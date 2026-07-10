'use client';

import { useMemo, useState } from 'react';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { FeedFilterBar } from './components/FeedFilterBar';
import { PlatformTabs } from './components/PlatformTabs';
import { JobCard } from '@/components/ui/job-card';
import { Pagination } from '@/components/ui/pagination';
import { formatJobCategories } from './utils/formatJobCategories';
import type { JobPosting, PlatformFilter, SortOption } from './types/feed';
import type { SelectionValue } from '@/components/ui/selection-modal';
import { MAX_STEP } from '@/components/ui/slider';

// 요구사항 3: 실제로는 20개가 1세트.
const PAGE_SIZE = 20;

const PLATFORM_LABELS: Record<JobPosting['platform'], string> = {
  SARAMIN: '사람인',
  WANTED: '원티드',
  WORKNET: '워크넷',
  DIRECT: '직접등록',
};

function createMockJob(id: number): JobPosting {
  return {
    id,
    platform: 'SARAMIN',
    companyName: '와탭랩스',
    jobTitle: 'Java/Spring Boot 백엔드 개발자 채용',
    jobCategories: ['경영·비즈니스 기획', '웹 기획', '마케팅 기획', '브랜드기획', '사업기획'],
    career: 'EXPERIENCED',
    careerLabel: '경력 3-10년',
    region: '부산 부산진구',
    deadline: '2026-07-15',
    deadlineLabel: '~7.2 (수)',
    dDay: 'D-7',
    thumbnailUrl: '',
    originalUrl: '#',
    isScrapped: false,
    isExpired: false,
    createdAt: '2026-06-29T08:00:00',
  };
}

const MOCK_JOBS: JobPosting[] = Array.from({ length: PAGE_SIZE }, (_, i) => createMockJob(i + 1));

export default function FeedPage() {
  const [sort, setSort] = useState<SortOption>('LATEST');
  const [platform, setPlatform] = useState<PlatformFilter>('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [keyword, setKeyword] = useState('');

  const [jobCategoryValue, setJobCategoryValue] = useState<SelectionValue | null>(null);
  const [regionValue, setRegionValue] = useState<SelectionValue | null>(null);
  const [careerRange, setCareerRange] = useState<[number, number]>([0, MAX_STEP]);
  const [deadlineSoon, setDeadlineSoon] = useState(false);

  const totalPages = 5;

  const jobs = useMemo(
    () => MOCK_JOBS,
    [currentPage, platform, sort, deadlineSoon, jobCategoryValue, regionValue, careerRange, keyword]
  );

  return (
    <div className="flex h-full w-full">
      {/* userName/userEmail/avatarUrl: 실제 인증 연동 전까지 임시값 */}
      <Sidebar
        userName="손진영" // TODO: 실제 인증 연동 후 세션 값으로 교체
        userEmail="sonjinyoung9849@gmail.com" // TODO: 실제 인증 연동 후 세션 값으로 교체
        avatarUrl="/icons/default-avatar.png" // TODO: 실제 인증 연동 후 세션 값으로 교체
      />

      <div className="flex h-full flex-1 flex-col overflow-y-auto">
        {/* 요구사항 1: 검색바(Header) + 필터행(FeedFilterBar)을 하나의 블록으로 묶어 sticky */}
        <div className="sticky top-0 z-10 flex flex-col bg-base-white">
          <Header onSearch={setKeyword} />
          <FeedFilterBar
            sort={sort}
            onSortChange={setSort}
            jobCategoryValue={jobCategoryValue}
            onJobCategoryApply={setJobCategoryValue}
            regionValue={regionValue}
            onRegionApply={setRegionValue}
            careerRange={careerRange}
            onCareerApply={setCareerRange}
            deadlineSoon={deadlineSoon}
            onDeadlineSoonToggle={setDeadlineSoon}
          />
        </div>

        <div className="flex w-full flex-1 flex-col gap-16 bg-neutral-50 px-20 py-5">
          <div className="flex w-full flex-col items-start gap-6">
            <PlatformTabs value={platform} onChange={setPlatform} />

            <div className="flex w-full flex-col gap-8">
              <div className="flex w-full flex-col items-center gap-2 rounded-3xl border border-line-secondary bg-neutral-0 p-3">
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    thumbnailUrl={job.thumbnailUrl}
                    deadlineIso={job.deadline}
                    deadlineText={job.deadlineLabel}
                    company={job.companyName}
                    title={job.jobTitle}
                    jobCategory={formatJobCategories(job.jobCategories)}
                    platformLabel={PLATFORM_LABELS[job.platform]}
                    region={job.region}
                    career={job.careerLabel}
                    originalUrl={job.originalUrl}
                    onAddToKanban={() => {
                      // TODO: POST /api/v1/kanban/cards 연동
                    }}
                  />
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
