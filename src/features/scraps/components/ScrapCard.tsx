'use client';

import Image from 'next/image';
import { DeadlineBadge, Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PinIcon, BriefcaseIcon, CalendarIcon } from '@/components/ui/icons';
import type { ScrapCardData } from '../types/scrap';

interface ScrapCardProps {
  data: ScrapCardData;
  onRemoveScrap: (jobPostingId: number) => void;
  onAddToKanban?: (jobPostingId: number) => void;
}

// 스크랩 해제 아이콘. Figma(node 75:13328 등) 우측 상단 아이콘 — 스크랩 탭에서는 항상
// "스크랩됨" 상태이므로 채워진 형태로 표시. public/icons/bookmark.svg(아웃라인, 사이드바용)와는
// 별도 용도라 KanbanCard.tsx의 로컬 아이콘 패턴처럼 이 파일 안에만 둠.
function BookmarkFilledIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M9.57 2.9a.5.5 0 0 1 .86 0l1.77 4.26c.07.17.24.29.43.3l4.6.36c.42.03.59.55.27.82l-3.5 3.01a.5.5 0 0 0-.16.5l1.07 4.49a.5.5 0 0 1-.74.55l-3.94-2.4a.5.5 0 0 0-.52 0l-3.94 2.4a.5.5 0 0 1-.74-.55l1.07-4.49a.5.5 0 0 0-.16-.5l-3.5-3a.5.5 0 0 1 .28-.83l4.6-.36a.5.5 0 0 0 .43-.3L9.57 2.9Z"
        fill="#4864F1"
      />
    </svg>
  );
}

// Figma "스크랩 메인 페이지"(node 75:13324) Card 컴포넌트 스펙 반영.
// JobCard(통합 공고 피드 카드)와 레이아웃은 거의 동일하지만:
// - 우측 상단에 스크랩 해제(북마크) 아이콘 버튼이 있음 (항상 채워진 상태)
// - 버튼 라벨이 "원본 공고 이동" / "지원 현황 추가"로 약간 다름
// - hover 시 배경이 neutral/50(#f6f6f7)으로 바뀜
//   (진영님 확인: Figma 카드 중 회색 배경 1개는 데이터 상태가 아니라 hover 상태 예시였음)
//
// ⚠️ 보류: isKanbanRegistered가 true인 카드의 "지원 현황 추가" 버튼을
// "이미 등록된 공고입니다" 문구로 바꿀지 여부는 추후 진영님·이세은님 확인 후 반영.
// 지금은 상태와 무관하게 항상 "지원 현황 추가"로 고정 표시.
export function ScrapCard({ data, onRemoveScrap, onAddToKanban }: ScrapCardProps) {
  return (
    <div className="flex w-full items-center gap-6 rounded-xl p-3 transition-colors hover:bg-neutral-50">
      {/* Thumbnail */}
      <div className="relative size-[100px] shrink-0 overflow-hidden rounded-lg">
        <Image src={data.thumbnailUrl} alt="" fill className="object-cover" />
        <div className="absolute left-[6px] top-[6px]">
          <DeadlineBadge deadline={data.deadline} />
        </div>
        <button
          type="button"
          onClick={() => onRemoveScrap(data.jobPostingId)}
          aria-label="스크랩 해제"
          className="absolute right-[6px] top-[6px] flex size-5 items-center justify-center"
        >
          {/* 보류: 즉시 삭제로 우선 구현. 삭제 전 확인 팝업 필요 여부는 이세은님 확인 후 결정 예정. */}
          <BookmarkFilledIcon />
        </button>
      </div>

      {/* Wrapper */}
      <div className="flex min-w-0 flex-1 items-center gap-[28px]">
        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
          <div className="flex flex-col gap-[2px]">
            <p className="text-3 font-medium text-label-body">{data.companyName}</p>
            <p className="truncate text-6 font-semibold text-label-base">{data.jobTitle}</p>
          </div>
          {/* TODO: API 명세서 2.5 ScrapItem에는 jobCategory 필드가 없음 (세영님 확인 대기).
              확인 전까지 mock 데이터 기준으로 표시. */}
          <p className="text-1 font-medium text-label-description">{data.jobCategoryLabel}</p>
          <Badge className="w-fit bg-neutral-200 text-label-body">{data.platformLabel}</Badge>
        </div>

        {/* Caption */}
        <div className="flex h-full flex-col justify-center gap-1">
          <div className="flex items-center gap-[6px]">
            <PinIcon />
            <span className="text-3 font-medium leading-[1.6] text-label-description">
              {data.region}
            </span>
          </div>
          <div className="flex items-center gap-[6px]">
            <BriefcaseIcon />
            <span className="text-3 font-medium leading-[1.6] text-label-description">
              {data.careerLabel}
            </span>
          </div>
          <div className="flex items-center gap-[6px]">
            <CalendarIcon />
            <span className="text-3 font-medium leading-[1.6] text-label-description">
              {data.deadlineLabel}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex h-full items-center">
          <div className="flex h-full flex-col justify-center gap-[10px]">
            <a href={data.originalUrl} target="_blank" rel="noreferrer" className="block w-full">
              <Button variant="outline" size="sm" className="w-full">
                원본 공고 이동
              </Button>
            </a>
            <Button variant="outline" size="sm" onClick={() => onAddToKanban?.(data.jobPostingId)}>
              지원 현황 추가
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
