import { Skeleton, SkeletonLine } from './skeleton';

// JobCard(job-card.tsx)와 동일한 레이아웃 치수를 사용하는 로딩 스켈레톤.
// 공고 탐색 / 스크랩 목록에서 재사용.
// QA-025: 막대 너비는 실제 콘텐츠 비율(회사명 22% / 공고명 64% / 직무 38%)에 맞추고, 지역·경력·마감일 열은 뺀다.
export function JobCardSkeleton() {
  return (
    <div className="flex w-full items-center gap-6 rounded-xl p-4">
      <Skeleton className="size-[100px] shrink-0 rounded-lg" />

      <div className="flex min-w-0 flex-1 items-center gap-[28px]">
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
          <div className="flex flex-col gap-[2px]">
            <SkeletonLine lineClassName="h-[21px]" widthClassName="w-[22%]" />
            <SkeletonLine lineClassName="h-[24px]" widthClassName="w-[64%]" />
          </div>
          <SkeletonLine lineClassName="h-[18px]" widthClassName="w-[38%]" />
        </div>

        <div className="flex w-[105px] shrink-0 flex-col items-stretch justify-center gap-[10px]">
          <Skeleton className="h-[38px] rounded-[10px]" />
          <Skeleton className="h-[38px] rounded-[10px]" />
        </div>
      </div>
    </div>
  );
}
