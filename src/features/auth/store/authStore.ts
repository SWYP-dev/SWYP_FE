'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '../type/auth';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setUser: (user: AuthUser) => void;
  patchUser: (patch: Partial<AuthUser>) => void;
  clearUser: () => void;
}

// 로그인 성공(1.1) 시 응답의 user 객체를 저장해서 Sidebar 프로필 영역을
// 별도 API 호출 없이 즉시 렌더링한다. accessToken/refreshToken은 이 스토어가 아니라
// src/lib/api/token.ts(localStorage)에서 별도로 관리한다.
// 이 스토어는 "화면에 보여줄 사용자 정보 + 로그인 여부"만 담당.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      patchUser: (patch) =>
        set((state) => (state.user ? { user: { ...state.user, ...patch } } : state)),
      clearUser: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'chwihap-auth-user',
    }
  )
);

// api-client.ts처럼 React 컴포넌트 트리 밖(401 인터셉터)에서 로그아웃 처리할 때 사용.
export function clearAuthUserOutsideReact() {
  useAuthStore.getState().clearUser();
}
