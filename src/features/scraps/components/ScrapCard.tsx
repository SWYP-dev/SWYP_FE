'use client';

import { useState } from 'react';
import Image from 'next/image';
import { DeadlineBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardThumbnailPlaceholder } from '@/components/ui/card-thumbnail-placeholder';
import { CalendarIcon, ScrapBookmarkIcon } from '@/components/ui/icons';
import type { ScrapCardData } from '../types/scrap';

interface ScrapCardProps {
  data: ScrapCardData;
  onRemoveScrap: (jobPostingId: number) => void;
  onAddToKanban?: (jobPostingId: number) => void;
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
          <CardThumbnailPlaceholder />
        )}
        <div className="relative flex h-[83px] w-full items-start justify-between">
          <DeadlineBadge deadline={data.deadline} />
          <button
            type="button"
            onClick={() => onRemoveScrap(data.jobPostingId)}
            aria-label="스크랩 해제"
            className="flex size-5 shrink-0 items-center justify-center"
          >
            {/* 스크랩 탭은 전부 스크랩된 상태만 노출되므로 항상 fill 아이콘 사용 */}
            <ScrapBookmarkIcon filled />
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
