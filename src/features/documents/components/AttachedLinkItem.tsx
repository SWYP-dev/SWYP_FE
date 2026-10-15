'use client';

import { useEffect, useRef, useState } from 'react';
import { TrashIcon } from '@/components/ui/icons';

// Figma node 38199:50756 기준 — URL 카테고리 드롭다운 옵션
// ⚠️ [백엔드 확인 완료] 서버는 한글이 아닌 enum 값(DocumentLinkCategory)을 받음/내려줌.
export const URL_CATEGORIES = [
  { value: 'RESUME', label: '이력서' },
  { value: 'PORTFOLIO', label: '포트폴리오' },
  { value: 'PERSONAL_CHANNEL', label: '개인 채널' },
  { value: 'OTHER', label: '기타' },
] as const;

export type UrlCategoryValue = (typeof URL_CATEGORIES)[number]['value'];

export function categoryLabel(category: string): string {
  return URL_CATEGORIES.find((c) => c.value === category)?.label ?? category;
}

interface AttachedLinkItemProps {
  category: string;
  url: string;
  onDelete: () => void;
  /** 카테고리 박스를 눌러 드롭다운에서 카테고리를 바꿀 때 호출 */
  onCategoryChange: (category: UrlCategoryValue) => void;
  disabled?: boolean;
}

// URL 누적 리스트의 한 행 (Figma node 847:67330).
// 등록은 상단 입력 슬롯에서만 하며, 이 행에서는 카테고리 박스를 눌러 카테고리만 수정할 수 있다
// (URL 값은 수정 불가).
export function AttachedLinkItem({
  category,
  url,
  onDelete,
  onCategoryChange,
  disabled = false,
}: AttachedLinkItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);

  // 드롭다운 바깥 클릭 시 닫기
  useEffect(() => {
    if (!isOpen) return;
    function handleMouseDown(e: MouseEvent) {
      if (categoryRef.current?.contains(e.target as Node)) return;
      setIsOpen(false);
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [isOpen]);

  return (
    <div className="flex w-full min-w-0 items-stretch gap-3">
      <div ref={categoryRef} className="relative w-[108px] shrink-0">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen((v) => !v)}
          aria-label="카테고리 변경"
          aria-expanded={isOpen}
          className="flex h-full w-full items-center justify-between rounded-xl border border-line-secondary bg-neutral-100 py-3 pl-5 pr-[11px] disabled:cursor-not-allowed"
        >
          <span className="text-3 font-medium text-label-base">{categoryLabel(category)}</span>
          <ChevronDownIcon />
        </button>
        {isOpen && (
          // URL 섹션이 드로어 최하단이라 아래로 열면 저장 바에 잘린다 → 위로 펼침.
          <div className="absolute bottom-[calc(100%+4px)] left-0 z-10 flex w-[108px] flex-col gap-1 overflow-hidden rounded-xl border border-line-secondary bg-base-white p-2">
            {URL_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => {
                  onCategoryChange(cat.value);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center rounded-lg px-5 py-[10px] text-3 font-medium text-label-base ${
                  category === cat.value ? 'bg-neutral-100' : 'hover:bg-neutral-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden rounded-xl bg-neutral-100 px-6 py-4">
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="min-w-0 flex-1 truncate text-3 font-medium text-label-base"
        >
          {url}
        </a>
        <button
          type="button"
          onClick={onDelete}
          disabled={disabled}
          aria-label="URL 삭제"
          className="flex shrink-0 items-center text-icon-gray disabled:cursor-not-allowed"
        >
          <TrashIcon size={18} />
        </button>
      </div>
    </div>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 6l4 4 4-4"
        stroke="var(--color-icon-gray)"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
