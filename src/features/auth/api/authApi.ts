import { apiFetch } from '@/lib/api/api-client';
import type { KakaoLoginResponse, CurrentUserResponse } from '../type/auth';

// 1.1 카카오 소셜 로그인 (POST /api/v1/auth/kakao)
export function loginWithKakao(code: string): Promise<KakaoLoginResponse> {
  const redirectUri = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI ?? '';
  return apiFetch<KakaoLoginResponse>('/api/v1/auth/kakao', {
    method: 'POST',
    body: { code, redirectUri },
  });
}

// 1.3 로그아웃 (POST /api/v1/auth/logout)
export function logoutRequest(): Promise<null> {
  return apiFetch<null>('/api/v1/auth/logout', {
    method: 'POST',
  });
}

// 6.1 내 정보 조회 (GET /api/v1/users/me)
// 1.1 응답엔 email이 없어서, 로그인 직후 이 API로 이메일을 보완한다.
export function fetchCurrentUser(): Promise<CurrentUserResponse> {
  return apiFetch<CurrentUserResponse>('/api/v1/users/me');
}
