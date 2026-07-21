'use client';

import { CloseIcon } from '@/components/ui/icons';
import type { KanbanCard } from '@/types/api';

interface DeleteCardModalProps {
  isOpen: boolean;
  card: KanbanCard | null;
  isOverDrawer?: boolean;
  onClose: () => void;
  onConfirm: (cardId: number) => void;
}

// 지원 내역 삭제 확인 팝업 (PRD 4.2.2: "카드 삭제 시 유실 방지 확인 팝업 노출" 필수)
// 삭제 확인 후 → KanbanBoard/DeadlineList에서 토스트 노출.
export function DeleteCardModal({
  isOpen,
  card,
  isOverDrawer = false,
  onClose,
  onConfirm,
}: DeleteCardModalProps) {
  if (!isOpen || !card) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center ${isOverDrawer ? 'z-[60]' : 'z-50'}`}
    >
      <div
        className={`absolute inset-0 ${isOverDrawer ? '' : 'bg-base-dimmed'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative flex w-[394px] flex-col gap-6 overflow-hidden rounded-[20px] bg-base-white py-6 shadow-spread-small">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-8">
          <p className="text-7 font-semibold text-label-base">지원 내역 삭제</p>
          <button type="button" onClick={onClose} aria-label="닫기" className="text-label-base">
            <CloseIcon size={24} />
          </button>
        </div>

        {/* 본문 */}
        <div className="px-8">
          <p className="whitespace-pre-wrap text-4 font-medium leading-[1.6] text-label-body">
            {`'${card.companyName}' 지원 내역을 삭제할까요?\n삭제한 내역은 되돌릴 수 없어요.`}
          </p>
        </div>

        {/* 푸터 */}
        <div className="flex items-center gap-3 px-8">
          <button
            type="button"
            onClick={onClose}
            className="flex flex-1 items-center justify-center rounded-xl border border-line-secondary py-3 text-5 font-medium text-label-base hover:bg-action-secondary-hover"
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => onConfirm(card.id)}
            className="flex flex-1 items-center justify-center rounded-xl bg-status-negative py-3 text-5 font-semibold text-base-white"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}
