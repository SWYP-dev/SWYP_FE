// ===================================
// 공통 응답 포맷 (API 명세서 "응답 포맷" 섹션 기준)
// ===================================

// v1.6 명세서 기준 - 실제 백엔드 구현은 error 객체 없이 code/message가 최상위로 평탄화되어 내려옴
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  code: string | null;
  message: string | null;
}

// 커서 기반 페이지네이션 — 5.3 알림 발송 이력 조회 등 무한 스크롤 API가 계속 사용
export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
  hasNext: boolean;
}

// 페이지 번호 기반 페이지네이션 (v1.9 신규)
// 2.1 공고 피드 조회, 2.5 스크랩 목록 조회가 cursor 방식에서 전환되면서 사용
export interface PageResponse<T> {
  items: T[];
  page: number; // 0부터 시작
  size: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}

// ===================================
// 2. 통합 공고 피드 (Feed)
// ===================================
export type Platform = 'SARAMIN' | 'WANTED' | 'WORKNET' | 'DIRECT';
export type JobCategory =
  'BACKEND' | 'FRONTEND' | 'FULLSTACK' | 'DESIGN' | 'PM' | 'DATA' | 'DEVOPS' | 'OTHER';
export type Career = 'NEW' | 'EXPERIENCED';

// 2.1 공고 피드 조회 - 쿼리 파라미터 (신규)
// v1.8: region 추가, jobCategory/career 다중 선택(콤마 구분) 지원
// v1.9: cursor → page 전환
export interface FeedQueryParams {
  page?: number; // 0부터 시작, 기본 0
  size?: number; // 기본 20, 최대 50
  sort?: 'LATEST' | 'DEADLINE';
  platform?: string; // 콤마 구분 다중 선택 (예: "SARAMIN,WORKNET")
  jobCategory?: string; // 콤마 구분 다중 선택
  career?: string; // 콤마 구분 다중 선택
  region?: string; // 콤마 구분 다중 선택 (v1.8 추가, 예: "판교,강남")
  deadlineSoon?: boolean;
  keyword?: string;
}

// 2.1 공고 피드 조회 - 목록 아이템
export interface FeedItem {
  id: number; // feed id (job_feed.id) — 피드 탐색 중에만 쓰는 임시성 ID, 스크랩 이후엔 jobPostingId를 써야 함
  platform: Platform;
  companyName: string;
  region: string; // 백엔드 확인(2026-07-19) 후 추가된 필드
  jobTitle: string;
  jobCategory: JobCategory;
  career: Career;
  deadline: string; // "2026-07-15"
  thumbnailUrl: string;
  originalUrl: string;
  isScrapped: boolean; // v1.9: isFavorite → isScrapped
  isExpired: boolean;
  createdAt: string;
}

// 2.2 공고 상세 조회 (피드 상세 패널용)
export interface FeedDetail extends Omit<FeedItem, 'isExpired'> {
  description: string;
  isKanbanRegistered: boolean;
}

// 2.5 스크랩 목록 조회 - 아이템 (피드보다 필드가 적음)
// v1.7: 식별자 id → jobPostingId (job_postings 사본 ID, 원본 피드 만료와 무관하게 영구 보존)
// v1.9: FavoriteItem → ScrapItem 개명, favoritedAt → scrappedAt
export interface ScrapItem {
  jobPostingId: number;
  companyName: string;
  jobTitle: string;
  deadline: string;
  thumbnailUrl: string;
  originalUrl: string;
  isKanbanRegistered: boolean;
  scrappedAt: string;
}

// ===================================
// 3. 지원 현황 관리 (Kanban)
// ===================================

// 3.1 칸반 카드 (스테이지 안에 중첩됨)
// ⚠️ 확인 필요: API 명세서 3.1에 "메모 제거 — 카드/수정창은 회사명·공고명·회사링크·지원일만
// 사용" 이라는 변경 메모가 추가됐는데, 바로 아래 Response 예시 JSON에는 여전히 memo·deadline·
// thumbnailUrl 필드가 남아있어 명세 자체가 정리 중인 상태로 보임. 실제 응답 필드 확정되면
// (특히 memo 유지 여부) 반영 필요. 우선 타입은 기존 그대로 유지.
export interface KanbanCard {
  id: number;
  postingId: number;
  companyName: string;
  jobTitle: string;
  deadline: string;
  thumbnailUrl: string;
  originalUrl: string;
  deadlineChanged: boolean;
  memo: string;
  registeredAt: string;
}

// 3.1 칸반 스테이지
export interface KanbanStage {
  id: number;
  name: string;
  position: number;
  isDefault: boolean;
  cards: KanbanCard[];
}

// 3.1 칸반 보드 전체 조회 응답
export interface KanbanBoard {
  stages: KanbanStage[];
}

// 3.4 칸반 카드 상세 조회 (서류 목록 포함)
export interface KanbanCardDetail {
  id: number;
  postingId: number;
  companyName: string;
  jobTitle: string;
  deadline: string;
  originalUrl: string;
  deadlineChanged: boolean;
  memo: string;
  documents: DocumentItem[];
  registeredAt: string;
}

// ===================================
// 4. 서류·메모 관리 (Document)
// ===================================
export type DocumentType = 'FILE' | 'LINK' | 'MEMO';

// FILE / LINK / MEMO가 필드가 달라서 하나의 유니온 타입으로 표현
export type DocumentItem =
  | {
      id: number;
      type: 'FILE';
      name: string;
      version: number;
      size?: number; // 3.4 칸반 카드 상세 조회 응답의 documents에는 없음 (4.1 업로드, 4.4 목록 조회에는 있음)
      uploadedAt: string;
    }
  | {
      id: number;
      type: 'LINK';
      name: string;
      url: string;
      registeredAt: string;
    }
  | {
      id: number;
      type: 'MEMO';
      name: string;
      content: string;
      registeredAt: string;
    };

// 4.6 다운로드 URL 발급 응답
export interface DownloadUrlResponse {
  downloadUrl: string;
  expiresAt: string;
}

// ===================================
// 5. 알림 (Notification)
// ===================================
export interface NotificationSettings {
  emailEnabled: boolean;
  inAppEnabled: boolean;
  email: string;
  remindDays: number[]; // 예: [7, 3, 1]
}

export type NotificationStatus = 'SUCCESS' | 'FAILED';

export interface NotificationHistoryItem {
  id: number;
  type: 'EMAIL';
  cardId: number;
  companyName: string;
  message: string;
  sentAt: string;
  status: NotificationStatus;
}

export interface InAppNotificationItem {
  id: number;
  cardId: number;
  companyName: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface InAppNotificationInbox {
  unreadCount: number;
  items: InAppNotificationItem[];
}

// ===================================
// 6. 사용자 (User)
// ===================================
export interface UserMe {
  id: number;
  nickname: string;
  profileImage: string;
  email: string;
  storageUsed: number; // byte 단위
  storageLimit: number; // byte 단위
  createdAt: string;
}

// ===================================
// 액션(수정/등록/삭제) 응답 타입
// ===================================

// 2.3 스크랩 추가
// v1.7: jobPostingId 추가 — 이후 해제·목록 조회에 쓰는 안정적인 ID
// v1.9: endpoint POST /feed/{postingId}/scrap 로 변경, isFavorite → isScrapped
export interface ScrapAddResponse {
  postingId: number; // 요청에 쓴 feed id (echo)
  jobPostingId: number;
  isScrapped: boolean;
}

// 2.4 스크랩 해제
// v1.9: endpoint DELETE /feed/scraps/{jobPostingId} 로 변경, isFavorite → isScrapped
export interface ScrapRemoveResponse {
  jobPostingId: number;
  isScrapped: boolean;
}

// 3.2 칸반 카드 등록
// ✅ 확인 완료 (2026-07-20, Swagger 실측): Request Body `postingId` 필드는 실제로
// jobPostingId(스크랩 사본 id)를 받음 — 상세는 registerCard.ts 주석 참고.
// 에러코드 POSTING_NOT_FAVORITED는 그대로 사용 중 (정합화 명칭 변경은 아직 안 됨).
export interface KanbanCardRegisterResponse {
  cardId: number;
  stageId: number;
  stageName: string;
  postingId: number;
  companyName: string;
  jobTitle: string;
  deadline: string;
}

// 3.3 칸반 카드 스테이지 이동
export interface KanbanCardMoveResponse {
  cardId: number;
  stageId: number;
  stageName: string;
  position: number;
}

// 3.5 칸반 카드 메모 수정
export interface KanbanCardMemoResponse {
  cardId: number;
  memo: string;
}

// 3.7 스테이지 추가
export interface KanbanStageCreateResponse {
  id: number;
  name: string;
  position: number;
  isDefault: boolean;
}

// 3.8 스테이지 수정
export interface KanbanStageUpdateResponse {
  id: number;
  name: string;
  position: number;
}

// 3.9 스테이지 삭제
export interface KanbanStageDeleteResponse {
  movedCardCount: number;
}

// 5.2 알림 설정 수정 (NotificationSettings와 동일 구조지만 email 필드 없음)
export type NotificationSettingsUpdateResponse = Omit<NotificationSettings, 'email'>;

// 5.5 인앱 알림 읽음 처리
export interface NotificationReadResponse {
  updatedCount: number;
}
