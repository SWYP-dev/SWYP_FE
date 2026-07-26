import { apiFetch } from '@/lib/api/api-client';
import type { PageResponse, ScrapItem, ScrapQueryParams } from '@/types/api';
import { isDeadlinePassed } from '@/lib/utils/deadline';

function buildQueryString(params: ScrapQueryParams): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.set(key, String(value));
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

// GET /api/v1/feed/scraps (API 명세서 2.5)
//
// ⚠️ [세은님 확인 완료 — Slack, 2026-07-26] PRD 5.3엔 "스크랩: 마감돼도 유지 + 회색 처리"로
// 적혀있지만, 실제 기획 의도는 "마감된 공고는 스크랩에서도 안 보여야 함"으로 확정됨
// (명세서/기능명세서엔 반영이 안 된 상태 — 문서 업데이트는 별도 확인 필요).
// getFeed.ts와 동일하게 deadline 기준 클라이언트 필터링으로 처리.
export async function getScraps(params: ScrapQueryParams): Promise<PageResponse<ScrapItem>> {
  const response = await apiFetch<PageResponse<ScrapItem>>(
    `/api/v1/feed/scraps${buildQueryString(params)}`
  );

  return {
    ...response,
    items: response.items.filter((item) => !isDeadlinePassed(item.deadline)),
  };
}
