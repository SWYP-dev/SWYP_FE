import posthog from 'posthog-js';

export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
export const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST;

let isInitialized = false;

/**
 * PostHog 클라이언트를 초기화한다. 앱 전체에서 한 번만 호출되어야 하며
 * PostHogProvider(src/providers/posthog-provider.tsx)에서만 호출한다.
 *
 * autocapture / capture_pageview를 끄는 이유: PostHog_이벤트_설계_문서.md에서
 * 의도적으로 설계한 커스텀 이벤트만 수집하기 위함. 자동 수집(Autocapture)을 켜두면
 * 설계한 이벤트와 별개로 $autocapture 이벤트가 같이 쌓여 대시보드가 지저분해진다.
 */
export function initPostHog() {
  if (isInitialized || typeof window === 'undefined' || !POSTHOG_KEY) return;

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    autocapture: false,
    capture_pageview: false,
    person_profiles: 'identified_only',
  });
  isInitialized = true;
}

/**
 * PostHog에 커스텀 이벤트를 전송한다.
 * GA4의 pushDataLayerEvent(src/lib/gtm.ts)와 역할은 비슷하지만 완전히 별개 도구 —
 * GA4는 PM 관점 지표, PostHog는 개발 관점 퍼널·실험 전용이라 이벤트를 섞지 않는다.
 *
 * @example
 * capturePostHogEvent('kakao_login_completed', { isNewUser: true });
 */
export function capturePostHogEvent(event: string, properties: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;
  posthog.capture(event, properties);
}
