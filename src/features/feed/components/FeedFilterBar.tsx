'use client';

import type { SortOption } from '../types/feed';
import type { SelectionValue } from '@/components/ui/selection-modal';
import { JobCategoryFilterButton } from './JobCategoryFilterButton';
import { RegionFilterButton } from './RegionFilterButton';
import { CareerFilterChip } from './CareerFilterChip';
import { DeadlineSoonFilterButton } from './DeadlineSoonFilterButton';

interface FeedFilterBarProps {
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;

  jobCategoryValue: SelectionValue | null;
  onJobCategoryApply: (value: SelectionValue | null) => void;

  regionValue: SelectionValue | null;
  onRegionApply: (value: SelectionValue | null) => void;

  careerRange: [number, number];
  onCareerApply: (range: [number, number]) => void;

  deadlineSoon: boolean;
  onDeadlineSoonToggle: (next: boolean) => void;
}

/**
 * 필터 + 정렬 행만 담당. 검색바는 components/layout/header.tsx가 전담한다.
 * sticky 처리는 이 컴포넌트가 아니라 page.tsx에서 Header와 함께 감싸는
 * 상위 wrapper(<div className="sticky top-0">)가 책임진다.
 */
export function FeedFilterBar({
  sort,
  onSortChange,
  jobCategoryValue,
  onJobCategoryApply,
  regionValue,
  onRegionApply,
  careerRange,
  onCareerApply,
  deadlineSoon,
  onDeadlineSoonToggle,
}: FeedFilterBarProps) {
  return (
    <div className="flex w-full items-center justify-between bg-base-white px-12 pb-4 pt-7">
      <div className="flex items-center gap-2">
        <JobCategoryFilterButton value={jobCategoryValue} onApply={onJobCategoryApply} />
        <RegionFilterButton value={regionValue} onApply={onRegionApply} />
        <CareerFilterChip appliedRange={careerRange} onApply={onCareerApply} />
        <DeadlineSoonFilterButton isActive={deadlineSoon} onToggle={onDeadlineSoonToggle} />
      </div>

      <div className="flex items-start gap-1">
        <button
          type="button"
          onClick={() => onSortChange('LATEST')}
          className="flex min-h-[14px] items-center gap-1"
        >
          <span
            className={`text-3 whitespace-nowrap ${
              sort === 'LATEST' ? 'font-semibold text-label-base' : 'font-normal text-label-body'
            }`}
          >
            최신순
          </span>
        </button>
        <span className="text-1 text-label-body">•</span>
        <button
          type="button"
          onClick={() => onSortChange('DEADLINE')}
          className="flex min-h-[14px] items-center gap-1"
        >
          <span
            className={`text-3 whitespace-nowrap ${
              sort === 'DEADLINE' ? 'font-semibold text-label-base' : 'font-normal text-label-body'
            }`}
          >
            마감일순
          </span>
        </button>
      </div>
    </div>
  );
}
