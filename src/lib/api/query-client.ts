import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1분 — 이 시간 동안은 재요청 없이 캐시 사용
      retry: 1,
    },
  },
});
