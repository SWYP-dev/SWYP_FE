import { Skeleton } from '@/components/ui/skeleton';

// 칸반보드 초기 로딩 시 실제 스테이지/카드 개수를 알 수 없어, KanbanColumn/KanbanCard
// 레이아웃 치수를 참고한 임의 3컬럼 × 2카드 형태로 자리를 채운다.
function KanbanCardSkeleton() {
  return (
    <div className="flex w-full flex-col gap-2 rounded-xl bg-base-white px-6 pb-4 pt-5">
      <Skeleton className="h-[14px] w-16" />
      <Skeleton className="h-5 w-4/5" />
      <Skeleton className="h-[14px] w-24" />
    </div>
  );
}

function KanbanColumnSkeleton() {
  return (
    <div className="flex h-full min-w-[296px] flex-1 flex-col items-start rounded-2xl bg-surface-card">
      <div className="flex w-full items-center p-5">
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="flex w-full flex-col gap-3 px-5 pb-5">
        <KanbanCardSkeleton />
        <KanbanCardSkeleton />
      </div>
    </div>
  );
}

export function KanbanBoardSkeleton() {
  return (
    <div className="flex h-full w-full flex-1 items-stretch gap-6 overflow-x-auto pb-2">
      <KanbanColumnSkeleton />
      <KanbanColumnSkeleton />
      <KanbanColumnSkeleton />
    </div>
  );
}
