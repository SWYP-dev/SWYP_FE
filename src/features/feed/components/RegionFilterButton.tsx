'use client';

import { useState } from 'react';
import { FilterTriggerButton } from '@/components/ui/filter-trigger-button';
import {
  SelectionModal,
  type SelectionGroup,
  type SelectionValue,
} from '@/components/ui/selection-modal';

// 프로젝트 '지역' 문서 기준 데이터. 서울 등 일부 그룹은 자치구, 세종/전국은 하위 지역 없음.

const REGION_GROUPS: SelectionGroup[] = [
  {
    id: 'nationwide',
    label: '전국',
    children: [],
  },
  {
    id: 'seoul',
    label: '서울',
    children: [
      { id: 'seoul-0', label: '강남구' },
      { id: 'seoul-1', label: '강동구' },
      { id: 'seoul-2', label: '강북구' },
      { id: 'seoul-3', label: '강서구' },
      { id: 'seoul-4', label: '관악구' },
      { id: 'seoul-5', label: '광진구' },
      { id: 'seoul-6', label: '구로구' },
      { id: 'seoul-7', label: '금천구' },
      { id: 'seoul-8', label: '노원구' },
      { id: 'seoul-9', label: '도봉구' },
      { id: 'seoul-10', label: '동대문구' },
      { id: 'seoul-11', label: '동작구' },
      { id: 'seoul-12', label: '마포구' },
      { id: 'seoul-13', label: '서대문구' },
      { id: 'seoul-14', label: '서초구' },
      { id: 'seoul-15', label: '성동구' },
      { id: 'seoul-16', label: '성북구' },
      { id: 'seoul-17', label: '송파구' },
      { id: 'seoul-18', label: '양천구' },
      { id: 'seoul-19', label: '영등포구' },
      { id: 'seoul-20', label: '용산구' },
      { id: 'seoul-21', label: '은평구' },
      { id: 'seoul-22', label: '종로구' },
      { id: 'seoul-23', label: '중구' },
      { id: 'seoul-24', label: '중랑구' },
    ],
  },
  {
    id: 'gyeonggi',
    label: '경기',
    children: [
      { id: 'gyeonggi-0', label: '가평군' },
      { id: 'gyeonggi-1', label: '고양시 덕양구' },
      { id: 'gyeonggi-2', label: '고양시 일산동구' },
      { id: 'gyeonggi-3', label: '고양시 일산서구' },
      { id: 'gyeonggi-4', label: '과천시' },
      { id: 'gyeonggi-5', label: '광명시' },
      { id: 'gyeonggi-6', label: '광주시' },
      { id: 'gyeonggi-7', label: '구리시' },
      { id: 'gyeonggi-8', label: '군포시' },
      { id: 'gyeonggi-9', label: '김포시' },
      { id: 'gyeonggi-10', label: '남양주시' },
      { id: 'gyeonggi-11', label: '동두천시' },
      { id: 'gyeonggi-12', label: '부천시' },
      { id: 'gyeonggi-13', label: '성남시 분당구' },
      { id: 'gyeonggi-14', label: '성남시 수정구' },
      { id: 'gyeonggi-15', label: '성남시 중원구' },
      { id: 'gyeonggi-16', label: '수원시 권선구' },
      { id: 'gyeonggi-17', label: '수원시 영통구' },
      { id: 'gyeonggi-18', label: '수원시 장안구' },
      { id: 'gyeonggi-19', label: '수원시 팔달구' },
      { id: 'gyeonggi-20', label: '시흥시' },
      { id: 'gyeonggi-21', label: '안산시 단원구' },
      { id: 'gyeonggi-22', label: '안산시 상록구' },
      { id: 'gyeonggi-23', label: '안성시' },
      { id: 'gyeonggi-24', label: '안양시 동안구' },
      { id: 'gyeonggi-25', label: '안양시 만안구' },
      { id: 'gyeonggi-26', label: '양주시' },
      { id: 'gyeonggi-27', label: '양평군' },
      { id: 'gyeonggi-28', label: '여주시' },
      { id: 'gyeonggi-29', label: '연천군' },
      { id: 'gyeonggi-30', label: '오산시' },
      { id: 'gyeonggi-31', label: '용인시 기흥구' },
      { id: 'gyeonggi-32', label: '용인시 수지구' },
      { id: 'gyeonggi-33', label: '용인시 처인구' },
      { id: 'gyeonggi-34', label: '의왕시' },
      { id: 'gyeonggi-35', label: '의정부시' },
      { id: 'gyeonggi-36', label: '이천시' },
      { id: 'gyeonggi-37', label: '파주시' },
      { id: 'gyeonggi-38', label: '평택시' },
      { id: 'gyeonggi-39', label: '포천시' },
      { id: 'gyeonggi-40', label: '하남시' },
      { id: 'gyeonggi-41', label: '화성시' },
    ],
  },
  {
    id: 'incheon',
    label: '인천',
    children: [
      { id: 'incheon-0', label: '강화군' },
      { id: 'incheon-1', label: '계양구' },
      { id: 'incheon-2', label: '미추홀구' },
      { id: 'incheon-3', label: '남동구' },
      { id: 'incheon-4', label: '동구' },
      { id: 'incheon-5', label: '부평구' },
      { id: 'incheon-6', label: '서구' },
      { id: 'incheon-7', label: '연수구' },
      { id: 'incheon-8', label: '옹진군' },
      { id: 'incheon-9', label: '중구' },
    ],
  },
  {
    id: 'daejeon',
    label: '대전',
    children: [
      { id: 'daejeon-0', label: '대덕구' },
      { id: 'daejeon-1', label: '동구' },
      { id: 'daejeon-2', label: '서구' },
      { id: 'daejeon-3', label: '유성구' },
      { id: 'daejeon-4', label: '중구' },
    ],
  },
  {
    id: 'sejong',
    label: '세종',
    children: [],
  },
  {
    id: 'chungnam',
    label: '충남',
    children: [
      { id: 'chungnam-0', label: '계룡시' },
      { id: 'chungnam-1', label: '공주시' },
      { id: 'chungnam-2', label: '금산군' },
      { id: 'chungnam-3', label: '논산시' },
      { id: 'chungnam-4', label: '당진시' },
      { id: 'chungnam-5', label: '보령시' },
      { id: 'chungnam-6', label: '부여군' },
      { id: 'chungnam-7', label: '서산시' },
      { id: 'chungnam-8', label: '서천군' },
      { id: 'chungnam-9', label: '아산시' },
      { id: 'chungnam-10', label: '예산군' },
      { id: 'chungnam-11', label: '천안시 동남구' },
      { id: 'chungnam-12', label: '천안시 서북구' },
      { id: 'chungnam-13', label: '청양군' },
      { id: 'chungnam-14', label: '태안군' },
      { id: 'chungnam-15', label: '홍성군' },
    ],
  },
  {
    id: 'chungbuk',
    label: '충북',
    children: [
      { id: 'chungbuk-0', label: '괴산군' },
      { id: 'chungbuk-1', label: '단양군' },
      { id: 'chungbuk-2', label: '보은군' },
      { id: 'chungbuk-3', label: '영동군' },
      { id: 'chungbuk-4', label: '옥천군' },
      { id: 'chungbuk-5', label: '음성군' },
      { id: 'chungbuk-6', label: '제천시' },
      { id: 'chungbuk-7', label: '증평군' },
      { id: 'chungbuk-8', label: '진천군' },
      { id: 'chungbuk-9', label: '청주시 상당구' },
      { id: 'chungbuk-10', label: '청주시 서원구' },
      { id: 'chungbuk-11', label: '청주시 청원구' },
      { id: 'chungbuk-12', label: '청주시 흥덕구' },
      { id: 'chungbuk-13', label: '충주시' },
    ],
  },
  {
    id: 'gwangju',
    label: '광주',
    children: [
      { id: 'gwangju-0', label: '광산구' },
      { id: 'gwangju-1', label: '남구' },
      { id: 'gwangju-2', label: '동구' },
      { id: 'gwangju-3', label: '북구' },
      { id: 'gwangju-4', label: '서구' },
    ],
  },
  {
    id: 'jeonnam',
    label: '전남',
    children: [
      { id: 'jeonnam-0', label: '강진군' },
      { id: 'jeonnam-1', label: '고흥군' },
      { id: 'jeonnam-2', label: '곡성군' },
      { id: 'jeonnam-3', label: '광양시' },
      { id: 'jeonnam-4', label: '구례군' },
      { id: 'jeonnam-5', label: '나주시' },
      { id: 'jeonnam-6', label: '담양군' },
      { id: 'jeonnam-7', label: '목포시' },
      { id: 'jeonnam-8', label: '무안군' },
      { id: 'jeonnam-9', label: '보성군' },
      { id: 'jeonnam-10', label: '순천시' },
      { id: 'jeonnam-11', label: '신안군' },
      { id: 'jeonnam-12', label: '여수시' },
      { id: 'jeonnam-13', label: '영광군' },
      { id: 'jeonnam-14', label: '영암군' },
      { id: 'jeonnam-15', label: '완도군' },
      { id: 'jeonnam-16', label: '장성군' },
      { id: 'jeonnam-17', label: '장흥군' },
      { id: 'jeonnam-18', label: '진도군' },
      { id: 'jeonnam-19', label: '함평군' },
      { id: 'jeonnam-20', label: '해남군' },
      { id: 'jeonnam-21', label: '화순군' },
    ],
  },
  {
    id: 'jeonbuk',
    label: '전북',
    children: [
      { id: 'jeonbuk-0', label: '고창군' },
      { id: 'jeonbuk-1', label: '군산시' },
      { id: 'jeonbuk-2', label: '김제시' },
      { id: 'jeonbuk-3', label: '남원시' },
      { id: 'jeonbuk-4', label: '무주군' },
      { id: 'jeonbuk-5', label: '부안군' },
      { id: 'jeonbuk-6', label: '순창군' },
      { id: 'jeonbuk-7', label: '완주군' },
      { id: 'jeonbuk-8', label: '익산시' },
      { id: 'jeonbuk-9', label: '임실군' },
      { id: 'jeonbuk-10', label: '장수군' },
      { id: 'jeonbuk-11', label: '전주시 덕진구' },
      { id: 'jeonbuk-12', label: '전주시 완산구' },
      { id: 'jeonbuk-13', label: '정읍시' },
      { id: 'jeonbuk-14', label: '진안군' },
    ],
  },
  {
    id: 'daegu',
    label: '대구',
    children: [
      { id: 'daegu-0', label: '군위군' },
      { id: 'daegu-1', label: '남구' },
      { id: 'daegu-2', label: '달서구' },
      { id: 'daegu-3', label: '달성군' },
      { id: 'daegu-4', label: '동구' },
      { id: 'daegu-5', label: '북구' },
      { id: 'daegu-6', label: '서구' },
      { id: 'daegu-7', label: '수성구' },
      { id: 'daegu-8', label: '중구' },
    ],
  },
  {
    id: 'gyeongbuk',
    label: '경북',
    children: [
      { id: 'gyeongbuk-0', label: '경산시' },
      { id: 'gyeongbuk-1', label: '경주시' },
      { id: 'gyeongbuk-2', label: '고령군' },
      { id: 'gyeongbuk-3', label: '구미시' },
      { id: 'gyeongbuk-4', label: '김천시' },
      { id: 'gyeongbuk-5', label: '문경시' },
      { id: 'gyeongbuk-6', label: '봉화군' },
      { id: 'gyeongbuk-7', label: '상주시' },
      { id: 'gyeongbuk-8', label: '성주군' },
      { id: 'gyeongbuk-9', label: '안동시' },
      { id: 'gyeongbuk-10', label: '영덕군' },
      { id: 'gyeongbuk-11', label: '영양군' },
      { id: 'gyeongbuk-12', label: '영주시' },
      { id: 'gyeongbuk-13', label: '영천시' },
      { id: 'gyeongbuk-14', label: '예천군' },
      { id: 'gyeongbuk-15', label: '울릉군' },
      { id: 'gyeongbuk-16', label: '울진군' },
      { id: 'gyeongbuk-17', label: '의성군' },
      { id: 'gyeongbuk-18', label: '청도군' },
      { id: 'gyeongbuk-19', label: '청송군' },
      { id: 'gyeongbuk-20', label: '칠곡군' },
      { id: 'gyeongbuk-21', label: '포항시 남구' },
      { id: 'gyeongbuk-22', label: '포항시 북구' },
    ],
  },
  {
    id: 'busan',
    label: '부산',
    children: [
      { id: 'busan-0', label: '강서구' },
      { id: 'busan-1', label: '금정구' },
      { id: 'busan-2', label: '기장군' },
      { id: 'busan-3', label: '남구' },
      { id: 'busan-4', label: '동구' },
      { id: 'busan-5', label: '동래구' },
      { id: 'busan-6', label: '부산진구' },
      { id: 'busan-7', label: '북구' },
      { id: 'busan-8', label: '사상구' },
      { id: 'busan-9', label: '사하구' },
      { id: 'busan-10', label: '서구' },
      { id: 'busan-11', label: '수영구' },
      { id: 'busan-12', label: '연제구' },
      { id: 'busan-13', label: '영도구' },
      { id: 'busan-14', label: '중구' },
      { id: 'busan-15', label: '해운대구' },
    ],
  },
  {
    id: 'ulsan',
    label: '울산',
    children: [
      { id: 'ulsan-0', label: '남구' },
      { id: 'ulsan-1', label: '동구' },
      { id: 'ulsan-2', label: '북구' },
      { id: 'ulsan-3', label: '울주군' },
      { id: 'ulsan-4', label: '중구' },
    ],
  },
  {
    id: 'gyeongnam',
    label: '경남',
    children: [
      { id: 'gyeongnam-0', label: '거제시' },
      { id: 'gyeongnam-1', label: '거창군' },
      { id: 'gyeongnam-2', label: '고성군' },
      { id: 'gyeongnam-3', label: '김해시' },
      { id: 'gyeongnam-4', label: '남해군' },
      { id: 'gyeongnam-5', label: '밀양시' },
      { id: 'gyeongnam-6', label: '사천시' },
      { id: 'gyeongnam-7', label: '산청군' },
      { id: 'gyeongnam-8', label: '양산시' },
      { id: 'gyeongnam-9', label: '의령군' },
      { id: 'gyeongnam-10', label: '진주시' },
      { id: 'gyeongnam-11', label: '창녕군' },
      { id: 'gyeongnam-12', label: '창원시 마산합포구' },
      { id: 'gyeongnam-13', label: '창원시 마산회원구' },
      { id: 'gyeongnam-14', label: '창원시 성산구' },
      { id: 'gyeongnam-15', label: '창원시 의창구' },
      { id: 'gyeongnam-16', label: '창원시 진해구' },
      { id: 'gyeongnam-17', label: '통영시' },
      { id: 'gyeongnam-18', label: '하동군' },
      { id: 'gyeongnam-19', label: '함안군' },
      { id: 'gyeongnam-20', label: '함양군' },
      { id: 'gyeongnam-21', label: '합천군' },
    ],
  },
  {
    id: 'gangwon',
    label: '강원',
    children: [
      { id: 'gangwon-0', label: '강릉시' },
      { id: 'gangwon-1', label: '고성군' },
      { id: 'gangwon-2', label: '동해시' },
      { id: 'gangwon-3', label: '삼척시' },
      { id: 'gangwon-4', label: '속초시' },
      { id: 'gangwon-5', label: '양구군' },
      { id: 'gangwon-6', label: '양양군' },
      { id: 'gangwon-7', label: '영월군' },
      { id: 'gangwon-8', label: '원주시' },
      { id: 'gangwon-9', label: '인제군' },
      { id: 'gangwon-10', label: '정선군' },
      { id: 'gangwon-11', label: '철원군' },
      { id: 'gangwon-12', label: '춘천시' },
      { id: 'gangwon-13', label: '태백시' },
      { id: 'gangwon-14', label: '평창군' },
      { id: 'gangwon-15', label: '홍천군' },
      { id: 'gangwon-16', label: '화천군' },
      { id: 'gangwon-17', label: '횡성군' },
    ],
  },
  {
    id: 'jeju',
    label: '제주',
    children: [
      { id: 'jeju-0', label: '서귀포시' },
      { id: 'jeju-1', label: '제주시' },
    ],
  },
  {
    id: 'overseas',
    label: '해외',
    children: [
      { id: 'overseas-0', label: '아시아/중동' },
      { id: 'overseas-1', label: '중국/홍콩' },
      { id: 'overseas-2', label: '일본' },
      { id: 'overseas-3', label: '미국' },
      { id: 'overseas-4', label: '북아메리카' },
      { id: 'overseas-5', label: '남아메리카' },
      { id: 'overseas-6', label: '유럽' },
      { id: 'overseas-7', label: '오세아니아' },
      { id: 'overseas-8', label: '아프리카' },
    ],
  },
];

interface RegionFilterButtonProps {
  value: SelectionValue | null;
  onApply: (value: SelectionValue | null) => void;
}

export function RegionFilterButton({ value, onApply }: RegionFilterButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const label =
    value === null
      ? '지역'
      : value.childIds.length === 0
        ? `지역 · ${REGION_GROUPS.find((g) => g.id === value.groupId)?.label ?? ''} 전체`
        : `지역 · ${value.childIds.length}개`;

  return (
    <>
      <FilterTriggerButton onClick={() => setIsOpen(true)} isActive={isOpen || value !== null}>
        {label}
      </FilterTriggerButton>

      <SelectionModal
        title="지역"
        groups={REGION_GROUPS}
        value={value}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onApply={(next) => {
          onApply(next);
          setIsOpen(false);
        }}
        emptyStateLines={['지역을 선택하면', '상세 지역을 볼 수 있어요']}
      />
    </>
  );
}

// 지역 선택 결과 → API `region` 쿼리 파라미터(콤마 구분) 변환.
// "전국" 선택 시 필터 없음. 그룹만 선택(하위 지역 미선택) 시 그룹 라벨(예: "서울") 그대로 전송.
export function buildRegionParam(value: SelectionValue | null): string | undefined {
  if (!value || value.groupId === 'nationwide') return undefined;

  const group = REGION_GROUPS.find((g) => g.id === value.groupId);
  if (!group) return undefined;

  if (value.childIds.length === 0) return group.label;

  const labels = value.childIds
    .map((childId) => group.children.find((c) => c.id === childId)?.label)
    .filter((l): l is string => !!l);

  return labels.length > 0 ? labels.join(',') : group.label;
}
