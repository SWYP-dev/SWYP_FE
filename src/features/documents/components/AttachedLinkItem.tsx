'use client';

import type { DocumentItem } from '@/types/api';
import { TrashIcon } from '@/components/ui/icons';

interface AttachedLinkItemProps {
  document: Extract<DocumentItem, { type: 'LINK' }>;
  onDelete: () => void;
}

export function AttachedLinkItem({ document, onDelete }: AttachedLinkItemProps) {
  return (
    <div className="flex w-full min-w-0 items-start gap-2">
      <div className="flex w-[108px] shrink-0 items-center rounded-xl border border-line-secondary bg-neutral-100 py-2 pl-4 pr-[11px]">
        <span className="flex-1 text-3 font-medium text-label-description">{document.name}</span>
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
        <button type="button" onClick={onDelete} aria-label="링크 삭제" className="shrink-0">
          <TrashIcon size={18} />
        </button>
      </div>
    </div>
  );
}
