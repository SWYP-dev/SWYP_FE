'use client';

import { useEffect } from 'react';
import { identifyUser, initPostHog } from '@/lib/posthog';
import { useAuthStore } from '@/features/auth/store/authStore';

/**
 * 앱 최초 마운트 시 PostHog를 초기화한다.
 * 렌더링에 관여하지 않고 초기화 부수효과만 수행하므로 children을 그대로 반환한다.
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    initPostHog();
  }, []);

  // 배포 전부터 로그인돼 있던 사용자도 저장소 복원 후 같은 사용자로 식별한다.
  useEffect(() => {
    if (hasHydrated && user?.id !== undefined) identifyUser(user.id);
  }, [hasHydrated, user?.id]);

  return <>{children}</>;
}
