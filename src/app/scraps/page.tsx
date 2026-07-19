'use client';

import { useState } from 'react';
import type { NextPage } from 'next';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Pagination } from '@/components/ui/pagination';
import { MAX_STEP } from '@/components/ui/slider';
import type { SelectionValue } from '@/components/ui/selection-modal';
import { CareerFilterChip } from '@/features/feed/components/CareerFilterChip';
import { RegionFilterButton } from '@/features/feed/components/RegionFilterButton';
import { JobCategoryFilterButton } from '@/features/feed/components/JobCategoryFilterButton';
import { DeadlineSoonFilterButton } from '@/features/feed/components/DeadlineSoonFilterButton';
import { ScrapCard } from '@/features/scraps/components/ScrapCard';
import { MOCK_SCRAPS } from '@/features/scraps/data/mockScraps';

const PAGE_SIZE = 20;

// Figma "스크랩 메인 페이지"(node 75:13324). sidebar의 '/scraps' 라우팅 대상.
const ScrapsPage: NextPage = () => {
  const [currentPage, setCurrentPage] = useState(0);

  // 요구사항 2: 필터/정렬 UI는 통합 공고 피드(src/app/page.tsx)와 동일하게 구현.
  // ⚠️ 보류: API 명세서 2.5(GET /api/v1/feed/scraps)는 page/size 파라미터만 지원하고
  // jobCategory/region/career/deadlineSoon/sort는 없음. 세영님·동섭님 확인 후 실제
  // 쿼리 파라미터 연동 예정. 그 전까지는 피드 페이지처럼 UI만 배치(필터링 미적용).
  const [careerRange, setCareerRange] = useState<[number, number]>([0, MAX_STEP]);
  const [regionValue, setRegionValue] = useState<SelectionValue | null>(null);
  const [jobCategoryValue, setJobCategoryValue] = useState<SelectionValue | null>(null);
  const [isDeadlineSoon, setIsDeadlineSoon] = useState(false);

  // 요구사항 5: 즉시 삭제(낙관적 업데이트)로 우선 구현. 삭제 전 확인 팝업 필요 여부는 보류.
  const [scraps, setScraps] = useState(MOCK_SCRAPS);

  function handleRemoveScrap(jobPostingId: number) {
    setScraps((prev) => prev.filter((item) => item.jobPostingId !== jobPostingId));
    // TODO: DELETE /api/v1/feed/scraps/{jobPostingId} 연동 (API 명세서 2.4). 실패 시 롤백 처리 필요.
  }

  function handleAddToKanban(jobPostingId: number) {
    void jobPostingId;
    // TODO: 칸반 등록 연동 (PRD 4.2.2 "내 지원 현황에 추가")
  }

  const totalPages = Math.max(1, Math.ceil(scraps.length / PAGE_SIZE));

  return (
    <div className="w-full h-screen relative bg-base-white overflow-hidden flex text-left text-label-base font-pretendard">
      <Sidebar
        userName="손진영"
        userEmail="sonjinyoung9849@gmail.com"
        avatarUrl="/images/avatar.png"
      />

      <main className="self-stretch flex-1 flex flex-col text-3 min-h-0 overflow-y-auto">
        <div className="sticky top-0 z-10 flex flex-col bg-base-white">
          <Header />

          <div className="flex items-center justify-between pt-7 px-12 pb-5 text-center">
            <div className="flex items-center gap-3">
              <JobCategoryFilterButton value={jobCategoryValue} onApply={setJobCategoryValue} />
              <RegionFilterButton value={regionValue} onApply={setRegionValue} />
              <CareerFilterChip appliedRange={careerRange} onApply={setCareerRange} />
              <DeadlineSoonFilterButton isActive={isDeadlineSoon} onToggle={setIsDeadlineSoon} />
            </div>
            {/* TODO: 정렬 클릭 인터랙션은 통합 공고 피드와 동일하게 아직 미구현 상태.
                피드 쪽에 클릭 핸들러가 붙으면 동일하게 반영 예정. */}
            <div className="flex items-start gap-2 text-label-body">
              <div className="font-semibold text-label-base">최신순</div>
              <div className="text-1">•</div>
              <div>마감일순</div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col px-11 py-5 bg-surface-card">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col items-center gap-3 p-3 bg-base-white border border-line-secondary rounded-[20px]">
              {scraps.map((scrap) => (
                <ScrapCard
                  key={scrap.jobPostingId}
                  data={scrap}
                  onRemoveScrap={handleRemoveScrap}
                  onAddToKanban={handleAddToKanban}
                />
              ))}
            </div>

            <div className="flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ScrapsPage;
