'use client';

import { Popover, popoverPanelChrome, usePopoverTrigger } from '@/components/ui/popover';
import { CAREER_LABELS, MAX_STEP, Slider } from '@/components/ui/slider';

interface CareerFilterChipProps {
  /** URL 쿼리와 동기화된, 실제 적용 중인 값 (step index, 0~15) */
  appliedRange: [number, number];
  onApply: (range: [number, number]) => void;
}

function formatChipLabel(min: number, max: number): string {
  if (min === 0 && max === MAX_STEP) return '경력';
  return `경력 ${CAREER_LABELS[min]} - ${CAREER_LABELS[max]}`;
}

/**
 * 통합 공고 피드의 경력 필터 칩.
 * Slider 자체 UI(신입~15년 이상)만 씀. 버튼(적용/초기화)은 Figma 스펙에
 * 없어서 넣지 않았고, onChange를 바로 onApply로 커밋하는 실시간 반영
 * 방식으로 둠 (CONVENTION.md의 URL 쿼리 기반 상태 관리 원칙 그대로).
 */
export function CareerFilterChip({ appliedRange, onApply }: CareerFilterChipProps) {
  const { isOpen, triggerRef, toggle, close } = usePopoverTrigger<HTMLButtonElement>();
  const isFullRange = appliedRange[0] === 0 && appliedRange[1] === MAX_STEP;

  return (
    <>
      <button
        ref={triggerRef}
        onClick={toggle}
        aria-expanded={isOpen}
        className={`inline-flex items-center gap-1 rounded-[var(--radius-max)] border px-[var(--spacing-5)] py-[var(--spacing-3)] text-[length:var(--text-3)] whitespace-nowrap ${
          isOpen || !isFullRange
            ? 'border-[var(--color-line-primary)] text-[var(--color-label-primary)]'
            : 'border-[var(--color-line-secondary)] text-[var(--color-label-body)]'
        }`}
      >
        {formatChipLabel(appliedRange[0], appliedRange[1])} ▾
      </button>

      <Popover
        isOpen={isOpen}
        onClose={close}
        triggerRef={triggerRef}
        align="start"
        className={popoverPanelChrome}
      >
        <Slider
          minValue={appliedRange[0]}
          maxValue={appliedRange[1]}
          onChange={(min, max) => onApply([min, max])}
        />
      </Popover>
    </>
  );
}
