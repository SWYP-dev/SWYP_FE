'use client';

import { useEffect } from 'react';
import { initPostHog } from '@/lib/posthog';

/**
 * 앱 최초 마운트 시 PostHog를 초기화한다.
 * 렌더링에 관여하지 않고 초기화 부수효과만 수행하므로 children을 그대로 반환한다.
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initPostHog();
  }, []);

  return <>{children}</>;
}
