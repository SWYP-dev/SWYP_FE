'use client';

import { Button } from '@/components/ui/button';

interface AddStageButtonProps {
  onClick: () => void;
}

// Figma Button 컴포넌트(node 49:693:220723) — 화면 우측 하단 고정(floating) 버튼.
// 기존 Button 컴포넌트(primary) 재사용 + 위치·모양만 override.
// 스테이지 최대 10개 제한(PRD 4.2.3)은 클릭 핸들러 쪽(page.tsx)에서 체크 예정.
export function AddStageButton({ onClick }: AddStageButtonProps) {
  return (
    <Button
      variant="primary"
      onClick={onClick}
      className="fixed bottom-6 right-6 gap-[2px] rounded-max shadow-normal-medium"
    >
      <PlusIcon />
      전형 단계 추가
    </Button>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 3v10M3 8h10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
