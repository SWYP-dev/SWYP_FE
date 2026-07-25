'use client';

import { create } from 'zustand';

interface LoginModalState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

// api-client.ts의 401 인터셉터처럼 React 컴포넌트 트리 밖에서도 로그인 모달을
// 띄울 수 있도록 하는 전역 스토어. Sidebar/NotificationBell의 로컬 LoginModal과는
// 별개로, "인증 만료로 인한 로그인 유도"는 이 전역 모달 하나로 통일해서 처리.
export const useLoginModalStore = create<LoginModalState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

export function openLoginModalOutsideReact() {
  useLoginModalStore.getState().open();
}
