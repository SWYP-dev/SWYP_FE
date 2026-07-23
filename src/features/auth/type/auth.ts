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
