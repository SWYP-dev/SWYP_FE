import { apiFetch } from '@/lib/api/api-client';
import type { KanbanCardDetail, KanbanStage } from '@/types/api';

// ================================
// Response 타입
// ================================

export interface KanbanBoardResponse {
  stages: KanbanStage[];
}

export interface KanbanCardDirectResponse {
  cardId: number;
  stageId: number;
  stageName: string;
  postingId: number;
  companyName: string;
  jobTitle: string;
  deadline: string | null; // 상시채용 등 마감일 미표기 공고는 null (KanbanCard와 동일 패턴)
}

export interface KanbanCardUpdateResponse {
  cardId: number;
  companyName: string;
  jobTitle: string;
  originalUrl: string;
  deadline: string | null;
}

export interface KanbanCardMoveResponse {
  cardId: number;
  stageId: number;
  stageName: string;
  position: number;
}

export interface KanbanStageCreateResponse {
  id: number;
  name: string;
  position: number;
  isDefault: boolean;
}

export interface KanbanStageUpdateResponse {
  id: number;
  name: string;
  position: number;
}

export interface KanbanStageDeleteResponse {
  movedCardCount: number;
}

export interface KanbanCardMemoResponse {
  cardId: number;
  memo: string;
}

// ================================
// Request 타입
// ================================

export interface CreateDirectCardRequest {
  companyName: string;
  title: string;
  originalUrl: string;
  // AddCardModal 폼에서는 항상 실제 날짜 문자열이 채워지지만, "삭제 실행 취소"
  // (KanbanBoard.handleUndoDeleteCard)가 상시채용 카드의 원래 deadline(null)을
  // 그대로 이 API에 재전송하는 경로가 있어 null도 허용한다.
  deadline: string | null;
}

// ⚠️ [QA 반영] 필드 전체를 보내야 했던 기존 방식 때문에, 마감일만 바꾸려 해도
// 회사명/공고명이 항상 같이 전송돼 "직접 등록한 카드만 수정 가능"(K010) 에러가
// 발생했음. 부분 업데이트 지원하도록 전부 optional로 변경.
export interface UpdateCardRequest {
  companyName?: string;
  title?: string;
  originalUrl?: string;
  deadline?: string;
}

// ================================
// API 함수
// ================================

// GET /api/v1/kanban
export function fetchKanbanBoard(): Promise<KanbanBoardResponse> {
  return apiFetch<KanbanBoardResponse>('/api/v1/kanban');
}

// POST /api/v1/kanban/cards/direct
export function createDirectCard(body: CreateDirectCardRequest): Promise<KanbanCardDirectResponse> {
  return apiFetch<KanbanCardDirectResponse>('/api/v1/kanban/cards/direct', {
    method: 'POST',
    body,
  });
}

// PATCH /api/v1/kanban/cards/{cardId}/update
export function updateCard(
  cardId: number,
  body: UpdateCardRequest
): Promise<KanbanCardUpdateResponse> {
  return apiFetch<KanbanCardUpdateResponse>(`/api/v1/kanban/cards/${cardId}/update`, {
    method: 'PATCH',
    body,
  });
}

// PATCH /api/v1/kanban/cards/{cardId}/stage
export function moveCard(
  cardId: number,
  body: { stageId: number; position: number }
): Promise<KanbanCardMoveResponse> {
  return apiFetch<KanbanCardMoveResponse>(`/api/v1/kanban/cards/${cardId}/stage`, {
    method: 'PATCH',
    body,
  });
}

// DELETE /api/v1/kanban/cards/{cardId}
export function deleteCard(cardId: number): Promise<null> {
  return apiFetch<null>(`/api/v1/kanban/cards/${cardId}`, {
    method: 'DELETE',
  });
}

// POST /api/v1/kanban/stages
export function createStage(body: { name: string; position?: number }): Promise<KanbanStageCreateResponse> {
  return apiFetch<KanbanStageCreateResponse>('/api/v1/kanban/stages', {
    method: 'POST',
    body,
  });
}

// PATCH /api/v1/kanban/stages/{stageId}
export function updateStage(
  stageId: number,
  body: { name?: string; position?: number }
): Promise<KanbanStageUpdateResponse> {
  return apiFetch<KanbanStageUpdateResponse>(`/api/v1/kanban/stages/${stageId}`, {
    method: 'PATCH',
    body,
  });
}

// DELETE /api/v1/kanban/stages/{stageId}
export function deleteStage(
  stageId: number,
  moveToStageId?: number
): Promise<KanbanStageDeleteResponse> {
  const url = moveToStageId
    ? `/api/v1/kanban/stages/${stageId}?moveToStageId=${moveToStageId}`
    : `/api/v1/kanban/stages/${stageId}`;
  return apiFetch<KanbanStageDeleteResponse>(url, { method: 'DELETE' });
}

// GET /api/v1/kanban/cards/{cardId} (3.5)
export function fetchCardDetail(cardId: number): Promise<KanbanCardDetail> {
  return apiFetch<KanbanCardDetail>(`/api/v1/kanban/cards/${cardId}`);
}

// PATCH /api/v1/kanban/cards/{cardId}/memo (3.6)
export function updateCardMemo(cardId: number, memo: string): Promise<KanbanCardMemoResponse> {
  return apiFetch<KanbanCardMemoResponse>(`/api/v1/kanban/cards/${cardId}/memo`, {
    method: 'PATCH',
    body: { memo },
  });
}
