// API 명세서 v1.9 - 1.1 카카오 소셜 로그인 응답 타입
// [2026-07-22] Slack 논의 반영: 이메일은 마이페이지 별도 입력 플로우가 아니라
// 카카오 로그인 필수 동의 항목으로 확정됨(동섭님 7/18 확인). 별도 GET /users/me
// 없이 1.1 로그인 응답 자체에 email이 포함될 가능성이 높아 optional로 미리 추가.
// ⚠️ 아직 스웨거엔 반영 안 됨 — 백엔드 확인 후 optional(?) 제거 예정.
export interface KakaoLoginResponse {
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
  user: {
    id: number;
    nickname: string;
    profileImage: string;
    email?: string;
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
// email은 1.1 응답엔 없고 6.1(/users/me) 응답에만 있어서 optional로 둠.
export interface AuthUser {
  id: number;
  nickname: string;
  profileImage: string;
  email?: string;
}
