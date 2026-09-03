import { apiFetch } from '@/lib/api/api-client';
import type { KakaoLoginResponse, CurrentUserResponse, TestSessionResponse } from '../type/auth';

// 1.1 카카오 소셜 로그인 (POST /api/v1/auth/kakao)
export function loginWithKakao(code: string): Promise<KakaoLoginResponse> {
  const redirectUri = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI ?? '';
  return apiFetch<KakaoLoginResponse>('/api/v1/auth/kakao', {
    method: 'POST',
    body: { code, redirectUri },
  });
}

// 로그인 없는 테스트 계정 세션 발급.
// 백엔드(POST /api/v1/auth/test-session)를 직접 부르지 않고 같은 오리진의
// Route Handler(src/app/api/test-session/route.ts)를 거친다 —
// X-Test-Session-Secret을 브라우저 번들에 노출하지 않기 위함.
// baseUrl: ''로 지정해야 apiFetch가 백엔드 주소를 앞에 붙이지 않는다.
export function createTestSession(): Promise<TestSessionResponse> {
  return apiFetch<TestSessionResponse>('/api/test-session', {
    method: 'POST',
    baseUrl: '',
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

// 6.2 회원 탈퇴 (DELETE /api/v1/users/me)
export function deleteAccount(): Promise<null> {
  return apiFetch<null>('/api/v1/users/me', {
    method: 'DELETE',
  });
}
