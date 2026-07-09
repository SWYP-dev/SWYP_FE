import Image from 'next/image';
import { DeadlineBadge, Badge } from './badge';
import { Button } from './button';
import { PinIcon, BriefcaseIcon, CalendarIcon } from './icons';

interface JobCardProps {
  thumbnailUrl: string;
  deadlineIso: string;
  deadlineText: string;
  company: string;
  title: string;
  jobCategory: string;
  platformLabel: string;
  region: string;
  career: string;
  originalUrl: string;
  onAddToKanban?: () => void;
}

// Figma Card 컴포넌트(node 27:3610, type="list") 스펙 반영.
// 스크랩 아이콘은 위치 미확정으로 보류 (TODO).
export function JobCard({
  thumbnailUrl,
  deadlineIso,
  deadlineText,
  company,
  title,
  jobCategory,
  platformLabel,
  region,
  career,
  originalUrl,
  onAddToKanban,
}: JobCardProps) {
  return (
    <div className="flex w-full items-center gap-5 rounded-xl p-3 hover:bg-neutral-100">
      {/* Thumbnail */}
      <div className="relative size-[100px] shrink-0 overflow-hidden rounded-lg">
        <Image src={thumbnailUrl} alt="" fill className="object-cover" />
        <div className="absolute left-[6px] top-[6px]">
          <DeadlineBadge deadline={deadlineIso} />
        </div>
        {/* TODO: 스크랩 아이콘 - 위치 미확정, 추후 추가 */}
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
        <div className="flex flex-col gap-[2px]">
          <p className="text-3 font-medium text-label-body">{company}</p>
          <p className="truncate text-6 font-semibold text-label-base">{title}</p>
        </div>
        <p className="text-1 font-medium text-label-description">{jobCategory}</p>
        <Badge className="w-fit bg-neutral-200 text-label-body">{platformLabel}</Badge>
      </div>

      {/* Caption */}
      <div className="flex h-full flex-col justify-center gap-1">
        <div className="flex items-center gap-[6px]">
          <PinIcon />
          <span className="text-3 font-medium leading-[1.6] text-label-description">{region}</span>
        </div>
        <div className="flex items-center gap-[6px]">
          <BriefcaseIcon />
          <span className="text-3 font-medium leading-[1.6] text-label-description">{career}</span>
        </div>
        <div className="flex items-center gap-[6px]">
          <CalendarIcon />
          <span className="text-3 font-medium leading-[1.6] text-label-description">
            {deadlineText}
          </span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex h-full flex-col justify-center gap-[10px]">
        <a href={originalUrl} target="_blank" rel="noreferrer">
          <Button variant="outline" size="sm">
            원본 공고로 이동
          </Button>
        </a>
        <Button variant="outline" size="sm" onClick={onAddToKanban}>
          내 지원 현황에 추가
        </Button>
      </div>
    </div>
  );
}
