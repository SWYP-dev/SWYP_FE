'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onDismiss: () => void;
  /** Figma Toast 컴포넌트(node 150:23659) variant — 성공/실패 */
  type?: 'success' | 'error';
  hasButton?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  /** @deprecated onAction 사용 권장. 하위 호환을 위해 유지 */
  onUndo?: () => void;
  duration?: number;
}

export function Toast({
  message,
  isVisible,
  onDismiss,
  type = 'success',
  hasButton = false,
  actionLabel = '되돌리기',
  onAction,
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
        <div
          className={`flex shrink-0 items-center justify-center rounded-max border p-[2px] ${
            type === 'error' ? 'border-status-negative' : 'border-status-positive'
          }`}
        >
          {type === 'error' ? <CloseSmallIcon /> : <CheckSmallIcon />}
        </div>
        <p className="whitespace-nowrap text-1 font-medium text-base-white">{message}</p>
        {hasButton && (
          <div className="flex items-center self-stretch">
            <button
              type="button"
              onClick={onAction ?? onUndo}
              className="rounded px-2 py-1 text-0 font-medium text-label-base bg-base-white"
            >
              {actionLabel}
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

// 실패 상태용 X 아이콘 — CheckSmallIcon과 동일한 10x10 틀, 색상만 status/negative
function CloseSmallIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2.5 2.5L7.5 7.5M7.5 2.5L2.5 7.5"
        stroke="#FB322E"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}
