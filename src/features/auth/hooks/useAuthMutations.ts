'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { loginWithKakao, logoutRequest, fetchCurrentUser } from '../api/authApi';
import { useAuthStore } from '../store/authStore';
import { setTokens, clearTokens } from '@/lib/api/token';

export function useKakaoLoginMutation() {
  const setUser = useAuthStore((s) => s.setUser);
  const patchUser = useAuthStore((s) => s.patchUser);

  return useMutation({
    mutationFn: (code: string) => loginWithKakao(code),
    onSuccess: async (data) => {
      setTokens(data.accessToken, data.refreshToken);
      // 닉네임/프로필 사진은 즉시 표시
      setUser(data.user);

      // 이메일은 1.1 응답에 없으므로 6.1을 추가 호출해서 보완.
      // 실패해도 로그인 자체는 이미 성공했으니 조용히 무시.
      try {
        const me = await fetchCurrentUser();
        patchUser({ email: me.email });
      } catch {
        // no-op: 이메일 보완 실패는 로그인 실패로 취급하지 않음
      }
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
