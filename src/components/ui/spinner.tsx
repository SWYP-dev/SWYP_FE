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
