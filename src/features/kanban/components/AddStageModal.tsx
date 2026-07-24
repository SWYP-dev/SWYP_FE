'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';

interface AddStageModalProps {
  isOpen: boolean;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onConfirm: (name: string) => void;
}

// Figma "전형 단계 추가"(node 164:28872) 반영.
// 기존엔 컬럼 안에 인라인 입력창(draft column)이 떴는데, 중앙 팝업 모달로 교체.
export function AddStageModal({ isOpen, value, onChange, onClose, onConfirm }: AddStageModalProps) {
  const [hasError, setHasError] = useState(false);

  if (!isOpen) return null;

  function handleConfirm() {
    const trimmed = value.trim();
    if (!trimmed) {
      setHasError(true);
      return;
    }
    onConfirm(trimmed);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-base-dimmed" onClick={onClose} aria-hidden="true" />
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <Modal
          title="전형 단계 추가"
          onClose={onClose}
          primaryLabel="확인"
          hasSecondaryButton={false}
          onPrimaryClick={handleConfirm}
        >
          <div className="flex flex-col gap-2 px-8 py-4">
            <p className="text-3 font-semibold text-label-base">전형 이름</p>
            <input
              autoFocus
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
                setHasError(false);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
              placeholder="텍스트를 입력해 주세요."
              className={`w-full rounded-xl border-2 bg-transparent px-4 py-3 text-4 font-medium text-label-base placeholder:text-label-placeholder outline-none ${
                hasError ? 'border-status-negative' : 'border-line-secondary focus:border-line-primary'
              }`}
            />
            {hasError && (
              <p className="text-1 font-medium text-status-negative">전형 이름을 입력해주세요.</p>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
}
