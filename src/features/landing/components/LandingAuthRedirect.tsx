'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/authStore';

/**
 * 로그인 상태로 랜딩(/)에 들어오면 서비스 화면(/jobs)으로 돌려보낸다.
 *
 * 토큰이 localStorage에 있어 middleware에서는 로그인 여부를 판단할 수 없으므로 클라이언트에서 처리한다.
 * zustand persist 복원 전 첫 렌더에는 isAuthenticated가 false라 랜딩이 잠깐 보이는 깜빡임이 난다.
 * hasHydrated가 true가 될 때까지 children을 렌더하지 않아 깜빡임을 막는다.
 *
 * router.replace를 쓰는 이유: push면 /jobs에서 뒤로 가기를 눌렀을 때 랜딩으로 돌아왔다가
 * 다시 /jobs로 튕겨서 뒤로 가기가 먹통이 된 것처럼 보인다.
 */
export default function LandingAuthRedirect({ children }: { children: ReactNode }) {
  const router = useRouter();
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (hasHydrated && isAuthenticated) router.replace('/jobs');
  }, [hasHydrated, isAuthenticated, router]);

  // hydration 전이거나 이미 로그인이면 랜딩 콘텐츠를 그리지 않음 (블랭크)
  if (!hasHydrated || isAuthenticated) return null;

  return <>{children}</>;
}
