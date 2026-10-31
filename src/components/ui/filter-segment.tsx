'use client';

import { forwardRef, type ReactNode } from 'react';

/**
 * 통합 공고 탐색/스크랩의 직군·직무, 지역, 경력 필터를 하나로 묶는 큰 가로 바.
 * 안쪽 FilterSegment들이 세로 구분선으로 나뉘고, 각 세그먼트를 누르면 그 아래에 드롭다운이 열린다.
 */
export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-stretch divide-x divide-[var(--color-line-secondary)] overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-line-secondary)] bg-[var(--color-base-white)]">
      {children}
    </div>
  );
}

interface FilterSegmentProps {
  /** 윗줄 라벨 (예: "지역") */
  label: string;
  /** 아랫줄 값 (예: "전체", "서울 강남구 외 2개") */
  valueText: string;
  /** 필터가 실제로 적용돼 있는지 — 값 텍스트를 강조색으로 표시 */
  isApplied?: boolean;
  /** 드롭다운이 열려 있는지 */
  isOpen?: boolean;
  onClick: () => void;
}

/** FilterBar 안의 세그먼트 하나 — 윗줄 라벨 + 아랫줄 현재 값. */
export const FilterSegment = forwardRef<HTMLButtonElement, FilterSegmentProps>(
  function FilterSegment({ label, valueText, isApplied = false, isOpen = false, onClick }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        aria-expanded={isOpen}
        className={`flex min-w-[132px] cursor-pointer items-center justify-between gap-[var(--spacing-5)] px-[20px] py-[8px] text-left ${
          isOpen ? 'bg-[var(--color-neutral-50)]' : 'hover:bg-[var(--color-neutral-50)]'
        }`}
      >
        <span className="flex min-w-0 flex-col items-start gap-1">
          <span className="whitespace-nowrap text-[length:var(--text-1)] font-medium leading-[1.5] text-[var(--color-label-description)]">
            {label}
          </span>
          <span
            className={`max-w-[180px] truncate text-[length:var(--text-3)] font-semibold leading-[1.5] ${
              isApplied ? 'text-[var(--color-label-primary)]' : 'text-[var(--color-label-base)]'
            }`}
          >
            {valueText}
          </span>
        </span>
        {/* QA-023: 드롭다운이 열린다는 걸 보여주는 아이콘. 열려 있는 동안은 위로 뒤집는다. */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          className={`shrink-0 text-[var(--color-label-description)] transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    );
  }
);
