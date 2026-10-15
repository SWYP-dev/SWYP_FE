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

// 한 번에 노출하는 페이지 번호 개수 (블록 크기).
const BLOCK_SIZE = 10;

// Figma Pagination 컴포넌트(node 30:131) 스펙 반영.
// 페이지를 10개 블록(1~10, 11~20…) 단위로 노출하고, 이전/다음 화살표는 블록 단위로 이동.
export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const blockIndex = Math.floor(currentPage / BLOCK_SIZE);
  const start = blockIndex * BLOCK_SIZE;
  const end = Math.min(totalPages, start + BLOCK_SIZE);

  const pages = Array.from({ length: end - start }, (_, i) => start + i);
  // 첫 블록이면 이전 블록이 없고, 마지막 블록이면 다음 블록이 없음
  const isFirst = start === 0;
  const isLast = end >= totalPages;

  return (
    <div className="flex items-center gap-5">
      <button
        type="button"
        // 이전 블록의 마지막 페이지로 이동 (예: 11~20 → 10)
        onClick={() => !isFirst && onPageChange(start - 1)}
        disabled={isFirst}
        aria-label="이전 10페이지"
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
        // 다음 블록의 첫 페이지로 이동 (예: 1~10 → 11)
        onClick={() => !isLast && onPageChange(end)}
        disabled={isLast}
        aria-label="다음 10페이지"
        className="disabled:cursor-not-allowed"
      >
        <ChevronIcon direction="right" disabled={isLast} />
      </button>
    </div>
  );
}
