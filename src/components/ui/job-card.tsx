'use client';

import { useState } from 'react';
import Image from 'next/image';
import { DeadlineBadge } from './badge';
import { Button } from './button';
import { PinIcon, BriefcaseIcon, CalendarIcon } from './icons';

interface JobCardProps {
  thumbnailUrl: string;
  deadlineIso: string;
  deadlineText: string;
  company: string;
  title: string;
  jobCategory: string;
  region: string;
  career: string;
  originalUrl: string | null;
  isScrapped: boolean;
  onToggleScrap?: () => void;
  onAddToKanban?: () => void;
}

// 스크랩 아이콘(Figma 36:567 CardThumbnail > Wrapper > Icon, size 20x20).
// SVG 파일 업로드가 지원되지 않아 인라인으로 작성.
function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5.5 4C5.5 3.44772 5.94772 3 6.5 3H13.5C14.0523 3 14.5 3.44772 14.5 4V16.5L10 13.5L5.5 16.5V4Z"
        fill={filled ? 'white' : 'none'}
        stroke="white"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Figma Card 컴포넌트(node 36:567, type="list") 스펙 반영.
// 2026-07-23 디자인 변경점 반영: 플랫폼 뱃지 제거.
export function JobCard({
  thumbnailUrl,
  deadlineIso,
  deadlineText,
  company,
  title,
  jobCategory,
  region,
  career,
  originalUrl,
  isScrapped,
  onToggleScrap,
  onAddToKanban,
}: JobCardProps) {
  const [imgError, setImgError] = useState(false);
  const showImage = !!thumbnailUrl && !imgError;

  return (
    // Card: gap-[20px](spacing/6) — Thumbnail ~ 안쪽 Wrapper 사이 간격
    <div className="flex w-full items-center gap-6 rounded-xl p-3 hover:bg-neutral-100">
      {/* Thumbnail */}
      <div className="relative size-[100px] shrink-0 overflow-hidden rounded-lg bg-neutral-100 p-[6px]">
        {showImage ? (
          <Image
            src={thumbnailUrl}
            alt=""
            fill
            className="rounded-lg object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
            <Image
              src="/images/main-logo.png"
              alt=""
              width={48}
              height={48}
              className="object-contain opacity-40"
            />
          </div>
        )}
        {/* Wrapper: D-day 뱃지(좌) + 스크랩 아이콘(우), justify-between — Figma 스펙 그대로 */}
        <div className="relative flex h-[83px] w-full items-start justify-between">
          <DeadlineBadge deadline={deadlineIso} />
          <button
            type="button"
            aria-label={isScrapped ? '스크랩 해제' : '스크랩'}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleScrap?.();
            }}
            className="flex size-5 shrink-0 items-center justify-center"
          >
            <BookmarkIcon filled={isScrapped} />
          </button>
        </div>
      </div>

      {/* Wrapper: gap-[28px] — Content/Caption/Buttons 사이 간격 */}
      <div className="flex min-w-0 flex-1 items-center gap-[28px]">
        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
          <div className="flex flex-col gap-[2px]">
            <p className="text-3 font-medium text-label-body">{company}</p>
            <p className="truncate text-6 font-semibold text-label-base">{title}</p>
          </div>
          <p className="text-1 font-medium text-label-description">{jobCategory}</p>
        </div>

        {/* Caption: 고정 너비 — 텍스트 길이에 따른 정렬 흔들림 방지 */}
        <div className="flex h-full w-[168px] shrink-0 flex-col justify-center gap-1">
          <div className="flex items-center gap-[6px]">
            <PinIcon />
            <span className="truncate text-3 font-medium leading-[1.6] text-label-description">
              {region || '지역 정보 없음'}
            </span>
          </div>
          <div className="flex items-center gap-[6px]">
            <BriefcaseIcon />
            <span className="truncate text-3 font-medium leading-[1.6] text-label-description">
              {career}
            </span>
          </div>
          <div className="flex items-center gap-[6px]">
            <CalendarIcon />
            <span className="truncate text-3 font-medium leading-[1.6] text-label-description">
              {deadlineText}
            </span>
          </div>
        </div>

        {/* Buttons: 고정 너비 */}
        <div className="flex h-full w-[140px] shrink-0 flex-col justify-center gap-[10px]">
          {originalUrl ? (
            <a href={originalUrl} target="_blank" rel="noreferrer" className="block w-full">
              <Button variant="outline" size="sm" className="w-full">
                원본 공고로 이동
              </Button>
            </a>
          ) : (
            <Button variant="outline" size="sm" className="w-full" disabled>
              원본 링크 없음
            </Button>
          )}
          <Button variant="outline" size="sm" className="w-full" onClick={onAddToKanban}>
            내 지원 현황에 추가
          </Button>
        </div>
      </div>
    </div>
  );
}
