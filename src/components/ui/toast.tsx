'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onDismiss: () => void;
  /** 자동 닫힘 시간(ms). 요구사항: 4초 */
  duration?: number;
}

// Figma Toast 컴포넌트 — 프레임(49:7847)에서 인스턴스가 hidden 상태라 정확한 스타일 확인 불가.
// ⚠️ 확인 필요: 배경색/아이콘 유무 등은 Toast 마스터 컴포넌트 노드 확인 후 보정.
// 우선 화면 하단 중앙 + 어두운 배경 패턴으로 구현. 노출 시간은 4초(요구사항 확정).
export function Toast({ message, isVisible, onDismiss, duration = 4000 }: ToastProps) {
  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [isVisible, duration, onDismiss]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center rounded-xl bg-neutral-900 px-6 py-3 shadow-normal-medium">
        <p className="whitespace-nowrap text-3 font-medium text-base-white">{message}</p>
      </div>
    </div>
  );
}
