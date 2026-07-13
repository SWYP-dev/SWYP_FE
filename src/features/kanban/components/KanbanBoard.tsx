'use client';

import { useState, useCallback } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import type { KanbanStage } from '@/types/api';
import { KanbanColumn } from './KanbanColumn';
import { AddStageButton } from './AddStageButton';
import { Toast } from '@/components/ui/toast';

const MAX_STAGES = 10; // PRD 4.2.3: 최대 10개 단계

interface KanbanBoardProps {
  initialStages: KanbanStage[];
  onRenameStage?: (stageId: number, newName: string) => void;
  onDeleteStage?: (stageId: number) => void;
  onCardMove?: (cardId: number, fromStageId: number, toStageId: number) => void;
  /** 확정된 스테이지 생성 시 호출 — TODO: POST /api/v1/kanban/stages (3.7) 연동 지점 */
  onCreateStage?: (name: string) => void;
}

// Figma "지원 현황 메인"(49:7796) + "전형 단계 추가"(49:7797) 스펙 반영.
// 추가 버튼 클릭 → 보드 맨 끝에 draft 컬럼 + 인라인 TextField → 이름 확정 시 스테이지 생성.
export function KanbanBoard({
  initialStages,
  onRenameStage,
  onDeleteStage,
  onCardMove,
  onCreateStage,
}: KanbanBoardProps) {
  const [stages, setStages] = useState(initialStages);
  const [isAddingStage, setIsAddingStage] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const dismissToast = useCallback(() => setToastMessage(null), []);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const cardId = active.id as number;
    const fromStageId = active.data.current?.stageId as number;
    const toStageId = over.id as number;

    if (!fromStageId || fromStageId === toStageId) return;

    setStages((prev) => {
      const fromStage = prev.find((s) => s.id === fromStageId);
      const card = fromStage?.cards.find((c) => c.id === cardId);
      if (!card) return prev;

      return prev.map((s) => {
        if (s.id === fromStageId) return { ...s, cards: s.cards.filter((c) => c.id !== cardId) };
        if (s.id === toStageId) return { ...s, cards: [...s.cards, card] };
        return s;
      });
    });

    onCardMove?.(cardId, fromStageId, toStageId);
  }

  function handleAddStageClick() {
    if (stages.length >= MAX_STAGES) {
      // ⚠️ 확인 필요: 10개 초과 시 안내 방식(토스트 문구 등) — 디자인 확인 후 보정
      setToastMessage('전형 단계는 최대 10개까지 추가할 수 있어요.');
      return;
    }
    setIsAddingStage(true);
  }

  function handleConfirmDraft(name: string) {
    setStages((prev) => [
      ...prev,
      {
        // TODO: POST /api/v1/kanban/stages(3.7) 연동 시 서버가 반환한 id/position으로 교체
        id: Date.now(),
        name,
        position: prev.length + 1,
        isDefault: false,
        cards: [],
      },
    ]);
    setIsAddingStage(false);
    // ⚠️ 확인 필요: 토스트 문구 — Figma 49:7847 Toast 확인 후 교체. 노출 4초는 확정.
    setToastMessage('전형 단계가 추가되었어요.');
    onCreateStage?.(name);
  }

  // draft 컬럼 렌더링용 임시 스테이지 객체
  const draftStage: KanbanStage = {
    id: -1,
    name: '',
    position: stages.length + 1,
    isDefault: false,
    cards: [],
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      {/* 가로 스크롤: overflow-x-auto만 사용 (디자이너 코멘트) */}
      <div className="flex h-full w-full flex-1 items-stretch gap-5 overflow-x-auto pb-2">
        {[...stages]
          .sort((a, b) => a.position - b.position)
          .map((stage) => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              onRenameStage={onRenameStage}
              onDeleteStage={onDeleteStage}
            />
          ))}
        {isAddingStage && (
          <KanbanColumn
            key="draft"
            stage={draftStage}
            isDraft
            onConfirmDraft={handleConfirmDraft}
            onCancelDraft={() => setIsAddingStage(false)}
          />
        )}
      </div>

      <AddStageButton onClick={handleAddStageClick} />

      <Toast
        message={toastMessage ?? ''}
        isVisible={toastMessage !== null}
        onDismiss={dismissToast}
      />
    </DndContext>
  );
}
