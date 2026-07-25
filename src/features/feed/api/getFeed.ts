import { apiFetch } from '@/lib/api/api-client';
import type { PageResponse } from '@/types/api';
import type { FeedItem, FeedQueryParams } from '@/types/api';

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
// ⚠️ TODO(백엔드 확인 필요 — 세영님/동섭님): PRD 4.1.2는 "마감 지난 공고는 피드에서 자동 제외"가
// 원칙이지만, API 명세서 v1.11 기준 백엔드에 만료 공고 정리 스케줄러가 구현돼 있지 않고
// GET /api/v1/feed에도 만료 공고를 걸러주는 파라미터가 없음. 배치 주기(08/20시) 사이 시차 동안
// isExpired: true인 공고가 응답에 섞여 내려올 수 있어, 원칙을 지키기 위해 FE에서 임시로
// 클라이언트 필터링 처리함. 백엔드에 만료 정리 스케줄러 도입 또는 excludeExpired 필터
// 파라미터 추가를 요청하고, 확정되면 이 필터링은 제거 가능.
//
// 주의: 스크랩(2.5)·칸반(3.x)은 반대로 마감 공고를 "유지 + 회색 처리"하는 게 원칙(5.3)이므로
// 이 필터링은 통합 공고 피드 전용이며 다른 API 응답에는 적용하지 않음.
export async function getFeed(params: FeedQueryParams): Promise<PageResponse<FeedItem>> {
  const response = await apiFetch<PageResponse<FeedItem>>(`/api/v1/feed${buildQueryString(params)}`);

  return {
    ...response,
    items: response.items.filter((item) => !item.isExpired),
  };
}
