'use client';

import Image from 'next/image';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { EditIcon, TrashIcon } from '@/components/ui/icons';
import type { KanbanCard as KanbanCardType } from '@/types/api';
import { formatDeadlineText } from '../utils/formatDeadline';

interface KanbanCardProps {
  card: KanbanCardType;
  stageId: number;
  onCardClick?: (cardId: number) => void;
  onEditCard?: (card: KanbanCardType) => void;
  onDeleteCard?: (card: KanbanCardType) => void;
}

function handleOriginalLinkClick(event: React.MouseEvent<HTMLAnchorElement>) {
  event.stopPropagation();
}

function CalendarSmallIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3" width="10" height="9" rx="1.2" stroke="#9E9EA1" strokeWidth="1.2" />
      <path
        d="M2 5.5h10M4.5 1.5v3M9.5 1.5v3"
        stroke="#9E9EA1"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ExternalLinkIcon() {
  return <Image src="/icons/external-link.svg" alt="" width={14} height={14} />;
}

// ⚠️ [QA 반영] 카드를 "같은 스테이지 내 다른 카드" 위에 놓았을 때 그 위치로 재정렬할 수
// 있도록, 카드 자체도 드롭 대상(useDroppable)이 되도록 함. 기존엔 드롭 대상이 "스테이지
// 전체"뿐이라 어느 카드 위/아래에 놓았는지 구분할 방법이 없어 같은 스테이지 내 재정렬이
// 아예 불가능했음.
export function KanbanCard({ card, stageId, onCardClick, onEditCard, onDeleteCard }: KanbanCardProps) {
  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `card-${card.id}`,
    data: { type: 'card-zone', stageId, cardId: card.id },
  });

  // fix: id를 String으로 통일 — 신규 추가 스테이지 드래그 안 되는 버그 수정 (버그3)
  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    transform,
    isDragging,
  } = useDraggable({
    id: String(card.id),
    data: { stageId, card },
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.5 : 1 }
    : undefined;

  return (
    <div ref={setDroppableRef} className="w-full">
      <div
        ref={setDraggableRef}
        style={style}
        {...listeners}
        {...attributes}
        onClick={() => onCardClick?.(card.id)}
        className={`group flex w-full cursor-grab flex-col items-start justify-center active:cursor-grabbing ${isDragging ? 'z-50' : ''}`}
      >
        <div className="flex w-full items-start rounded-xl bg-base-white px-5 pb-3 pt-4">
          <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
            <div className="flex flex-col gap-1">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="text-3 font-medium text-label-body">{card.companyName}</p>
                  <p className="w-full truncate text-5 font-semibold text-label-base">
                    {card.jobTitle}
                  </p>
                </div>
                <div
                  className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => onEditCard?.(card)}
                    aria-label="지원 내역 수정"
                    className="flex size-5 items-center justify-center text-icon-gray"
                  >
                    <EditIcon size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteCard?.(card)}
                    aria-label="지원 내역 삭제"
                    className="flex size-5 items-center justify-center text-icon-gray"
                  >
                    <TrashIcon size={16} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <CalendarSmallIcon />
                <span className="flex-1 text-1 font-medium text-label-description">
                  {formatDeadlineText(card.deadline)}
                </span>
                {card.deadlineChanged && (
                  <span className="rounded px-1 py-[1px] text-0 font-medium bg-fill-negative-light text-status-negative">
                    마감일 변경
                  </span>
                )}
              </div>
            </div>
            <a
              href={card.originalUrl}
              target="_blank"
              rel="noreferrer"
              onClick={handleOriginalLinkClick}
              className="flex items-center gap-1 py-[6px] text-1 font-medium text-label-primary"
            >
              원본 공고 이동
              <ExternalLinkIcon />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
