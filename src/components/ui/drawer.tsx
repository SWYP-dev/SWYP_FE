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
//
// QA-008: 모달처럼 갑자기 나타나지 않고 화면 우측 가장자리에서 슬라이드 인/아웃 한다.
// 일반적인 드로어 모션 스펙 — 열릴 때 300ms ease-out(감속), 닫힐 때 200ms ease-in(가속),
// 배경 딤은 같은 시간으로 페이드. (Figma 모션 스펙 확정 전 임시 값, globals.css의 drawer-* 참고)
const DRAWER_EXIT_MS = 200;

export function Drawer({ isOpen, onClose, children, footer, className = '' }: DrawerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);

  // 닫힘 애니메이션이 끝날 때까지 DOM을 유지한다 (isOpen이 false가 돼도 바로 언마운트하지 않음).
  const [isMounted, setIsMounted] = useState(isOpen);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) setIsMounted(true);
  }
  const isClosing = isMounted && !isOpen;

  useEffect(() => {
    if (!isClosing) return;
    const timer = setTimeout(() => setIsMounted(false), DRAWER_EXIT_MS);
    return () => clearTimeout(timer);
  }, [isClosing]);

  // 부모는 닫을 때 보통 대상(cardId 등)을 같이 비워서 children이 "불러오는 중"으로 바뀌는데,
  // 슬라이드 아웃 중에 내용이 바뀌어 보이지 않도록 열려 있던 마지막 내용을 그대로 보여준다.
  const [shown, setShown] = useState({ children, footer });
  if (isOpen && (shown.children !== children || shown.footer !== footer)) {
    setShown({ children, footer });
  }

  // 콘텐츠가 실제로 넘칠 때만 하단 바에 그림자를 준다 — 짧은 화면에서는 경계선만.
  useEffect(() => {
    const scrollEl = scrollRef.current;
    const contentEl = contentRef.current;
    if (!isMounted || !scrollEl || !contentEl) return;

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
  }, [isMounted]);

  if (!isMounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Dimmed overlay */}
      <div
        className={`absolute inset-0 bg-base-dimmed ${isClosing ? 'animate-drawer-overlay-out' : 'animate-drawer-overlay-in'}`}
        onClick={isClosing ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className={`relative flex h-full w-[475px] flex-col items-start bg-base-white shadow-spread-medium ${
          isClosing ? 'animate-drawer-out' : 'animate-drawer-in'
        } ${className}`}
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
            {shown.children}
          </div>
        </div>

        {shown.footer && (
          <div
            className="flex h-[72px] w-full shrink-0 items-center justify-end border-t border-line-secondary bg-neutral-0 px-6"
            style={isScrollable ? { boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.04)' } : undefined}
          >
            {shown.footer}
          </div>
        )}
      </div>
    </div>
  );
}
