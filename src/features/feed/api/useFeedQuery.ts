import { useQuery } from '@tanstack/react-query';
import { getFeed } from './getFeed';
import type { FeedQueryParams } from '@/types/api';

/**
 * 통합 공고 피드 조회.
 *
 * ⚠️ TODO(백엔드/PM 확인 후 확장): jobCategory, career, region, platform은
 * 필터 UI ↔ API 스펙 간 데이터 모델이 달라 아직 파라미터에 안 실었음.
 * - jobCategory: 우리 UI는 20개 대분류·다건 선택 전제인데 실제 enum은
 *   BACKEND/FRONTEND/FULLSTACK/DESIGN/PM/DATA/DEVOPS/OTHER 8개뿐
 * - career: 우리 UI는 신입~15년 슬라이더 범위인데 실제는 NEW/EXPERIENCED 이진값
 * - platform: WORKNET이 필터 UI에 없음
 * 확인되는 대로 queryKey/params에 하나씩 추가할 것.
 */
export function useFeedQuery(params: FeedQueryParams) {
  return useQuery({
    queryKey: ['feed', params],
    queryFn: () => getFeed(params),
  });
}
