import type { CSSProperties } from 'react';

// Figma "Spinner" 컴포넌트(node 226:29028, size 40) 참고.
// 3개의 원(Lobe)이 중앙에 모였다가 삼각형 형태로 퍼지는 애니메이션을 반복.
// Figma는 blur/blend 모드로 각 원에 글로우를 주는데, smart animate 프레임별
// 정확한 타이밍/이징 값이 MCP로 노출되지 않아 easing/duration은 임의 값(1.2s ease-in-out)으로 구현함.

type SpinnerProps = {
  className?: string;
};

type DotStyle = CSSProperties & {
  '--spinner-dot-x': string;
  '--spinner-dot-y': string;
};

const DOTS: { id: number; x: number; y: number; delayMs: number }[] = [
  { id: 1, x: 7.4, y: -6.4, delayMs: 0 },
  { id: 2, x: 1.8, y: 9.6, delayMs: 150 },
  { id: 3, x: -9.2, y: -3.2, delayMs: 300 },
];

/**
 * 버튼 안에 들어가는 16px 로딩 아이콘.
 * 위 Spinner는 화면 전체 로딩용(40px)이라 버튼에는 크다.
 * stroke가 currentColor라 버튼의 글자색(primary=흰색 등)을 그대로 따라간다.
 */
export function ButtonSpinnerIcon() {
  return (
    <svg
      className="animate-spin"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" opacity="0.3" />
      <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Spinner({ className }: SpinnerProps) {
  return (
    <div className={`relative size-[40px] ${className ?? ''}`} role="status" aria-label="로딩 중">
      {DOTS.map((dot) => (
        <span
          key={dot.id}
          className="animate-spinner-dot absolute top-1/2 left-1/2 size-[10px] rounded-full bg-fill-primary"
          style={
            {
              '--spinner-dot-x': `${dot.x}px`,
              '--spinner-dot-y': `${dot.y}px`,
              animationDelay: `${dot.delayMs}ms`,
            } as DotStyle
          }
        />
      ))}
    </div>
  );
}
