'use client';

import type { DocumentItem } from '@/types/api';
import { TrashIcon } from '@/components/ui/icons';

interface AttachedLinkItemProps {
  document: Extract<DocumentItem, { type: 'LINK' }>;
  onDelete: () => void;
}

export function AttachedLinkItem({ document, onDelete }: AttachedLinkItemProps) {
  return (
    <div className="flex w-full items-center justify-between gap-2 rounded-lg border border-line-secondary bg-base-white px-3 py-2">
      <a
        href={document.url}
        target="_blank"
        rel="noreferrer"
        className="min-w-0 flex-1 truncate text-3 font-medium text-label-primary hover:underline"
      >
        {document.name}
      </a>
      <button
        type="button"
        onClick={onDelete}
        aria-label="링크 삭제"
        className="shrink-0 text-label-description"
      >
        <TrashIcon size={16} />
      </button>
    </div>
  );
}