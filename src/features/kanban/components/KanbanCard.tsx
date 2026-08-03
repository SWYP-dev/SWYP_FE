'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EditIcon, TrashIcon } from '@/components/ui/icons';
import type { KanbanCard as KanbanCardType } from '@/types/api';
import { formatDeadlineText } from '../utils/formatDeadline';

interface KanbanCardProps {
  card: KanbanCardType;
  stageId: number;
  onCardClick?: (cardId: number) => void;
  onEditCard?: (card: KanbanCardType) => void;
  onDeleteCard?: (card: KanbanCardType) => void;
}

function handleOriginalLinkClick(event: React.MouseEvent<HTMLAnchorElement>) {
  event.stopPropagation();
}

function CalendarSmallIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3" width="10" height="9" rx="1.2" stroke="#9E9EA1" strokeWidth="1.2" />
      <path
        d="M2 5.5h10M4.5 1.5v3M9.5 1.5v3"
        stroke="#9E9EA1"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M18.4214 21.25H6.07857C5.32839 21.25 4.60893 20.952 4.07847 20.4215C3.54801 19.8911 3.25 19.1716 3.25 18.4214V6.07857C3.25 5.32839 3.54801 4.60893 4.07847 4.07847C4.60893 3.54801 5.32839 3.25 6.07857 3.25H12.25C12.4546 3.25 12.6508 3.33128 12.7955 3.47595C12.9402 3.62062 13.0214 3.81683 13.0214 4.02143C13.0214 4.22602 12.9402 4.42224 12.7955 4.56691C12.6508 4.71158 12.4546 4.79286 12.25 4.79286H6.07857C5.73758 4.79286 5.41055 4.92832 5.16943 5.16943C4.92832 5.41055 4.79286 5.73758 4.79286 6.07857V18.4214C4.79286 18.7624 4.92832 19.0894 5.16943 19.3306C5.41055 19.5717 5.73758 19.7071 6.07857 19.7071H18.4214C18.7624 19.7071 19.0894 19.5717 19.3306 19.3306C19.5717 19.0894 19.7071 18.7624 19.7071 18.4214V12.25C19.7071 12.0454 19.7884 11.8492 19.9331 11.7045C20.0778 11.5598 20.274 11.4786 20.4786 11.4786C20.6832 11.4786 20.8794 11.5598 21.0241 11.7045C21.1687 11.8492 21.25 12.0454 21.25 12.25V18.4214C21.25 19.1716 20.952 19.8911 20.4215 20.4215C19.8911 20.952 19.1716 21.25 18.4214 21.25ZM20.4786 8.90714C20.2748 8.90448 20.0801 8.82235 19.936 8.67825C19.7919 8.53415 19.7098 8.33948 19.7071 8.13571V4.79286H16.3643C16.1597 4.79286 15.9635 4.71158 15.8188 4.56691C15.6741 4.42224 15.5929 4.22602 15.5929 4.02143C15.5929 3.81683 15.6741 3.62062 15.8188 3.47595C15.9635 3.33128 16.1597 3.25 16.3643 3.25H20.4786C20.6823 3.25266 20.877 3.33479 21.0211 3.47889C21.1652 3.62299 21.2473 3.81766 21.25 4.02143V8.13571C21.2473 8.33948 21.1652 8.53415 21.0211 8.67825C20.877 8.82235 20.6823 8.90448 20.4786 8.90714Z" />
      <path d="M13.7428 11.467C13.5443 11.4518 13.3597 11.3595 13.2285 11.2098C13.102 11.0684 13.032 10.8853 13.032 10.6955C13.032 10.5058 13.102 10.3227 13.2285 10.1812L19.9142 3.49553C19.9848 3.41974 20.07 3.35895 20.1646 3.31678C20.2592 3.27462 20.3614 3.25195 20.465 3.25012C20.5685 3.24829 20.6714 3.26735 20.7675 3.30615C20.8635 3.34494 20.9508 3.40269 21.0241 3.47595C21.0973 3.5492 21.1551 3.63646 21.1939 3.73251C21.2327 3.82857 21.2517 3.93146 21.2499 4.03504C21.2481 4.13862 21.2254 4.24077 21.1832 4.3354C21.1411 4.43002 21.0803 4.51519 21.0045 4.58581L14.257 11.2098C14.1258 11.3595 13.9412 11.4518 13.7428 11.467Z" />
    </svg>
  );
}

// ⚠️ [QA 반영] 카드를 컬럼 스크롤 영역(overflow-y-auto) 안에서 CSS transform으로만
// 옮기면, 마우스가 그 영역의 시각적 경계를 벗어나는 순간부터 transform이 overflow에
// 잘려 보이지 않아 "특정 y값 아래부터 카드가 고정된 것처럼" 보이는 문제가 있었음.
// 실제 드래그 중 보여지는 카드는 DndContext 최상단(KanbanBoard)의 DragOverlay로
// 따로 렌더링해 overflow 제약을 받지 않도록 하고, 이 시각적 마크업만 두 곳에서
// 공유하기 위해 별도 컴포넌트로 분리.
export function KanbanCardContent({
  card,
  onEditCard,
  onDeleteCard,
}: {
  card: KanbanCardType;
  onEditCard?: (card: KanbanCardType) => void;
  onDeleteCard?: (card: KanbanCardType) => void;
}) {
  return (
    <div className="flex w-full items-start rounded-xl bg-base-white px-6 pb-4 pt-5 transition-shadow hover:shadow-normal-medium">
      <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-1 flex-col">
              <p className="text-3 font-medium text-label-body">{card.companyName}</p>
              <p className="line-clamp-2 w-full text-5 font-semibold text-label-base">
                {card.jobTitle}
              </p>
            </div>
            <div
              className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => onEditCard?.(card)}
                aria-label="지원 내역 수정"
                className="flex size-5 items-center justify-center text-icon-gray"
              >
                <EditIcon size={16} />
              </button>
              <button
                type="button"
                onClick={() => onDeleteCard?.(card)}
                aria-label="지원 내역 삭제"
                className="flex size-5 items-center justify-center text-icon-gray"
              >
                <TrashIcon size={16} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <CalendarSmallIcon />
            <span className="flex-1 text-1 font-medium text-label-description">
              {formatDeadlineText(card.deadline)}
            </span>
            {card.deadlineChanged && (
              <span className="rounded px-1 py-[1px] text-0 font-medium bg-fill-negative-light text-status-negative">
                마감일 변경
              </span>
            )}
          </div>
        </div>
        <a
          href={card.originalUrl}
          target="_blank"
          rel="noreferrer"
          onClick={handleOriginalLinkClick}
          className="flex w-fit items-center gap-2 py-2 text-1 font-medium text-label-primary"
        >
          원본 공고 이동
          <ExternalLinkIcon />
        </a>
      </div>
    </div>
  );
}

export function KanbanCard({
  card,
  stageId,
  onCardClick,
  onEditCard,
  onDeleteCard,
}: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: String(card.id),
    data: { type: 'card', stageId, card },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // ⚠️ 드래그 중인 실제 카드는 DragOverlay가 보여주므로, 원래 자리의 카드는 완전히
    // 숨겨서(0) 두 개가 겹쳐 보이지 않게 함.
    opacity: isDragging ? 0 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onCardClick?.(card.id)}
      className="group flex w-full cursor-grab flex-col items-start justify-center active:cursor-grabbing"
    >
      <KanbanCardContent card={card} onEditCard={onEditCard} onDeleteCard={onDeleteCard} />
    </div>
  );
}
