'use client';

import { JobCard } from '@/components/ui/job-card';
import { isDeadlinePassed } from '@/lib/utils/deadline';
import type { ScrapCardData } from '../types/scrap';

interface ScrapCardProps {
  data: ScrapCardData;
  onRemoveScrap: (jobPostingId: number) => void;
  onAddToKanban?: (jobPostingId: number) => void;
}

// ⚠️ [QA 반영] 통합 공고 탐색(JobCard)과 스크랩 카드가 서로 다른 마크업으로 복제되어
// 패딩/간격/폭 스펙이 계속 어긋나는 문제가 반복됨 — JobCard를 그대로 감싸 재사용해서
// 두 화면의 카드 스펙이 항상 동일하게 유지되도록 함(Figma node 133:23009 기준).
//
// ⚠️ [PRD 5.3 반영] "원본 공고가 마감/삭제된 경우 — 스크랩: 유지하되, 회색으로 처리되며
// '마감되었거나 삭제된 공고예요.' 표시". ScrapItem API 응답엔 isExpired 필드가 없어서
// deadline 값으로 클라이언트에서 직접 판정함 (getFeed.ts의 isDeadlinePassed와 동일 유틸 재사용).
export function ScrapCard({ data, onRemoveScrap, onAddToKanban }: ScrapCardProps) {
  const isExpired = isDeadlinePassed(data.deadline);

  return (
    <JobCard
      thumbnailUrl={data.thumbnailUrl ?? ''}
      deadlineIso={data.deadline}
      deadlineText={data.deadlineLabel}
      company={data.companyName}
      title={data.jobTitle}
      jobCategory={data.jobCategoryLabel}
      region={data.region ?? ''}
      career={data.careerLabel}
      originalUrl={data.originalUrl}
      isScrapped
      isExpired={isExpired}
      onToggleScrap={() => onRemoveScrap(data.jobPostingId)}
      onAddToKanban={() => onAddToKanban?.(data.jobPostingId)}
    />
  );
}
