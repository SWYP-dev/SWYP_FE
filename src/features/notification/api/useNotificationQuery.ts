import { useQuery } from '@tanstack/react-query';
import { fetchNotificationInbox } from './notificationApi';
import { useAuthStore } from '@/features/auth/store/authStore';

export const notificationKeys = {
  inbox: (size: number) => ['notifications', 'inbox', size] as const,
};

// 지원 마감일 페이지 헤더 알림벨 + 알림 모달이 공유하는 인앱 알림함 조회 (API 5.4).
// 벨 뱃지가 어느 정도 실시간성을 갖도록 1분마다 재조회.
//
// ⚠️ [2026-07-23] 무한 리로드 버그 수정: enabled 조건이 없어서 비로그인 상태에서도
// 이 쿼리가 항상 실행됨 → 알림 API가 401 반환 → api-client.ts의 401 처리 로직이
// window.location.href='/'로 강제 리다이렉트 → 페이지 재로드 → 다시 이 쿼리 실행 →
// 다시 401... 무한 새로고침 루프의 근본 원인이었음.
// → 로그인 상태(isAuthenticated)일 때만 쿼리가 실행되도록 enabled 추가.
export function useNotificationInbox(size = 20) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: notificationKeys.inbox(size),
    queryFn: () => fetchNotificationInbox(size),
    refetchInterval: 60_000,
    enabled: isAuthenticated,
  });
}
