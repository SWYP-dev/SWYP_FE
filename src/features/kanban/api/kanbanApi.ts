import { apiFetch } from '@/lib/api/api-client';
import type { KanbanStage } from '@/types/api';

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
  deadline: string;
}

export interface KanbanCardUpdateResponse {
  cardId: number;
  companyName: string;
  jobTitle: string;
  originalUrl: string;
  deadline: string;
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

// ================================
// Request 타입
// ================================

export interface CreateDirectCardRequest {
  companyName: string;
  title: string;
  originalUrl: string;
  deadline: string;
}

export interface UpdateCardRequest {
  companyName: string;
  title: string;
  originalUrl: string;
  deadline: string;
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
export function createStage(body: { name: string }): Promise<KanbanStageCreateResponse> {
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
  body?: { moveToStageId?: number }
): Promise<KanbanStageDeleteResponse> {
  return apiFetch<KanbanStageDeleteResponse>(`/api/v1/kanban/stages/${stageId}`, {
    method: 'DELETE',
    body,
  });
}
