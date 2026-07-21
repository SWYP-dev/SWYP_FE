import { apiFetch } from '@/lib/api/api-client';
import type { DocumentItem, DownloadUrlResponse } from '@/types/api';

// 4.1 서류 업로드 (파일)
export function uploadDocumentFile(
  cardId: number,
  file: File,
  name: string
): Promise<DocumentItem> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('name', name);
  return apiFetch<DocumentItem>(`/api/v1/kanban/cards/${cardId}/documents/file`, {
    method: 'POST',
    body: formData,
  });
}

// 4.2 서류 등록 (외부 링크)
export function registerDocumentLink(
  cardId: number,
  body: { name: string; url: string }
): Promise<DocumentItem> {
  return apiFetch<DocumentItem>(`/api/v1/kanban/cards/${cardId}/documents/link`, {
    method: 'POST',
    body,
  });
}

// 4.5 서류 삭제
export function deleteDocument(cardId: number, documentId: number): Promise<null> {
  return apiFetch<null>(`/api/v1/kanban/cards/${cardId}/documents/${documentId}`, {
    method: 'DELETE',
  });
}

// 4.6 파일 다운로드 URL 발급
export function fetchDownloadUrl(cardId: number, documentId: number): Promise<DownloadUrlResponse> {
  return apiFetch<DownloadUrlResponse>(
    `/api/v1/kanban/cards/${cardId}/documents/${documentId}/download`
  );
}
