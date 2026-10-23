'use client';

import { useSyncExternalStore } from 'react';
import type { FeatureFlagKey } from '@/lib/analytics/featureFlags';
import { isFeatureFlagEnabled, subscribeFeatureFlags } from '@/lib/posthog';

export function useFeatureFlagEnabled(key: FeatureFlagKey): boolean {
  // 서버와 하이드레이션에서는 기존 CTA를 유지하고 플래그 로드 뒤에만 전환한다.
  return useSyncExternalStore(
    subscribeFeatureFlags,
    () => isFeatureFlagEnabled(key),
    () => false
  );
}
