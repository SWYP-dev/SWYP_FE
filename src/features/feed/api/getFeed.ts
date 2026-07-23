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
export async function getFeed(params: FeedQueryParams): Promise<PageResponse<FeedItem>> {
  return apiFetch<PageResponse<FeedItem>>(`/api/v1/feed${buildQueryString(params)}`);
}
