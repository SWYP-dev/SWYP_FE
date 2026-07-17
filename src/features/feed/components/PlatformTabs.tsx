'use client';

import type { PlatformFilter } from '../types/feed';

interface PlatformTabsProps {
  value: PlatformFilter;
  onChange: (value: PlatformFilter) => void;
}

/**
 * 진영님 코멘트(4일 전): "사람인, 원티드는 추후 정책 결정되는대로 업데이트 예정"
 * → 정책 확정 전까지 UI만 배치하고 disabled 처리. 클릭 시 아무 동작 없음.
 * 정책 확정되면 disabled prop만 제거하면 바로 활성화되도록 구성.
 */

export function PlatformTabs({ value, onChange }: PlatformTabsProps) {
  return (
    <div className="flex w-full items-start gap-2">
      <TabButton label="전체" active={value === 'ALL'} onClick={() => onChange('ALL')} />
      <TabButton label="사람인" active={value === 'SARAMIN'} disabled />
      <TabButton label="원티드" active={value === 'WANTED'} disabled />
    </div>
  );
}

function TabButton({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={disabled ? '제휴 정책 확정 후 오픈 예정' : undefined}
      className={`flex items-center justify-center rounded-max border px-4 py-2 ${
        active ? 'border-line-primary bg-fill-primary-light' : 'border-line-secondary bg-neutral-0'
      } ${disabled ? 'cursor-not-allowed' : ''}`}
    >
      <span className={`text-3 font-medium ${active ? 'text-label-primary' : 'text-label-body'}`}>
        {label}
      </span>
    </button>
  );
}
