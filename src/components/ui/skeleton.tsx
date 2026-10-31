interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`animate-pulse rounded-md bg-fill-secondary ${className}`} />;
}

interface SkeletonLineProps {
  /** 실제 텍스트의 줄 높이 (예: "h-[21px]"). 막대는 이 안에서 세로 중앙에 놓인다. */
  lineClassName: string;
  /** 막대 너비 (예: "w-[22%]"). 닫힌 스케일이라 w-24 같은 값은 무시되므로 대괄호로 쓴다. */
  widthClassName: string;
}

// QA-025: 막대를 줄 높이만큼 채우면 빽빽해 보여서, 줄 높이는 실제 텍스트와 맞추되 막대만 얇게 그린다.
export function SkeletonLine({ lineClassName, widthClassName }: SkeletonLineProps) {
  return (
    <div className={`flex w-full items-center ${lineClassName}`}>
      <Skeleton className={`h-[60%] ${widthClassName}`} />
    </div>
  );
}
