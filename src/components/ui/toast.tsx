'use client';

import { useEffect } from 'react';

type ToastType = 'success' | 'error';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onDismiss: () => void;
  /** 성공/실패 variant */
  type?: ToastType;
  hasButton?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  /** @deprecated onAction 사용 권장. 하위 호환을 위해 유지 */
  onUndo?: () => void;
  duration?: number;
}

// HT-009: 기존 토스트(12px 문구, 반투명 배경, 14px 아이콘)는 작아서 액션 피드백으로 인식되지 않았음.
// 디자이너 부재로 시안 없이, 보편적인 어두운 스낵바 형태(불투명 진회색 배경, 상태색이 채워진
// 아이콘, 텍스트 액션 버튼)로 다시 디자인함. 위치(하단 중앙)·z-index·props는 기존과 같다.
const ICON_BG_CLASS: Record<ToastType, string> = {
  success: 'bg-status-positive',
  error: 'bg-status-negative',
};

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
    <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2">
      <div
        role="status"
        aria-live="polite"
        className="animate-toast-in flex min-w-[320px] items-center gap-4 rounded-xl bg-neutral-900 px-6 py-[14px] shadow-normal-large"
      >
        <div
          className={`flex size-[20px] shrink-0 items-center justify-center rounded-max text-base-white ${ICON_BG_CLASS[type]}`}
        >
          {type === 'error' ? <CloseSmallIcon /> : <CheckSmallIcon />}
        </div>
        <p className="flex-1 whitespace-nowrap text-4 font-medium text-base-white">{message}</p>
        {hasButton && (
          <button
            type="button"
            onClick={onAction ?? onUndo}
            className="ml-3 shrink-0 whitespace-nowrap text-3 font-semibold text-service-200 transition-colors hover:text-base-white"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

// 상태색 원 위에 올라가므로 흰색(currentColor) 아이콘으로 그린다.
function CheckSmallIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2.5 6.25L5 8.75L9.5 3.75"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// 실패 상태용 X 아이콘 — CheckSmallIcon과 동일한 12x12 틀
function CloseSmallIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3.5 3.5L8.5 8.5M8.5 3.5L3.5 8.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
