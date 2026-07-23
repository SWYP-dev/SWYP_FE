'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { JobCard } from '@/components/ui/job-card';
import { Pagination } from '@/components/ui/pagination';
import { MAX_STEP } from '@/components/ui/slider';
import type { SelectionValue } from '@/components/ui/selection-modal';
import { CareerFilterChip } from '@/features/feed/components/CareerFilterChip';
import { RegionFilterButton } from '@/features/feed/components/RegionFilterButton';
import { JobCategoryFilterButton } from '@/features/feed/components/JobCategoryFilterButton';
import { DeadlineSoonFilterButton } from '@/features/feed/components/DeadlineSoonFilterButton';
import { useFeedQuery } from '@/features/feed/api/useFeedQuery';
import { postScrap, deleteScrap } from '@/features/feed/api/scrap';
import type { FeedQueryParams } from '@/types/api';

type SortOption = NonNullable<FeedQueryParams['sort']>;

const JOB_CATEGORY_LABELS: Record<string, string> = {
  사업관리: '사업관리',
  '경영.회계.사무': '경영·회계·사무',
  '금융.보험': '금융·보험',
  '교육.자연.사회과학': '교육·자연·사회과학',
  '법률.경찰.소방.교도.국방': '법률·경찰·소방·교도·국방',
  '보건.의료': '보건·의료',
  '사회복지.종교': '사회복지·종교',
  '문화.예술.디자인.방송': '문화·예술·디자인·방송',
  '운전.운송': '운전·운송',
  영업판매: '영업판매',
  '경비.청소': '경비·청소',
  '이용.숙박.여행.오락.스포츠': '이용·숙박·여행·오락·스포츠',
  음식서비스: '음식서비스',
  건설: '건설',
  기계: '기계',
  재료: '재료',
  '화학.바이오': '화학·바이오',
  '섬유.의복': '섬유·의복',
  '전기.전자': '전기·전자',
  정보통신: '정보통신',
  식품가공: '식품가공',
  '인쇄.목재.가구.공예': '인쇄·목재·가구·공예',
  '환경.에너지.안전': '환경·에너지·안전',
  농림어업: '농림어업',
};

function formatJobCategory(raw: string): string {
  const codes = raw.split(',').filter(Boolean);
  const labels = codes.map((code) => JOB_CATEGORY_LABELS[code] ?? code);
  if (labels.length <= 3) return labels.join(', ');
  return `${labels.slice(0, 3).join(', ')} 외 ${labels.length - 3}건`;
}

function formatCareer(raw: string): string {
  const codes = raw.split(',').filter(Boolean);
  if (codes.length >= 2) return '신입/경력 무관';
  return codes[0] === 'NEW' ? '신입' : '경력';
}

function formatDeadline(deadline: string): string {
  const date = new Date(deadline);
  return `~${date.getMonth() + 1}.${date.getDate()} (${'일월화수목금토'[date.getDay()]})`;
}

export default function FeedPage() {
  const [sort, setSort] = useState<SortOption>('LATEST');
  const [deadlineSoon, setDeadlineSoon] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  const [jobCategoryValue, setJobCategoryValue] = useState<SelectionValue | null>(null);
  const [regionValue, setRegionValue] = useState<SelectionValue | null>(null);
  const [careerRange, setCareerRange] = useState<[number, number]>([0, MAX_STEP]);

  // 스크랩 상태 로컬 오버라이드.
  // ⚠️ FeedItem 응답에 jobPostingId가 없어서, 이번 세션에서 직접 스크랩한 것만
  // jobPostingId를 기억해 해제가 가능함. 서버에서 이미 isScrapped:true로 온 공고는
  // jobPostingId를 모르기 때문에 해제 버튼이 동작하지 않음 (TODO: 백엔드에
  // FeedItem에도 jobPostingId 포함 요청 필요).
  const [scrapOverrides, setScrapOverrides] = useState<Record<number, boolean>>({});
  const [jobPostingIdMap, setJobPostingIdMap] = useState<Record<number, number>>({});

  const { data, isLoading, isError } = useFeedQuery({
    page: currentPage,
    size: 20,
    sort,
    deadlineSoon: deadlineSoon || undefined,
    keyword: keyword || undefined,
    jobCategory:
      jobCategoryValue && jobCategoryValue.childIds.length > 0
        ? jobCategoryValue.childIds.join(',')
        : undefined,
  });

  async function handleToggleScrap(feedId: number, currentlyScrapped: boolean) {
    // 낙관적 업데이트: 서버 응답 기다리지 않고 먼저 화면 반영
    setScrapOverrides((prev) => ({ ...prev, [feedId]: !currentlyScrapped }));

    try {
      if (!currentlyScrapped) {
        const res = await postScrap(feedId);
        setJobPostingIdMap((prev) => ({ ...prev, [feedId]: res.jobPostingId }));
      } else {
        const jobPostingId = jobPostingIdMap[feedId];
        if (!jobPostingId) {
          // 이번 세션에서 스크랩한 적 없는(=jobPostingId 모르는) 공고는 해제 불가.
          // TODO: 백엔드가 FeedItem에 jobPostingId 내려주면 이 분기 제거 가능.
          console.warn('jobPostingId를 몰라서 스크랩 해제 요청을 보낼 수 없습니다.', feedId);
          return;
        }
        await deleteScrap(jobPostingId);
      }
    } catch (err) {
      // 실패 시 롤백
      setScrapOverrides((prev) => ({ ...prev, [feedId]: currentlyScrapped }));
      console.error('스크랩 처리 실패', err);
    }
  }

  return (
    <div className="w-full h-screen relative bg-base-white overflow-hidden flex text-left text-label-base font-pretendard">
      <Sidebar />

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
                  data?.items.map((job) => {
                    const isScrapped = scrapOverrides[job.id] ?? job.isScrapped;
                    return (
                      <JobCard
                        key={job.id}
                        thumbnailUrl={job.thumbnailUrl ?? ''}
                        deadlineIso={job.deadline}
                        deadlineText={formatDeadline(job.deadline)}
                        company={job.companyName}
                        title={job.jobTitle}
                        jobCategory={formatJobCategory(job.jobCategory)}
                        region={job.region ?? ''}
                        career={formatCareer(job.career)}
                        originalUrl={job.originalUrl}
                        isScrapped={isScrapped}
                        onToggleScrap={() => handleToggleScrap(job.id, isScrapped)}
                      />
                    );
                  })}
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
}
