'use client';

import { forwardRef } from 'react';

interface FilterTriggerButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  /** 팝오버형(직군・직무, 지역, 경력)은 true, 토글형(마감일 임박)은 false */
  showChevron?: boolean;
  /** 필터가 적용된 상태 (팝오버가 열려있거나 값이 선택된 경우) */
  isActive?: boolean;
}

/**
 * 통합 공고 피드 필터 트리거 버튼.
 * Figma Button 컴포넌트(node 34:3599)를 그대로 재사용한 것 — 별도 컴포넌트가
 * 아니라 텍스트 + 화살표 아이콘 유무로 구분해서 씀 (직군·직무/지역/경력 = 아이콘 있음,
 * 마감일 임박 = 아이콘 없음).
 *
 * isActive 스타일(fill/primary-light 배경 + line/primary 테두리 + label/primary 텍스트)은
 * Figma에 트리거 버튼 자체의 active variant가 없어서, 같은 프레임 안의 플랫폼 필터
 * "전체" 버튼(선택 상태)에 이미 쓰이고 있는 패턴을 그대로 가져온 것.
 */
export const FilterTriggerButton = forwardRef<HTMLButtonElement, FilterTriggerButtonProps>(
  function FilterTriggerButton({ children, onClick, showChevron = true, isActive = false }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        aria-expanded={showChevron ? isActive : undefined}
        aria-pressed={!showChevron ? isActive : undefined}
        className={`inline-flex items-center justify-center gap-[var(--spacing-1)] rounded-[var(--radius-lg)] border py-[var(--spacing-3)] ${
          showChevron ? 'pl-[12px] pr-[7px]' : 'px-[var(--spacing-4)]'
        } ${
          isActive
            ? 'border-[var(--color-line-primary)] bg-[var(--color-fill-primary-light)] text-[var(--color-label-primary)]'
            : 'border-[var(--color-line-secondary)] bg-[var(--color-neutral-0)] text-[var(--color-label-base)]'
        }`}
      >
        <span className="whitespace-nowrap text-[length:var(--text-3)] font-medium leading-[1.5]">
          {children}
        </span>
        {showChevron && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M4 6L8 10L12 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    );
  }
);
