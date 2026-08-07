import { Skeleton } from './skeleton';

// JobCard(job-card.tsx)와 동일한 레이아웃 치수를 사용하는 로딩 스켈레톤.
// 공고 탐색 / 스크랩 목록에서 재사용.
export function JobCardSkeleton() {
  return (
    <div className="flex w-full items-center gap-6 rounded-xl p-4">
      <Skeleton className="size-[100px] shrink-0 rounded-lg" />

      <div className="flex min-w-0 flex-1 items-center gap-[28px]">
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-3">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-[18px] w-24" />
            <Skeleton className="h-6 w-3/5" />
          </div>
          <Skeleton className="h-[18px] w-32" />
        </div>

        <div className="flex h-full w-[140px] shrink-0 flex-col items-start justify-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-28" />
        </div>

        <div className="flex h-full w-[120px] shrink-0 flex-col items-stretch justify-center gap-[10px]">
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
