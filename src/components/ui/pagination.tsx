interface PaginationProps {
  currentPage: number; // 0부터 시작 (API 명세서 기준)
  totalPages: number;
  onPageChange: (page: number) => void;
}

function ChevronIcon({ direction, disabled }: { direction: 'left' | 'right'; disabled: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={disabled ? 'text-neutral-400' : 'text-label-base'}
    >
      <path
        d={direction === 'left' ? 'M11 4L6 9L11 14' : 'M7 4L12 9L7 14'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Figma Pagination 컴포넌트(node 30:131) 스펙 반영.
// 현재 페이지 기준 최대 5개 번호를 윈도우 방식으로 노출.
export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const windowSize = 5;
  const half = Math.floor(windowSize / 2);
  let start = Math.max(0, currentPage - half);
  const end = Math.min(totalPages, start + windowSize);
  start = Math.max(0, end - windowSize);

  const pages = Array.from({ length: end - start }, (_, i) => start + i);
  const isFirst = currentPage === 0;
  const isLast = currentPage === totalPages - 1;

  return (
    <div className="flex items-center gap-5">
      <button
        type="button"
        onClick={() => !isFirst && onPageChange(currentPage - 1)}
        disabled={isFirst}
        aria-label="이전 페이지"
        className="disabled:cursor-not-allowed"
      >
        <ChevronIcon direction="left" disabled={isFirst} />
      </button>

      <div className="flex items-center gap-1">
        {pages.map((page) => {
          const isActive = page === currentPage;
          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`flex size-[30px] items-center justify-center rounded-lg text-3 font-semibold ${
                isActive ? 'bg-fill-primary-light text-label-base' : 'text-label-body'
              }`}
            >
              {page + 1}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => !isLast && onPageChange(currentPage + 1)}
        disabled={isLast}
        aria-label="다음 페이지"
        className="disabled:cursor-not-allowed"
      >
        <ChevronIcon direction="right" disabled={isLast} />
      </button>
    </div>
  );
}
