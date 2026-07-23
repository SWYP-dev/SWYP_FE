import { apiFetch } from '@/lib/api/api-client';
import type { ScrapAddResponse, ScrapRemoveResponse } from '@/types/api';

// 2.3 스크랩 추가
export async function postScrap(postingId: number): Promise<ScrapAddResponse> {
  return apiFetch<ScrapAddResponse>(`/api/v1/feed/${postingId}/scrap`, {
    method: 'POST',
  });
}

// 2.4 스크랩 해제
export async function deleteScrap(jobPostingId: number): Promise<ScrapRemoveResponse> {
  return apiFetch<ScrapRemoveResponse>(`/api/v1/feed/scraps/${jobPostingId}`, {
    method: 'DELETE',
  });
}
