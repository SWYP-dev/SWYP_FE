'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import type { NextPage } from 'next';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Pagination } from '@/components/ui/pagination';
import { Toast } from '@/components/ui/toast';
import type { SelectionValue } from '@/components/ui/selection-modal';
import {
  JobCategoryFilterButton,
  buildJobCategoryParam,
} from '@/features/feed/components/JobCategoryFilterButton';
import { RegionFilterButton, buildRegionParam } from '@/features/feed/components/RegionFilterButton';
import {
  CareerFilterChip,
  buildCareerParam,
  type CareerTagId,
} from '@/features/feed/components/CareerFilterChip';
import { DeadlineSoonFilterButton } from '@/features/feed/components/DeadlineSoonFilterButton';
import { ScrapCard } from '@/features/scraps/components/ScrapCard';
import { useScrapsQuery } from '@/features/scraps/api/useScrapsQuery';
import { deleteScrap } from '@/features/feed/api/scrap';
import { registerKanbanCard } from '@/features/kanban/api/registerCard';
import { kanbanKeys } from '@/features/kanban/api/useKanbanQuery';
import { ApiClientError } from '@/lib/api/api-client';
import { formatDeadlineText } from '@/features/kanban/utils/formatDeadline';
import { formatCareer } from '@/features/feed/utils/formatCareer';
import type { ScrapCardData } from '@/features/scraps/types/scrap';
import type { ScrapItem } from '@/types/api';

function toScrapCardData(item: ScrapItem): ScrapCardData {
  return {
    ...item,
    deadlineLabel: formatDeadlineText(item.deadline),
    platformLabel: item.platform ?? '',
    jobCategoryLabel: item.jobCategory ?? '',
    region: item.region ?? '-',
    careerLabel: formatCareer(item.career),
  };
}

// Figma "스크랩 메인 페이지"(node 75:13324). sidebar의 '/scraps' 라우팅 대상.
const ScrapsPage: NextPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(0);

  // ⚠️ [백엔드 반영 완료] API 명세서 2.5에 필터 파라미터가 추가돼서, 통합 공고 피드와
  // 동일한 헬퍼(buildJobCategoryParam 등)로 실제 쿼리에 연결함.
  const [careerTags, setCareerTags] = useState<CareerTagId[]>([]);
  const [regionValue, setRegionValue] = useState<SelectionValue | null>(null);
  const [jobCategoryValue, setJobCategoryValue] = useState<SelectionValue | null>(null);
  const [isDeadlineSoon, setIsDeadlineSoon] = useState(false);

  const { data, isLoading, isError, refetch } = useScrapsQuery({
    page: currentPage,
    size: 20,
    jobCategory: buildJobCategoryParam(jobCategoryValue),
    region: buildRegionParam(regionValue),
    career: buildCareerParam(careerTags),
    deadlineSoon: isDeadlineSoon || undefined,
  });

  // 스크랩 해제 낙관적 업데이트: "삭제된 id" 집합만 들고 있다가 필터링해서 렌더링
  const [removedIds, setRemovedIds] = useState<Set<number>>(new Set());

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  async function handleRemoveScrap(jobPostingId: number) {
    setRemovedIds((prev) => new Set(prev).add(jobPostingId));

    try {
      await deleteScrap(jobPostingId);
      refetch();
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    } catch (err) {
      setRemovedIds((prev) => {
        const next = new Set(prev);
        next.delete(jobPostingId);
        return next;
      });
      console.error('스크랩 해제 실패', err);
      setToastType('error');
      setToastMessage('스크랩 해제에 실패했어요.');
    }
  }

  // 3.2 칸반 카드 등록 (jobPostingId 기준 — registerCard.ts 주석 참고)
  async function handleAddToKanban(jobPostingId: number) {
    try {
      await registerKanbanCard(jobPostingId);
      queryClient.invalidateQueries({ queryKey: kanbanKeys.board() });
      setToastType('success');
      setToastMessage('지원 현황에 추가되었어요.');
    } catch (err) {
      setToastType('error');
      if (
        err instanceof ApiClientError &&
        (err.code === 'K003' || err.code === 'DUPLICATE_KANBAN_CARD')
      ) {
        setToastMessage('이미 등록된 공고예요.');
      } else {
        console.error('칸반 등록 실패', err);
        setToastMessage('지원 현황 추가에 실패했어요.');
      }
    }
  }

  const scraps: ScrapCardData[] = (data?.items ?? [])
    .filter((item) => !removedIds.has(item.jobPostingId))
    .map(toScrapCardData);

  return (
    <div className="w-full h-screen relative bg-base-white overflow-hidden flex text-left text-label-base font-pretendard">
      <Sidebar />

      <main className="self-stretch flex-1 flex flex-col text-3 min-h-0 overflow-y-auto">
        <div className="sticky top-0 z-10 flex flex-col bg-base-white">
          <Header showSearch={false} />

          <div className="flex items-center justify-between pt-7 px-12 pb-5 text-center">
            <div className="flex items-center gap-3">
              <JobCategoryFilterButton value={jobCategoryValue} onApply={setJobCategoryValue} />
              <RegionFilterButton value={regionValue} onApply={setRegionValue} />
              <CareerFilterChip appliedTags={careerTags} onApply={setCareerTags} />
              <DeadlineSoonFilterButton isActive={isDeadlineSoon} onToggle={setIsDeadlineSoon} />
            </div>
            <div className="flex items-start gap-2 text-label-body">
              <div className="font-semibold text-label-base">최신순</div>
              <div className="text-1">•</div>
              <div>마감일순</div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col px-12 py-7 bg-surface-card">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col items-center gap-3 p-3 bg-base-white border border-line-secondary rounded-[20px]">
              {isLoading && <p className="py-10 text-label-description">불러오는 중...</p>}
              {isError && (
                <p className="py-10 text-status-negative">스크랩 목록을 불러오지 못했어요.</p>
              )}
              {!isLoading && !isError && scraps.length === 0 && (
                <p className="py-10 text-label-description">스크랩한 공고가 없어요.</p>
              )}
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
                totalPages={data?.totalPages ?? 1}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </div>
      </main>

      <Toast
        message={toastMessage ?? ''}
        isVisible={toastMessage !== null}
        onDismiss={() => setToastMessage(null)}
        type={toastType}
        hasButton={toastType === 'success' && toastMessage === '지원 현황에 추가되었어요.'}
        actionLabel="지원 현황 이동"
        onAction={() => router.push('/kanban')}
      />
    </div>
  );
};

export default ScrapsPage;
