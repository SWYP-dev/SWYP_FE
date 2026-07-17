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

// Figma Card 컴포넌트(node 36:567, type="list") 스펙 반영.
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
    // Card: gap-[20px](spacing/6) — Thumbnail ~ 안쪽 Wrapper 사이 간격
    <div className="flex w-full items-center gap-6 rounded-xl p-3 hover:bg-neutral-100">
      {/* Thumbnail */}
      <div className="relative size-[100px] shrink-0 overflow-hidden rounded-lg">
        <Image src={thumbnailUrl} alt="" fill className="object-cover" />
        <div className="absolute left-[6px] top-[6px]">
          <DeadlineBadge deadline={deadlineIso} />
        </div>
        {/* TODO: 스크랩 아이콘 - 위치 미확정, 추후 추가 */}
      </div>

      {/* Wrapper: gap-[28px] — Content/Caption/Buttons 사이 간격 (28px는 닫힌 스케일 밖 값이라 arbitrary 표기) */}
      <div className="flex min-w-0 flex-1 items-center gap-[28px]">
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
            <span className="text-3 font-medium leading-[1.6] text-label-description">
              {region}
            </span>
          </div>
          <div className="flex items-center gap-[6px]">
            <BriefcaseIcon />
            <span className="text-3 font-medium leading-[1.6] text-label-description">
              {career}
            </span>
          </div>
          <div className="flex items-center gap-[6px]">
            <CalendarIcon />
            <span className="text-3 font-medium leading-[1.6] text-label-description">
              {deadlineText}
            </span>
          </div>
        </div>

        {/* Buttons: 원본 공고로 이동 버튼에 w-full — 아래(내 지원 현황에 추가) 버튼 너비에 맞춰 늘어남.
            NOTE: Button 컴포넌트가 className을 그대로 전달(forward)한다는 가정 하에 작성했습니다.
            만약 className이 병합 안 되면 Button 내부 구현 확인 필요. */}
        <div className="flex h-full flex-col justify-center gap-[10px]">
          <a href={originalUrl} target="_blank" rel="noreferrer" className="block w-full">
            <Button variant="outline" size="sm" className="w-full">
              원본 공고로 이동
            </Button>
          </a>
          <Button variant="outline" size="sm" onClick={onAddToKanban}>
            내 지원 현황에 추가
          </Button>
        </div>
      </div>
    </div>
  );
}
