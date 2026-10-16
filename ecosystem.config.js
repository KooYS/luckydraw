// PM2 ecosystem — NCloud 배포용
// cwd 가 반드시 /opt/app/current 이어야 symlink swap 으로 무중단 reload 가 작동.
// 누락 시 deploy.sh fail-fast (ADR-011).

module.exports = {
  apps: [
    {
      name: "luckydraw",
      cwd: "/opt/app/current",
      // standalone 빌드 산출물. next build 후 .next/standalone/server.js 자동 생성.
      script: ".next/standalone/server.js",
      instances: 2,
      exec_mode: "cluster",
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        // standalone server 는 HOSTNAME=0.0.0.0 default. Caddy 가 reverse_proxy 하니
        // localhost 에만 바인딩해서 외부 직접 접근 차단.
        HOSTNAME: "127.0.0.1",
        PORT: 3000,
      },
    },
  ],
};
