import { useQuery } from '@tanstack/react-query';
import { getScraps } from './getScraps';
import type { ScrapQueryParams } from '@/types/api';

// 스크랩 목록 조회 (API 명세서 2.5). useFeedQuery와 동일한 패턴.
export function useScrapsQuery(params: ScrapQueryParams) {
  return useQuery({
    queryKey: ['scraps', params],
    queryFn: () => getScraps(params),
  });
}
