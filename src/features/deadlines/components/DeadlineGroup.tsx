'use client';

import type { DeadlineGroupData } from '../utils/groupByDeadline';
import { DeadlineCard } from './DeadlineCard';

interface DeadlineGroupProps {
  group: DeadlineGroupData;
  selectedCardId: number | null;
  availableStages: { id: number; name: string }[];
  onCardClick: (cardId: number) => void;
  onDeleteCard: (cardId: number) => void;
  onUpdateDeadline: (cardId: number, deadline: string) => void;
  onMoveStage: (cardId: number, stageId: number) => void;
}

// Figma "DeadlineGroup"(node 101:17525 등) 스펙 반영.
export function DeadlineGroup({
  group,
  selectedCardId,
  availableStages,
  onCardClick,
  onDeleteCard,
  onUpdateDeadline,
  onMoveStage,
}: DeadlineGroupProps) {
  return (
    <div className="flex w-full flex-col items-start gap-4">
      <div
        className={`flex items-end gap-[6px] whitespace-nowrap ${
          group.isUrgent ? 'text-label-primary' : ''
        }`}
      >
        <p
          className={`text-7 font-semibold leading-[1.4] ${group.isUrgent ? '' : 'text-label-base'}`}
        >
          {group.label}
        </p>
        <p
          className={`text-5 font-medium leading-[1.5] ${group.isUrgent ? '' : 'text-label-body'}`}
        >
          {group.ddayLabel}
        </p>
      </div>

      <div className="flex w-full flex-col items-start gap-3">
        {group.cards.map((entry) => (
          <DeadlineCard
            key={entry.card.id}
            entry={entry}
            isUrgent={group.isUrgent}
            isSelected={selectedCardId === entry.card.id}
            availableStages={availableStages}
            onClick={() => onCardClick(entry.card.id)}
            onDelete={() => onDeleteCard(entry.card.id)}
            onUpdateDeadline={onUpdateDeadline}
            onMoveStage={onMoveStage}
          />
        ))}
      </div>
    </div>
  );
}
