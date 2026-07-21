'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useKakaoLoginMutation } from '@/features/auth/hooks/useAuthMutations';

// 카카오 인가 코드 콜백 처리 페이지.
// NEXT_PUBLIC_KAKAO_REDIRECT_URI를 이 경로로 등록해야 함 (예: http://localhost:3000/auth/kakao/callback)
export default function KakaoCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginMutation = useKakaoLoginMutation();
  const hasRequested = useRef(false); // 인가 코드는 1회용이라 StrictMode 이중 호출 방지

  useEffect(() => {
    const code = searchParams.get('code');
    const kakaoError = searchParams.get('error');

    if (kakaoError) {
      router.replace('/?loginError=kakao_denied');
      return;
    }
    if (!code || hasRequested.current) return;
    hasRequested.current = true;

    loginMutation.mutate(code, {
      onSuccess: () => router.replace('/'),
      onError: () => router.replace('/?loginError=1'),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-base-white">
      <p className="text-3 text-label-body">카카오 로그인 처리 중입니다...</p>
    </div>
  );
}
