'use client';

import { EditIcon, TrashIcon } from '@/components/ui/icons';
import { formatDeadlineText } from '@/features/kanban/utils/formatDeadline';
import type { DeadlineCardEntry } from '../utils/groupByDeadline';

interface DeadlineCardProps {
  entry: DeadlineCardEntry;
  /** 그룹이 오늘/내일(urgent)인지 — Divider 색상(파랑/검정)에 사용 */
  isUrgent: boolean;
  /** 현재 Drawer에 열려있는 카드인지 — 배경 강조 표시 */
  isSelected: boolean;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
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

// Figma "지원 마감일 메인" Card(node 101:17530 등) 스펙 반영.
// isUrgent(오늘/내일 그룹) = 파란색, 그 외 = 검정(--color-label-base).
// ⚠️ FIX: 좌측 액센트 바가 안 보이던 버그 수정.
// 바 높이를 부모 기준 h-full(퍼센트)로 잡았는데, 부모가 items-center라 자식을
// 콘텐츠 높이(=0, 바는 내용이 없음)로만 배치해서 바가 찌그러져 있었음.
// 부모를 items-stretch로 바꿔 형제(텍스트 영역) 높이에 맞춰 자동으로 늘어나도록 수정.
export function DeadlineCard({
  entry,
  isUrgent,
  isSelected,
  onClick,
  onEdit,
  onDelete,
}: DeadlineCardProps) {
  const { card, stageName } = entry;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
      className={`flex w-full cursor-pointer items-start gap-1 overflow-hidden rounded-xl border px-4 py-3 transition-colors ${
        isSelected
          ? 'border-neutral-200 bg-neutral-50'
          : 'border-line-secondary bg-base-white hover:bg-neutral-50'
      }`}
    >
      <div className="flex flex-1 items-stretch gap-4">
        <div
          className={`w-2 shrink-0 self-stretch rounded-max ${
            isUrgent ? 'bg-fill-primary' : 'bg-[var(--color-label-base)]'
          }`}
        />

        <div className="flex flex-1 flex-col gap-2 py-1">
          <div className="flex flex-col gap-1">
            <div className="flex flex-col">
              <p className="text-3 font-medium text-label-body">{card.companyName}</p>
              <p className="w-full truncate text-5 font-semibold text-label-base">
                {card.jobTitle}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <CalendarSmallIcon />
              <span className="text-1 font-medium text-label-description">
                {formatDeadlineText(card.deadline)}
              </span>
            </div>
          </div>

          <span className="inline-flex w-fit items-center gap-[2px] rounded-md bg-neutral-200 px-2 py-[2px] text-0 font-medium text-label-body">
            {stageName}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-start gap-[6px]" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onEdit} aria-label="수정" className="text-label-base">
          <EditIcon size={16} />
        </button>
        <button type="button" onClick={onDelete} aria-label="삭제" className="text-label-base">
          <TrashIcon size={16} />
        </button>
      </div>
    </div>
  );
}
