import Image from 'next/image';

interface EmptyJobPostingProps {
  onResetFilters: () => void;
}

// Figma "필터링 된 채용 공고가 없는 경우"(node 133:23497) EmptyJobPosting 컴포넌트 반영.
// size-full + justify-center로 부모 영역 전체를 채운 뒤 중앙 정렬 (Figma 스펙 그대로).
export function EmptyJobPosting({ onResetFilters }: EmptyJobPostingProps) {
  return (
    <div className="flex h-full w-full min-h-[420px] flex-1 flex-col items-center justify-center gap-4">
      <Image src="/icons/empty-search.svg" alt="" width={40} height={40} />
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
