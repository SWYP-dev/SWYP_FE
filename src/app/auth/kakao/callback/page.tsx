'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useKakaoLoginMutation } from '@/features/auth/hooks/useAuthMutations';

// 카카오 인가 코드 콜백 처리 페이지.
// NEXT_PUBLIC_KAKAO_REDIRECT_URI를 이 경로로 등록해야 함 (예: http://localhost:3000/auth/kakao/callback)
//
// ⚠️ 빌드 에러 수정: useSearchParams()를 쓰는 컴포넌트는 Next.js App Router에서
// 반드시 <Suspense>로 감싸야 함. 로컬 dev 서버에서는 안 걸리다가 Vercel의
// 프로덕션 빌드(정적 프리렌더링) 단계에서 "useSearchParams() should be wrapped
// in a suspense boundary" 에러로 빌드 자체가 실패함.
// → useSearchParams를 쓰는 로직을 CallbackHandler로 분리하고, 기본 export에서 Suspense로 감쌈.
export default function KakaoCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-base-white">
          <p className="text-3 text-label-body">카카오 로그인 처리 중입니다...</p>
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}

function CallbackHandler() {
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
