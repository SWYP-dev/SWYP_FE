import { apiFetch } from '@/lib/api/api-client';
import type { InAppNotificationInbox, NotificationReadResponse } from '@/types/api';

// GET /api/v1/notifications/inbox (API 명세서 5.4)
export function fetchNotificationInbox(size = 20): Promise<InAppNotificationInbox> {
  return apiFetch<InAppNotificationInbox>(`/api/v1/notifications/inbox?size=${size}`);
}

// PATCH /api/v1/notifications/inbox/read (API 명세서 5.5)
export function markNotificationsRead(ids: number[]): Promise<NotificationReadResponse> {
  return apiFetch<NotificationReadResponse>('/api/v1/notifications/inbox/read', {
    method: 'PATCH',
    body: { ids },
  });
}
