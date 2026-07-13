'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { KanbanBoard } from '@/features/kanban/components/KanbanBoard';
import { MOCK_KANBAN_STAGES } from '@/features/kanban/data/mockKanbanStages';

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
            onAddStage={() => {
              // TODO: 스테이지 추가 모달 연동 (최대 10개 제한 체크 포함, 3.7)
            }}
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
