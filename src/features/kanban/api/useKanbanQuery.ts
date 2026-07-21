import { useQuery } from '@tanstack/react-query';
import { fetchKanbanBoard, fetchCardDetail } from './kanbanApi';

export const kanbanKeys = {
  board: () => ['kanban', 'board'] as const,
  cardDetail: (cardId: number) => ['kanban', 'card', cardId] as const,
};

// GET /api/v1/kanban — 보드 전체 조회
export function useKanbanBoard() {
  return useQuery({
    queryKey: kanbanKeys.board(),
    queryFn: fetchKanbanBoard,
  });
}

// GET /api/v1/kanban/cards/{cardId} — 카드 상세 (Drawer가 열려있을 때만 조회)
export function useCardDetail(cardId: number | null) {
  return useQuery({
    queryKey: kanbanKeys.cardDetail(cardId ?? -1),
    queryFn: () => fetchCardDetail(cardId as number),
    enabled: cardId !== null,
  });
}
