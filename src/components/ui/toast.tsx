'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onDismiss: () => void;
  /** "되돌리기" 버튼 표시 여부 — Figma hasButton prop */
  hasButton?: boolean;
  onUndo?: () => void;
  /** 자동 닫힘 시간(ms). 칸반 전형 단계 추가 요구사항: 4초 */
  duration?: number;
}

// Figma Toast 마스터 컴포넌트(node 53:13321) 스펙 반영.
// 배경: --base/dimmed (rgba(0,0,0,0.7)), 좌측 success 아이콘, 12px medium white 텍스트.
// type="success" 하나만 확인됨 — 에러 타입 등 추가 variant는 추후 확인 후 확장 예정.
export function Toast({
  message,
  isVisible,
  onDismiss,
  hasButton = false,
  onUndo,
  duration = 4000,
}: ToastProps) {
  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [isVisible, duration, onDismiss]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-2 rounded-lg bg-base-dimmed px-4 py-3">
        {/* success 아이콘 — 초록 원형 테두리 + 체크 */}
        <div className="flex shrink-0 items-center justify-center rounded-max border border-status-positive p-[2px]">
          <CheckSmallIcon />
        </div>
        <p className="whitespace-nowrap text-1 font-medium text-base-white">{message}</p>
        {hasButton && (
          <div className="flex items-center self-stretch">
            <button
              type="button"
              onClick={onUndo}
              className="rounded px-2 py-1 text-0 font-medium text-label-base bg-base-white"
            >
              되돌리기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CheckSmallIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2 5.5L4 7.5L8 3"
        stroke="#00AA6B"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
