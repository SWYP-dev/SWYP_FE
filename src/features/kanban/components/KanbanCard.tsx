'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { KanbanCard as KanbanCardType } from '@/types/api';
import { formatDeadlineText } from '../utils/formatDeadline';

interface KanbanCardProps {
  card: KanbanCardType;
  stageId: number;
  onEdit?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
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
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5.5 3.5H3.5A1 1 0 0 0 2.5 4.5v6A1 1 0 0 0 3.5 11.5h6a1 1 0 0 0 1-1v-2M8 2.5h3.5V6M11.2 2.8 6.5 7.5"
        stroke="#4864F1"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function KanbanCard({ card, stageId, onClick }: KanbanCardProps) {
  // fix: id를 String으로 통일 — 신규 추가 스테이지 드래그 안 되는 버그 수정 (버그3)
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: String(card.id),
    data: { stageId, card },
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.5 : 1 }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`flex w-full cursor-grab flex-col items-start justify-center active:cursor-grabbing ${isDragging ? 'z-50' : ''}`}
    >
      <div className="flex w-full items-start rounded-xl bg-base-white px-5 pb-3 pt-4">
        <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
          <div className="flex flex-col gap-1">
            <div className="flex flex-col">
              <p className="text-3 font-medium text-label-body">{card.companyName}</p>
              <p className="w-full truncate text-5 font-semibold text-label-base">
                {card.jobTitle}
              </p>
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
  );
}
