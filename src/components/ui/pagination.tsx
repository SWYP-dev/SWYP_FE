import Image from 'next/image';

interface PaginationProps {
  currentPage: number; // 0부터 시작 (API 명세서 기준)
  totalPages: number;
  onPageChange: (page: number) => void;
}

// name="chevron-left" / "chevron-right" — 이전/다음 페이지 버튼.
function ChevronIcon({ direction, disabled }: { direction: 'left' | 'right'; disabled: boolean }) {
  return (
    <Image
      src={direction === 'left' ? '/icons/chevron-left.svg' : '/icons/chevron-right.svg'}
      alt=""
      width={18}
      height={18}
      className={disabled ? 'opacity-40' : ''}
    />
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
