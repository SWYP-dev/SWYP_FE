'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CloseIcon } from './icons';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode; // DrawerContentSlot
  /** 스크롤 영역 밖에 고정되는 하단 바 (예: 저장하기 버튼) */
  footer?: ReactNode;
  className?: string;
}

// Figma "Drawer" 컴포넌트(node 51:109) 스펙 반영.
// "화면 전환 없이 빠르고 연속적인 작업 흐름을 제공하기 위한 컴포넌트" — Figma 컴포넌트 설명 그대로.
// 실제 콘텐츠(카드 상세, 지원 내역 폼 등)는 세부 프레임 확정 전까지 children으로 슬롯만 열어둠.
// 배경 딤 처리는 tokens.css의 --color-base-dimmed 사용.
export function Drawer({ isOpen, onClose, children, footer, className = '' }: DrawerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);

  // 콘텐츠가 실제로 넘칠 때만 하단 바에 그림자를 준다 — 짧은 화면에서는 경계선만.
  useEffect(() => {
    const scrollEl = scrollRef.current;
    const contentEl = contentRef.current;
    if (!isOpen || !scrollEl || !contentEl) return;

    function measure() {
      if (!scrollEl) return;
      setIsScrollable(scrollEl.scrollHeight > scrollEl.clientHeight);
    }
    measure();

    // 첨부/URL 행이 늘거나 줄면 높이가 바뀌므로 콘텐츠 크기를 관찰한다.
    const observer = new ResizeObserver(measure);
    observer.observe(contentEl);
    observer.observe(scrollEl);
    return () => observer.disconnect();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Dimmed overlay */}
      <div className="absolute inset-0 bg-base-dimmed" onClick={onClose} aria-hidden="true" />

      {/* Drawer panel */}
      <div
        className={`relative flex h-full w-[475px] flex-col items-start bg-base-white shadow-spread-medium ${className}`}
      >
        <div className="flex w-full items-center justify-between px-6 py-7">
          <div className="size-6" aria-hidden="true" />
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex size-6 items-center justify-center text-label-base"
          >
            <CloseIcon size={24} />
          </button>
        </div>

        <div ref={scrollRef} className="flex w-full min-h-0 flex-1 flex-col overflow-y-auto">
          <div ref={contentRef} className="w-full">
            {children}
          </div>
        </div>

        {footer && (
          <div
            className="flex h-[72px] w-full shrink-0 items-center justify-end border-t border-line-secondary bg-neutral-0 px-6"
            style={isScrollable ? { boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.04)' } : undefined}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
