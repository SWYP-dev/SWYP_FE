'use client';

import { CloseIcon } from '@/components/ui/icons';
import type { KanbanStage } from '@/types/api';

interface DeleteStageModalProps {
  isOpen: boolean;
  stage: KanbanStage | null;
  onClose: () => void;
  onConfirm: (stageId: number) => void;
}

// Figma 삭제 확인 팝업(node 49:7928) 스펙 반영.
// 타이틀: "전형 단계 삭제"
// 본문: '{단계명}' 단계를 삭제할까요?\n삭제한 단계는 되돌릴 수 없어요.
// 취소: outline / 삭제: #fb322e (--status/negative) 빨간 배경
// ⚠️ PRD 4.2.3: 카드 있는 스테이지 삭제 시 "이동 대상 선택" 팝업이 추가로 필요 (3.9 연동 시 구현)
// 지금은 빈 스테이지 삭제 시의 기본 확인 팝업만 구현.
export function DeleteStageModal({ isOpen, stage, onClose, onConfirm }: DeleteStageModalProps) {
  if (!isOpen || !stage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Dimmed overlay */}
      <div className="absolute inset-0 bg-base-dimmed" onClick={onClose} aria-hidden="true" />

      {/* Modal panel — shadow-spread-small: 0 0 60px rgba(33,33,35,0.1) */}
      <div className="relative flex w-[566px] flex-col gap-4 overflow-hidden rounded-[20px] bg-base-white py-6 shadow-spread-small">
        {/* Header */}
        <div className="flex items-center justify-between px-8">
          <p className="text-7 font-semibold text-label-base">전형 단계 삭제</p>
          <button type="button" onClick={onClose} aria-label="닫기" className="text-label-base">
            <CloseIcon size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col items-start px-8">
          <p className="whitespace-pre-wrap text-4 font-medium leading-[1.6] text-label-body">
            {`'${stage.name}' 단계를 삭제할까요? \n삭제한 단계는 되돌릴 수 없어요.`}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-8">
          <button
            type="button"
            onClick={onClose}
            className="flex flex-1 items-center justify-center rounded-xl border border-line-secondary px-7 py-3 text-5 font-medium text-label-base hover:bg-action-secondary-hover"
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => onConfirm(stage.id)}
            className="flex flex-1 items-center justify-center rounded-xl bg-status-negative px-7 py-3 text-5 font-semibold text-base-white"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}
