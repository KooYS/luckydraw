const ICON_BASE_URL = "/images/bank-icons";

export interface BankInfo {
  code: string;
  name: string;
  shortName: string;
  color: string;
  iconUrl?: string;
  appScheme?: string;
  androidSchemeHost: string;
  androidPackage?: string;
  appStoreUrl?: string;
  playStoreUrl?: string;
}

export interface TransferParams {
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
  amount?: number;
}

export type Platform = "ios" | "android" | "desktop";

export const BANKS: Record<string, BankInfo> = {
  kakao: {
    code: "kakao",
    name: "카카오뱅크",
    shortName: "카카오뱅크",
    color: "#FFEB00",
    iconUrl: `${ICON_BASE_URL}/icon_kakao.png`,
    appScheme: "kakaobank://",
    androidSchemeHost: "kakaobank",
    androidPackage: "com.kakaobank.channel",
    appStoreUrl: "https://apps.apple.com/kr/app/id1258016944",
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=com.kakaobank.channel",
  },
  toss: {
    code: "toss",
    name: "토스",
    shortName: "토스",
    color: "#0064FF",
    iconUrl: `${ICON_BASE_URL}/icon_toss.png`,
    appScheme: "supertoss://",
    androidSchemeHost: "supertoss",
    androidPackage: "viva.republica.toss",
    appStoreUrl: "https://apps.apple.com/kr/app/id839333328",
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=viva.republica.toss",
  },
  kbank: {
    code: "kbank",
    name: "케이뱅크",
    shortName: "케이뱅크",
    color: "#FF6B00",
    iconUrl: `${ICON_BASE_URL}/icon_kbank.png`,
    appScheme: "ukbanksmartbanknonloginpay://",
    androidSchemeHost: "ukbanksmartbankweb",
    androidPackage: "com.kbankwith.smartbank",
    appStoreUrl: "https://apps.apple.com/kr/app/id1178872627",
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=com.kbankwith.smartbank",
  },
  kb: {
    code: "kb",
    name: "KB국민은행",
    shortName: "국민은행",
    color: "#FFBC00",
    iconUrl: `${ICON_BASE_URL}/icon_kbstart.png`,
    appScheme: "kbbank://",
    androidSchemeHost: "call",
    androidPackage: "com.kbstar.kbbank",
    appStoreUrl: "https://apps.apple.com/kr/app/id373742138",
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=com.kbstar.kbbank",
  },
  shinhan: {
    code: "shinhan",
    name: "신한은행",
    shortName: "신한은행",
    color: "#0046FF",
    iconUrl: `${ICON_BASE_URL}/icon_shinhansol.png`,
    appScheme: "shinhansol://",
    androidSchemeHost: "sbankandnor",
    androidPackage: "com.shinhan.sbanking",
    appStoreUrl: "https://apps.apple.com/kr/app/id357484932",
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=com.shinhan.sbanking",
  },
  woori: {
    code: "woori",
    name: "우리은행",
    shortName: "우리은행",
    color: "#0066B3",
    iconUrl: `${ICON_BASE_URL}/icon_woorione.png`,
    appScheme: "newsmartpib://",
    androidSchemeHost: "com.wooribank.smart.npib",
    androidPackage: "com.wooribank.smart.npib",
    appStoreUrl: "https://apps.apple.com/kr/app/id1470181651",
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=com.wooribank.smart.npib",
  },
  hana: {
    code: "hana",
    name: "하나은행",
    shortName: "하나은행",
    color: "#009490",
    iconUrl: `${ICON_BASE_URL}/icon_hanaoneq.png`,
    appScheme: "hanapush://",
    androidSchemeHost: "hanapush",
    androidPackage: "com.hanabank.ebk.channel.android.hananbank",
    appStoreUrl: "https://apps.apple.com/kr/app/id1362508015",
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=com.hanabank.ebk.channel.android.hananbank",
  },
  nh: {
    code: "nh",
    name: "NH농협은행",
    shortName: "농협은행",
    color: "#00AB4E",
    iconUrl: `${ICON_BASE_URL}/icon_nhallonebank_new.png`,
    appScheme: "nhallone://",
    androidSchemeHost: "nhcok",
    androidPackage: "com.nonghyup.nhallonebank",
    appStoreUrl: "https://apps.apple.com/kr/app/id1641628055",
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=com.nonghyup.nhallonebank",
  },
  ibk: {
    code: "ibk",
    name: "IBK기업은행",
    shortName: "기업은행",
    color: "#0072BC",
    iconUrl: `${ICON_BASE_URL}/icon_ionebank.png`,
    appScheme: "ionebank://",
    androidSchemeHost: "ionebank",
    androidPackage: "com.ibk.android.ionebank",
    appStoreUrl: "https://apps.apple.com/kr/app/id1460543865",
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=com.ibk.android.ionebank",
  },
  sc: {
    code: "sc",
    name: "SC제일은행",
    shortName: "SC제일은행",
    color: "#007E3F",
    iconUrl: `${ICON_BASE_URL}/icon_scbank.png`,
    appScheme: "scbmobile://",
    androidSchemeHost: "ma30sso",
    androidPackage: "com.scbank.ma30",
    appStoreUrl: "https://apps.apple.com/kr/app/id1457418899",
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=com.scbank.ma30",
  },
  citi: {
    code: "citi",
    name: "한국씨티은행",
    shortName: "한국씨티은행",
    color: "#003DA5",
    iconUrl: `${ICON_BASE_URL}/icon_citibank.png`,
    appScheme: "citimobileapp://",
    androidSchemeHost: "smartpay",
    androidPackage: "kr.co.citibank.citimobile",
    appStoreUrl: "https://apps.apple.com/kr/app/id1179759666",
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=kr.co.citibank.citimobile",
  },
  busan: {
    code: "busan",
    name: "부산은행",
    shortName: "부산은행",
    color: "#ED1C24",
    iconUrl: `${ICON_BASE_URL}/icon_bnk.png`,
    appScheme: "bslink://",
    androidSchemeHost: "call",
    androidPackage: "kr.co.busanbank.mbp",
    appStoreUrl: "https://apps.apple.com/kr/app/id1445137607",
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=kr.co.busanbank.mbp",
  },
  dgb: {
    code: "dgb",
    name: "iM뱅크",
    shortName: "iM뱅크",
    color: "#005AA5",
    iconUrl: `${ICON_BASE_URL}/icon_imbank_dgb.png`,
    appScheme: "mbanking://",
    androidSchemeHost: "openservice",
    androidPackage: "kr.co.dgb.dgbm",
    appStoreUrl: "https://apps.apple.com/kr/app/id1067748687",
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=kr.co.dgb.dgbm",
  },
  kwangju: {
    code: "kwangju",
    name: "광주은행",
    shortName: "광주은행",
    color: "#0066B3",
    iconUrl: `${ICON_BASE_URL}/icon_kwangjubank_n.png`,
    appScheme: "kjbankisb://",
    androidSchemeHost: "asb",
    androidPackage: "com.kjbank.asb.pbanking",
    appStoreUrl: "https://apps.apple.com/kr/app/id1576149106",
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=com.kjbank.asb.pbanking",
  },
  jeonbuk: {
    code: "jeonbuk",
    name: "전북은행",
    shortName: "전북은행",
    color: "#0066CC",
    iconUrl: `${ICON_BASE_URL}/icon_jbbank.png`,
    appScheme: "jbpribanksign://",
    androidSchemeHost: "lina-close",
    androidPackage: "kr.co.jbbank.privatebank",
    appStoreUrl: "https://apps.apple.com/kr/app/id1547903285",
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=kr.co.jbbank.privatebank",
  },
  jeju: {
    code: "jeju",
    name: "제주은행",
    shortName: "제주은행",
    color: "#FF6600",
    iconUrl: `${ICON_BASE_URL}/icon_jbank_new.png`,
    appScheme: "jbanksmart://",
    androidSchemeHost: "action",
    androidPackage: "com.jejubank.smartnew",
    appStoreUrl: "https://apps.apple.com/kr/app/id6443788309",
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=com.jejubank.smartnew",
  },
  kyongnam: {
    code: "kyongnam",
    name: "경남은행",
    shortName: "경남은행",
    color: "#005BAC",
    iconUrl: `${ICON_BASE_URL}/icon_knb.png`,
    appScheme: "com.knb.psb://",
    androidSchemeHost: "knbank.onelink.me",
    androidPackage: "com.knb.psb",
    appStoreUrl: "https://apps.apple.com/kr/app/id678852685",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.knb.psb",
  },
  post: {
    code: "post",
    name: "우체국예금",
    shortName: "우체국",
    color: "#EF4123",
    iconUrl: `${ICON_BASE_URL}/icon_postbank.png`,
    appScheme: "com.epost.psf.sd://",
    androidSchemeHost: "com.epost.psf.sd",
    androidPackage: "com.epost.psf.sdsi",
    appStoreUrl: "https://apps.apple.com/kr/app/id554920991",
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=com.epost.psf.sdsi",
  },
  mg: {
    code: "mg",
    name: "새마을금고",
    shortName: "새마을금고",
    color: "#0066B3",
    iconUrl: `${ICON_BASE_URL}/icon_mgbank.png`,
    appScheme: "kfccsb://",
    androidSchemeHost: "call",
    androidPackage: "com.smg.spbs",
    appStoreUrl: "https://apps.apple.com/kr/app/id425089902",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.smg.spbs",
  },
  shinhyup: {
    code: "shinhyup",
    name: "신협",
    shortName: "신협",
    color: "#00A651",
    iconUrl: `${ICON_BASE_URL}/icon_shinhyup.png`,
    appScheme: "cuonbank://",
    androidSchemeHost: "clientservice",
    androidPackage: "kr.co.cu.onbank",
    appStoreUrl: "https://apps.apple.com/kr/app/id1484456647",
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=kr.co.cu.onbank",
  },
  kdb: {
    code: "kdb",
    name: "KDB산업은행",
    shortName: "산업은행",
    color: "#00A1E0",
    iconUrl: `${ICON_BASE_URL}/icon_kdbsan.png`,
    appScheme: "smartkdb://",
    androidSchemeHost: "",
    androidPackage: "co.kr.kdb.android.smartkdb",
    appStoreUrl: "https://apps.apple.com/kr/app/id392572957",
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=co.kr.kdb.android.smartkdb",
  },
  suhyup: {
    code: "suhyup",
    name: "Sh수협은행",
    shortName: "수협은행",
    color: "#0072CE",
    iconUrl: `${ICON_BASE_URL}/icon_suhyup_heybank.png`,
    appScheme: "suhyuppesmb://",
    androidSchemeHost: "m.suhyup-bank.com:9190",
    androidPackage: "com.suhyup.pesmb",
    appStoreUrl: "https://apps.apple.com/kr/app/id1441936097",
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=com.suhyup.pesmb",
  },
};

/** 전체 은행 목록 반환 */
export function getAllBanks(): BankInfo[] {
  return Object.values(BANKS);
}

/** 코드로 은행 정보 조회 */
export function getBankByCode(code: string): BankInfo | undefined {
  return BANKS[code];
}

/** 송금 딥링크 생성 */
export function getTransferDeepLink(
  userBankCode: string,
  _params: TransferParams
): string | null {
  const bank = BANKS[userBankCode];
  return bank?.appScheme ?? null;
}

/** 토스 송금 딥링크 생성 */
export function getTossTransferLink(params: TransferParams): string {
  const { bankCode, accountNumber, accountHolder, amount } = params;
  const bank = BANKS[bankCode];
  const bankName = bank?.name || bankCode;

  const queryParams = new URLSearchParams({
    bank: bankName,
    accountNo: accountNumber.replace(/-/g, ""),
    depositor: accountHolder,
    ...(amount && { amount: String(amount) }),
  });

  return `supertoss://send?${queryParams.toString()}`;
}

/** 카카오뱅크 송금 딥링크 생성 */
export function getKakaoBankTransferLink(params: TransferParams): string {
  const { bankCode, accountNumber } = params;
  return `kakaobank://transfer?bank=${bankCode}&account=${accountNumber.replace(/-/g, "")}`;
}

/** 현재 디바이스 플랫폼 감지 */
export function getPlatform(): Platform {
  if (typeof navigator === "undefined") return "desktop";

  const userAgent = navigator.userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(userAgent)) return "ios";
  if (/android/.test(userAgent)) return "android";

  return "desktop";
}

/** iOS 디바이스 여부 */
export function isIOS(): boolean {
  return getPlatform() === "ios";
}

/** Android 디바이스 여부 */
export function isAndroid(): boolean {
  return getPlatform() === "android";
}

/** 모바일 디바이스 여부 */
export function isMobile(): boolean {
  const platform = getPlatform();
  return platform === "ios" || platform === "android";
}

/** 플랫폼별 앱스토어 링크 반환 */
export function getAppStoreLink(bankCode: string): string | null {
  const bank = BANKS[bankCode];
  if (!bank) return null;

  const platform = getPlatform();

  if (platform === "ios") return bank.appStoreUrl ?? null;
  if (platform === "android") return bank.playStoreUrl ?? null;

  return bank.playStoreUrl ?? bank.appStoreUrl ?? null;
}

/** Android Intent URL 생성 */
export function getAndroidIntentLink(bankCode: string): string | null {
  const bank = BANKS[bankCode];
  if (!bank?.androidPackage) return null;

  const scheme = bank.appScheme?.replace("://", "");
  return `intent://${bank.androidSchemeHost}#Intent;scheme=${scheme};package=${bank.androidPackage};S.browser_fallback_url=${encodeURIComponent(bank.playStoreUrl || "")};end`;
}

/** 플랫폼에 맞는 앱 실행 링크 반환 */
export function getAppLink(bankCode: string): string | null {
  const bank = BANKS[bankCode];
  if (!bank) return null;

  const platform = getPlatform();

  if (platform === "ios") return bank.appScheme ?? null;
  if (platform === "android") {
    return getAndroidIntentLink(bankCode) ?? bank.appScheme ?? null;
  }

  return null;
}

/** 플랫폼별 앱 정보 반환 */
export function getAppInfo(bankCode: string): {
  platform: Platform;
  appLink: string | null;
  storeLink: string | null;
  packageName: string | null;
} {
  const bank = BANKS[bankCode];
  const platform = getPlatform();

  if (!bank) {
    return { platform, appLink: null, storeLink: null, packageName: null };
  }

  return {
    platform,
    appLink: getAppLink(bankCode),
    storeLink: getAppStoreLink(bankCode),
    packageName: platform === "android" ? (bank.androidPackage ?? null) : null,
  };
}

/** 계좌번호 마스킹 (뒤 4자리만 표시) */
export function maskAccountNumber(accountNumber: string): string {
  const numbers = accountNumber.replace(/[^0-9]/g, "");
  if (numbers.length <= 4) return numbers;

  const visible = numbers.slice(-4);
  const masked = "*".repeat(numbers.length - 4);
  return masked + visible;
}
