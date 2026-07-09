// 로그인 시 발급받은 accessToken/refreshToken을 브라우저에 저장하고 꺼내 쓰는 유틸.
// localStorage 사용 (SPA 방식 - 새로고침해도 로그인 유지)

const ACCESS_TOKEN_KEY = 'chwihap_access_token';
const REFRESH_TOKEN_KEY = 'chwihap_refresh_token';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null; // SSR 환경에서는 localStorage 없음
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function setAccessToken(accessToken: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}
