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
  // fix: id를 String으로 통일 — 신규 추가 스테이지 드래그 안 되는 버그 수정 (버그3)
  const { setNodeRef, isOver } = useDroppable({
    id: String(stage.id),
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
    // fix: overflow-hidden 제거 — 드래그 시 카드가 컬럼에 잘리는 버그 수정 (버그1)
    <div
      className={`flex h-full min-w-[296px] flex-1 flex-col items-start rounded-2xl transition-colors ${
        isOver ? 'bg-fill-primary-light' : 'bg-surface-card'
      }`}
    >
      {/* Header */}
      <div className="flex w-full items-start p-4">
        <div className="flex min-h-7 flex-1 items-center justify-between">
          <div className="flex items-center gap-2">
            <DragHandleIcon size={20} />
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
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="지원 내역 추가"
              onClick={() => onAddCard?.(stage.id)}
              className="flex size-5 items-center justify-center text-icon-gray"
            >
              <PlusSmallIcon size={20} />
            </button>
            <button
              type="button"
              aria-label="스테이지 이름 수정"
              onClick={() => {
                setDraftName(stage.name);
                setIsEditingName(true);
              }}
              className="flex size-5 items-center justify-center text-icon-gray"
            >
              <EditIcon size={20} />
            </button>
            <button
              type="button"
              aria-label="스테이지 삭제"
              onClick={() => onDeleteStage?.(stage.id)}
              className="flex size-5 items-center justify-center text-icon-gray"
            >
              <TrashIcon size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Card List */}
      <div
        ref={setNodeRef}
        className="w-full flex-1 overflow-y-auto overflow-x-hidden kanban-scroll-y"
      >
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
