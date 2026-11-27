import type { SelectionValue } from '@/components/ui/selection-filter';
import type { AnalyticsEventMap, FilterPage } from '@/lib/analytics/events';
import type { FeedFilterType, Ga4EventMap } from '@/lib/analytics/ga4Events';
import { buildJobCategoryParam } from '../components/JobCategoryFilterButton';
import { buildRegionParam } from '../components/RegionFilterButton';
import { buildCareerParam, type CareerTagId } from '../components/CareerFilterChip';

export type FeedFilterState = {
  jobCategoryValue: SelectionValue | null;
  regionValue: SelectionValue | null;
  careerTags: CareerTagId[];
  deadlineSoon: boolean;
};

export function countActiveFilters(state: FeedFilterState): number {
  // 화면의 선택 표시 대신 실제 쿼리에 반영되는 필터 종류만 센다.
  return [
    buildJobCategoryParam(state.jobCategoryValue) !== undefined,
    buildRegionParam(state.regionValue) !== undefined,
    buildCareerParam(state.careerTags) !== undefined,
    state.deadlineSoon,
  ].filter(Boolean).length;
}

export function buildFilterAppliedProperties(
  page: FilterPage,
  filterType: AnalyticsEventMap['feed_filter_applied']['filter_type'],
  next: FeedFilterState
): AnalyticsEventMap['feed_filter_applied'] {
  const activeFilterCount = countActiveFilters(next);
  if (filterType === 'deadline_soon') {
    return {
      page,
      filter_type: filterType,
      filter_value: next.deadlineSoon,
      active_filter_count: activeFilterCount,
    };
  }
  // 직군·지역은 쿼리 값으로, 경력은 사용자가 선택한 태그 그대로 기록한다.
  const filterValues: Record<'job_category' | 'region' | 'career', string[]> = {
    job_category: buildJobCategoryParam(next.jobCategoryValue)?.split(',') ?? [],
    region: buildRegionParam(next.regionValue)?.split(',') ?? [],
    career: next.careerTags,
  };
  return {
    page,
    filter_type: filterType,
    filter_value: filterValues[filterType],
    active_filter_count: activeFilterCount,
  };
}

// GA4 값은 문자열만 쓴다. 조건이 없으면 'all'로 보내 "전체"와 "값 누락"을 구분한다.
function toGa4FilterValues(state: FeedFilterState): Record<FeedFilterType, string> {
  return {
    job_category: buildJobCategoryParam(state.jobCategoryValue) ?? 'all',
    region: buildRegionParam(state.regionValue) ?? 'all',
    // PostHog 이벤트와 같게 경력은 사용자가 선택한 태그 그대로 기록한다.
    career: state.careerTags.length > 0 ? state.careerTags.join(',') : 'all',
    deadline_soon: state.deadlineSoon ? 'on' : 'off',
  };
}

/** 필터 적용 후 결과가 갱신됐을 때 GA4로 보낼 feed_filter_applied 매개변수. */
export function buildGa4FilterAppliedParams(
  filterType: FeedFilterType,
  next: FeedFilterState,
  isSearching: boolean,
  totalElements: number
): Ga4EventMap['feed_filter_applied'] {
  const values = toGa4FilterValues(next);
  const base = {
    filter_type: filterType,
    filter_value: values[filterType],
    is_searching: isSearching ? ('true' as const) : ('false' as const),
  };
  if (totalElements > 0) {
    return {
      ...base,
      has_result: 'true',
      zero_result_job_category: undefined,
      zero_result_region: undefined,
      zero_result_career: undefined,
      zero_result_deadline_soon: undefined,
    };
  }
  return {
    ...base,
    has_result: 'false',
    zero_result_job_category: values.job_category,
    zero_result_region: values.region,
    zero_result_career: values.career,
    zero_result_deadline_soon: next.deadlineSoon ? 'on' : 'off',
  };
}
