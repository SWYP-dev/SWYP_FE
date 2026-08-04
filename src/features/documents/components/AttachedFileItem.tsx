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
    <div className="flex w-full min-w-0 items-center gap-1 rounded-xl bg-neutral-100 py-4 pl-2 pr-6">
      <button
        type="button"
        onClick={onDownload}
        className="flex min-w-0 flex-1 flex-col items-start justify-center pl-4 text-left"
      >
        <p className="w-full min-w-0 truncate text-[13px] font-medium text-label-base">
          {document.name}
        </p>
        <p className="w-full text-left text-[11px] font-medium text-label-description">
          {formatFileSize(document.size)}
        </p>
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label="서류 삭제"
        className="shrink-0 text-icon-gray"
      >
        <TrashIcon size={18} />
      </button>
    </div>
  );
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return '';
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
