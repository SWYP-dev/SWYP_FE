'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useAuthStore } from '@/features/auth/store/authStore';
import { pushDataLayerEvent } from '@/lib/gtm';
import { consumeEntryType } from '@/lib/analytics/sessionEntry';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useKanbanBoard } from '@/features/kanban/api/useKanbanQuery';
import { KanbanBoardSkeleton } from '@/features/kanban/components/KanbanBoardSkeleton';
import { saveKanbanLayoutCache } from '@/features/kanban/utils/kanbanLayoutCache';

const KanbanBoard = dynamic(
  () => import('@/features/kanban/components/KanbanBoard').then((m) => m.KanbanBoard),
  { ssr: false }
);

export default function KanbanPage() {
  const { data, isLoading, isError } = useKanbanBoard();

  useEffect(() => {
    if (data) saveKanbanLayoutCache(data.stages.map((stage) => stage.cards.length));
  }, [data]);

  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasTrackedViewRef = useRef(false);

  // 로그인 상태 복원 후 로그인 사용자에게 화면이 표시되면 1회만 보낸다.
  // ref로 재렌더링·StrictMode 재실행에 의한 중복을 막는다.
  useEffect(() => {
    if (!hasHydrated || !isAuthenticated || hasTrackedViewRef.current) return;
    hasTrackedViewRef.current = true;
    pushDataLayerEvent('kanban_viewed', { entry_type: consumeEntryType('/kanban') });
  }, [hasHydrated, isAuthenticated]);

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-base-white">
      <Sidebar />

      <main className="flex min-w-0 flex-1 flex-col self-stretch">
        <div className="sticky top-0 z-10 bg-base-white">
          <Header showSearch={false} />
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-[80px] py-7">
          {isLoading && <KanbanBoardSkeleton />}
          {isError && (
            <div className="flex h-full items-center justify-center text-3 text-status-negative">
              데이터를 불러오지 못했어요. 다시 시도해 주세요.
            </div>
          )}
          {data && <KanbanBoard initialStages={data.stages} />}
        </div>
      </main>
    </div>
  );
}
