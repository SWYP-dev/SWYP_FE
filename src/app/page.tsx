'use client';

import { useState } from 'react';
import type { NextPage } from 'next';
import Image from 'next/image';
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
import { formatJobCategories } from '@/features/feed/utils/formatJobCategories';
import type { PlatformFilter } from '@/features/feed/types/feed';

/* ──────────────────────────────────────────────
   토큰 매핑 기준 (src/styles/tokens.css — Tailwind v4 @theme)
   - spacing: 1=2px 2=4px 3=8px 4=12px 5=16px 6=20px
              7=24px 8=32px 9=40px 10=48px 11=64px 12=80px
   - --spacing: initial 상태이므로 스케일 밖 값(7px, 18px, 35px 등)은
     반드시 arbitrary([Npx])로 표기
   - 타이포: text-N에 행간 내장 (leading-* 불필요)
   ────────────────────────────────────────────── */

// 요구사항 3: 실제로는 20개(PAGE_SIZE)가 1세트.
const PAGE_SIZE = 20;

// 요구사항 2: 직무가 여러 개인 경우 대비. TODO: API 연동 전 임시 데이터.
const JOBS = Array.from({ length: PAGE_SIZE }, (_, i) => ({
  id: i,
  company: '와탭랩스',
  title: 'Java/Spring Boot 백엔드 개발자 채용',
  jobCategories: ['경영·비즈니스 기획', '웹 기획', '마케팅 기획', '브랜드기획', '사업기획'],
  platformLabel: '사람인',
  region: '부산 부산진구',
  career: '경력 3-10년',
  deadlineText: '~7.2 (수)',
  deadlineIso: '2026-07-08',
  originalUrl: 'https://example.com',
  thumbnail: '/images/job-thumbnail.png',
}));

// "플랫폼" 필터 — PM 정책 확정 대기 중(플랫폼 뱃지·필터 자체가 없어질 수도 있음).
// 확정 전까지 손대지 않고 그대로 둠.
const FilterChip = ({ label, hasDropdown = true }: { label: string; hasDropdown?: boolean }) => (
  <div
    className={`rounded-lg bg-base-white inset-ring inset-ring-line-secondary flex items-center justify-center py-3 ${
      hasDropdown ? 'pl-4 pr-[7px]' : 'px-4'
    }`}
  >
    <div className="flex items-center justify-center gap-1 min-h-5">
      <div className="font-medium">{label}</div>
      {hasDropdown && (
        <Image src="/icons/chevron-down.svg" alt="" width={16} height={16} className="shrink-0" />
      )}
    </div>
  </div>
);

const Component1: NextPage = () => {
  const [currentPage, setCurrentPage] = useState(0);

  const [careerRange, setCareerRange] = useState<[number, number]>([0, MAX_STEP]);
  const [regionValue, setRegionValue] = useState<SelectionValue | null>(null);
  const [jobCategoryValue, setJobCategoryValue] = useState<SelectionValue | null>(null);
  const [isDeadlineSoon, setIsDeadlineSoon] = useState(false);

  // 요구사항 4: 진영님 코멘트 - 사람인/원티드는 정책 확정 전까지 UI만 배치, disabled.
  // (PlatformTabs 내부에서 처리, 여기서는 값만 들고 있음)
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('ALL');

  return (
    <div className="w-full min-h-[64rem] relative bg-base-white overflow-hidden flex items-start text-left text-label-base font-pretendard">
      <Sidebar
        userName="손진영"
        userEmail="sonjinyoung9849@gmail.com"
        avatarUrl="/images/avatar.png"
      />

      {/* ── Main ── */}
      <main className="self-stretch flex-1 flex flex-col text-3 overflow-y-auto">
        {/* 요구사항 1: 검색바(Header) + 필터/정렬 행을 하나의 블록으로 묶어 sticky 처리 */}
        <div className="sticky top-0 z-10 flex flex-col bg-base-white">
          <Header />

          <div className="flex items-center justify-between pt-11 px-11 pb-5 gap-6 text-center">
            <div className="flex items-center gap-3">
              {/* 플랫폼 필터: PM 정책 확정 대기 중, 손대지 않음 */}
              <FilterChip label="플랫폼" />
              <JobCategoryFilterButton value={jobCategoryValue} onApply={setJobCategoryValue} />
              <RegionFilterButton value={regionValue} onApply={setRegionValue} />
              <CareerFilterChip appliedRange={careerRange} onApply={setCareerRange} />
              <DeadlineSoonFilterButton isActive={isDeadlineSoon} onToggle={setIsDeadlineSoon} />
            </div>
            <div className="flex items-start gap-2 text-label-body">
              <div className="font-semibold text-label-base">최신순</div>
              <div className="text-1">•</div>
              <div>마감일순</div>
            </div>
          </div>
        </div>

        {/* Platform Tabs (전체/사람인/원티드) — Figma ButtonWrapper 스펙.
            사람인/원티드는 정책 확정 전까지 disabled */}
        <div className="px-11 pt-5">
          <PlatformTabs value={platformFilter} onChange={setPlatformFilter} />
        </div>

        {/* Job List */}
        <div className="flex-1 flex flex-col gap-2 py-7 px-11 bg-surface-card">
          {JOBS.map((job) => (
            <JobCard
              key={job.id}
              thumbnailUrl={job.thumbnail}
              deadlineIso={job.deadlineIso}
              deadlineText={job.deadlineText}
              company={job.company}
              title={job.title}
              jobCategory={formatJobCategories(job.jobCategories)}
              platformLabel={job.platformLabel}
              region={job.region}
              career={job.career}
              originalUrl={job.originalUrl}
            />
          ))}
        </div>

        {/* Pagination — totalPages는 API 연동 시 실제 값으로 교체 */}
        <div className="flex justify-center py-11">
          <Pagination currentPage={currentPage} totalPages={5} onPageChange={setCurrentPage} />
        </div>
      </main>
    </div>
  );
};

export default Component1;
