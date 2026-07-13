'use client';

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { KanbanStage } from '@/types/api';
import { KanbanCard } from './KanbanCard';
import { DragHandleIcon, EditIcon, PlusSmallIcon, TrashIcon, TriangleDownFillIcon } from '@/components/ui/icons';

interface KanbanColumnProps {
  stage: KanbanStage;
  /** 전형 단계 추가 직후의 임시(draft) 컬럼 여부 — 헤더 TextField가 열린 채로 시작 */
  isDraft?: boolean;
  onRenameStage?: (stageId: number, newName: string) => void;
  onDeleteStage?: (stageId: number) => void;
  /** draft 컬럼 이름 확정 (Figma 49:7797 흐름) */
  onConfirmDraft?: (name: string) => void;
  /** draft 컬럼 취소 (빈 값 커밋 or ESC) */
  onCancelDraft?: () => void;
  onAddCard?: (stageId: number) => void;
}

// Figma KanbanColumn 마스터(50:14062) + "전형 단계 추가" 프레임(49:7797) 스펙 반영.
// 추가/수정 모두 헤더 인라인 TextField 방식. TextField 마스터(49:7636)는 default/error 상태 관리.
export function KanbanColumn({
  stage,
  isDraft = false,
  onRenameStage,
  onDeleteStage,
  onConfirmDraft,
  onCancelDraft,
  onAddCard,
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
          <div className="flex items-center gap-2">
            <TriangleDownFillIcon />
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
                    {/* ⚠️ 확인 필요: 실제 에러 문구는 Figma 49:7822 확인 후 교체 */}
                    전형 단계 이름을 입력해 주세요.
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
            {!isDraft && (
              <button
                type="button"
                aria-label="지원 내역 추가"
                onClick={() => onAddCard?.(stage.id)}
                className="flex size-4 items-center justify-center text-icon-gray"
              >
                <PlusSmallIcon />
              </button>
            )}
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

      {/* List — 세로 스크롤은 overflow-y-auto로만 처리 */}
      <div ref={setNodeRef} className="w-full flex-1 overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col gap-3 px-4 pb-4">
          {stage.cards.map((card) => (
            <KanbanCard key={card.id} card={card} stageId={stage.id} />
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
