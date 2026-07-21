'use client';

function BellIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 3.5c-3.5 0-5.5 2.4-5.5 6v3.2c0 .6-.2 1.2-.6 1.7l-1 1.3c-.6.8 0 2 1 2h12.2c1 0 1.6-1.2 1-2l-1-1.3c-.4-.5-.6-1.1-.6-1.7V9.5c0-3.6-2-6-5.5-6Z"
        stroke="#212123"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 19a2 2 0 0 0 4 0" stroke="#212123" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

interface DeadlineHeaderProps {
  onBellClick?: () => void;
}

// Figma "지원 마감일 메인" Header(node 101:17561) 스펙 반영 — 검색 없이 알림 벨만 배치.
// ⚠️ 알림 확인 모달(node 101:17563)은 "지원 마감일 알림 확인 전/후" 시안을 받은 뒤 별도 연결 예정.
// bell.svg 에셋이 public/icons에 없어 인라인 SVG로 구현.
export function DeadlineHeader({ onBellClick }: DeadlineHeaderProps) {
  return (
    <header className="flex min-h-[80px] w-full items-center justify-end gap-5 border-b border-line-secondary bg-base-white px-[80px] py-5">
      <button
        type="button"
        onClick={onBellClick}
        aria-label="알림"
        className="flex size-6 items-center justify-center"
      >
        <BellIcon />
      </button>
    </header>
  );
}
