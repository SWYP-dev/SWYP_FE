import Image from 'next/image';

interface EmptyJobPostingProps {
  onResetFilters: () => void;
}

// Figma "필터링 된 채용 공고가 없는 경우"(node 133:23477) EmptyJobPosting 컴포넌트 반영.
// public에 empty-search.svg가 없어 search.svg 사용 (40×40 스케일).
export function EmptyJobPosting({ onResetFilters }: EmptyJobPostingProps) {
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center gap-4 py-20">
      <Image src="/icons/search.svg" alt="" width={40} height={40} />
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-9 font-semibold leading-[1.4] text-label-base">
          조건에 맞는 채용 공고가 없어요
        </p>
        <p className="text-6 font-medium leading-[1.6] text-label-body">
          필터를 조정하거나 초기화해 보세요.
        </p>
      </div>
      <button
        type="button"
        onClick={onResetFilters}
        className="flex items-center justify-center rounded-lg border border-line-secondary bg-base-white px-3 py-2"
      >
        <span className="text-6 font-medium text-label-base">필터 초기화</span>
      </button>
    </div>
  );
}
