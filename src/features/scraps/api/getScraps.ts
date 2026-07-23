import { apiFetch } from '@/lib/api/api-client';
import type { PageResponse, ScrapItem, ScrapQueryParams } from '@/types/api';

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
export async function getScraps(params: ScrapQueryParams): Promise<PageResponse<ScrapItem>> {
  return apiFetch<PageResponse<ScrapItem>>(`/api/v1/feed/scraps${buildQueryString(params)}`);
}
