'use client';

import dynamic from 'next/dynamic';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { MOCK_KANBAN_STAGES } from '@/features/kanban/data/mockKanbanStages';

// @dnd-kit이 내부적으로 useId 카운터를 사용해 DOM id를 생성하는데,
// SSR과 클라이언트 하이드레이션 사이에 카운터가 리셋되어 값이 달라져
// hydration mismatch가 발생함. KanbanBoard를 클라이언트에서만 렌더링해 해결.
const KanbanBoard = dynamic(
  () => import('@/features/kanban/components/KanbanBoard').then((m) => m.KanbanBoard),
  { ssr: false }
);

// Figma "지원 현황 메인"(node 49:7796) 페이지. sidebar의 '/kanban' 라우팅 대상.
export default function KanbanPage() {
  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-base-white text-left text-3 text-label-base">
      <Sidebar
        userName="손진영"
        userEmail="sonjinyoung9849@gmail.com"
        avatarUrl="/images/avatar.png"
      />

      <main className="flex flex-1 flex-col self-stretch">
        <div className="sticky top-0 z-10 bg-base-white">
          <Header />
        </div>

        <div className="flex flex-1 flex-col overflow-hidden px-[80px] py-6">
          <KanbanBoard
            initialStages={MOCK_KANBAN_STAGES}
            onRenameStage={(stageId: number, newName: string) => {
              void stageId;
              void newName;
              // TODO: PATCH /api/v1/kanban/stages/{stageId} 연동 (3.8)
            }}
            onDeleteStage={(stageId: number) => {
              void stageId;
              // TODO: 카드 있을 경우 이동 대상 선택 팝업 연동 (3.9)
            }}
            onCardMove={(cardId: number, fromStageId: number, toStageId: number) => {
              void cardId;
              void fromStageId;
              void toStageId;
              // TODO: PATCH /api/v1/kanban/cards/{cardId}/stage 연동 (3.3)
            }}
          />
        </div>
      </main>
    </div>
  );
}
