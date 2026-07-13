'use client';

import { useState } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import type { KanbanStage } from '@/types/api';
import { KanbanColumn } from './KanbanColumn';
import { AddStageButton } from './AddStageButton';

interface KanbanBoardProps {
  initialStages: KanbanStage[];
  onAddStage?: () => void;
  onRenameStage?: (stageId: number, newName: string) => void;
  onDeleteStage?: (stageId: number) => void;
  // TODO: 확정되면 PATCH /api/v1/kanban/cards/{cardId}/stage(3.3) 연동 지점
  onCardMove?: (cardId: number, fromStageId: number, toStageId: number) => void;
}

// Figma "지원 현황 메인"(node 49:7796) 스펙 반영.
// 디자이너 코멘트: 가로 스크롤은 커스텀 컴포넌트 없이 overflow-x-auto로 구현.
export function KanbanBoard({
  initialStages,
  onAddStage,
  onRenameStage,
  onDeleteStage,
  onCardMove,
}: KanbanBoardProps) {
  const [stages, setStages] = useState(initialStages);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

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
        if (s.id === fromStageId) {
          return { ...s, cards: s.cards.filter((c) => c.id !== cardId) };
        }
        if (s.id === toStageId) {
          return { ...s, cards: [...s.cards, card] };
        }
        return s;
      });
    });

    onCardMove?.(cardId, fromStageId, toStageId);
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      {/* 가로 스크롤: overflow-x-auto만 사용 (커스텀 스크롤 컴포넌트 미구현) */}
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
      </div>
      <AddStageButton onClick={() => onAddStage?.()} />
    </DndContext>
  );
}
