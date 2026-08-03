'use client';

import type { DocumentItem } from '@/types/api';
import { TrashIcon } from '@/components/ui/icons';

interface AttachedLinkItemProps {
  document: Extract<DocumentItem, { type: 'LINK' }>;
  onDelete: () => void;
}

// ⚠️ [백엔드 확인] category가 name과 분리된 별도 필드로 확정됨 — 카테고리 표시는
// document.category 기준으로 처리 (document.name은 더 이상 카테고리 값이 아님).
const CATEGORY_LABELS: Record<string, string> = {
  RESUME: '이력서',
  PORTFOLIO: '포트폴리오',
  PERSONAL_CHANNEL: '개인 채널',
  OTHER: '기타',
};

export function AttachedLinkItem({ document, onDelete }: AttachedLinkItemProps) {
  const label = CATEGORY_LABELS[document.category] ?? document.category;

  return (
    <div className="flex w-full min-w-0 items-stretch gap-2">
      <div className="flex w-[108px] shrink-0 items-center rounded-xl border border-line-secondary bg-neutral-100 py-3 pl-4 pr-[11px]">
        <span className="flex-1 text-3 font-medium text-label-description">{label}</span>
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-line-secondary bg-neutral-100 px-4 py-3">
        <a
          href={document.url}
          target="_blank"
          rel="noreferrer"
          className="min-w-0 flex-1 truncate text-3 font-medium text-label-base"
        >
          {document.url}
        </a>
        <button
          type="button"
          onClick={onDelete}
          aria-label="링크 삭제"
          className="shrink-0 text-icon-gray"
        >
          <TrashIcon size={18} />
        </button>
      </div>
    </div>
  );
}
