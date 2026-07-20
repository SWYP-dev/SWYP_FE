'use client';

import { useState } from 'react';
import { FilterTriggerButton } from '@/components/ui/filter-trigger-button';
import {
  SelectionModal,
  type SelectionGroup,
  type SelectionValue,
} from '@/components/ui/selection-modal';

// 세영님/동섭님 확인(2026-07-19) 기준 실제 jobCategory 값 24개.
// API가 콤마 구분 다중값을 받으므로, 그룹 드릴다운 없이 하나의 그룹 안에
// 24개를 전부 체크박스로 넣는 구조로 처리함.
// TODO(디자인 확인): 왼쪽 그룹 패널에 "직군" 1개만 항상 선택된 채로 뜨는 게
// UX상 불필요해 보일 수 있음 — 그룹 패널 자체를 없애고 24개 체크박스만
// 바로 보여주는 방식으로 갈지 진영님과 논의 필요.
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

  const label =
    value === null
      ? '직군 · 직무'
      : value.childIds.length === 0
        ? '직군 · 직무'
        : `직군 · 직무 · ${value.childIds.length}개`;

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
