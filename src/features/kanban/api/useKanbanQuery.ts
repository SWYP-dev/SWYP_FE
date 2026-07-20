import { useQuery } from '@tanstack/react-query';
import { fetchKanbanBoard } from './kanbanApi';

export const kanbanKeys = {
  board: () => ['kanban', 'board'] as const,
};

// GET /api/v1/kanban — 보드 전체 조회
export function useKanbanBoard() {
  return useQuery({
    queryKey: kanbanKeys.board(),
    queryFn: fetchKanbanBoard,
  });
}
