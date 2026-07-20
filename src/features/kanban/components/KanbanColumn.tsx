'use client';

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { KanbanCard as KanbanCardType, KanbanStage } from '@/types/api';
import { KanbanCard } from './KanbanCard';
import { DragHandleIcon, EditIcon, PlusSmallIcon, TrashIcon } from '@/components/ui/icons';

interface KanbanColumnProps {
  stage: KanbanStage;
  isDraft?: boolean;
  onRenameStage?: (stageId: number, newName: string) => void;
  onDeleteStage?: (stageId: number) => void;
  onConfirmDraft?: (name: string) => void;
  onCancelDraft?: () => void;
  onAddCard?: (stageId: number) => void;
  onEditCard?: (card: KanbanCardType, stageId: number) => void;
  onDeleteCard?: (card: KanbanCardType) => void;
}

// Figma KanbanColumn 마스터(50:14062) + 지원 현황 메인(49:7796) 스펙 반영.
// 헤더 ButtonGroup 순서: + (추가) → ⠿ (드래그) → ✎ (수정) → 🗑 (삭제, 커스텀만)
// 헤더 좌측 장식 아이콘: ▸ (chevron-right, 비활성 장식용)
export function KanbanColumn({
  stage,
  isDraft = false,
  onRenameStage,
  onDeleteStage,
  onConfirmDraft,
  onCancelDraft,
  onAddCard,
  onEditCard,
  onDeleteCard,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
    data: { stageId: stage.id },
  });

  const [isEditingName, setIsEditingName] = useState(isDraft);
  const [draftName, setDraftName] = useState(isDraft ? '' : stage.name);
  const [hasError, setHasError] = useState(false);

  function commit() {
    const trimmed = draftName.trim();
    if (isDraft) {
      if (!trimmed) {
        onCancelDraft?.();
        return;
      }
      onConfirmDraft?.(trimmed);
      return;
    }
    setIsEditingName(false);
    if (trimmed && trimmed !== stage.name) {
      onRenameStage?.(stage.id, trimmed);
    } else {
      setDraftName(stage.name);
    }
  }

  function cancel() {
    if (isDraft) {
      onCancelDraft?.();
      return;
    }
    setDraftName(stage.name);
    setIsEditingName(false);
    setHasError(false);
  }

  return (
    <div
      className={`flex h-full min-w-[296px] flex-1 flex-col items-start overflow-hidden rounded-2xl bg-surface-card ${
        isOver ? 'ring-2 ring-line-primary' : ''
      }`}
    >
      {/* Header */}
      <div className="flex w-full items-start p-4">
        <div className="flex min-h-7 flex-1 items-center justify-between">
          {/* 좌측: 장식 아이콘 + 스테이지명 + 카드 수 */}
          <div className="flex items-center gap-2">
            <ChevronRightSmallIcon />
            {isEditingName ? (
              <div className="flex flex-col gap-1">
                <input
                  autoFocus
                  value={draftName}
                  onChange={(e) => {
                    setDraftName(e.target.value);
                    setHasError(false);
                  }}
                  onBlur={commit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commit();
                    if (e.key === 'Escape') cancel();
                  }}
                  placeholder={isDraft ? '전형 단계를 입력하세요.' : '텍스트를 입력해 주세요.'}
                  className={`w-[168px] border-b-2 bg-transparent pb-1 text-5 font-medium text-label-base placeholder:text-label-placeholder outline-none ${
                    hasError ? 'border-status-negative' : 'border-line-secondary'
                  }`}
                />
                {hasError && (
                  <p className="text-1 font-medium text-status-negative">
                    전형 이름을 입력해주세요.
                  </p>
                )}
              </div>
            ) : (
              <p className="whitespace-nowrap text-6 font-semibold text-label-base">{stage.name}</p>
            )}
            {!isDraft && (
              <p className="whitespace-nowrap text-5 font-medium text-label-body">
                {stage.cards.length}
              </p>
            )}
          </div>

          {/* 우측 ButtonGroup: + → ⠿ → ✎ → 🗑(커스텀만) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="지원 내역 추가"
              onClick={() => onAddCard?.(stage.id)}
              className="flex size-4 items-center justify-center text-icon-gray"
            >
              <PlusSmallIcon />
            </button>
            <button
              type="button"
              aria-label="스테이지 순서 이동"
              className="flex size-4 cursor-grab items-center justify-center text-icon-gray"
            >
              <DragHandleIcon />
            </button>
            <button
              type="button"
              aria-label="스테이지 이름 수정"
              onClick={() => {
                setDraftName(stage.name);
                setIsEditingName(true);
              }}
              className="flex size-4 items-center justify-center text-icon-gray"
            >
              <EditIcon />
            </button>
            {!stage.isDefault && (
              <button
                type="button"
                aria-label="스테이지 삭제"
                onClick={() => onDeleteStage?.(stage.id)}
                className="flex size-4 items-center justify-center text-icon-gray"
              >
                <TrashIcon />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Card List */}
      <div ref={setNodeRef} className="w-full flex-1 overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col gap-3 px-4 pb-4">
          {stage.cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              stageId={stage.id}
              onEdit={() => onEditCard?.(card, stage.id)}
              onDelete={() => onDeleteCard?.(card)}
            />
          ))}
          {!isDraft && stage.cards.length === 0 && (
            <div className="flex w-full items-center justify-center rounded-xl border border-dashed border-line-secondary py-8 text-2 text-label-description">
              등록된 공고가 없어요
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Figma 헤더 좌측 장식 아이콘 — chevron-right(▸), 비활성 장식용
// PRD v1.3.0에서 "카드 목록 접기" 기능 삭제 → 클릭 이벤트 없음
function ChevronRightSmallIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6 4.5L10 8L6 11.5"
        stroke="#212123"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
