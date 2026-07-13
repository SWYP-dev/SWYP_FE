'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { KanbanCard as KanbanCardType } from '@/types/api';
import { formatDeadlineText } from '../utils/formatDeadline';

interface KanbanCardProps {
  card: KanbanCardType;
  stageId: number;
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

// Figma Card 컴포넌트(node 49:7685 등) 스펙 반영.
// 통합 공고 피드의 JobCard와 달리 썸네일/뱃지 없이 회사명·공고명·마감일·원본링크만 노출
// (API 명세서 3.1 변경 메모: 칸반 카드는 memo 미노출 확정).
// TODO: 카드 클릭 시 상세 슬라이드 패널(3.4) 오픈 — 해당 Figma 프레임 받으면 연동.
export function KanbanCard({ card, stageId }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
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
      className="flex w-full cursor-grab flex-col items-start justify-center active:cursor-grabbing"
    >
      <div className="flex w-full items-start rounded-xl bg-base-white px-6 pb-3 pt-4">
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
