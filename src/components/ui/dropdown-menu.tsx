'use client';

export interface DropdownMenuItem {
  label: string;
}

interface DropdownMenuProps {
  items: DropdownMenuItem[];
  onSelect: (item: DropdownMenuItem, index: number) => void;
  className?: string;
  /** 선택된 항목 인덱스. 지정하면 해당 항목에 강조 배경 + 체크 아이콘 표시 (Figma SelectMenu, node 101:17673) */
  selectedIndex?: number;
}

export function DropdownMenu({ items, onSelect, className = '', selectedIndex }: DropdownMenuProps) {
  return (
    <div
      role="menu"
      data-figma-node="33:80"
      className={`flex flex-col items-start gap-1 overflow-clip rounded-xl border border-line-secondary bg-base-white p-1 ${className}`}
    >
      {items.map((item, index) => {
        const isSelected = index === selectedIndex;
        return (
          <button
            key={item.label}
            type="button"
            role="menuitem"
            onClick={() => onSelect(item, index)}
            className={`flex h-12 w-full items-center justify-between gap-2 rounded-lg px-4 py-3 text-left ${
              isSelected ? 'bg-neutral-100' : 'hover:bg-action-secondary-hover'
            }`}
          >
            <span
              className={`truncate text-4 leading-[1.5] text-label-base ${
                isSelected ? 'font-semibold' : 'font-medium'
              }`}
            >
              {item.label}
            </span>
            {isSelected && <CheckIcon />}
          </button>
        );
      })}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5 12l5 5L19 8"
        stroke="#212123"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
