import { apiFetch } from '@/lib/api/api-client';
import type { FeedbackCreateRequest, FeedbackCreateResponse } from '../types/feedback';

// 7.1 의견 제출 (POST /api/v1/feedback)
export function submitFeedback(request: FeedbackCreateRequest): Promise<FeedbackCreateResponse> {
  const formData = new FormData();
  formData.append('type', request.type);
  formData.append('content', request.content);
  if (request.email !== null) formData.append('email', request.email);
  if (request.image !== null) formData.append('image', request.image);

  return apiFetch<FeedbackCreateResponse>('/api/v1/feedback', { method: 'POST', body: formData });
}
