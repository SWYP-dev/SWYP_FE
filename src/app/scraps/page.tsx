'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { NextPage } from 'next';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Pagination } from '@/components/ui/pagination';
import { Toast } from '@/components/ui/toast';
import type { SelectionValue } from '@/components/ui/selection-modal';
import { CareerFilterChip, type CareerTagId } from '@/features/feed/components/CareerFilterChip';
import { RegionFilterButton } from '@/features/feed/components/RegionFilterButton';
import { JobCategoryFilterButton } from '@/features/feed/components/JobCategoryFilterButton';
import { DeadlineSoonFilterButton } from '@/features/feed/components/DeadlineSoonFilterButton';
import { ScrapCard } from '@/features/scraps/components/ScrapCard';
import { useScrapsQuery } from '@/features/scraps/api/useScrapsQuery';
import { deleteScrap } from '@/features/feed/api/scrap';
import { registerKanbanCard } from '@/features/kanban/api/registerCard';
import { ApiClientError } from '@/lib/api/api-client';
import { formatDeadlineText } from '@/features/kanban/utils/formatDeadline';
import type { ScrapCardData } from '@/features/scraps/types/scrap';
import type { ScrapItem } from '@/types/api';

// ScrapItem(API 2.5 응답)에는 platform/jobCategory/region/career 필드가 아직 없음
// (features/scraps/types/scrap.ts 상단 주석 참고). 백엔드 확장 전까지는 빈 값으로
// 채워서 카드 레이아웃만 유지하고, 실제 값이 있는 필드(회사명/공고명/마감일 등)만 API 응답을 그대로 사용.
// TODO: API 2.5 응답에 필드가 추가되면 세영님 확인 후 실제 값으로 교체.
function toScrapCardData(item: ScrapItem): ScrapCardData {
  return {
    ...item,
    deadlineLabel: formatDeadlineText(item.deadline),
    platformLabel: '',
    jobCategoryLabel: '',
    region: '',
    careerLabel: '',
  };
}

// Figma "스크랩 메인 페이지"(node 75:13324). sidebar의 '/scraps' 라우팅 대상.
const ScrapsPage: NextPage = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);

  // ⚠️ 보류: API 명세서 2.5는 page/size만 지원. 아래 필터/정렬 UI는 통합 공고 피드와 동일하게
  // 배치만 해두고 파라미터에는 아직 연결하지 않음 (확장 여부 세영님·동섭님 확인 대기).
  const [careerTags, setCareerTags] = useState<CareerTagId[]>([]);
  const [regionValue, setRegionValue] = useState<SelectionValue | null>(null);
  const [jobCategoryValue, setJobCategoryValue] = useState<SelectionValue | null>(null);
  const [isDeadlineSoon, setIsDeadlineSoon] = useState(false);

  const { data, isLoading, isError, refetch } = useScrapsQuery({
    page: currentPage,
    size: 20,
  });

  // 스크랩 해제 낙관적 업데이트: "삭제된 id" 집합만 들고 있다가 필터링해서 렌더링
  const [removedIds, setRemovedIds] = useState<Set<number>>(new Set());

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  async function handleRemoveScrap(jobPostingId: number) {
    setRemovedIds((prev) => new Set(prev).add(jobPostingId));

    try {
      await deleteScrap(jobPostingId);
      refetch(); // 서버 기준 totalElements/totalPages 동기화
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
      setToastType('success');
      setToastMessage('지원 현황에 추가했어요.');
    } catch (err) {
      setToastType('error');
      if (err instanceof ApiClientError && err.code === 'ALREADY_REGISTERED') {
        setToastMessage('이미 지원 현황에 등록된 공고예요.');
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

        <div className="flex-1 flex flex-col px-11 py-5 bg-surface-card">
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
        hasButton={toastType === 'success' && toastMessage === '지원 현황에 추가했어요.'}
        actionLabel="지원 현황 이동"
        onAction={() => router.push('/kanban')}
      />
    </div>
  );
};

export default ScrapsPage;
