import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createDirectCard,
  updateCard,
  moveCard,
  updateCardStageDeadline,
  deleteCard,
  createStage,
  updateStage,
  deleteStage,
  updateCardMemo,
} from './kanbanApi';
import { kanbanKeys } from './useKanbanQuery';

// 카드 직접 등록
// ⚠️ 기존엔 여기서 onSuccess 시 즉시 재조회(invalidateQueries)했는데, KanbanBoard의
// "등록 후 다른 컬럼으로 이동" 체이닝 흐름과 타이밍이 겹치면서 화면이 "지원 전"으로
// 잠깐 덮어써지는 깜빡임이 있었음. 재조회 책임을 호출부(KanbanBoard)로 옮겨서,
// 등록+이동이 전부 끝난 뒤 한 번만 재조회하도록 변경.
export function useCreateDirectCard() {
  return useMutation({
    mutationFn: createDirectCard,
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
      companyName?: string;
      title?: string;
      originalUrl?: string;
      deadline?: string;
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
    // ⚠️ 기존엔 onError에서만 재조회(롤백용)했음. 카드 등록 직후 이동을 체이닝하는
    // 흐름(KanbanBoard의 직접 등록 onConfirm)에서, 등록 API의 invalidateQueries가
    // 이동 완료 전에 먼저 응답하면서 화면이 "지원 전" 상태로 덮어써진 채 멈추는
    // 버그가 있어, 이동 성공 시에도 재조회하도록 추가함.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kanbanKeys.board() });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: kanbanKeys.board() });
    },
  });
}

// 카드 마감일/전형 단계 수정 (지원 마감일 페이지 전용, API 3.13)
export function useUpdateCardStageDeadline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      cardId,
      ...body
    }: {
      cardId: number;
      deadline?: string;
      stageId?: number;
    }) => updateCardStageDeadline(cardId, body),
    onSuccess: () => {
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
      deleteStage(stageId, moveToStageId),
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
