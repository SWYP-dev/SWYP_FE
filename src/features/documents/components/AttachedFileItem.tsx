'use client';

import type { DocumentItem } from '@/types/api';
import { TrashIcon } from '@/components/ui/icons';

interface AttachedFileItemProps {
  document: Extract<DocumentItem, { type: 'FILE' }>;
  onDownload: () => void;
  onDelete: () => void;
}

// Figma "지원 현황 상세(첨부 파일 추가 버튼 클릭)"(node 167:31325) FileListSlot 반영.
export function AttachedFileItem({ document, onDownload, onDelete }: AttachedFileItemProps) {
  return (
    <div className="flex w-full items-center gap-1 rounded-xl bg-neutral-100 py-3 pl-1 pr-5">
      <button
        type="button"
        onClick={onDownload}
        className="flex flex-1 flex-col items-center justify-center pl-4 text-center"
      >
        <p className="w-full truncate text-[13px] font-medium text-label-base">{document.name}</p>
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
