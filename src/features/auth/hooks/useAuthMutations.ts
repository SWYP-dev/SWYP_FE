'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { loginWithKakao, logoutRequest } from '../api/authApi';
import { useAuthStore } from '../store/authStore';
import { setTokens, clearTokens } from '@/lib/api/token';

export function useKakaoLoginMutation() {
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (code: string) => loginWithKakao(code),
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      // [2026-07-22] GET /api/v1/users/me 별도 호출 제거.
      // Slack 논의(7/18)에 따라 이메일은 카카오 로그인 필수 동의 항목으로 확정되어
      // 1.1 응답(user.email)에 바로 포함될 예정 — 별도 이메일 보완 호출 불필요.
      // ⚠️ 현재 스웨거엔 email 필드가 아직 없어서, 반영 전까지는 사이드바 이메일이
      // 빈 값으로 보일 수 있음(정상 — 백엔드 반영 후 자동으로 채워짐).
      setUser(data.user);
    },
  });
}

export function useLogoutMutation() {
  const clearUser = useAuthStore((s) => s.clearUser);
  const router = useRouter();

  return useMutation({
    mutationFn: logoutRequest,
    // 1.3 설명대로 서버 호출은 Refresh Token 블랙리스트 처리를 위한 보안 조치일 뿐이라,
    // API 실패 여부와 무관하게 클라이언트 로그아웃(토큰 삭제)은 항상 수행한다.
    onSettled: () => {
      clearTokens();
      clearUser();
      router.push('/');
    },
  });
}
