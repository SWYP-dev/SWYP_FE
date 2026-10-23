'use client';

import { create } from 'zustand';
import { track } from '@/lib/posthog';
import type { LoginTrigger } from '@/lib/analytics/events';

interface LoginModalState {
  isOpen: boolean;
  trigger: LoginTrigger;
  open: (trigger: LoginTrigger) => void;
  close: () => void;
}

// api-client.ts의 401 인터셉터처럼 React 컴포넌트 트리 밖에서도 로그인 모달을
// 띄울 수 있도록 하는 전역 스토어. Sidebar/NotificationBell의 로컬 LoginModal과는
// 별개로, "인증 만료로 인한 로그인 유도"는 이 전역 모달 하나로 통일해서 처리.
export const useLoginModalStore = create<LoginModalState>((set, get) => ({
  isOpen: false,
  trigger: 'api_401',
  open: (trigger) => {
    // 동시 401 응답에도 최초 노출과 최초 트리거만 기록한다.
    if (get().isOpen) return;
    track('login_prompt_shown', { trigger });
    set({ isOpen: true, trigger });
  },
  close: () => set({ isOpen: false }),
}));

export function openLoginModalOutsideReact(trigger: LoginTrigger) {
  useLoginModalStore.getState().open(trigger);
}
