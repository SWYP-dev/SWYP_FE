'use client';

import { Suspense, useEffect, useRef } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { useAuthStore } from '@/features/auth/store/authStore';
import { pushDataLayerEvent } from '@/lib/gtm';
import { DeadlineHeader } from '@/features/deadlines/components/DeadlineHeader';
import { DeadlineList } from '@/features/deadlines/components/DeadlineList';
import { DeadlineListSkeleton } from '@/features/deadlines/components/DeadlineListSkeleton';

// Figma "지원 마감일 메인"(node 101:17608). sidebar '/deadlines' 라우팅 대상.
export default function DeadlinesPage() {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasTrackedViewRef = useRef(false);

  // 로그인 상태 복원 후 로그인 사용자에게 화면이 표시되면 1회만 보낸다.
  // ref로 재렌더링·StrictMode 재실행에 의한 중복을 막는다.
  useEffect(() => {
    if (!hasHydrated || !isAuthenticated || hasTrackedViewRef.current) return;
    hasTrackedViewRef.current = true;
    pushDataLayerEvent('deadlines_viewed');
  }, [hasHydrated, isAuthenticated]);

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-base-white">
      <Sidebar />

      <main className="flex min-w-0 flex-1 flex-col self-stretch">
        <div className="sticky top-0 z-10">
          <DeadlineHeader />
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-neutral-50 px-[80px] py-7">
          <Suspense fallback={<DeadlineListSkeleton />}>
            <DeadlineList />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
