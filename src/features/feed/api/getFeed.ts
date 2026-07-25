import { apiFetch } from '@/lib/api/api-client';
import type { PageResponse } from '@/types/api';
import type { FeedItem, FeedQueryParams } from '@/types/api';
import { isDeadlinePassed } from '@/lib/utils/deadline';

function buildQueryString(params: FeedQueryParams): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.set(key, String(value));
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

// GET /api/v1/feed (API 명세서 2.1)
//
// ⚠️ TODO(백엔드 확인 필요 — 세영님/동섭님): PRD 4.1.2 "마감 지난 공고는 피드에서 자동 제외"
// 원칙 반영. 백엔드 isExpired 플래그는 배치 주기(08/20시) 시차 때문에 실제 마감일이
// 지났어도 다음 배치 전까지 false로 남아있을 수 있어, isExpired 플래그만으론 불충분함.
// → 클라이언트에서 deadline 날짜 직접 계산(isDeadlinePassed)까지 이중으로 필터링.
// 만료 공고 정리 스케줄러 도입 또는 excludeExpired 필터 파라미터 추가되면 이 로직 제거 가능.
//
// 주의: 스크랩(2.5)·칸반(3.x)은 반대로 마감 공고를 "유지 + 회색 처리"하는 게 원칙(5.3)이므로
// 이 필터링은 통합 공고 피드 전용이며 다른 API 응답에는 적용하지 않음.
export async function getFeed(params: FeedQueryParams): Promise<PageResponse<FeedItem>> {
  const response = await apiFetch<PageResponse<FeedItem>>(`/api/v1/feed${buildQueryString(params)}`);

  return {
    ...response,
    items: response.items.filter((item) => !item.isExpired && !isDeadlinePassed(item.deadline)),
  };
}
