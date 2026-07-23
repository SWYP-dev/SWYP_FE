/**
 * API 명세서 2.1 공고 피드 조회 기준.
 * jobCategories는 배열로 확장 가정 (백엔드 확정 필요, formatJobCategories.ts 주석 참고)
 */
export interface JobPosting {
  id: number;
  platform: 'SARAMIN' | 'WANTED' | 'WORKNET' | 'DIRECT';
  companyName: string;
  jobTitle: string;
  jobCategories: string[]; // 백엔드 확정 전까지 임시로 배열 가정
  career: 'NEW' | 'EXPERIENCED';
  careerLabel: string; // ex. "경력 3-10년"
  region: string; // ex. "부산 부산진구"
  deadline: string; // ISO date string
  deadlineLabel: string; // ex. "~7.2 (수)"
  dDay: string; // ex. "D-7"
  thumbnailUrl: string;
  originalUrl: string;
  isScrapped: boolean;
  isExpired: boolean;
  createdAt: string;
}

export interface FeedResponse {
  items: JobPosting[];
  page: number; // 0-based
  size: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}

export type SortOption = 'LATEST' | 'DEADLINE';

// PlatformTabs 등 필터 UI에서 사용. JobPosting.platform에 'ALL'(전체) 옵션을 더한 값.
export type PlatformFilter = 'ALL' | JobPosting['platform'];
