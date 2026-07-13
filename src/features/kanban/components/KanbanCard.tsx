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
}

function handleOriginalLinkClick(event: React.MouseEvent<HTMLAnchorElement>) {
  event.stopPropagation();
}

function CalendarSmallIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3" width="10" height="9" rx="1.2" stroke="#9E9EA1" strokeWidth="1.2" />
      <path d="M2 5.5h10M4.5 1.5v3M9.5 1.5v3" stroke="#9E9EA1" strokeWidth="1.2" strokeLinecap="round" />
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

// Figma Card 컴포넌트(node 49:7685) 스펙 반영.
// 드래그 핸들과 버튼 클릭 충돌 방지:
//   - 드래그: 카드 전체 영역 (listeners/attributes)
//   - 수정/삭제 버튼: e.stopPropagation()으로 드래그 이벤트 차단
// deadlineChanged: true일 경우 마감일 옆에 경고 표시
export function KanbanCard({ card, stageId, onEdit, onDelete }: KanbanCardProps) {
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
          {/* 타이틀 영역 */}
          <div className="flex flex-col gap-1">
            <div className="flex flex-col">
              <p className="text-3 font-medium text-label-body">{card.companyName}</p>
              <p className="w-full truncate text-5 font-semibold text-label-base">
                {card.jobTitle}
              </p>
            </div>
            {/* 마감일 + deadlineChanged 경고 */}
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

          {/* 원본 공고 이동 */}
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

          {/* 수정 / 삭제 버튼 */}
          <div className="flex items-center gap-2 pt-1 border-t border-line-secondary mt-1">
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.();
              }}
              className="flex-1 py-1 text-1 font-medium text-label-body hover:text-label-base"
            >
              수정
            </button>
            <div className="h-3 w-px bg-line-secondary" />
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.();
              }}
              className="flex-1 py-1 text-1 font-medium text-status-negative hover:opacity-70"
            >
              삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}