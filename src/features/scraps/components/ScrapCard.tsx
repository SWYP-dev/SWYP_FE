'use client';

import { useState } from 'react';
import Image from 'next/image';
import { DeadlineBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from '@/components/ui/icons';
import type { ScrapCardData } from '../types/scrap';

interface ScrapCardProps {
  data: ScrapCardData;
  onRemoveScrap: (jobPostingId: number) => void;
  onAddToKanban?: (jobPostingId: number) => void;
}

// 스크랩 해제 아이콘 — JobCard.tsx의 BookmarkIcon과 동일한 도형.
// ⚠️ JobCard는 흰색(fill/stroke white)인데, 썸네일이 항상 null이라 플레이스홀더(밝은 배경)
// 위에서 흰 아이콘이 안 보이는 문제가 있어서 여기서는 label-body 톤으로 조정함.
// JobCard도 같은 문제가 있을 수 있어서 필요하면 같이 확인해봐도 좋을 것 같아요.
function BookmarkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5.5 4C5.5 3.44772 5.94772 3 6.5 3H13.5C14.0523 3 14.5 3.44772 14.5 4V16.5L10 13.5L5.5 16.5V4Z"
        fill="#616164"
        stroke="#616164"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Figma "스크랩 메인 페이지"(node 75:13324) Card 컴포넌트 반영. JobCard.tsx 최신 패턴 반영.
//
// ⚠️ 보류: platform/jobCategory/region/career는 API 미지원으로 page.tsx에서 빈 문자열로
// 채워 넘어옴 (toScrapCardData 참고). 여기서는 값이 있을 때만 렌더링하도록 방어해서,
// 지금은 아예 안 보이고 나중에 필드 추가되면 자동으로 나타나게 처리.
export function ScrapCard({ data, onRemoveScrap, onAddToKanban }: ScrapCardProps) {
  const [imgError, setImgError] = useState(false);
  const showImage = !!data.thumbnailUrl && !imgError;

  return (
    <div className="flex w-full items-center gap-6 rounded-xl p-3 transition-colors hover:bg-neutral-50">
      {/* Thumbnail — thumbnailUrl 항상 null 확인됨 (공공데이터포털 소스 자체에 필드 없음) */}
      <div className="relative size-[100px] shrink-0 overflow-hidden rounded-lg bg-neutral-100 p-[6px]">
        {showImage ? (
          <Image
            src={data.thumbnailUrl}
            alt=""
            fill
            className="rounded-lg object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
            <Image
              src="/logo/chwihap-logo.svg"
              alt=""
              width={48}
              height={48}
              className="object-contain opacity-40"
            />
          </div>
        )}
        <div className="relative flex h-[83px] w-full items-start justify-between">
          <DeadlineBadge deadline={data.deadline} />
          <button
            type="button"
            onClick={() => onRemoveScrap(data.jobPostingId)}
            aria-label="스크랩 해제"
            className="flex size-5 shrink-0 items-center justify-center"
          >
            {/* 보류: 즉시 삭제로 우선 구현. 삭제 전 확인 팝업 필요 여부는 이세은님 확인 후 결정. */}
            <BookmarkIcon />
          </button>
        </div>
      </div>

      {/* Wrapper */}
      <div className="flex min-w-0 flex-1 items-center gap-[28px]">
        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-[2px]">
          <p className="text-3 font-medium text-label-body">{data.companyName}</p>
          <p className="truncate text-6 font-semibold text-label-base">{data.jobTitle}</p>
          {data.jobCategoryLabel && (
            <p className="text-1 font-medium text-label-description">{data.jobCategoryLabel}</p>
          )}
        </div>

        {/* Caption — region/career는 값 있을 때만, 마감일은 항상 표시 */}
        <div className="flex h-full w-[168px] shrink-0 flex-col justify-center gap-1">
          <div className="flex items-center gap-[6px]">
            <CalendarIcon />
            <span className="truncate text-3 font-medium leading-[1.6] text-label-description">
              {data.deadlineLabel}
            </span>
          </div>
        </div>

        {/* Buttons: 고정 너비 */}
        <div className="flex h-full w-[140px] shrink-0 flex-col justify-center gap-[10px]">
          {data.originalUrl ? (
            <a href={data.originalUrl} target="_blank" rel="noreferrer" className="block w-full">
              <Button variant="outline" size="sm" className="w-full">
                원본 공고 이동
              </Button>
            </a>
          ) : (
            <Button variant="outline" size="sm" className="w-full" disabled>
              원본 링크 없음
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onAddToKanban?.(data.jobPostingId)}
          >
            지원 현황 추가
          </Button>
        </div>
      </div>
    </div>
  );
}
