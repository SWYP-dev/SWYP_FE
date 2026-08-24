'use client';

import { CloseIcon } from '@/components/ui/icons';
import { useEscapeKey } from '@/lib/hooks/useEscapeKey';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  /** 계속 작성 — 드로어를 닫지 않고 돌아간다 */
  onCancel: () => void;
  /** 나가기 — 변경분을 버리고 드로어를 닫는다 */
  onConfirm: () => void;
}

// 저장하지 않은 변경이 있는 상태에서 카드 상세 드로어를 닫으려 할 때 노출.
// 드로어(z-50) 위에 뜨므로 z-[60] — DeleteCardModal의 isOverDrawer와 동일한 규칙.
export function UnsavedChangesModal({ isOpen, onCancel, onConfirm }: UnsavedChangesModalProps) {
  useEscapeKey(isOpen, onCancel);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0" onClick={onCancel} aria-hidden="true" />
      <div className="relative flex w-[394px] flex-col gap-6 overflow-hidden rounded-[20px] bg-base-white py-6 shadow-spread-small">
        <div className="flex items-center justify-between px-8">
          <p className="text-7 font-semibold text-label-base">저장하지 않고 나갈까요?</p>
          <button type="button" onClick={onCancel} aria-label="닫기" className="text-label-base">
            <CloseIcon size={24} />
          </button>
        </div>

        <div className="px-8">
          <p className="whitespace-pre-wrap text-4 font-medium leading-[1.6] text-label-body">
            작성 중인 내용은 저장되지 않아요.
          </p>
        </div>

        {/* 기본 강조는 "계속 작성" — 실수로 닫아 메모를 잃는 쪽이 손실이 크다. */}
        <div className="flex items-center gap-4 px-8">
          <button
            type="button"
            onClick={onConfirm}
            className="flex h-10 flex-1 items-center justify-center rounded-xl border border-line-secondary text-5 font-medium text-label-base hover:bg-action-secondary-hover"
          >
            나가기
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-10 flex-1 items-center justify-center rounded-xl border border-transparent bg-fill-primary text-5 font-semibold text-base-white hover:bg-action-primary-hover"
          >
            계속 작성
          </button>
        </div>
      </div>
    </div>
  );
}
