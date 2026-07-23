/**
 * 이메일 알림(마감 임박 리마인드) 관련 타입 정의
 * 참고: PRD v1.4.0 4.3.2 알림 기능 / API 명세서 v1.9 5. 알림(Notification)
 *
 * NOTE: API 5.3(알림 발송 이력 조회)은 이미 포맷팅된 message 문자열만 내려주는 구조라
 * 이 화면(기업명/공고명/마감일 그룹핑)과 데이터 형태가 다릅니다.
 * 실제 데이터 소스는 칸반 카드 마감일 데이터일 가능성이 높은데, 세영님/동섭님 확인 필요 (TODO)
 */
export interface DeadlineNotificationItem {
  id: number;
  /** 칸반 카드 상세로 딥링크하기 위한 카드 ID */
  cardId: number;
  companyName: string;
  title: string;
  /** ISO 날짜 문자열 (YYYY-MM-DD) */
  deadlineDate: string;
}

export interface DeadlineNotificationGroup {
  /** "TODAY" | "TOMORROW" | 마감일(YYYY-MM-DD) */
  key: string;
  /** "오늘" | "내일" | "7월 23일 (목)" */
  label: string;
  /** "D-Day" | "D-1" | "D-10" */
  dDayLabel: string;
  /** 오늘/내일 그룹만 primary 컬러로 강조 */
  isEmphasized: boolean;
  items: DeadlineNotificationItem[];
}
