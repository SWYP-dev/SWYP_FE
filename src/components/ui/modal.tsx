import type { ReactNode } from 'react';
import { Button } from './button';

interface ModalProps {
  children: ReactNode; // contentSlot
  title?: string;
  hasModalHeader?: boolean;
  hasCloseIcon?: boolean;
  hasModalFooter?: boolean;
  hasPrimaryButton?: boolean;
  hasSecondaryButton?: boolean;
  primaryLabel?: string;
  secondaryLabel?: string;
  onClose?: () => void;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  className?: string;
}

// X 아이콘. Figma 원본은 만료되는 asset URL이라 인라인 SVG로 대체.
function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M18 6L6 18M6 6L18 18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Figma "Modal" 컴포넌트(node 9:7382) 스펙 기준.
// 배경 딤 처리(오버레이)는 이 컴포넌트를 사용하는 쪽에서 감싸서 처리.
export function Modal({
  children,
  title,
  hasModalHeader = true,
  hasCloseIcon = true,
  hasModalFooter = true,
  hasPrimaryButton = true,
  hasSecondaryButton = true,
  primaryLabel = '적용',
  secondaryLabel = '초기화',
  onClose,
  onPrimaryClick,
  onSecondaryClick,
  className = '',
}: ModalProps) {
  return (
    <div
      className={`flex w-[566px] flex-col items-start gap-6 overflow-hidden rounded-[20px] bg-base-white py-7 shadow-spread-small ${className}`}
    >
      {hasModalHeader && (
        <div className="flex w-full items-center justify-between px-8">
          <p className="text-8 font-semibold leading-[1.4] text-label-base">{title}</p>
          {hasCloseIcon && (
            <button type="button" onClick={onClose} aria-label="닫기" className="text-label-base">
              <CloseIcon />
            </button>
          )}
        </div>
      )}

      <div className="w-full px-8">{children}</div>

      {hasModalFooter && (
        <div className="flex w-full items-start gap-4 px-8">
          {hasSecondaryButton && (
            <Button variant="secondary" size="lg" onClick={onSecondaryClick}>
              {secondaryLabel}
            </Button>
          )}
          {hasPrimaryButton && (
            <Button variant="primary" size="lg" className="flex-1" onClick={onPrimaryClick}>
              {primaryLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
