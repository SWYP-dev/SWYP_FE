'use client';

import { useState } from 'react';
import { FilterTriggerButton } from '@/components/ui/filter-trigger-button';
import {
  SelectionModal,
  getSelectionSummary,
  type SelectionGroup,
  type SelectionValue,
} from '@/components/ui/selection-modal';

// 세영님/동섭님 확인(2026-07-19) 기준 실제 jobCategory 값 24개.
const JOB_CATEGORY_GROUPS: SelectionGroup[] = [
  {
    id: 'all',
    label: '직군',
    children: [
      { id: '사업관리', label: '사업관리' },
      { id: '경영.회계.사무', label: '경영·회계·사무' },
      { id: '금융.보험', label: '금융·보험' },
      { id: '교육.자연.사회과학', label: '교육·자연·사회과학' },
      { id: '법률.경찰.소방.교도.국방', label: '법률·경찰·소방·교도·국방' },
      { id: '보건.의료', label: '보건·의료' },
      { id: '사회복지.종교', label: '사회복지·종교' },
      { id: '문화.예술.디자인.방송', label: '문화·예술·디자인·방송' },
      { id: '운전.운송', label: '운전·운송' },
      { id: '영업판매', label: '영업판매' },
      { id: '경비.청소', label: '경비·청소' },
      { id: '이용.숙박.여행.오락.스포츠', label: '이용·숙박·여행·오락·스포츠' },
      { id: '음식서비스', label: '음식서비스' },
      { id: '건설', label: '건설' },
      { id: '기계', label: '기계' },
      { id: '재료', label: '재료' },
      { id: '화학.바이오', label: '화학·바이오' },
      { id: '섬유.의복', label: '섬유·의복' },
      { id: '전기.전자', label: '전기·전자' },
      { id: '정보통신', label: '정보통신' },
      { id: '식품가공', label: '식품가공' },
      { id: '인쇄.목재.가구.공예', label: '인쇄·목재·가구·공예' },
      { id: '환경.에너지.안전', label: '환경·에너지·안전' },
      { id: '농림어업', label: '농림어업' },
    ],
  },
];

interface JobCategoryFilterButtonProps {
  value: SelectionValue | null;
  onApply: (value: SelectionValue | null) => void;
}

export function JobCategoryFilterButton({ value, onApply }: JobCategoryFilterButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  // includeGroupLabel: false — 그룹이 "직군" 하나뿐이라 프리픽스와 중복되므로 직무명만 표시
  const summary = getSelectionSummary(value, JOB_CATEGORY_GROUPS, false);
  const label =
    summary === null
      ? '직군 · 직무'
      : summary.totalCount === 1
        ? `직군 · 직무 · ${summary.firstLabel}`
        : `직군 · 직무 · ${summary.firstLabel} 외 ${summary.totalCount - 1}개`;

  return (
    <>
      <FilterTriggerButton onClick={() => setIsOpen(true)} isActive={isOpen || value !== null}>
        {label}
      </FilterTriggerButton>

      <SelectionModal
        title="직군 · 직무"
        groups={JOB_CATEGORY_GROUPS}
        value={value}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onApply={(next) => {
          onApply(next);
          setIsOpen(false);
        }}
        emptyStateLines={['직군을 선택하면', '직무를 볼 수 있어요']}
      />
    </>
  );
}

// 직군·직무 선택 결과 → API `jobCategory` 쿼리 파라미터(콤마 구분) 변환.
export function buildJobCategoryParam(value: SelectionValue | null): string | undefined {
  if (!value || value.length === 0) return undefined;

  const ids: string[] = [];
  value.forEach((gv) => ids.push(...gv.childIds));

  return ids.length > 0 ? ids.join(',') : undefined;
}
