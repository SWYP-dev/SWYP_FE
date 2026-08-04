import { isAlwaysHiring } from '@/lib/utils/deadline';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

// "2026-07-15" -> "~ 7.15 (수)"
// Figma Card 컴포넌트(node 49:7685) Deadline 텍스트 포맷 반영.
export function formatDeadlineText(deadlineIso: string | null): string {
  if (isAlwaysHiring(deadlineIso)) return '상시채용';
  const date = new Date(deadlineIso);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = WEEKDAYS[date.getDay()];
  return `~ ${month}.${day} (${weekday})`;
}
