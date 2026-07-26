'use client';

import { useState } from 'react';
import Image from 'next/image';
import { DeadlineBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardThumbnailPlaceholder } from '@/components/ui/card-thumbnail-placeholder';
import { PinIcon, BriefcaseIcon, CalendarIcon } from '@/components/ui/icons';
import { ScrapBookmarkIcon } from '@/components/ui/scrap-bookmark-icon';
import { isDeadlinePassed } from '@/lib/utils/deadline';
import type { ScrapCardData } from '../types/scrap';

interface ScrapCardProps {
  data: ScrapCardData;
  onRemoveScrap: (jobPostingId: number) => void;
  onAddToKanban?: (jobPostingId: number) => void;
}

// Figma "스크랩 메인 페이지"(node 75:13324) Card 컴포넌트 반영. JobCard.tsx 최신 패턴 반영.
//
// ⚠️ [PRD 5.3 반영] "원본 공고가 마감/삭제된 경우 — 스크랩: 유지하되, 회색으로 처리되며
// '마감되었거나 삭제된 공고예요.' 표시". ScrapItem API 응답엔 isExpired 필드가 없어서
// deadline 값으로 클라이언트에서 직접 판정함 (getFeed.ts의 isDeadlinePassed와 동일 유틸 재사용).
export function ScrapCard({ data, onRemoveScrap, onAddToKanban }: ScrapCardProps) {
  const [imgError, setImgError] = useState(false);
  const showImage = !!data.thumbnailUrl && !imgError;
  const isExpired = isDeadlinePassed(data.deadline);

  return (
    <div
      className={`flex w-full items-center gap-6 rounded-xl p-3 transition-colors ${
        isExpired ? 'opacity-60 grayscale' : 'hover:bg-neutral-50'
      }`}
    >
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
          {isExpired ? (
            <p className="text-1 font-medium text-status-negative">
              마감되었거나 삭제된 공고예요.
            </p>
          ) : (
            data.jobCategoryLabel && (
              <p className="text-1 font-medium text-label-description">{data.jobCategoryLabel}</p>
            )
          )}
        </div>

        {/* Caption — JobCard.tsx와 동일하게 지역/경력/마감일 3줄 고정 표시 */}
        <div className="flex h-full w-[168px] shrink-0 flex-col justify-center gap-1">
          <div className="flex items-center gap-[6px]">
            <PinIcon />
            <span className="truncate text-3 font-medium leading-[1.6] text-label-description">
              {data.region || '-'}
            </span>
          </div>
          <div className="flex items-center gap-[6px]">
            <BriefcaseIcon />
            <span className="truncate text-3 font-medium leading-[1.6] text-label-description">
              {data.careerLabel || '-'}
            </span>
          </div>
          <div className="flex items-center gap-[6px]">
            <CalendarIcon />
            <span className="truncate text-3 font-medium leading-[1.6] text-label-description">
              {data.deadlineLabel}
            </span>
          </div>
        </div>

        {/* Buttons */}
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
