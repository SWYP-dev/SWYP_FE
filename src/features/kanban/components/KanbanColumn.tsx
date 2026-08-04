'use client';

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { KanbanCard as KanbanCardType, KanbanStage } from '@/types/api';
import { KanbanCard } from './KanbanCard';
import { DragHandleIcon, EditIcon, PlusSmallIcon, TrashIcon } from '@/components/ui/icons';
import { pushDataLayerEvent } from '@/lib/gtm';

// ⚠️ 백엔드는 현재 "지원 전"만 isDefault:true로 내려주고(이동·이름변경 제한),
// "면접"/"최종 결과"는 서버 차원 제한이 없어 이름 변경/삭제가 실제로 가능한 상태임.
// 기획 확정(2026-07-26)에 따라 3개 기본 스테이지 모두 FE에서 이름 변경·삭제를
// 비활성화 처리함. 완전한 보호를 위해선 백엔드도 이 두 스테이지에 동일한 제약을
// 걸어야 함 — 별도 확인 요청 필요.
const DEFAULT_STAGE_NAMES = ['지원 전', '면접', '최종 결과'];

// 문자(한글/영문 등)나 숫자가 하나도 없으면 특수문자/이모지로만 이루어진 것으로 간주
function hasNoLetterOrDigit(value: string): boolean {
  return !/[\p{L}\p{N}]/u.test(value);
}

// 완성된 한글 음절(가~힣)이 아닌 낱자음/낱모음(ㄱ~ㅎ, ㅏ~ㅣ)만으로 이루어진 입력은
// hasNoLetterOrDigit로 걸러지지 않아(Unicode상 "글자"로 분류) 별도 감지.
function isOnlyHangulJamo(value: string): boolean {
  return /^[ㄱ-ㅎㅏ-ㅣ\s]+$/.test(value);
}

// API 명세서 3.7/3.8 이름 검증 규칙(K005~K009)과 동일한 기준으로 클라이언트 사전 검증.
function validateStageName(trimmed: string): string | undefined {
  if (!trimmed) return '전형 단계 이름을 입력해 주세요.';
  if (isOnlyHangulJamo(trimmed)) return '올바른 단어 형태로 입력해 주세요.';
  if (trimmed.length < 2) return '2자 이상 입력해 주세요.';
  if (trimmed.length > 20) return '20자를 초과하여 입력할 수 없어요.';
  if (hasNoLetterOrDigit(trimmed)) return '특수문자나 이모지는 입력할 수 없어요.';
  return undefined;
}

interface KanbanColumnProps {
  stage: KanbanStage;
  isDraft?: boolean;
  draftName?: string;
  onDraftNameChange?: (name: string) => void;
  onRenameStage?: (stageId: number, newName: string, position: number) => void;
  onDeleteStage?: (stageId: number) => void;
  onConfirmDraft?: (name: string) => void;
  onCancelDraft?: () => void;
  onAddCard?: (stageId: number) => void;
  onCardClick?: (cardId: number) => void;
  onEditCard?: (card: KanbanCardType) => void;
  onDeleteCard?: (card: KanbanCardType) => void;
}

export function KanbanColumn({
  stage,
  isDraft = false,
  draftName: draftNameProp,
  onDraftNameChange,
  onRenameStage,
  onDeleteStage,
  onConfirmDraft,
  onCancelDraft,
  onAddCard,
  onCardClick,
  onEditCard,
  onDeleteCard,
}: KanbanColumnProps) {
  // 카드 이동/재정렬 시 드롭 폴백 타깃(빈 스테이지 등)
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `stage-${stage.id}`,
    data: { type: 'stage-container', stageId: stage.id },
  });

  // ⚠️ [QA 반영] 카드 재정렬과 동일하게 @dnd-kit/sortable로 교체 — 기존
  // useDraggable 방식은 다른 컬럼이 자리를 안 비켜주고 겹쳐 보이는 문제가 있었음.
  const {
    attributes: stageDragAttributes,
    listeners: stageDragListeners,
    setNodeRef: setSortableRef,
    transform: stageTransform,
    transition: stageTransition,
    isDragging: isStageDragging,
  } = useSortable({
    id: `stage-drag-${stage.id}`,
    data: { type: 'stage', stageId: stage.id },
    disabled: isDraft || stage.name === '지원 전',
  });

  const stageDragStyle = {
    transform: CSS.Transform.toString(stageTransform),
    transition: stageTransition,
    opacity: isStageDragging ? 0.5 : 1,
  };

  // 드롭 가능 영역과 정렬 가능한 드래그 요소, 두 ref를 한 노드에 같이 적용
  function setColumnRef(node: HTMLDivElement | null) {
    setDroppableRef(node);
    setSortableRef(node);
  }

  const [isEditingName, setIsEditingName] = useState(isDraft);
  const [localDraftName, setLocalDraftName] = useState(isDraft ? '' : stage.name);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isLocked = stage.isDefault || DEFAULT_STAGE_NAMES.includes(stage.name);

  const draftName = isDraft ? (draftNameProp ?? '') : localDraftName;

  function updateDraftName(value: string) {
    if (isDraft) {
      onDraftNameChange?.(value);
    } else {
      setLocalDraftName(value);
    }
    setErrorMessage(null);
  }

  // 수정 버튼 클릭 / 단계명 더블클릭, 두 진입 경로를 하나로 묶고
  // GA 이벤트(stage_name_edit_trigger)로 어떤 방식을 더 많이 쓰는지 구분해서 트래킹한다.
  function startEditing(method: 'button' | 'double_click') {
    if (isDraft || isLocked) return;
    pushDataLayerEvent('stage_name_edit_trigger', { method });
    setLocalDraftName(stage.name);
    setIsEditingName(true);
  }

  function commit() {
    const trimmed = draftName.trim();
    if (isDraft) {
      const validationError = validateStageName(trimmed);
      if (validationError) {
        setErrorMessage(validationError);
        return;
      }
      onConfirmDraft?.(trimmed);
      return;
    }
    if (trimmed === stage.name) {
      setIsEditingName(false);
      return;
    }
    const validationError = validateStageName(trimmed);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    onRenameStage?.(stage.id, trimmed, stage.position);
    setIsEditingName(false);
  }

  function cancel() {
    if (isDraft) {
      onCancelDraft?.();
      return;
    }
    setLocalDraftName(stage.name);
    setIsEditingName(false);
    setErrorMessage(null);
  }

  return (
    <div
      ref={setColumnRef}
      style={stageDragStyle}
      className={`flex h-full min-w-[296px] flex-1 flex-col items-start rounded-2xl transition-colors ${
        isOver ? 'bg-fill-primary-light' : 'bg-surface-card'
      }`}
    >
      {/* Header */}
      <div className="flex w-full items-start p-5">
        <div className="flex min-h-7 flex-1 items-center justify-between">
          <div className="flex items-center">
            <div className="flex items-center gap-3">
              <div
                {...stageDragAttributes}
                {...stageDragListeners}
                className="flex cursor-grab items-center justify-center active:cursor-grabbing"
              >
                <DragHandleIcon size={20} />
              </div>
              {isEditingName ? (
                <div className="flex flex-col gap-3">
                  <input
                    autoFocus
                    value={draftName}
                    onChange={(e) => updateDraftName(e.target.value)}
                    onBlur={commit}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commit();
                      if (e.key === 'Escape') cancel();
                    }}
                    placeholder={isDraft ? '전형 단계를 입력하세요.' : '텍스트를 입력해 주세요.'}
                    className={`w-[168px] border-b-2 bg-transparent pb-2 text-5 font-medium text-label-base placeholder:text-label-placeholder outline-none ${
                      errorMessage ? 'border-status-negative' : 'border-line-secondary'
                    }`}
                  />
                  {errorMessage && (
                    <p className="text-1 font-medium text-status-negative">{errorMessage}</p>
                  )}
                </div>
              ) : (
                <p
                  onDoubleClick={() => startEditing('double_click')}
                  className={`whitespace-nowrap text-6 font-semibold text-label-base ${
                    isDraft || isLocked ? '' : 'cursor-text'
                  }`}
                >
                  {stage.name}
                </p>
              )}
            </div>
            {!isDraft && (
              <p className="ml-4 whitespace-nowrap text-5 font-medium text-label-body">
                {stage.cards.length}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="지원 내역 추가"
              disabled={isDraft}
              onClick={() => onAddCard?.(stage.id)}
              className={`flex size-5 items-center justify-center ${
                isDraft ? 'cursor-not-allowed opacity-30' : 'text-icon-gray'
              }`}
            >
              <PlusSmallIcon size={20} />
            </button>
            <button
              type="button"
              aria-label="스테이지 이름 수정"
              disabled={isDraft || isLocked}
              onClick={() => startEditing('button')}
              className={`flex size-5 items-center justify-center ${
                isDraft || isLocked ? 'cursor-not-allowed opacity-30' : 'text-icon-gray'
              }`}
            >
              <EditIcon size={20} />
            </button>
            <button
              type="button"
              aria-label="스테이지 삭제"
              disabled={isDraft || isLocked}
              onClick={() => {
                if (isDraft || isLocked) return;
                onDeleteStage?.(stage.id);
              }}
              className={`flex size-5 items-center justify-center ${
                isDraft || isLocked ? 'cursor-not-allowed opacity-30' : 'text-icon-gray'
              }`}
            >
              <TrashIcon size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Card List */}
      <div className="w-full flex-1 overflow-y-auto overflow-x-hidden kanban-scroll-y">
        <SortableContext
          items={stage.cards.map((c) => String(c.id))}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-3 px-5 pb-5">
            {stage.cards.map((card) => (
              <KanbanCard
                key={card.id}
                card={card}
                stageId={stage.id}
                onCardClick={onCardClick}
                onEditCard={onEditCard}
                onDeleteCard={onDeleteCard}
              />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
