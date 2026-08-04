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

// DELETE /api/v1/notifications/inbox/{notificationId} (2026-08-04 백엔드 프론트 연동 공유, API 5.6 예정)
// 존재하지 않거나 로그인한 사용자의 알림이 아니면 404 (ApiClientError) 발생.
// ⚠️ 응답 바디 형식이 명시되지 않아, 다른 삭제류 API(6.2 회원 탈퇴 등)와 동일하게
// ApiResponse<null>({ success, data: null }) 형태로 가정. 204 No Content 등 실제 응답이
// 다르면 apiFetch의 res.json() 파싱 단계에서 에러가 날 수 있음 — 세영님/동섭님 확인 필요 (TODO).
export function deleteNotification(notificationId: number): Promise<null> {
  return apiFetch<null>(`/api/v1/notifications/inbox/${notificationId}`, {
    method: 'DELETE',
  });
}

// DELETE /api/v1/notifications/inbox (2026-08-04 백엔드 프론트 연동 공유, API 5.7 예정)
// 인앱 알림만 삭제되며 이메일 발송 이력(5.3 알림 발송 이력 조회)에는 영향 없음.
// ⚠️ 응답 바디 형식 가정은 deleteNotification과 동일 (TODO 동일하게 확인 필요).
export function deleteAllNotifications(): Promise<null> {
  return apiFetch<null>('/api/v1/notifications/inbox', {
    method: 'DELETE',
  });
}
