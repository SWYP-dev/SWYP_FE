import type { DeadlineNotificationItem } from '../types';

/**
 * 미리보기 기준 "오늘"로 취급할 날짜.
 * 실제 연동 시 서버 발송 시점(sentAt) 또는 클라이언트 현재 시각으로 대체됩니다.
 */
export const MOCK_REFERENCE_DATE = '2026-07-13';

export const mockDeadlineNotifications: DeadlineNotificationItem[] = [
  {
    id: 1,
    cardId: 101,
    companyName: '와탭랩스',
    title: 'Java/Spring Boot 백엔드 개발자 채용',
    deadlineDate: '2026-07-13',
  },
  {
    id: 2,
    cardId: 102,
    companyName: '와탭랩스',
    title: 'Java/Spring Boot 백엔드 개발자 채용',
    deadlineDate: '2026-07-13',
  },
  {
    id: 3,
    cardId: 103,
    companyName: '와탭랩스',
    title: 'Java/Spring Boot 백엔드 개발자 채용',
    deadlineDate: '2026-07-14',
  },
  {
    id: 4,
    cardId: 104,
    companyName: '와탭랩스',
    title: 'Java/Spring Boot 백엔드 개발자 채용',
    deadlineDate: '2026-07-23',
  },
];
