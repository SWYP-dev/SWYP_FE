'use client';

import { useState } from 'react';
import type { DocumentItem } from '@/types/api';
import { AttachmentCategoryDropdown } from './AttachmentCategoryDropdown';
import { TrashIcon } from '@/components/ui/icons';

interface AttachedFileItemProps {
  document: Extract<DocumentItem, { type: 'FILE' }>;
  onDownload: () => void;
  onDelete: () => void;
}

// TODO: Figma에 FileListSlot 실제 아이템 시안 없음 — 확정되면 마크업/스타일 교체
export function AttachedFileItem({ document, onDownload, onDelete }: AttachedFileItemProps) {
  // TODO: 카테고리는 API 4.1/4.4 응답에 필드가 없어 로컬 상태로만 유지 (세영님·동섭님 확인 대기)
  const [category, setCategory] = useState<string | null>(null);

  return (
    <div className="flex w-full items-center justify-between gap-2 rounded-lg border border-line-secondary bg-base-white px-3 py-2">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <button
          type="button"
          onClick={onDownload}
          className="min-w-0 truncate text-left text-3 font-medium text-label-base hover:underline"
        >
          {document.name}
        </button>
        <span className="shrink-0 text-1 font-medium text-label-description">
          v{document.version}
        </span>
        <AttachmentCategoryDropdown selectedCategory={category} onSelectCategory={setCategory} />
      </div>
      <button
        type="button"
        onClick={onDelete}
        aria-label="서류 삭제"
        className="shrink-0 text-label-description"
      >
        <TrashIcon size={16} />
      </button>
    </div>
  );
}
