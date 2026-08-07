import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { fetchNotificationInbox, fetchNotificationSettings } from './notificationApi';
import { useAuthStore } from '@/features/auth/store/authStore';

const DEFAULT_SIZE = 10;

export const notificationKeys = {
  inbox: (size: number) => ['notifications', 'inbox', size] as const,
  inboxInfinite: (size: number) => ['notifications', 'inbox', 'infinite', size] as const,
  settings: ['notifications', 'settings'] as const,
};

// 설정 > 알림 페이지 초기값 로드 (API 5.1).
export function useNotificationSettings() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: notificationKeys.settings,
    queryFn: fetchNotificationSettings,
    enabled: isAuthenticated,
  });
}

// 지원 마감일 페이지 헤더 알림벨이 사용하는 인앱 알림함 조회 (API 5.4).
// 벨 뱃지가 어느 정도 실시간성을 갖도록 1분마다 재조회.
//
// ⚠️ [2026-07-23] 무한 리로드 버그 수정: enabled 조건이 없어서 비로그인 상태에서도
// 이 쿼리가 항상 실행됨 → 알림 API가 401 반환 → api-client.ts의 401 처리 로직이
// window.location.href='/'로 강제 리다이렉트 → 페이지 재로드 → 다시 이 쿼리 실행 →
// 다시 401... 무한 새로고침 루프의 근본 원인이었음.
// → 로그인 상태(isAuthenticated)일 때만 쿼리가 실행되도록 enabled 추가.
export function useNotificationInbox(size = DEFAULT_SIZE) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: notificationKeys.inbox(size),
    queryFn: () => fetchNotificationInbox(size),
    refetchInterval: 60_000,
    enabled: isAuthenticated,
  });
}

// 알림 모달의 "더보기" 목록 조회 (API 5.4). v1.11 정정에 따라 5.3과 동일한
// cursor/nextCursor/hasNext 커서 페이지네이션 방식으로 구현 — "더보기" 클릭 시
// size를 늘려 처음부터 재조회하지 않고, 직전 응답의 nextCursor로 이어서 조회한다.
export function useNotificationInboxInfinite(size = DEFAULT_SIZE) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useInfiniteQuery({
    queryKey: notificationKeys.inboxInfinite(size),
    queryFn: ({ pageParam }: { pageParam: string | undefined }) => fetchNotificationInbox(size, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined),
    enabled: isAuthenticated,
  });
}
