// 지원 마감일 관련 공통 유틸.
// DeadlineBadge(뱃지 표시)와 getFeed(피드 필터링)가 동일한 기준으로 마감 여부를
// 판단하도록 로직을 한 곳에 모음. (배치 주기 시차로 백엔드 isExpired가 아직
// false인 경우를 대비해, 클라이언트 날짜 계산을 최종 판단 기준으로 사용)
export function getDeadlineDiffDays(deadline: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(deadline);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function isDeadlinePassed(deadline: string | null): boolean {
  // deadline이 null이면 상시채용 등 마감일 미표기 공고 — 마감 처리하지 않음.
  if (deadline === null) return false;
  return getDeadlineDiffDays(deadline) < 0;
}

// KanbanCard/KanbanCardDetail의 deadline은 타입상 string(non-null)으로 문서화돼
// 있으나, 원본 피드가 deadline: null(상시채용)인 공고를 지원 현황에 추가하면 실제
// 응답도 null로 내려온다(문서-코드 불일치, FeedItem과 동일한 패턴). new Date(null)이
// epoch(1970-01-01)로 조용히 파싱되어 "1970.01.01"로 잘못 표시되던 게 원인.
export function isAlwaysHiring(deadline: string | null): deadline is null {
  return deadline === null;
}
