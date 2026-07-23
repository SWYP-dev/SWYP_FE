import type { ScrapCardData } from '../types/scrap';

// TODO: GET /api/v1/feed/scraps 연동 전 임시 목업 데이터.
// Figma(node 75:13324) 목업과 동일한 더미 값 사용.
// index 1번 카드만 isKanbanRegistered: true로 설정 (추후 "이미 등록된 공고입니다" 문구 작업 시 참고용).
export const MOCK_SCRAPS: ScrapCardData[] = Array.from({ length: 19 }, (_, i) => ({
  jobPostingId: i,
  companyName: '와탭랩스',
  jobTitle: 'Java/Spring Boot 백엔드 개발자 채용',
  platformLabel: '사람인',
  jobCategoryLabel: '백엔드 개발자',
  region: '부산 부산진구',
  careerLabel: '경력 3-10년',
  deadline: '2026-07-08',
  deadlineLabel: '~7.2 (수)',
  thumbnailUrl: '/images/job-thumbnail.png',
  originalUrl: 'https://example.com',
  isKanbanRegistered: i === 1,
  scrappedAt: '2026-06-29T10:00:00',
}));
