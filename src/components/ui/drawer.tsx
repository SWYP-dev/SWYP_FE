'use client';

import type { ReactNode } from 'react';
import { CloseIcon } from './icons';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode; // DrawerContentSlot
  className?: string;
}

// Figma "Drawer" 컴포넌트(node 51:109) 스펙 반영.
// "화면 전환 없이 빠르고 연속적인 작업 흐름을 제공하기 위한 컴포넌트" — Figma 컴포넌트 설명 그대로.
// 실제 콘텐츠(카드 상세, 지원 내역 폼 등)는 세부 프레임 확정 전까지 children으로 슬롯만 열어둠.
// 배경 딤 처리는 tokens.css의 --color-base-dimmed 사용.
export function Drawer({ isOpen, onClose, children, className = '' }: DrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Dimmed overlay */}
      <div className="absolute inset-0 bg-base-dimmed" onClick={onClose} aria-hidden="true" />

      {/* Drawer panel */}
      <div
        className={`relative flex h-full w-[475px] flex-col items-start bg-base-white pt-6 shadow-spread-medium ${className}`}
      >
        <div className="flex w-full items-center justify-between px-5">
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

        <div className="flex w-full flex-1 flex-col items-end justify-center overflow-y-auto">
          <div className="w-full flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
