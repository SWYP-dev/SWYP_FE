'use client';

import { CloseIcon } from '@/components/ui/icons';
import { useEscapeKey } from '@/lib/hooks/useEscapeKey';

interface DeleteAccountModalProps {
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

// Figma "설정 - 계정(계정 삭제 모달 등장)"(node 226:28892) 스펙 반영.
export function DeleteAccountModal({
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteAccountModalProps) {
  useEscapeKey(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-base-dimmed" onClick={onClose} aria-hidden="true" />
      <div className="relative flex w-[394px] flex-col gap-6 overflow-hidden rounded-[20px] bg-base-white py-6 shadow-spread-small">
        <div className="flex items-center justify-between px-8">
          <p className="text-7 font-semibold text-label-base">계정 삭제</p>
          <button type="button" onClick={onClose} aria-label="닫기" className="text-label-base">
            <CloseIcon size={24} />
          </button>
        </div>

        <div className="px-8">
          <p className="text-4 font-medium leading-[1.6] text-label-body">
            계정과 모든 활동 기록이 삭제돼요.
          </p>
        </div>

        <div className="flex items-center gap-4 px-8">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex h-10 flex-1 items-center justify-center rounded-xl border border-line-secondary text-5 font-medium text-label-base hover:bg-action-secondary-hover disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex h-10 flex-1 items-center justify-center rounded-xl border border-transparent bg-status-negative text-5 font-semibold text-base-white disabled:opacity-50"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}
