import { Skeleton } from '@/components/ui/skeleton';

// DeadlineGroup/DeadlineCard 레이아웃 치수를 참고한 로딩 스켈레톤.
// 실제 그룹/카드 개수는 로딩 전엔 알 수 없어 임의 2그룹 × 2카드로 채운다.
function DeadlineCardSkeleton() {
  return (
    <div className="flex w-full items-start gap-1 overflow-hidden rounded-xl border border-line-secondary px-5">
      <div className="flex flex-1 items-stretch gap-5">
        <Skeleton className="w-2 shrink-0 self-stretch rounded-max" />
        <div className="flex flex-1 flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <Skeleton className="h-[18px] w-24" />
              <Skeleton className="h-6 w-2/5" />
            </div>
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-[22px] w-16 rounded-md" />
        </div>
      </div>
    </div>
  );
}

function DeadlineGroupSkeleton() {
  return (
    <div className="flex w-full flex-col items-start gap-5">
      <Skeleton className="h-7 w-32" />
      <div className="flex w-full flex-col items-start gap-4">
        <DeadlineCardSkeleton />
        <DeadlineCardSkeleton />
      </div>
    </div>
  );
}

export function DeadlineListSkeleton() {
  return (
    <div className="flex w-full flex-col gap-9 rounded-[20px] bg-base-white p-[28px]">
      <DeadlineGroupSkeleton />
      <DeadlineGroupSkeleton />
    </div>
  );
}
