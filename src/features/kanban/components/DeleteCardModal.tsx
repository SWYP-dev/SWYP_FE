'use client';

import { CloseIcon } from '@/components/ui/icons';
import { useEscapeKey } from '@/lib/hooks/useEscapeKey';
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
  useEscapeKey(isOpen, onClose);

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
        {/* h-10(48px, border-box): border(1px)가 padding/line-height 위에 그대로
            더해져 48px가 아닌 49~50px로 어긋나던 문제 방지 — 명시적 높이를 줘서
            border까지 포함해 항상 48px 고정. */}
        <div className="flex items-center gap-4 px-8">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 flex-1 items-center justify-center rounded-xl border border-line-secondary text-5 font-medium text-label-base hover:bg-action-secondary-hover"
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => onConfirm(card.id)}
            className="flex h-10 flex-1 items-center justify-center rounded-xl border border-transparent bg-status-negative text-5 font-semibold text-base-white"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}
