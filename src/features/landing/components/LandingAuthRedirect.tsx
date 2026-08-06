'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/authStore';

/**
 * 로그인 상태로 랜딩(/)에 들어오면 서비스 화면(/jobs)으로 돌려보낸다.
 *
 * 토큰이 localStorage에 있어 middleware에서는 로그인 여부를 판단할 수 없으므로 클라이언트에서 처리한다.
 * zustand persist 복원 전 첫 렌더에는 isAuthenticated가 false라 아무 일도 하지 않고,
 * 복원이 끝나면 스토어가 갱신되면서 리렌더 → 이 effect가 다시 돌며 이동한다.
 *
 * router.replace를 쓰는 이유: push면 /jobs에서 뒤로 가기를 눌렀을 때 랜딩으로 돌아왔다가
 * 다시 /jobs로 튕겨서 뒤로 가기가 먹통이 된 것처럼 보인다.
 */
export default function LandingAuthRedirect() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) router.replace('/jobs');
  }, [isAuthenticated, router]);

  return null;
}
