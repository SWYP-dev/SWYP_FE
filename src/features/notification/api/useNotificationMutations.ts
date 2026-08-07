import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  markNotificationsRead,
  deleteNotification,
  deleteAllNotifications,
  updateNotificationSettings,
  type NotificationSettingsUpdate,
} from './notificationApi';
import { notificationKeys } from './useNotificationQuery';

// 설정 > 알림 페이지 저장 (API 5.2).
export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: NotificationSettingsUpdate) => updateNotificationSettings(body),
    onSuccess: (data) => {
      queryClient.setQueryData(notificationKeys.settings, (prev: unknown) =>
        prev ? { ...prev, ...data } : prev
      );
    },
  });
}

// 개별 항목 읽음 처리(API 5.5). 현재 UI에서 직접 트리거하는 곳은 없지만, 추후 알림 클릭 시
// 카드 상세로 이동하면서 함께 호출하는 용도로 유지.
export function useMarkNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => markNotificationsRead(ids),
    onSuccess: () => {
      // inbox(벨) / inbox-infinite(모달 목록) 쿼리키가 모두 ['notifications','inbox', ...]로
      // 시작하므로 이 prefix invalidate 한 번으로 목록 + unreadCount가 함께 갱신됨.
      queryClient.invalidateQueries({ queryKey: ['notifications', 'inbox'] });
    },
  });
}

// 개별 알림 삭제 (API 5.6, 2026-08-04 백엔드 프론트 연동 공유) — NotificationItem의 X(닫기)
// 버튼에서 사용. 이전에는 삭제 API가 없어 "읽음 처리"로 대체 구현했었으나, 실제 삭제 API가
// 추가되어 본래 의도(항목 닫기 = 삭제)대로 동작을 변경함.
// ⚠️ 대상이 없거나 내 알림이 아니면 404(ApiClientError)를 던짐 — 현재는 별도 처리 없이
// 상위에서 발생하는 에러 그대로 전파됨. UX상 에러 토스트 필요 여부는 세은님 확인 필요 (TODO).
export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'inbox'] });
    },
  });
}

// 전체 알림 삭제 (API 5.7, 2026-08-04 백엔드 프론트 연동 공유) — NotificationModal의
// "모두 삭제" 버튼에서 사용. 인앱 알림만 삭제되며 이메일 발송 이력에는 영향 없음.
// ⚠️ 기존에는 "모두 삭제" 버튼이 실제로는 "모두 읽음 처리"만 수행했음(2026-07-23 확인,
// 삭제 API 부재로 인한 임시 조치). 이번에 실제 삭제 API로 교체 — 되돌릴 수 없는 동작이므로
// 프론트에서 별도 확인 다이얼로그가 필요한지 세은님 확인 필요 (TODO).
export function useDeleteAllNotifications() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteAllNotifications(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'inbox'] });
    },
  });
}
