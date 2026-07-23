import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markNotificationsRead } from './notificationApi';

// 개별 항목 닫기(X) 또는 "모두 삭제"(→ 사실상 모두 읽음, 사용자 확인 2026-07-23)에서 재사용
export function useMarkNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => markNotificationsRead(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'inbox'] });
    },
  });
}
