'use client';

import { useState } from 'react';
import type { NextPage } from 'next';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { JobCard } from '@/components/ui/job-card';
import { Pagination } from '@/components/ui/pagination';
import { MAX_STEP } from '@/components/ui/slider';
import type { SelectionValue } from '@/components/ui/selection-modal';
import { CareerFilterChip } from '@/features/feed/components/CareerFilterChip';
import { RegionFilterButton } from '@/features/feed/components/RegionFilterButton';
import { JobCategoryFilterButton } from '@/features/feed/components/JobCategoryFilterButton';
import { DeadlineSoonFilterButton } from '@/features/feed/components/DeadlineSoonFilterButton';
import { PlatformTabs } from '@/features/feed/components/PlatformTabs';
import type { PlatformFilter } from '@/features/feed/types/feed';
import { useFeedQuery } from '@/features/feed/api/useFeedQuery';
import type { FeedQueryParams } from '@/types/api';

type SortOption = NonNullable<FeedQueryParams['sort']>;

// 백엔드 JobCategory enum -> 화면 표시용 한글 라벨
// TODO: 8개 전부 맞는지 진영님 확인 필요 (임시 매핑)
const JOB_CATEGORY_LABELS: Record<string, string> = {
  BACKEND: '백엔드 개발자',
  FRONTEND: '프론트엔드 개발자',
  FULLSTACK: '풀스택 개발자',
  DESIGN: '디자이너',
  PM: 'PM',
  DATA: '데이터',
  DEVOPS: 'DevOps',
  OTHER: '기타',
};

const PLATFORM_LABELS: Record<string, string> = {
  SARAMIN: '사람인',
  WANTED: '원티드',
  WORKNET: '워크넷',
  DIRECT: '직접등록',
};

function formatDeadline(deadline: string): string {
  const date = new Date(deadline);
  return `~${date.getMonth() + 1}.${date.getDate()} (${'일월화수목금토'[date.getDay()]})`;
}

const Component1: NextPage = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [sort, setSort] = useState<SortOption>('LATEST');
  const [deadlineSoon, setDeadlineSoon] = useState(false);
  const [keyword, setKeyword] = useState('');

  // ⚠️ 아래 3개는 UI 상태만 들고 있고 아직 API 파라미터로 안 보냄
  // (백엔드/PM 확인 후 매핑 방식 정해지면 useFeedQuery params에 추가)
  const [careerRange, setCareerRange] = useState<[number, number]>([0, MAX_STEP]);
  const [regionValue, setRegionValue] = useState<SelectionValue | null>(null);
  const [jobCategoryValue, setJobCategoryValue] = useState<SelectionValue | null>(null);
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('ALL');

  const { data, isLoading, isError } = useFeedQuery({
    page: currentPage,
    size: 20,
    sort,
    deadlineSoon: deadlineSoon || undefined,
    keyword: keyword || undefined,
  });

  return (
    <div className="w-full h-screen relative bg-base-white overflow-hidden flex text-left text-label-base font-pretendard">
      <Sidebar
        userName="손진영"
        userEmail="sonjinyoung9849@gmail.com"
        avatarUrl="/images/avatar.png"
      />

      <main className="self-stretch flex-1 flex flex-col text-3 min-h-0 overflow-y-auto">
        <div className="sticky top-0 z-10 flex flex-col bg-base-white">
          <Header onSearch={setKeyword} />

          <div className="flex items-center justify-between pt-7 px-12 pb-5 text-center">
            <div className="flex items-center gap-3">
              <JobCategoryFilterButton value={jobCategoryValue} onApply={setJobCategoryValue} />
              <RegionFilterButton value={regionValue} onApply={setRegionValue} />
              <CareerFilterChip appliedRange={careerRange} onApply={setCareerRange} />
              <DeadlineSoonFilterButton isActive={deadlineSoon} onToggle={setDeadlineSoon} />
            </div>
            <div className="flex items-start gap-2 text-label-body">
              <button
                type="button"
                onClick={() => setSort('LATEST')}
                className={sort === 'LATEST' ? 'font-semibold text-label-base' : ''}
              >
                최신순
              </button>
              <div className="text-1">•</div>
              <button
                type="button"
                onClick={() => setSort('DEADLINE')}
                className={sort === 'DEADLINE' ? 'font-semibold text-label-base' : ''}
              >
                마감일순
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col px-11 py-5 bg-surface-card">
          <div className="flex flex-col gap-6">
            <PlatformTabs value={platformFilter} onChange={setPlatformFilter} />

            <div className="flex flex-col gap-8">
              <div className="flex flex-col items-center gap-3 p-3 bg-base-white border border-line-secondary rounded-[20px]">
                {isLoading && <p className="py-11 text-label-description">불러오는 중...</p>}
                {isError && (
                  <p className="py-11 text-status-negative">
                    공고를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
                  </p>
                )}
                {!isLoading &&
                  !isError &&
                  data?.items.map((job) => (
                    <JobCard
                      key={job.id}
                      thumbnailUrl={job.thumbnailUrl}
                      deadlineIso={job.deadline}
                      deadlineText={formatDeadline(job.deadline)}
                      company={job.companyName}
                      title={job.jobTitle}
                      jobCategory={JOB_CATEGORY_LABELS[job.jobCategory] ?? job.jobCategory}
                      platformLabel={PLATFORM_LABELS[job.platform] ?? job.platform}
                      region="" // TODO: region 필드가 API 응답에 없음. 백엔드 확인 필요
                      career={job.career === 'NEW' ? '신입' : '경력'}
                      originalUrl={job.originalUrl}
                    />
                  ))}
              </div>

              {data && (
                <div className="flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={data.totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Component1;
