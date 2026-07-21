import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createDirectCard,
  updateCard,
  moveCard,
  deleteCard,
  createStage,
  updateStage,
  deleteStage,
  updateCardMemo,
} from './kanbanApi';
import { kanbanKeys } from './useKanbanQuery';

// 카드 직접 등록
export function useCreateDirectCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDirectCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kanbanKeys.board() });
    },
  });
}

// 카드 수정
export function useUpdateCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      cardId,
      ...body
    }: {
      cardId: number;
      companyName: string;
      title: string;
      originalUrl: string;
      deadline: string;
    }) => updateCard(cardId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kanbanKeys.board() });
    },
  });
}

// 카드 이동 (낙관적 업데이트 — 드래그앤드롭 UX 유지)
export function useMoveCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      cardId,
      stageId,
      position,
    }: {
      cardId: number;
      stageId: number;
      position: number;
    }) => moveCard(cardId, { stageId, position }),
    onError: () => {
      // 실패 시 서버 데이터로 롤백
      queryClient.invalidateQueries({ queryKey: kanbanKeys.board() });
    },
  });
}

// 카드 삭제
export function useDeleteCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kanbanKeys.board() });
    },
  });
}

// 스테이지 추가
export function useCreateStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createStage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kanbanKeys.board() });
    },
  });
}

// 스테이지 수정 (이름)
export function useUpdateStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ stageId, ...body }: { stageId: number; name?: string; position?: number }) =>
      updateStage(stageId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kanbanKeys.board() });
    },
  });
}

// 스테이지 삭제
export function useDeleteStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ stageId, moveToStageId }: { stageId: number; moveToStageId?: number }) =>
      deleteStage(stageId, moveToStageId ? { moveToStageId } : undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kanbanKeys.board() });
    },
  });
}

// 카드 메모 수정 (blur 자동저장)
export function useUpdateCardMemo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, memo }: { cardId: number; memo: string }) =>
      updateCardMemo(cardId, memo),
    onSuccess: (_data, { cardId }) => {
      queryClient.invalidateQueries({ queryKey: kanbanKeys.cardDetail(cardId) });
    },
  });
}
