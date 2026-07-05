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

// 목록 API들이 공통으로 쓰는 커서 페이지네이션 형태
export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
  hasNext: boolean;
}

// ===================================
// 2. 통합 공고 피드 (Feed)
// ===================================
export type Platform = 'SARAMIN' | 'WANTED' | 'WORKNET' | 'DIRECT';
export type JobCategory =
  'BACKEND' | 'FRONTEND' | 'FULLSTACK' | 'DESIGN' | 'PM' | 'DATA' | 'DEVOPS' | 'OTHER';
export type Career = 'NEW' | 'EXPERIENCED';

// 2.1 공고 피드 조회 - 목록 아이템
export interface FeedItem {
  id: number;
  platform: Platform;
  companyName: string;
  jobTitle: string;
  jobCategory: JobCategory;
  career: Career;
  deadline: string; // "2026-07-15"
  thumbnailUrl: string;
  originalUrl: string;
  isFavorite: boolean;
  isExpired: boolean;
  createdAt: string;
}

// 2.2 공고 상세 조회 (피드 상세 패널용)
export interface FeedDetail extends Omit<FeedItem, 'isExpired'> {
  description: string;
  isKanbanRegistered: boolean;
}

// 2.5 즐겨찾기 목록 조회 - 아이템 (피드보다 필드가 적음)
export interface FavoriteItem {
  id: number;
  companyName: string;
  jobTitle: string;
  deadline: string;
  thumbnailUrl: string;
  originalUrl: string;
  isKanbanRegistered: boolean;
  favoritedAt: string;
}

// ===================================
// 3. 지원 현황 관리 (Kanban)
// ===================================

// 3.1 칸반 카드 (스테이지 안에 중첩됨)
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

// 2.3 / 2.4 즐겨찾기 추가/해제
export interface FavoriteToggleResponse {
  postingId: number;
  isFavorite: boolean;
}

// 3.2 칸반 카드 등록
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
