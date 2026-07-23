import type { ScrapItem } from '@/types/api';

/**
 * 스크랩 카드 UI 표시용 타입.
 *
 * ⚠️ 확인 필요 (진행 중): API 명세서 2.5(GET /api/v1/feed/scraps) 응답 타입인 `ScrapItem`
 * (src/types/api.ts)에는 platform/jobCategory/region/career 필드가 없음
 * ("스크랩 탭은 카드 UI가 더 간결하게 설계됨"이라고 명시돼 있음).
 * 하지만 Figma 디자인(node 75:13324)에는 플랫폼 뱃지·직무·지역·경력이 모두 표시되어 있고,
 * 태영님 확인 결과 우선 화면에는 노출하기로 함 (2026-07-19).
 * → 세영님 확인 후 API 2.5 응답에 필드가 추가되면 ScrapItem을 그대로 쓰도록 교체 필요.
 * 그 전까지는 이 타입 + mockScraps.ts의 목업으로 화면만 구성.
 */
export interface ScrapCardData extends Pick<
  ScrapItem,
  | 'jobPostingId'
  | 'companyName'
  | 'jobTitle'
  | 'thumbnailUrl'
  | 'originalUrl'
  | 'isKanbanRegistered'
  | 'scrappedAt'
> {
  deadline: string; // ISO date string (ScrapItem.deadline과 동일)
  deadlineLabel: string; // ex. "~7.2 (수)"
  platformLabel: string; // TODO: API 확장 대기 (세영님 확인 필요)
  jobCategoryLabel: string; // TODO: API 확장 대기 (세영님 확인 필요)
  region: string; // TODO: API 확장 대기 (세영님 확인 필요)
  careerLabel: string; // TODO: API 확장 대기 (세영님 확인 필요)
}
