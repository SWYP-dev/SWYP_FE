import type { DeadlineNotificationGroup, DeadlineNotificationItem } from '../types';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

function toDateOnly(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function getDDay(referenceDate: Date, targetDate: Date): number {
  return Math.round((targetDate.getTime() - referenceDate.getTime()) / DAY_IN_MS);
}

function formatMonthDay(date: Date): string {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${days[date.getDay()]})`;
}

/**
 * 마감일 기준으로 오늘/내일/그 외 날짜별로 공고를 그룹핑합니다.
 * 마감일 페이지의 groupByDeadline.ts와 그룹핑 기준(D-day)이 동일해서,
 * 두 로직을 공통 유틸로 합칠 수 있는지는 별도 검토가 필요합니다. (TODO)
 */
export function groupDeadlineNotifications(
  items: DeadlineNotificationItem[],
  referenceDateString: string
): DeadlineNotificationGroup[] {
  const referenceDate = toDateOnly(referenceDateString);
  const sorted = [...items].sort(
    (a, b) => toDateOnly(a.deadlineDate).getTime() - toDateOnly(b.deadlineDate).getTime()
  );

  const groups = new Map<string, DeadlineNotificationGroup>();

  for (const item of sorted) {
    const targetDate = toDateOnly(item.deadlineDate);
    const dDay = getDDay(referenceDate, targetDate);

    let key: string;
    let label: string;
    let dDayLabel: string;
    let isEmphasized: boolean;

    if (dDay === 0) {
      key = 'TODAY';
      label = '오늘';
      dDayLabel = 'D-Day';
      isEmphasized = true;
    } else if (dDay === 1) {
      key = 'TOMORROW';
      label = '내일';
      dDayLabel = 'D-1';
      isEmphasized = true;
    } else {
      key = item.deadlineDate;
      label = formatMonthDay(targetDate);
      dDayLabel = `D-${dDay}`;
      isEmphasized = false;
    }

    if (!groups.has(key)) {
      groups.set(key, { key, label, dDayLabel, isEmphasized, items: [] });
    }
    groups.get(key)!.items.push(item);
  }

  return Array.from(groups.values());
}
