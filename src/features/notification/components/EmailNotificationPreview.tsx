import type { DeadlineNotificationGroup } from '../types';
import { ChwihapWordmark } from './icons';
import { DeadlineGroupSection } from './DeadlineGroupSection';

interface EmailNotificationPreviewProps {
  groups: DeadlineNotificationGroup[];
  onViewAllClick?: () => void;
  onCardClick?: (cardId: number) => void;
}

function buildSummaryLine(groups: DeadlineNotificationGroup[]): string {
  return groups.map((group) => `${group.label} 마감 ${group.items.length}건`).join(' · ');
}

export function EmailNotificationPreview({
  groups,
  onViewAllClick,
  onCardClick,
}: EmailNotificationPreviewProps) {
  const totalCount = groups.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <div className="flex w-full flex-col items-center gap-5 bg-[#f6f6f7] py-[36px]">
      <div className="flex w-full max-w-[652px] flex-col items-start gap-6 rounded-2xl bg-white p-[36px]">
        <header className="flex w-full flex-col items-start border-b border-[#e9ebec] pb-5">
          <ChwihapWordmark className="h-5 w-[110px]" />
        </header>

        <div className="flex w-full flex-col items-start gap-6">
          <div className="flex flex-col gap-1.5">
            <p className="text-2xl font-bold leading-[1.4] text-[#212123]">
              마감이 임박한 공고가 {totalCount}건 있어요
            </p>
            <p className="text-[17px] font-medium leading-[1.4] text-[#616164]">
              {buildSummaryLine(groups)}
            </p>
          </div>

          <div className="flex w-full flex-col items-start gap-8">
            {groups.map((group) => (
              <DeadlineGroupSection key={group.key} group={group} onCardClick={onCardClick} />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onViewAllClick}
          className="flex w-full items-center justify-center rounded-lg bg-[#4864f1] px-3 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90"
        >
          지원 마감일에서 모아보기
        </button>
      </div>

      <p className="text-center text-[11px] font-medium leading-[1.5] text-[#616164]">
        Copyright © Chwihap. All rights reserved.
      </p>
    </div>
  );
}
