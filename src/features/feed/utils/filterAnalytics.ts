import type { SelectionValue } from '@/components/ui/selection-filter';
import type { AnalyticsEventMap, FilterPage } from '@/lib/analytics/events';
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
