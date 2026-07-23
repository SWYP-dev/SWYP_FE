import { useQuery } from '@tanstack/react-query';
import { fetchNotificationInbox } from './notificationApi';

export const notificationKeys = {
  inbox: (size: number) => ['notifications', 'inbox', size] as const,
};

// 지원 마감일 페이지 헤더 알림벨 + 알림 모달이 공유하는 인앱 알림함 조회 (API 5.4).
// 벨 뱃지가 어느 정도 실시간성을 갖도록 1분마다 재조회.
export function useNotificationInbox(size = 20) {
  return useQuery({
    queryKey: notificationKeys.inbox(size),
    queryFn: () => fetchNotificationInbox(size),
    refetchInterval: 60_000,
  });
}
