'use client';

import { FilterTriggerButton } from '@/components/ui/filter-trigger-button';

interface DeadlineSoonFilterButtonProps {
  /** deadlineSoon 쿼리 파라미터 값 */
  isActive: boolean;
  onToggle: (next: boolean) => void;
}

/**
 * 통합 공고 피드의 "마감일 임박" 필터.
 * Figma 확인: 직군・직무/지역/경력과 달리 화살표 아이콘이 없는 토글형 Button.
 * 팝오버/모달 없이 클릭할 때마다 API의 deadlineSoon(boolean) 파라미터를 바로 토글.
 */
export function DeadlineSoonFilterButton({ isActive, onToggle }: DeadlineSoonFilterButtonProps) {
  return (
    <FilterTriggerButton
      showChevron={false}
      isActive={isActive}
      onClick={() => onToggle(!isActive)}
    >
      마감일 임박
    </FilterTriggerButton>
  );
}
