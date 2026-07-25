'use client';

import Image from 'next/image';
import { useSortable } from '@dnd-kit/sortable';
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

// ⚠️ [QA 재작업] 기존엔 useDraggable+useDroppable을 직접 조합해서 카드 간 재정렬을
// 만들려 했는데, 기본 collisionDetection(rectIntersection)이 "카드"와 "카드를 감싸는
// 스테이지 전체"를 구분 못해 제대로 동작하지 않았음. 이미 설치돼 있던 @dnd-kit/sortable의
// useSortable로 교체 — 정확히 이런 "리스트 내 재정렬 + 여러 컨테이너 간 이동"을 위해
// 만들어진 라이브러리라 충돌 문제 없이 동작함.
export function KanbanCard({ card, stageId, onCardClick, onEditCard, onDeleteCard }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: String(card.id),
    data: { type: 'card', stageId, card },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
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
            className="flex w-fit items-center gap-1 py-[6px] text-1 font-medium text-label-primary"
          >
            원본 공고 이동
            <ExternalLinkIcon />
          </a>
        </div>
      </div>
    </div>
  );
}
