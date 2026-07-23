import type { DeadlineNotificationGroup } from '../types';
import { DeadlineNotificationCard } from './DeadlineNotificationCard';

interface DeadlineGroupSectionProps {
  group: DeadlineNotificationGroup;
  onCardClick?: (cardId: number) => void;
}

export function DeadlineGroupSection({ group, onCardClick }: DeadlineGroupSectionProps) {
  return (
    <div className="flex w-full flex-col items-start gap-4">
      <div className="flex items-end gap-[6px]">
        <p
          className={`text-lg font-semibold leading-[1.4] ${group.isEmphasized ? 'text-[#4864f1]' : 'text-[#212123]'}`}
        >
          {group.label}
        </p>
        <p
          className={`text-base font-medium leading-[1.5] ${group.isEmphasized ? 'text-[#4864f1]' : 'text-[#616164]'}`}
        >
          {group.dDayLabel}
        </p>
      </div>
      <div className="flex w-full flex-col gap-3">
        {group.items.map((item) => (
          <DeadlineNotificationCard
            key={item.id}
            item={item}
            isEmphasized={group.isEmphasized}
            onClick={onCardClick}
          />
        ))}
      </div>
    </div>
  );
}
