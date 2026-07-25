'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { useEscapeKey } from '@/lib/hooks/useEscapeKey';

interface AddStageModalProps {
  isOpen: boolean;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onConfirm: (name: string) => void;
}

// Figma "전형 단계 추가"(node 164:28872) 반영.
// 기존엔 컬럼 안에 인라인 입력창(draft column)이 떴는데, 중앙 팝업 모달로 교체.
//
// API 명세서 v1.11 (3.7)의 이름 검증 규칙(2~20자, STAGE_NAME_TOO_SHORT/TOO_LONG) 중
// 길이 조건만 클라이언트에서 우선 검증해 불필요한 API 호출을 줄임.
// 특수문자/중복 이름 검증은 서버 규칙 확정본이 없어 서버 응답(K006/K007)에 위임.
export function AddStageModal({ isOpen, value, onChange, onClose, onConfirm }: AddStageModalProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEscapeKey(isOpen, onClose);

  if (!isOpen) return null;

  function handleConfirm() {
    const trimmed = value.trim();
    if (!trimmed) {
      setErrorMessage('전형 단계 이름을 입력해 주세요.');
      return;
    }
    if (trimmed.length < 2) {
      setErrorMessage('2자 이상 입력해 주세요.');
      return;
    }
    if (trimmed.length > 20) {
      setErrorMessage('20자를 초과하여 입력할 수 없어요.');
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
                setErrorMessage(null);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
              placeholder="텍스트를 입력해 주세요."
              className={`w-full rounded-xl border-2 bg-transparent px-4 py-3 text-4 font-medium text-label-base placeholder:text-label-placeholder outline-none ${
                errorMessage ? 'border-status-negative' : 'border-line-secondary focus:border-line-primary'
              }`}
            />
            {errorMessage && (
              <p className="text-1 font-medium text-status-negative">{errorMessage}</p>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
}
