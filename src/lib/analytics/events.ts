// 이벤트 이름·속성은 docs/analytics/posthog-events.md와 일치시킨다.
export type AccountType = 'kakao' | 'test';

export interface AnalyticsEventMap {
  landing_viewed: Record<string, never>;
  kakao_login_completed: { is_new_user: boolean };
}

export type AnalyticsEventName = keyof AnalyticsEventMap;
