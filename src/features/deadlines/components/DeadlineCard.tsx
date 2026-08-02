'use client';

import { EditIcon, TrashIcon } from '@/components/ui/icons';
import { formatDeadlineText } from '@/features/kanban/utils/formatDeadline';
import type { DeadlineCardEntry } from '../utils/groupByDeadline';

interface DeadlineCardProps {
  entry: DeadlineCardEntry;
  isUrgent: boolean;
  isSelected: boolean;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function CalendarSmallIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3" width="10" height="9" rx="1.2" stroke="#9E9EA1" strokeWidth="1.2" />
      <path d="M2 5.5h10M4.5 1.5v3M9.5 1.5v3" stroke="#9E9EA1" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function DeadlineCard({ entry, isUrgent, isSelected, onClick, onEdit, onDelete }: DeadlineCardProps) {
  const { card, stageName } = entry;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
      className={`flex w-full cursor-pointer items-start gap-1 overflow-hidden rounded-xl border px-5 py-4 transition-colors ${
        isSelected
          ? 'border-neutral-200 bg-neutral-50'
          : 'border-line-secondary bg-base-white hover:bg-neutral-50'
      }`}
    >
      <div className="flex flex-1 items-stretch gap-5">
        <div
          className={`w-2 shrink-0 self-stretch rounded-max ${
            isUrgent ? 'bg-fill-primary' : 'bg-[var(--color-label-base)]'
          }`}
        />

        <div className="flex flex-1 flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col">
              <p className="text-3 font-medium text-label-body">{card.companyName}</p>
              <p className="w-full truncate text-5 font-semibold text-label-base">{card.jobTitle}</p>
            </div>
            <div className="flex items-center gap-2">
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
        <button type="button" onClick={onEdit} aria-label="수정" className="text-icon-gray">
          <EditIcon size={16} />
        </button>
        <button type="button" onClick={onDelete} aria-label="삭제" className="text-icon-gray">
          <TrashIcon size={16} />
        </button>
      </div>
    </div>
  );
}
