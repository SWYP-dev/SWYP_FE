'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Modal } from '@/components/ui/modal';
import { FilterTriggerButton } from '@/components/ui/filter-trigger-button';
import type { KanbanStage } from '@/types/api';

interface StageFilterChipProps {
  stages: KanbanStage[];
  appliedStageIds: number[];
  onApply: (stageIds: number[]) => void;
}

// Figma "지원 현황 메인(전형 단계 필터링)"(node 164:28661) 반영.
// CareerFilterChip과 동일한 태그 다중 선택 모달 패턴 재사용.
export function StageFilterChip({ stages, appliedStageIds, onApply }: StageFilterChipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<number[]>(appliedStageIds);

  const openModal = () => {
    setDraft(appliedStageIds);
    setIsOpen(true);
  };

  const handleApply = () => {
    onApply(draft);
    setIsOpen(false);
  };

  const toggleStage = (stageId: number) => {
    setDraft((prev) =>
      prev.includes(stageId) ? prev.filter((id) => id !== stageId) : [...prev, stageId]
    );
  };

  function formatChipLabel() {
    if (appliedStageIds.length === 0) return '전형 단계';
    if (appliedStageIds.length === 1) {
      return stages.find((s) => s.id === appliedStageIds[0])?.name ?? '전형 단계';
    }
    return `전형 단계 · ${appliedStageIds.length}개`;
  }

  return (
    <>
      <FilterTriggerButton onClick={openModal} isActive={isOpen || appliedStageIds.length > 0}>
        {formatChipLabel()}
      </FilterTriggerButton>

      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="dialog"
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-base-dimmed)]"
            onClick={() => setIsOpen(false)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <Modal
                title="전형 단계"
                onClose={() => setIsOpen(false)}
                primaryLabel={draft.length > 0 ? `${draft.length}개 적용` : '적용'}
                secondaryLabel="초기화"
                onPrimaryClick={handleApply}
                onSecondaryClick={() => setDraft([])}
              >
                <div className="flex flex-wrap items-center gap-2 px-8 py-4">
                  <TagButton label="전체" isActive={draft.length === 0} onClick={() => setDraft([])} />
                  {stages.map((stage) => (
                    <TagButton
                      key={stage.id}
                      label={stage.name}
                      isActive={draft.includes(stage.id)}
                      onClick={() => toggleStage(stage.id)}
                    />
                  ))}
                </div>
              </Modal>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

function TagButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center rounded-lg border bg-base-white px-4 py-2 ${
        isActive ? 'border-line-primary text-label-primary' : 'border-line-secondary text-label-body'
      }`}
    >
      <span className="text-3 font-medium">{label}</span>
    </button>
  );
}
