'use client';

import type { DocumentItem } from '@/types/api';
import { TrashIcon } from '@/components/ui/icons';

interface AttachedLinkItemProps {
  document: Extract<DocumentItem, { type: 'LINK' }>;
  onDelete: () => void;
}

// Figma "지원 현황 상세(URL 입력 완료)"(node 167:31389) UrlItemSlot 반영.
// fix: document.name(카테고리)을 링크 텍스트로 잘못 표시하던 버그 수정 — 카테고리 뱃지 + 실제 URL 분리 표시
export function AttachedLinkItem({ document, onDelete }: AttachedLinkItemProps) {
  return (
    <div className="flex w-full items-start gap-2">
      <div className="flex w-[108px] shrink-0 items-center rounded-xl border border-line-secondary bg-neutral-100 py-2 pl-4 pr-[11px]">
        <span className="flex-1 text-3 font-medium text-label-description">{document.name}</span>
      </div>
      <div className="flex flex-1 items-center gap-2 rounded-xl border border-line-secondary bg-neutral-100 px-4 py-3">
        <a
          href={document.url}
          target="_blank"
          rel="noreferrer"
          className="min-w-0 flex-1 truncate text-3 font-medium text-label-base"
        >
          {document.url}
        </a>
        <button type="button" onClick={onDelete} aria-label="링크 삭제" className="shrink-0">
          <TrashIcon size={18} />
        </button>
      </div>
    </div>
  );
}
