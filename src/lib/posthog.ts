import posthog from 'posthog-js';
import type { AccountType, AnalyticsEventMap, AnalyticsEventName } from './analytics/events';
import type { FeatureFlagKey } from './analytics/featureFlags';

export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
export const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST;

let isInitialized = false;

function getAppEnv(): 'production' | 'preview' | 'development' {
  const appEnv = process.env.NEXT_PUBLIC_VERCEL_ENV;
  return appEnv === 'production' || appEnv === 'preview' || appEnv === 'development'
    ? appEnv
    : 'development';
}

/**
 * PostHog 클라이언트는 한 번만 초기화하고, Provider보다 먼저 실행되는 계측에서도 호출한다.
 *
 * docs/analytics/posthog-events.md 2.4에 따라 클라이언트 이동의 페이지뷰도 자동 수집한다.
 * 클릭 자동 수집은 설계한 이벤트와 별개로 $autocapture가 쌓이지 않도록 계속 끈다.
 */
export function initPostHog() {
  if (isInitialized || typeof window === 'undefined' || !POSTHOG_KEY) return;

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    autocapture: false,
    capture_pageview: 'history_change',
    person_profiles: 'identified_only',
  });
  posthog.register({ app_env: getAppEnv() });
  // 익명 방문자도 환경별 플래그 조건으로 평가할 수 있게 한다.
  posthog.setPersonPropertiesForFlags({ app_env: getAppEnv() });
  isInitialized = true;
}

export function isFeatureFlagEnabled(key: FeatureFlagKey): boolean {
  initPostHog();
  // 키가 없거나 플래그가 로드되기 전에는 기존 CTA를 유지한다.
  if (!isInitialized) return false;
  return posthog.isFeatureEnabled(key) === true;
}

export function subscribeFeatureFlags(callback: () => void): () => void {
  initPostHog();
  if (!isInitialized) return () => {};
  return posthog.onFeatureFlags(callback);
}

/**
 * PostHog에 커스텀 이벤트를 전송한다.
 * GA4의 pushDataLayerEvent(src/lib/gtm.ts)와 역할은 비슷하지만 완전히 별개 도구 —
 * GA4는 PM 관점 지표, PostHog는 개발 관점 퍼널·실험 전용이라 이벤트를 섞지 않는다.
 *
 * @example
 * track('kakao_login_completed', { is_new_user: true });
 */
export function track<E extends AnalyticsEventName>(
  event: E,
  ...args: AnalyticsEventMap[E] extends Record<string, never>
    ? [properties?: AnalyticsEventMap[E]]
    : [properties: AnalyticsEventMap[E]]
) {
  // 자식 컴포넌트 effect가 먼저 실행돼도 초기화 전에 이벤트가 유실되지 않게 한다.
  initPostHog();
  if (!isInitialized) return;
  posthog.capture(event, args[0]);
}

export function identifyUser(userId: number, accountType?: AccountType) {
  initPostHog();
  if (!isInitialized) return;

  posthog.identify(String(userId), accountType ? { account_type: accountType } : undefined);
  // 앱 시작 시에는 저장된 계정 구분을 유지하고, 로그인 성공 시에만 갱신한다.
  if (accountType) posthog.register({ account_type: accountType });
}

export function resetAnalytics() {
  initPostHog();
  if (!isInitialized) return;

  posthog.reset();
  // reset으로 지워진 환경 속성을 복원해 익명 이벤트도 환경별로 구분한다.
  posthog.register({ app_env: getAppEnv() });
  // reset으로 지워진 플래그 평가용 환경 속성도 다시 전달한다.
  posthog.setPersonPropertiesForFlags({ app_env: getAppEnv() });
}
