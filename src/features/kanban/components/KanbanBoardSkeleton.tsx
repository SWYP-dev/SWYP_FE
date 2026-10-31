'use client';

import { useSyncExternalStore } from 'react';
import { Skeleton, SkeletonLine } from '@/components/ui/skeleton';
import { parseKanbanLayoutCache, readKanbanLayoutCache } from '../utils/kanbanLayoutCache';

// 저장된 개수가 없을 때(첫 방문·다른 기기) 쓰는 기본 형태: 3컬럼 × 2카드
const DEFAULT_CARD_COUNTS = [2, 2, 2];
// 컬럼은 세로로 잘리므로 화면을 넘는 카드까지 그리지 않는다.
const MAX_CARDS_PER_COLUMN = 10;

// localStorage 값은 이 페이지에서 구독할 변경이 없어 구독 함수는 비워 둔다.
function subscribeNothing() {
  return () => {};
}

function KanbanCardSkeleton() {
  return (
    <div className="flex w-full flex-col gap-[2px] rounded-xl bg-base-white px-6 pb-4 pt-5">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col">
          <SkeletonLine lineClassName="h-[21px]" widthClassName="w-[28%]" />
          <SkeletonLine lineClassName="h-[24px]" widthClassName="w-[72%]" />
        </div>
        <SkeletonLine lineClassName="h-[18px]" widthClassName="w-[38%]" />
      </div>
      <SkeletonLine lineClassName="h-[26px]" widthClassName="w-[34%]" />
    </div>
  );
}

function KanbanColumnSkeleton({ cardCount }: { cardCount: number }) {
  return (
    <div className="flex h-full min-w-[296px] flex-1 flex-col items-start overflow-hidden rounded-2xl bg-surface-card">
      <div className="flex w-full items-center p-5">
        <div className="flex h-[24px] w-full items-center">
          <Skeleton className="h-[16px] w-[96px]" />
        </div>
      </div>
      <div className="flex w-full flex-col gap-3 px-5 pb-5">
        {Array.from({ length: Math.min(cardCount, MAX_CARDS_PER_COLUMN) }).map((_, i) => (
          <KanbanCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function KanbanBoardSkeleton() {
  // 서버 렌더링에서는 저장값을 읽을 수 없다. 기본 형태를 그리면 새로고침 때 컬럼 수가 바뀌며
  // 튀어 보이므로, 값을 읽을 수 있는 시점까지 그리지 않는다.
  const rawLayout = useSyncExternalStore(subscribeNothing, readKanbanLayoutCache, () => undefined);
  if (rawLayout === undefined) return null;

  const cardCounts = parseKanbanLayoutCache(rawLayout) ?? DEFAULT_CARD_COUNTS;

  return (
    <div className="flex h-full w-full flex-1 items-stretch gap-6 overflow-x-auto pb-2 kanban-scroll-x">
      {cardCounts.map((cardCount, i) => (
        <KanbanColumnSkeleton key={i} cardCount={cardCount} />
      ))}
    </div>
  );
}
