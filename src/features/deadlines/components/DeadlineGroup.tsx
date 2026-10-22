'use client';

import type { DeadlineGroupData, DeadlineTone } from '../utils/groupByDeadline';
import { DeadlineCard } from './DeadlineCard';

interface DeadlineGroupProps {
  group: DeadlineGroupData;
  selectedCardId: number | null;
  onCardClick: (cardId: number) => void;
  onEditCard: (cardId: number) => void;
  onDeleteCard: (cardId: number) => void;
}

// HT-005: 파란색(label-primary)은 서비스 기본 강조색이라 마감 임박이 눈에 띄지 않아,
// 경고 의미가 분명한 빨간색(status-negative)으로 변경. 마감 지난 그룹은 회색으로 낮춤.
const HEADER_TONE_CLASS: Record<DeadlineTone, { label: string; dday: string }> = {
  urgent: { label: 'text-status-negative', dday: 'text-status-negative' },
  past: { label: 'text-label-description', dday: 'text-label-description' },
  default: { label: 'text-label-base', dday: 'text-label-body' },
};

// Figma "DeadlineGroup"(node 101:17525 등) 스펙 반영.
export function DeadlineGroup({
  group,
  selectedCardId,
  onCardClick,
  onEditCard,
  onDeleteCard,
}: DeadlineGroupProps) {
  const toneClass = HEADER_TONE_CLASS[group.tone];

  return (
    <div className="flex w-full flex-col items-start gap-5">
      <div className="flex items-end gap-[6px] whitespace-nowrap">
        <p className={`text-7 font-semibold leading-[1.4] ${toneClass.label}`}>{group.label}</p>
        <p className={`text-5 font-medium leading-[1.5] ${toneClass.dday}`}>{group.ddayLabel}</p>
      </div>

      <div className="flex w-full flex-col items-start gap-3">
        {group.cards.map((entry) => (
          <DeadlineCard
            key={entry.card.id}
            entry={entry}
            tone={group.tone}
            isSelected={selectedCardId === entry.card.id}
            onClick={() => onCardClick(entry.card.id)}
            onEdit={() => onEditCard(entry.card.id)}
            onDelete={() => onDeleteCard(entry.card.id)}
          />
        ))}
      </div>
    </div>
  );
}
