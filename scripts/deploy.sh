#!/bin/bash
#
# GitHub Actions 에서 매 배포마다 호출하는 스크립트.
# 새 릴리스 업로드 → symlink 전환 → pm2 reload (무중단).
#
# 기대하는 환경 변수:
#   SERVER_IP       - 대상 서버 IP
#   SSH_KEY         - SSH 개인키 경로
#   RELEASE_DIR     - 로컬 빌드 산출물 디렉토리 (예: ./dist 또는 전체 repo)
#   APP_NAME        - PM2 app 이름 (ecosystem.config.js의 name)
#
# 예시 workflow:
#   - name: Deploy
#     run: bash scripts/deploy.sh
#     env:
#       SERVER_IP:   ${{ secrets.BACKOFFICE_IP }}
#       SSH_KEY:     ~/.ssh/deploy_key
#       RELEASE_DIR: ./
#       APP_NAME:    backoffice
#
set -eux

TIMESTAMP=$(date +%Y%m%d%H%M%S)
REMOTE_RELEASE="/opt/app/releases/${TIMESTAMP}"
SSH_OPTS="-o StrictHostKeyChecking=no -i ${SSH_KEY}"
REMOTE="${SSH_USER:-root}@${SERVER_IP}"

# ─────────────────────────────────────────
# 0. 사전 검증 — ecosystem.config.js 의 cwd 가 /opt/app/current 인지 확인.
#    없으면 PM2 가 첫 등록 시점 절대경로를 캐시해서 reload 가 무의미해진다.
#    배포된 코드는 새 릴리스에 있는데 PM2 는 옛 릴리스의 server.js 를 실행하는
#    유령 배포 사고를 막기 위한 fail-fast.
# ─────────────────────────────────────────
ECOSYSTEM_FILE="${RELEASE_DIR}/ecosystem.config.js"
if [ ! -f "$ECOSYSTEM_FILE" ]; then
    echo "ERROR: ecosystem.config.js not found at $ECOSYSTEM_FILE" >&2
    exit 1
fi
if ! grep -qE "cwd:.*['\"]\/opt\/app\/current['\"]" "$ECOSYSTEM_FILE"; then
    echo "ERROR: ecosystem.config.js must include  cwd: '/opt/app/current'" >&2
    echo "       symlink-based atomic deploy 가 작동하려면 PM2 가 매번 current 를 따라가야 합니다." >&2
    echo "       scripts/ecosystem.config.template.js 참고." >&2
    exit 1
fi

# ─────────────────────────────────────────
# 1. 원격 릴리스 디렉토리 생성
# ─────────────────────────────────────────
ssh $SSH_OPTS $REMOTE "mkdir -p ${REMOTE_RELEASE}"

# ─────────────────────────────────────────
# 2. 코드 업로드 (rsync)
#    node_modules 제외. 서버에서 npm ci 로 재설치.
# ─────────────────────────────────────────
rsync -az --delete \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '.env' \
    --exclude '.next' \
    --exclude 'dist' \
    --exclude 'build' \
    --exclude '.turbo' \
    -e "ssh $SSH_OPTS" \
    "${RELEASE_DIR}/" "${REMOTE}:${REMOTE_RELEASE}/"

# ─────────────────────────────────────────
# 3. 원격에서 설치·빌드
# ─────────────────────────────────────────
ssh $SSH_OPTS $REMOTE "bash -s" << EOF
set -eux
cd ${REMOTE_RELEASE}

# shared/.env 링크 (환경변수는 릴리스 간 공유)
ln -sfn /opt/app/shared/config/.env .env || true
ln -sfn /opt/app/shared/logs logs || true

# 패키지 매니저 자동 감지: pnpm > yarn > npm 순서로 lockfile 검사.
if [ -f pnpm-lock.yaml ]; then
    corepack enable >/dev/null 2>&1 || npm i -g pnpm
    pnpm install --frozen-lockfile
    pnpm run build
elif [ -f yarn.lock ]; then
    corepack enable >/dev/null 2>&1 || npm i -g yarn
    yarn install --frozen-lockfile
    yarn build
else
    npm ci
    npm run build
fi

# 새 릴리스를 current 로 교체 (atomic symlink swap)
ln -sfn ${REMOTE_RELEASE} /opt/app/current

# PM2 무중단 reload (없으면 start, 있으면 reload)
cd /opt/app/current
if pm2 describe ${APP_NAME} >/dev/null 2>&1; then
    pm2 reload ecosystem.config.js --update-env
else
    pm2 start ecosystem.config.js
fi
pm2 save

# 오래된 릴리스 정리 (최근 5개만 보존)
ls -1dt /opt/app/releases/*/ | tail -n +6 | xargs -r rm -rf
EOF

echo "deploy.sh done — released ${TIMESTAMP}"
