'use client';

import dynamic from 'next/dynamic';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useKanbanBoard } from '@/features/kanban/api/useKanbanQuery';

const KanbanBoard = dynamic(
  () => import('@/features/kanban/components/KanbanBoard').then((m) => m.KanbanBoard),
  { ssr: false }
);

export default function KanbanPage() {
  const { data, isLoading, isError } = useKanbanBoard();

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-base-white">
      <Sidebar
        userName="손진영"
        userEmail="sonjinyoung9849@gmail.com"
        avatarUrl="/images/avatar.png"
      />

      <main className="flex min-w-0 flex-1 flex-col self-stretch">
        <div className="sticky top-0 z-10 bg-base-white">
          <Header />
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-[80px] py-6">
          {isLoading && (
            <div className="flex h-full items-center justify-center text-3 text-label-description">
              불러오는 중...
            </div>
          )}
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
