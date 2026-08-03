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
