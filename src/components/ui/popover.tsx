'use client';

import { createPortal } from 'react-dom';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';

/**
 * 필터 드롭다운(경력, 직군·직무, 지역 등)이 공통으로 쓰는 팝오버 컨테이너.
 *
 * 이 파일 하나에 다음을 전부 담음 (ui/ 폴더가 컴포넌트당 파일 하나인
 * 플랫 구조라, 훅을 따로 뺄 hooks/ 폴더가 없어서 한 파일로 합침):
 * - Popover: 포털 렌더링 + 위치 배치 + 바깥클릭/Escape 닫힘
 * - usePopoverTrigger: 칩 하나당 isOpen/triggerRef/toggle 관리하는 편의 훅
 * - popoverPanelChrome: 자체 border/배경이 없는 콘텐츠(Slider 등)에 붙이는 공용 스타일
 *
 * 사용 예 (자체 chrome이 있는 콘텐츠 — DropdownMenu 등):
 * ```tsx
 * const { isOpen, triggerRef, toggle, close } = usePopoverTrigger();
 * <button ref={triggerRef} onClick={toggle}>...</button>
 * <Popover isOpen={isOpen} onClose={close} triggerRef={triggerRef}>
 *   <DropdownMenu items={items} onSelect={...} />
 * </Popover>
 * ```
 *
 * 사용 예 (자체 chrome이 없는 콘텐츠 — Slider 단독 등):
 * ```tsx
 * <Popover isOpen={isOpen} onClose={close} triggerRef={triggerRef} className={popoverPanelChrome}>
 *   <Slider ... />
 * </Popover>
 * ```
 */

// ─────────────────────────────────────────────────────────
// 위치 계산
// ─────────────────────────────────────────────────────────

type PopoverAlign = 'start' | 'end' | 'center';

interface PopoverPositionOptions {
  offset?: number;
  align?: PopoverAlign;
  viewportPadding?: number;
}

interface PopoverPosition {
  top: number;
  left: number;
  ready: boolean;
}

const DEFAULT_POSITION_OPTIONS: Required<PopoverPositionOptions> = {
  offset: 8, // spacing-3 (8px) 토큰과 정렬
  align: 'start',
  viewportPadding: 16, // spacing-5 (16px) 토큰과 정렬
};

function usePopoverPosition(
  triggerRef: RefObject<HTMLElement | null>,
  popoverRef: RefObject<HTMLElement | null>,
  isOpen: boolean,
  options: PopoverPositionOptions = {}
): PopoverPosition {
  const { offset, align, viewportPadding } = { ...DEFAULT_POSITION_OPTIONS, ...options };
  const [position, setPosition] = useState<PopoverPosition>({ top: 0, left: 0, ready: false });

  // "닫힘 -> 열림"으로 바뀐 시점을 렌더링 중에 감지해서 ready를 리셋.
  // effect 안에서 동기적으로 setState를 호출하면 cascading render를 유발할 수 있어
  // react-hooks/set-state-in-effect 규칙에 걸리므로, React가 권장하는
  // "렌더링 중 상태 조정" 패턴(리렌더 시 즉시 반영, effect 타이밍에 의존 안 함)을 씀.
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setPosition((prev) => ({ ...prev, ready: false }));
    }
  }

  const calculate = useCallback(() => {
    const trigger = triggerRef.current;
    const popover = popoverRef.current;
    if (!trigger || !popover) return;

    const triggerRect = trigger.getBoundingClientRect();
    const popoverRect = popover.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left: number;
    switch (align) {
      case 'end':
        left = triggerRect.right - popoverRect.width;
        break;
      case 'center':
        left = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2;
        break;
      case 'start':
      default:
        left = triggerRect.left;
        break;
    }

    // 오른쪽으로 넘치면 트리거 오른쪽 끝에 맞춰 뒤집기
    if (left + popoverRect.width > viewportWidth - viewportPadding) {
      left = triggerRect.right - popoverRect.width;
    }
    // 그래도 왼쪽으로 넘치면 뷰포트 안쪽으로 클램프
    if (left < viewportPadding) {
      left = viewportPadding;
    }

    let top = triggerRect.bottom + offset;
    const overflowsBottom = top + popoverRect.height > viewportHeight - viewportPadding;
    const hasSpaceAbove = triggerRect.top - popoverRect.height - offset > viewportPadding;

    if (overflowsBottom && hasSpaceAbove) {
      top = triggerRect.top - popoverRect.height - offset;
    }

    setPosition({ top, left, ready: true });
  }, [triggerRef, popoverRef, align, offset, viewportPadding]);

  useLayoutEffect(() => {
    if (!isOpen) return;

    const raf = requestAnimationFrame(calculate);
    const handleReposition = () => calculate();

    window.addEventListener('resize', handleReposition);
    // capture: true로 등록해야 내부 스크롤 컨테이너 스크롤도 감지됨
    window.addEventListener('scroll', handleReposition, true);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [isOpen, calculate]);

  return position;
}

// ─────────────────────────────────────────────────────────
// 바깥 클릭 / Escape 닫힘
// ─────────────────────────────────────────────────────────

function useOutsideInteraction(
  isOpen: boolean,
  refs: {
    popoverRef: RefObject<HTMLElement | null>;
    triggerRef: RefObject<HTMLElement | null>;
  },
  onClose: () => void
) {
  const { popoverRef, triggerRef } = refs;

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      const clickedInsidePopover = popoverRef.current?.contains(target);
      const clickedTrigger = triggerRef.current?.contains(target);

      if (!clickedInsidePopover && !clickedTrigger) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, popoverRef, triggerRef, onClose]);
}

// ─────────────────────────────────────────────────────────
// 트리거 상태 관리 편의 훅
// ─────────────────────────────────────────────────────────

/**
 * 필터 칩 하나당 이 훅 하나씩 붙이면 됨.
 * ```tsx
 * const { isOpen, triggerRef, toggle, close } = usePopoverTrigger();
 * <button ref={triggerRef} onClick={toggle}>경력 ▾</button>
 * <Popover isOpen={isOpen} onClose={close} triggerRef={triggerRef}>...</Popover>
 * ```
 */
export function usePopoverTrigger<T extends HTMLElement = HTMLButtonElement>() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<T>(null);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return { isOpen, triggerRef, toggle, open, close };
}

// ─────────────────────────────────────────────────────────
// Popover 본체
// ─────────────────────────────────────────────────────────

interface PopoverProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLElement | null>;
  align?: PopoverAlign;
  offset?: number;
  children: ReactNode;
  className?: string;
}

/**
 * DropdownMenu처럼 자체 border/배경/radius가 없는 콘텐츠(Slider 단독 등)를
 * Popover에 넣을 때 재사용하는 기본 chrome 클래스. 이미 자체 chrome이 있는
 * 콘텐츠(DropdownMenu)에는 섞어 쓰면 안 됨 (이중 박스가 생김).
 */
export const popoverPanelChrome =
  'rounded-lg border border-[var(--color-line-secondary)] bg-[var(--color-base-white)] shadow-[var(--shadow-normal-medium)]';

export function Popover({
  isOpen,
  onClose,
  triggerRef,
  align = 'start',
  offset = 8,
  children,
  className = '',
}: PopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const position = usePopoverPosition(triggerRef, popoverRef, isOpen, { align, offset });

  useOutsideInteraction(isOpen, { popoverRef, triggerRef }, onClose);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={popoverRef}
      role="dialog"
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        opacity: position.ready ? 1 : 0,
        pointerEvents: position.ready ? 'auto' : 'none',
      }}
      className={`z-50 transition-opacity duration-100 ${className}`}
    >
      {children}
    </div>,
    document.body
  );
}
