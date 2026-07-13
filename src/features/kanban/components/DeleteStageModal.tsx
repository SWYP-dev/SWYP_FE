'use client';

import { useState } from 'react';
import { CloseIcon } from '@/components/ui/icons';
import type { KanbanStage } from '@/types/api';

interface DeleteStageModalProps {
  isOpen: boolean;
  stage: KanbanStage | null;
  /** 이동 대상 후보 스테이지 목록 (삭제 대상 제외) */
  otherStages: KanbanStage[];
  onClose: () => void;
  /** 카드 없는 경우: moveToStageId = undefined, 있는 경우: 선택한 stageId */
  onConfirm: (stageId: number, moveToStageId?: number) => void;
}

// Figma 삭제 확인 팝업(node 49:7928) 스펙 반영.
// PRD 4.2.3 / API 3.9: 카드 있는 스테이지 삭제 시 이동 대상 선택 필요.
//   - 카드 없음: 바로 삭제 확인
//   - 카드 있음: 이동 대상 스테이지 선택 후 삭제
export function DeleteStageModal({
  isOpen,
  stage,
  otherStages,
  onClose,
  onConfirm,
}: DeleteStageModalProps) {
  const [moveToStageId, setMoveToStageId] = useState<number | null>(null);

  if (!isOpen || !stage) return null;

  const hasCards = stage.cards.length > 0;
  const canConfirm = !hasCards || moveToStageId !== null;

  function handleConfirm() {
    if (!canConfirm) return;
    onConfirm(stage!.id, moveToStageId ?? undefined);
    setMoveToStageId(null);
  }

  function handleClose() {
    setMoveToStageId(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-base-dimmed" onClick={handleClose} aria-hidden="true" />

      <div className="relative flex w-[566px] flex-col gap-4 overflow-hidden rounded-[20px] bg-base-white py-6 shadow-spread-small">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-8">
          <p className="text-7 font-semibold text-label-base">전형 단계 삭제</p>
          <button type="button" onClick={handleClose} aria-label="닫기" className="text-label-base">
            <CloseIcon size={24} />
          </button>
        </div>

        {/* 본문 */}
        <div className="flex flex-col gap-4 px-8">
          <p className="whitespace-pre-wrap text-4 font-medium leading-[1.6] text-label-body">
            {`'${stage.name}' 단계를 삭제할까요? \n삭제한 단계는 되돌릴 수 없어요.`}
          </p>

          {/* 카드 있는 경우: 이동 대상 선택 */}
          {hasCards && (
            <div className="flex flex-col gap-2">
              <p className="text-3 font-semibold text-label-base">
                이 단계의 카드 {stage.cards.length}개를 이동할 단계를 선택해 주세요.
              </p>
              <div className="flex flex-col gap-2">
                {otherStages.map((s) => (
                  <label
                    key={s.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                      moveToStageId === s.id
                        ? 'border-line-primary bg-fill-primary-light'
                        : 'border-line-secondary hover:bg-action-secondary-hover'
                    }`}
                  >
                    <input
                      type="radio"
                      name="moveToStage"
                      value={s.id}
                      checked={moveToStageId === s.id}
                      onChange={() => setMoveToStageId(s.id)}
                      className="accent-fill-primary"
                    />
                    <span
                      className={`text-3 font-medium ${
                        moveToStageId === s.id ? 'text-label-primary' : 'text-label-base'
                      }`}
                    >
                      {s.name}
                      <span className="ml-1 text-label-description">({s.cards.length})</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="flex items-center gap-3 px-8">
          <button
            type="button"
            onClick={handleClose}
            className="flex flex-1 items-center justify-center rounded-xl border border-line-secondary py-3 text-5 font-medium text-label-base hover:bg-action-secondary-hover"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className={`flex flex-1 items-center justify-center rounded-xl py-3 text-5 font-semibold text-base-white transition-colors ${
              canConfirm ? 'bg-status-negative' : 'bg-action-primary-disabled cursor-not-allowed'
            }`}
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}
