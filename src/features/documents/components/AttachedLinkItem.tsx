'use client';

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
  disabled?: boolean;
}

// URL 누적 리스트의 한 행 (Figma node 847:67330).
// 등록은 상단 입력 슬롯에서만 하므로 이 행은 읽기 전용 — 카테고리 박스로 유형을 식별한다.
export function AttachedLinkItem({
  category,
  url,
  onDelete,
  disabled = false,
}: AttachedLinkItemProps) {
  return (
    <div className="flex w-full min-w-0 items-stretch gap-3">
      <div className="flex w-[108px] shrink-0 items-center rounded-xl border border-line-secondary bg-neutral-100 py-3 pl-5 pr-[11px]">
        <span className="text-3 font-medium text-label-base">{categoryLabel(category)}</span>
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
