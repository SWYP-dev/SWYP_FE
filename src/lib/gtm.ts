import type { Ga4EventMap, Ga4EventName } from './analytics/ga4Events';

export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

/**
 * GTM dataLayer에 GA4용 커스텀 이벤트를 push한다.
 * GTM 컨테이너에서 이 이벤트명을 트리거로 등록해 GA4 태그와 연결해서 사용한다.
 * 이벤트 이름·속성은 src/lib/analytics/ga4Events.ts의 Ga4EventMap으로 제한해 오타를 막는다.
 *
 * @example
 * pushDataLayerEvent('stage_name_edit_trigger', { method: 'button' });
 * pushDataLayerEvent('landing_viewed');
 */
export function pushDataLayerEvent<E extends Ga4EventName>(
  event: E,
  ...args: Ga4EventMap[E] extends Record<string, never>
    ? [params?: Ga4EventMap[E]]
    : [params: Ga4EventMap[E]]
) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...args[0] });
}
