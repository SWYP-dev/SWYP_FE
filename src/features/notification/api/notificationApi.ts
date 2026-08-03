import { apiFetch } from '@/lib/api/api-client';
import type { InAppNotificationInbox, NotificationReadResponse } from '@/types/api';

// GET /api/v1/notifications/inbox (API 명세서 5.4)
// v1.11: cursor/nextCursor/hasNext 기반 커서 페이지네이션. 첫 요청은 cursor 생략,
// 이후 hasNext=true면 직전 응답의 nextCursor를 다음 요청의 cursor로 전달.
export function fetchNotificationInbox(size = 10, cursor?: string): Promise<InAppNotificationInbox> {
  const params = new URLSearchParams({ size: String(size) });
  if (cursor) params.set('cursor', cursor);
  return apiFetch<InAppNotificationInbox>(`/api/v1/notifications/inbox?${params.toString()}`);
}

// PATCH /api/v1/notifications/inbox/read (API 명세서 5.5)
export function markNotificationsRead(ids: number[]): Promise<NotificationReadResponse> {
  return apiFetch<NotificationReadResponse>('/api/v1/notifications/inbox/read', {
    method: 'PATCH',
    body: { ids },
  });
}
