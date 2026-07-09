import type { NextPage } from 'next';
import Image from 'next/image';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { JobCard } from '@/components/ui/job-card';

/* ──────────────────────────────────────────────
   토큰 매핑 기준 (src/styles/tokens.css — Tailwind v4 @theme)
   - spacing: 1=2px 2=4px 3=8px 4=12px 5=16px 6=20px
              7=24px 8=32px 9=40px 10=48px 11=64px 12=80px
   - --spacing: initial 상태이므로 스케일 밖 값(7px, 18px, 35px 등)은
     반드시 arbitrary([Npx])로 표기
   - 타이포: text-N에 행간 내장 (leading-* 불필요)
   ────────────────────────────────────────────── */

const FILTERS = ['플랫폼', '직무', '지역', '경력'];

// TODO: API 연동 전 임시 데이터 (실제 API 연동 시 FeedItem 타입으로 교체)
const JOBS = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  company: '와탭랩스',
  title: 'Java/Spring Boot 백엔드 개발자 채용',
  jobCategory: '백엔드 개발자',
  platformLabel: '사람인',
  region: '부산 부산진구',
  career: '경력 3-10년',
  deadlineText: '~7.2 (수)',
  deadlineIso: '2026-07-08',
  originalUrl: 'https://example.com',
  thumbnail: '/images/job-thumbnail.png',
}));

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
  return (
    <div className="w-full min-h-[64rem] relative bg-base-white overflow-hidden flex items-start text-left text-label-base font-pretendard">
      <Sidebar
        userName="손진영"
        userEmail="sonjinyoung9849@gmail.com"
        avatarUrl="/images/avatar.png"
      />

      {/* ── Main ── */}
      <main className="self-stretch flex-1 flex flex-col text-3">
        {/* TODO: API 연동 시 onSearch를 실제 검색 로직으로 교체 */}
        <Header />

        {/* Filter & Sort */}
        <div className="flex items-center justify-between pt-11 px-11 pb-5 gap-6 text-center">
          <div className="flex items-center gap-3">
            {FILTERS.map((label) => (
              <FilterChip key={label} label={label} />
            ))}
            <FilterChip label="마감일 임박" hasDropdown={false} />
          </div>
          <div className="flex items-start gap-2 text-label-body">
            <div className="font-semibold text-label-base">최신순</div>
            <div className="text-1">•</div>
            <div>마감일순</div>
          </div>
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
              jobCategory={job.jobCategory}
              platformLabel={job.platformLabel}
              region={job.region}
              career={job.career}
              originalUrl={job.originalUrl}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Component1;
