import type { DeadlineNotificationItem } from '../types';
import { CalendarIcon, ChevronRightIcon } from './icons';

interface DeadlineNotificationCardProps {
  item: DeadlineNotificationItem;
  /** 오늘/내일 그룹은 primary 컬러 divider, 그 외는 neutral-900 divider */
  isEmphasized: boolean;
  onClick?: (cardId: number) => void;
}

function formatDeadlineLabel(dateString: string): string {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const [, month, day] = dateString.split('-').map(Number);
  const date = new Date(dateString);
  return `~ ${month}.${day} (${days[date.getDay()]})`;
}

export function DeadlineNotificationCard({
  item,
  isEmphasized,
  onClick,
}: DeadlineNotificationCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(item.cardId)}
      className="flex w-full items-start gap-1 overflow-hidden rounded-xl border border-[#e9ebec] bg-white px-4 py-3 text-left transition-colors hover:bg-[#f6f6f7]"
    >
      <div className="flex flex-1 items-center gap-4">
        <span
          className={`h-full w-1 shrink-0 self-stretch rounded-full ${
            isEmphasized ? 'bg-[#4864f1]' : 'bg-[#212123]'
          }`}
        />
        <div className="flex flex-1 flex-col gap-2 py-1">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-[#616164]">{item.companyName}</p>
            <p className="truncate text-base font-semibold text-[#212123]">{item.title}</p>
          </div>
          <div className="flex items-center gap-1">
            <CalendarIcon className="size-3.5 text-[#9e9ea1]" />
            <p className="text-xs font-medium text-[#9e9ea1]">
              {formatDeadlineLabel(item.deadlineDate)}
            </p>
          </div>
        </div>
      </div>
      <ChevronRightIcon className="size-[18px] shrink-0 self-center text-[#9e9ea1]" />
    </button>
  );
}
