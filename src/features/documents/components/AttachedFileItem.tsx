'use client';

import type { DocumentItem } from '@/types/api';
import { TrashIcon } from '@/components/ui/icons';

interface AttachedFileItemProps {
  document: Extract<DocumentItem, { type: 'FILE' }>;
  onDownload: () => void;
  onDelete: () => void;
}

// ⚠️ [QA 반영 — 세영님 확인] 동일 공고 내 같은 파일명을 재업로드하면 API 응답의
// `version`은 정상적으로 증가하는데(1, 2, 3...), 화면에는 원본 파일명(`name`)만 그대로
// 보여서 어떤 버전인지 구분이 안 됐음. 백엔드가 `name` 자체에 버전 접미사를 붙여주는지
// 여부와 무관하게, FE에서 항상 `document.version` 값으로 "{파일명}_v{버전}.{확장자}"
// 형태를 직접 조합해서 보여주도록 처리.
function buildVersionedFileName(name: string, version: number): string {
  const lastDotIndex = name.lastIndexOf('.');
  if (lastDotIndex <= 0) return `${name}_v${version}`;
  const base = name.slice(0, lastDotIndex);
  const ext = name.slice(lastDotIndex); // ".pdf" 등 (점 포함)
  // 혹시 이름에 이미 "_v숫자" 접미사가 붙어있다면 중복으로 덧붙지 않도록 제거 후 재조합
  const cleanBase = base.replace(/_v\d+$/i, '');
  return `${cleanBase}_v${version}${ext}`;
}

export function AttachedFileItem({ document, onDownload, onDelete }: AttachedFileItemProps) {
  const displayName = buildVersionedFileName(document.name, document.version);

  return (
    <div className="flex w-full min-w-0 items-center gap-1 rounded-xl bg-neutral-100 py-4 pl-2 pr-6">
      <button
        type="button"
        onClick={onDownload}
        className="flex min-w-0 flex-1 flex-col items-center justify-center pl-4 text-center"
      >
        <p className="w-full min-w-0 truncate text-[13px] font-medium text-label-base">
          {displayName}
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
