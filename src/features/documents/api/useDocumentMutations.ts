'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  uploadDocumentFile,
  registerDocumentLink,
  deleteDocument,
  fetchDownloadUrl,
} from './documentsApi';
import { kanbanKeys } from '@/features/kanban/api/useKanbanQuery';

export function useUploadDocumentFile(cardId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, name }: { file: File; name: string }) =>
      uploadDocumentFile(cardId, file, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kanbanKeys.cardDetail(cardId) });
    },
  });
}

export function useRegisterDocumentLink(cardId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; url: string }) => registerDocumentLink(cardId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kanbanKeys.cardDetail(cardId) });
    },
  });
}

export function useDeleteDocument(cardId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (documentId: number) => deleteDocument(cardId, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kanbanKeys.cardDetail(cardId) });
    },
  });
}

// 다운로드: URL 발급 후 새 탭에서 열기
export function useDownloadDocument(cardId: number) {
  return useMutation({
    mutationFn: async (documentId: number) => {
      const { downloadUrl } = await fetchDownloadUrl(cardId, documentId);
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    },
  });
}
