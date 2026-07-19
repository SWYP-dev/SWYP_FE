'use client';

export interface DropdownMenuItem {
  label: string;
}

interface DropdownMenuProps {
  items: DropdownMenuItem[];
  onSelect: (item: DropdownMenuItem, index: number) => void;
  className?: string;
}

/**
 * Figma DropdownMenu 컴포넌트 (node 33:80) 구현.
 * https://www.figma.com/design/ar1tLubNIUVwLhU09duB9n/...?node-id=33-80
 *
 * ⚠️ Figma에서 default 상태만 확인됨. hover 배경색은 스펙에 없어서
 *    기존 --color-action-secondary-hover 토큰을 추정으로 가져다 씀 —
 *    hover variant 스펙 확인되면 교체 필요.
 *
 * items는 하드코딩하지 않고 props로 받도록 일반화함
 * (Figma 예시는 이력서/포트폴리오/개인 채널/기타 4개였으나,
 *  같은 props로 렌더링하면 시각적으로 100% 동일함).
 */
export function DropdownMenu({ items, onSelect, className = '' }: DropdownMenuProps) {
  return (
    <div
      role="menu"
      data-figma-node="33:80"
      className={`flex w-[108px] flex-col items-start gap-[var(--spacing-1)] overflow-clip rounded-[var(--radius-xl)] border border-[var(--color-line-secondary)] bg-[var(--color-neutral-0)] p-[var(--spacing-2)] ${className}`}
    >
      {items.map((item, index) => (
        <button
          key={item.label}
          type="button"
          role="menuitem"
          onClick={() => onSelect(item, index)}
          className="flex h-10 w-full items-center rounded-[var(--radius-lg)] px-[var(--spacing-5)] py-[var(--spacing-4)] text-left hover:bg-[var(--color-action-secondary-hover)]"
        >
          <span className="truncate text-[length:var(--text-3)] font-medium leading-[1.5] text-[var(--color-label-base)]">
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}
