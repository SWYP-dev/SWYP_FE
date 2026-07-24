import Image from 'next/image';

interface EmptyJobPostingProps {
  iconSrc: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

// Figma EmptyJobPosting 컴포넌트 반영. 필터 결과 없음(133:23497), 검색 결과 없음(133:23523)
// 두 시나리오가 아이콘/문구/버튼 유무만 다르고 레이아웃은 동일해서 하나로 통합.
export function EmptyJobPosting({
  iconSrc,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyJobPostingProps) {
  return (
    <div className="flex h-full w-full min-h-[420px] flex-1 flex-col items-center justify-center gap-4">
      <Image src={iconSrc} alt="" width={40} height={40} />
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-9 font-semibold leading-[1.4] text-label-base">{title}</p>
        <p className="text-6 font-medium leading-[1.6] text-label-body">{description}</p>
      </div>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="flex items-center justify-center rounded-lg border border-line-secondary bg-base-white px-3 py-2"
        >
          <span className="text-6 font-medium text-label-base">{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
