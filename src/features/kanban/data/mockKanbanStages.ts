import type { KanbanStage } from '@/types/api';

const BASE_CARD = {
  postingId: 101,
  companyName: '와탭랩스',
  jobTitle: 'Java/Spring Boot 백엔드 개발자 채용',
  deadline: '2026-07-02',
  thumbnailUrl: '',
  originalUrl: 'https://example.com',
  deadlineChanged: false,
  memo: '',
  registeredAt: '2026-06-29T11:00:00',
};

// TODO: GET /api/v1/kanban(3.1) 연동 전까지의 임시 데이터.
export const MOCK_KANBAN_STAGES: KanbanStage[] = [
  {
    id: 1,
    name: '지원 전',
    position: 1,
    isDefault: true,
    cards: Array.from({ length: 5 }, (_, i) => ({ ...BASE_CARD, id: i + 1 })),
  },
  {
    id: 2,
    name: '면접',
    position: 2,
    isDefault: true,
    cards: Array.from({ length: 2 }, (_, i) => ({ ...BASE_CARD, id: i + 10 })),
  },
  {
    id: 3,
    name: '최종 결과',
    position: 3,
    isDefault: true,
    cards: [{ ...BASE_CARD, id: 20 }],
  },
];
