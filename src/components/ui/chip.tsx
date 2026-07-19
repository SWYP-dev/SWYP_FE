import type { ReactNode } from 'react';

interface ChipProps {
  children: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

// Figma Chip 컴포넌트(node 26:3460) 스펙 반영.
// 작은 필터 요약 태그용 (예: 직군·직무 모달 내 "지역(1) 부산 전체").
// ⚠️ 메인 피드의 "전체/사람인/원티드" 큰 필터 버튼과는 다른 컴포넌트로 추정됨 - 확인 필요.
export function Chip({ children, leftIcon, rightIcon }: ChipProps) {
  return (
    <span className="inline-flex items-center justify-center gap-1 rounded-lg bg-neutral-50 px-3 py-[6px]">
      {leftIcon}
      <span className="text-0 font-semibold text-neutral-600">{children}</span>
      {rightIcon}
    </span>
  );
}
