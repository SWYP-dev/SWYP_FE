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
// ⚠️ FIX: 좌측 Divider 바 색상 미적용 버그 수정.
// 기존 'bg-neutral-900'가 이 프로젝트 Tailwind 토큰 스케일(50/100/200/700/1000 확인됨)에서
// 실제 생성되는 유틸리티인지 불확실해 값이 적용되지 않고 항상 파란색(bg-fill-primary)으로
// 보이는 문제가 있었음. tokens.css에 확정적으로 존재하는 CSS 변수
// --color-label-base(#212123, Figma의 neutral/900과 동일 hex)를 직접 참조하도록 변경.
// isUrgent(오늘/내일 그룹) = 파란색, 그 외 = 검정.
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
      <div className="flex flex-1 items-center gap-4">
        <div
          className={`h-full w-1 shrink-0 rounded-max ${
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
