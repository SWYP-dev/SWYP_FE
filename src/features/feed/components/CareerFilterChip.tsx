'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Modal } from '@/components/ui/modal';
import { CAREER_LABELS, MAX_STEP, Slider } from '@/components/ui/slider';
import { FilterTriggerButton } from '@/components/ui/filter-trigger-button';

interface CareerFilterChipProps {
  /** URL 쿼리와 동기화된, 실제 적용 중인 값 (step index, 0~15) */
  appliedRange: [number, number];
  onApply: (range: [number, number]) => void;
}

function formatChipLabel(min: number, max: number): string {
  if (min === 0 && max === MAX_STEP) return '경력';
  return `경력 ${CAREER_LABELS[min]} - ${CAREER_LABELS[max]}`;
}

/**
 * 통합 공고 피드의 경력 필터.
 *
 * Figma 확인(node 36:628): 트리거 버튼 아래 붙는 Popover가 아니라
 * 화면 중앙에 뜨는 전체 Modal(ModalHeader "경력" + 닫기 아이콘,
 * 슬라이더, ModalFooter 초기화/적용 버튼)이었음.
 * 기존에는 Popover로 구현되어 있어 위치가 어긋났던 것을 Modal로 교체.
 * 오버레이(배경 딤 처리)는 Modal.tsx 컴포넌트 설명대로 호출부에서 담당
 * (selection-modal.tsx와 동일한 패턴).
 */
export function CareerFilterChip({ appliedRange, onApply }: CareerFilterChipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<[number, number]>(appliedRange);
  const isFullRange = appliedRange[0] === 0 && appliedRange[1] === MAX_STEP;

  const openModal = () => {
    setDraft(appliedRange);
    setIsOpen(true);
  };

  const handleApply = () => {
    onApply(draft);
    setIsOpen(false);
  };

  const handleReset = () => {
    setDraft([0, MAX_STEP]);
  };

  return (
    <>
      <FilterTriggerButton onClick={openModal} isActive={isOpen || !isFullRange}>
        {formatChipLabel(appliedRange[0], appliedRange[1])}
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
                title="경력"
                onClose={() => setIsOpen(false)}
                primaryLabel="적용"
                secondaryLabel="초기화"
                onPrimaryClick={handleApply}
                onSecondaryClick={handleReset}
              >
                <div className="flex flex-col items-center justify-center py-11">
                  <Slider
                    minValue={draft[0]}
                    maxValue={draft[1]}
                    onChange={(min, max) => setDraft([min, max])}
                  />
                </div>
              </Modal>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
