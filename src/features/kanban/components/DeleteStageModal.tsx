'use client';

import { CloseIcon } from '@/components/ui/icons';
import { useEscapeKey } from '@/lib/hooks/useEscapeKey';
import type { KanbanStage } from '@/types/api';

interface DeleteStageModalProps {
  isOpen: boolean;
  stage: KanbanStage | null;
  onClose: () => void;
  onConfirm: (stageId: number) => void;
}

// Figma 삭제 확인 팝업(node 49:7928) 스펙 반영.
// ⚠️ [디자인/명세서 반영] 카드가 남아있는 스테이지는 삭제 자체를 차단하는 것으로 정책
// 변경 — 기존 "이동 대상 선택" UX 제거, 안내 메시지만 노출.
export function DeleteStageModal({ isOpen, stage, onClose, onConfirm }: DeleteStageModalProps) {
  useEscapeKey(isOpen, onClose);

  if (!isOpen || !stage) return null;

  const hasCards = stage.cards.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-base-dimmed" onClick={onClose} aria-hidden="true" />

      <div className="relative flex w-[394px] flex-col gap-5 overflow-hidden rounded-[20px] bg-base-white py-7 shadow-spread-small">
        <div className="flex items-center justify-between px-8">
          <p className="text-7 font-semibold text-label-base">전형 단계 삭제</p>
          <button type="button" onClick={onClose} aria-label="닫기" className="text-label-base">
            <CloseIcon size={24} />
          </button>
        </div>

        <div className="flex flex-col gap-4 px-8">
          {hasCards ? (
            <p className="whitespace-pre-wrap text-4 font-medium leading-[1.6] text-label-body">
              공고 카드가 남아있는 단계는 삭제할 수 없어요.{'\n'}카드를 삭제·이동 후 다시 시도해
              주세요.
            </p>
          ) : (
            <p className="whitespace-pre-wrap text-4 font-medium leading-[1.6] text-label-body">
              {`'${stage.name}' 단계를 삭제할까요? \n삭제한 단계는 되돌릴 수 없어요.`}
            </p>
          )}
        </div>

        {/* h-10(48px, border-box): border(1px)가 padding/line-height 위에 그대로
            더해져 48px가 아닌 49~50px로 어긋나던 문제 방지 — 명시적 높이를 줘서
            border까지 포함해 항상 48px 고정. */}
        <div className="flex items-center gap-4 px-8">
          {hasCards ? (
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 flex-1 items-center justify-center rounded-xl border border-transparent bg-fill-primary text-5 font-semibold text-base-white"
            >
              확인
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 flex-1 items-center justify-center rounded-xl border border-line-secondary text-5 font-medium text-label-base hover:bg-action-secondary-hover"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => onConfirm(stage.id)}
                className="flex h-10 flex-1 items-center justify-center rounded-xl border border-transparent bg-status-negative text-5 font-semibold text-base-white"
              >
                삭제
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
