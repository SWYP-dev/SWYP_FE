export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

/**
 * GTM dataLayer에 커스텀 이벤트를 push한다.
 * GTM 컨테이너에서 이 이벤트명을 트리거로 등록해 GA4 태그와 연결해서 사용한다.
 *
 * @example
 * pushDataLayerEvent('stage_name_edit_trigger', { method: 'button' });
 */
export function pushDataLayerEvent(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...params });
}
