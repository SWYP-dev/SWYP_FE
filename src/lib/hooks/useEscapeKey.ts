import { useEffect } from 'react';

// 모달 공통: ESC 키 입력 시 닫기. isOpen이 true일 때만 리스너를 등록해서
// 백그라운드에 있는 다른 컴포넌트의 ESC 입력에 영향 주지 않도록 함.
export function useEscapeKey(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
}
