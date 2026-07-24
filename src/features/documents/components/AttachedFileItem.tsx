'use client';

import type { DocumentItem } from '@/types/api';
import { TrashIcon } from '@/components/ui/icons';

interface AttachedFileItemProps {
  document: Extract<DocumentItem, { type: 'FILE' }>;
  onDownload: () => void;
  onDelete: () => void;
}

export function AttachedFileItem({ document, onDownload, onDelete }: AttachedFileItemProps) {
  return (
    <div className="flex w-full min-w-0 items-center gap-1 rounded-xl bg-neutral-100 py-3 pl-1 pr-5">
      <button
        type="button"
        onClick={onDownload}
        className="flex min-w-0 flex-1 flex-col items-center justify-center pl-4 text-center"
      >
        <p className="w-full min-w-0 truncate text-[13px] font-medium text-label-base">
          {document.name}
        </p>
        <p className="w-full text-[11px] font-medium text-label-description">
          {formatFileSize(document.size)}
        </p>
      </button>
      <button type="button" onClick={onDelete} aria-label="서류 삭제" className="shrink-0">
        <TrashIcon size={18} />
      </button>
    </div>
  );
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return '';
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
