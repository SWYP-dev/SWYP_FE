import { Skeleton, SkeletonLine } from '@/components/ui/skeleton';

// DeadlineGroup/DeadlineCard 레이아웃 치수를 그대로 쓴 로딩 스켈레톤 (QA-027).
// 실제 그룹/카드 개수는 로딩 전엔 알 수 없어 임의 2그룹 × 2카드로 채운다.
// 카드 폭과 무관하게 글자 길이는 비슷하므로 막대 너비는 비율이 아닌 px로 고정한다.
function DeadlineCardSkeleton() {
  return (
    <div className="flex w-full items-start gap-2 overflow-hidden rounded-xl border border-line-secondary bg-base-white px-5 py-4">
      <div className="flex flex-1 items-center gap-5">
        <Skeleton className="w-2 shrink-0 self-stretch rounded-max" />

        <div className="flex flex-1 flex-col gap-3 py-1">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col">
              <SkeletonLine lineClassName="h-[21px]" widthClassName="w-[96px]" />
              <SkeletonLine lineClassName="h-[24px]" widthClassName="w-[320px] max-w-full" />
            </div>
            <SkeletonLine lineClassName="h-[18px]" widthClassName="w-[120px]" />
          </div>
          <Skeleton className="h-[20.5px] w-[56px]" />
        </div>
      </div>

      <div className="flex shrink-0 items-start gap-[6px]">
        <Skeleton className="size-[16px] rounded-sm" />
        <Skeleton className="size-[16px] rounded-sm" />
      </div>
    </div>
  );
}

function DeadlineGroupSkeleton() {
  return (
    <div className="flex w-full flex-col items-start gap-5">
      <SkeletonLine lineClassName="h-[25px]" widthClassName="w-[140px]" />
      <div className="flex w-full flex-col items-start gap-3">
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
