'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { loginWithKakao, logoutRequest, deleteAccount } from '../api/authApi';
import { useAuthStore } from '../store/authStore';
import { setTokens, clearTokens } from '@/lib/api/token';
import { queryClient } from '@/lib/api/query-client';

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
      // ⚠️ [QA 반영] 로그인 성공 시, 비로그인 상태로 캐시된 "빈 데이터"가 남아있을 수
      // 있으니 전체 쿼리를 무효화해서 로그인된 사용자 기준으로 다시 불러오도록 함.
      queryClient.invalidateQueries();
    },
  });
}

// 6.2 회원 탈퇴 — 성공 시 로그아웃과 동일하게 토큰/유저 상태/쿼리 캐시를 정리하고 홈으로 이동.
export function useDeleteAccountMutation() {
  const clearUser = useAuthStore((s) => s.clearUser);
  const router = useRouter();

  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      clearTokens();
      clearUser();
      queryClient.clear();
      router.push('/');
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
      // ⚠️ [QA 반영] 기존엔 토큰/로그인 상태만 지우고 React Query 캐시는 그대로 둬서,
      // 로그아웃 후에도 이전에 불러온 보호된 데이터(칸반/마감일 등)가 캐시에 남아
      // 화면에 계속 보이는 문제가 있었음. 로그아웃 시 캐시를 완전히 비워서 방지.
      queryClient.clear();
      router.push('/');
    },
  });
}
