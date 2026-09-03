// API 명세서 v1.9 - 1.1 카카오 소셜 로그인 응답 타입
// [2026-07-22] Slack 확인 완료(동섭님): email 필드가 1.1 응답에 포함되도록 백엔드 수정 완료.
// 더 이상 optional이 아님 — GET /users/me 별도 호출도 불필요.
export interface KakaoLoginResponse {
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
  user: {
    id: number;
    nickname: string;
    profileImage: string | null;
    email: string;
  };
}

// 로그인 없는 테스트 계정 세션 발급 응답 (POST /api/v1/auth/test-session).
// 백엔드 안내: 카카오 로그인(1.1)과 response shape가 완전히 동일하다.
// 발급 경로를 백엔드가 구분하지 않으므로 로그인 성공 처리 로직을 그대로 재사용한다.
// nickname이 '테스트유저_xxxx' 형태로 내려오므로 필요하면 이걸로 테스트 계정 배너를 띄울 수 있다.
export type TestSessionResponse = KakaoLoginResponse;

// API 명세서 v1.9 - 6.1 내 정보 조회 응답 중 사이드바에 필요한 부분만 발췌
export interface CurrentUserResponse {
  id: number;
  nickname: string;
  profileImage: string;
  email: string;
}

// Sidebar/authStore에서 쓰는 사용자 표시 정보.
export interface AuthUser {
  id: number;
  nickname: string;
  profileImage: string | null; // 카카오 프로필 미등록 시 null로 내려옴 (실제 응답 확인됨)
  email: string;
}
