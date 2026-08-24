'use client';

import { TrashIcon } from '@/components/ui/icons';

interface AttachedFileItemProps {
  name: string;
  size?: number;
  /** 아직 업로드되지 않은 파일은 다운로드할 수 없으므로 생략된다 */
  onDownload?: () => void;
  onDelete: () => void;
  disabled?: boolean;
}

// 첨부 파일 누적 리스트의 한 행 (Figma node 847:67339 "AttachmentItem").
// 파일명·용량이 2줄로 쌓이고 삭제 아이콘은 회색 박스 안 오른쪽에 들어간다.
export function AttachedFileItem({
  name,
  size,
  onDownload,
  onDelete,
  disabled = false,
}: AttachedFileItemProps) {
  const content = (
    <div className="flex min-w-0 flex-1 flex-col justify-center pl-5 text-left">
      <p className="w-full truncate text-2 font-medium text-label-base">{name}</p>
      <p className="w-full text-0 font-medium text-label-description">{formatFileSize(size)}</p>
    </div>
  );

  return (
    <div className="flex w-full min-w-0 items-center">
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden rounded-xl bg-neutral-100 py-4 pl-2 pr-6">
        {onDownload ? (
          <button
            type="button"
            onClick={onDownload}
            disabled={disabled}
            className="flex min-w-0 flex-1 disabled:cursor-not-allowed"
          >
            {content}
          </button>
        ) : (
          content
        )}
        <button
          type="button"
          onClick={onDelete}
          disabled={disabled}
          aria-label="첨부 파일 삭제"
          className="flex shrink-0 items-center text-icon-gray disabled:cursor-not-allowed"
        >
          <TrashIcon size={18} />
        </button>
      </div>
    </div>
  );
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return '';
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
