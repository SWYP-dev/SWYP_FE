'use client';

import { useState } from 'react';
import { FilterTriggerButton } from '@/components/ui/filter-trigger-button';
import {
  SelectionModal,
  type SelectionGroup,
  type SelectionValue,
} from '@/components/ui/selection-modal';

// 프로젝트 '직군 및 직무 정보' 문서 기준 데이터. 20개 직군, 각 직군별 세부 직무 목록.

const JOB_CATEGORY_GROUPS: SelectionGroup[] = [
  {
    id: 'planning',
    label: '기획/전략',
    children: [
      { id: 'planning-0', label: '게임기획' },
      { id: 'planning-1', label: '경영기획' },
      { id: 'planning-2', label: '광고기획' },
      { id: 'planning-3', label: '기술기획' },
      { id: 'planning-4', label: '문화기획' },
      { id: 'planning-5', label: '브랜드기획' },
      { id: 'planning-6', label: '사업기획' },
      { id: 'planning-7', label: '상품기획' },
      { id: 'planning-8', label: '서비스기획/PM/PO' },
      { id: 'planning-9', label: '앱기획' },
      { id: 'planning-10', label: '웹기획' },
    ],
  },
  {
    id: 'marketing',
    label: '마케팅/홍보/MD',
    children: [
      { id: 'marketing-0', label: '광고 PD' },
      { id: 'marketing-1', label: '광고마케팅' },
      { id: 'marketing-2', label: '글로벌마케팅' },
      { id: 'marketing-3', label: '기업홍보' },
      { id: 'marketing-4', label: '디지털마케팅' },
      { id: 'marketing-5', label: '마케팅' },
      { id: 'marketing-6', label: '마케팅전략' },
      { id: 'marketing-7', label: '브랜드마케팅' },
      { id: 'marketing-8', label: '오프라인MD' },
      { id: 'marketing-9', label: '온라인MD' },
      { id: 'marketing-10', label: '패션/뷰티 MD' },
      { id: 'marketing-11', label: '식품/제조MD' },
    ],
  },
  {
    id: 'finance',
    label: '회계/세무/재무',
    children: [
      { id: 'finance-0', label: '감사' },
      { id: 'finance-1', label: '경리' },
      { id: 'finance-2', label: '공인회계사' },
      { id: 'finance-3', label: '관세사' },
      { id: 'finance-4', label: '관세사무원' },
      { id: 'finance-5', label: '세무사' },
      { id: 'finance-6', label: '재무' },
      { id: 'finance-7', label: '행정사' },
      { id: 'finance-8', label: 'CFA' },
      { id: 'finance-9', label: 'CFO' },
      { id: 'finance-10', label: 'IR/공시' },
    ],
  },
  {
    id: 'hr',
    label: '인사/노무/HR',
    children: [
      { id: 'hr-0', label: '노무사' },
      { id: 'hr-1', label: '인사' },
      { id: 'hr-2', label: '직업상담사' },
      { id: 'hr-3', label: '채용담당자' },
      { id: 'hr-4', label: 'ER(노무관리)' },
      { id: 'hr-5', label: 'HRD' },
      { id: 'hr-6', label: 'HRM' },
      { id: 'hr-7', label: 'HR컨설팅' },
    ],
  },
  {
    id: 'admin',
    label: '총무/법무/사무',
    children: [
      { id: 'admin-0', label: '법률사무원' },
      { id: 'admin-1', label: '법무' },
      { id: 'admin-2', label: '법무사' },
      { id: 'admin-3', label: '변리사' },
      { id: 'admin-4', label: '변호사' },
      { id: 'admin-5', label: '비서' },
      { id: 'admin-6', label: '총무' },
      { id: 'admin-7', label: '컴플라이언스' },
      { id: 'admin-8', label: '특허명세사' },
    ],
  },
  {
    id: 'it',
    label: 'IT개발/데이터',
    children: [
      { id: 'it-0', label: '개발PM' },
      { id: 'it-1', label: '게임개발' },
      { id: 'it-2', label: '기술지원' },
      { id: 'it-3', label: '데이터분석가' },
      { id: 'it-4', label: '데이터엔지니어' },
      { id: 'it-5', label: '백엔드/서버개발' },
      { id: 'it-6', label: '보안관제' },
      { id: 'it-7', label: '보안컨설팅' },
      { id: 'it-8', label: '앱개발' },
      { id: 'it-9', label: '웹개발' },
      { id: 'it-10', label: '웹마스터' },
      { id: 'it-11', label: '유지보수' },
      { id: 'it-12', label: '정보보안' },
      { id: 'it-13', label: '퍼블리셔' },
    ],
  },
  {
    id: 'design',
    label: '디자인',
    children: [
      { id: 'design-0', label: '가구디자인' },
      { id: 'design-1', label: '건축디자인' },
      { id: 'design-2', label: '게임디자인' },
      { id: 'design-3', label: '환경디자인' },
      { id: 'design-4', label: '공간디자인' },
      { id: 'design-5', label: '공공디자인' },
      { id: 'design-6', label: '공예디자인' },
      { id: 'design-7', label: '광고디자인' },
      { id: 'design-8', label: '그래픽디자인' },
      { id: 'design-9', label: '디지털디자인' },
      { id: 'design-10', label: 'UI/UX디자인' },
      { id: 'design-11', label: '모바일디자인' },
      { id: 'design-12', label: '무대디자인' },
      { id: 'design-13', label: '시각디자인' },
      { id: 'design-14', label: '패션디자인' },
    ],
  },
  {
    id: 'sales',
    label: '영업/판매/무역',
    children: [
      { id: 'sales-0', label: '건설영업' },
      { id: 'sales-1', label: '관세사' },
      { id: 'sales-2', label: '관세사무원' },
      { id: 'sales-3', label: '광고영업' },
      { id: 'sales-4', label: '국제무역사' },
      { id: 'sales-5', label: '기술영업' },
      { id: 'sales-6', label: '네트워크영업' },
      { id: 'sales-7', label: '무역MR' },
      { id: 'sales-8', label: '무역경리' },
      { id: 'sales-9', label: '무역사무원' },
      { id: 'sales-10', label: '매장영업/판매' },
    ],
  },
  {
    id: 'cs',
    label: '고객상담/TM',
    children: [
      { id: 'cs-0', label: '상담원' },
      { id: 'cs-1', label: 'CS' },
      { id: 'cs-2', label: 'CX매니저' },
    ],
  },
  {
    id: 'logistics',
    label: '구매/자재/물류',
    children: [
      { id: 'logistics-0', label: '구매관리' },
      { id: 'logistics-1', label: '구매기획' },
      { id: 'logistics-2', label: '국제물류' },
      { id: 'logistics-3', label: '물류관리' },
      { id: 'logistics-4', label: '물류기획' },
      { id: 'logistics-5', label: '물류사무원' },
      { id: 'logistics-6', label: '유통관리' },
      { id: 'logistics-7', label: '자재관리' },
      { id: 'logistics-8', label: '재고관리' },
      { id: 'logistics-9', label: '품질관리' },
      { id: 'logistics-10', label: 'SCM' },
      { id: 'logistics-11', label: 'SRM' },
    ],
  },
  {
    id: 'driving',
    label: '운전/운송/배송',
    children: [
      { id: 'driving-0', label: '운전/배송기사' },
      { id: 'driving-1', label: '물류/화물운송' },
      { id: 'driving-2', label: '조종사' },
    ],
  },
  {
    id: 'service',
    label: '서비스',
    children: [
      { id: 'service-0', label: '가전제품설치' },
      { id: 'service-1', label: '경비원' },
      { id: 'service-2', label: '경호원' },
      { id: 'service-3', label: '관광가이드' },
      { id: 'service-4', label: '관광통역안내사' },
      { id: 'service-5', label: '네일리스트' },
      { id: 'service-6', label: '미용사' },
    ],
  },
  {
    id: 'production',
    label: '생산',
    children: [
      { id: 'production-0', label: '공장장' },
      { id: 'production-1', label: '공정관리' },
      { id: 'production-2', label: '공정설계' },
      { id: 'production-3', label: '공정엔지니어' },
      { id: 'production-4', label: '생산직종사자' },
      { id: 'production-5', label: '품질관리자' },
      { id: 'production-6', label: '용접사' },
    ],
  },
  {
    id: 'construction',
    label: '건설/건축',
    children: [
      { id: 'construction-0', label: '감리원' },
      { id: 'construction-1', label: '감정평가사' },
      { id: 'construction-2', label: '건물관리자' },
      { id: 'construction-3', label: '건축가' },
      { id: 'construction-4', label: '공무' },
      { id: 'construction-5', label: '공인중개사' },
      { id: 'construction-6', label: '기계기사' },
      { id: 'construction-7', label: '기술도해사' },
      { id: 'construction-8', label: '기전기사' },
    ],
  },
  {
    id: 'medical',
    label: '의료',
    children: [
      { id: 'medical-0', label: '의사/한의사' },
      { id: 'medical-1', label: '간호사' },
      { id: 'medical-2', label: '간호조무사' },
      { id: 'medical-3', label: '방사선사' },
      { id: 'medical-4', label: '수의사' },
      { id: 'medical-5', label: '수의테크니션' },
      { id: 'medical-6', label: '병원코디네이터' },
      { id: 'medical-7', label: '보건관리자' },
      { id: 'medical-8', label: '상담실장' },
      { id: 'medical-9', label: '약사/한약사' },
      { id: 'medical-10', label: '기타의료종사자' },
    ],
  },
  {
    id: 'rnd',
    label: '연구/R&D',
    children: [
      { id: 'rnd-0', label: '로봇엔지니어' },
      { id: 'rnd-1', label: '연구원' },
      { id: 'rnd-2', label: '인증심사원' },
      { id: 'rnd-3', label: '환경측정분석사' },
      { id: 'rnd-4', label: 'CRA(임상연구원)' },
      { id: 'rnd-5', label: 'CRC(임상시험코디네이터)' },
      { id: 'rnd-6', label: 'CRM(임상연구전문가)' },
      { id: 'rnd-7', label: 'R&D' },
    ],
  },
  {
    id: 'education',
    label: '교육',
    children: [
      { id: 'education-0', label: '전문강사' },
      { id: 'education-1', label: '교육운영' },
      { id: 'education-2', label: '교육컨설턴트' },
      { id: 'education-3', label: '교재개발/교수설계' },
      { id: 'education-4', label: '교직원' },
      { id: 'education-5', label: '대학강사' },
      { id: 'education-6', label: '돌봄교사' },
      { id: 'education-7', label: '방과후교사/방문교사' },
      { id: 'education-8', label: '보건강사' },
    ],
  },
  {
    id: 'media',
    label: '미디어/문화/스포츠',
    children: [
      { id: 'media-0', label: '기자' },
      { id: 'media-1', label: '방송BJ' },
      { id: 'media-2', label: '방송엔지니어' },
      { id: 'media-3', label: '사운드엔지니어' },
      { id: 'media-4', label: '성우' },
      { id: 'media-5', label: '쇼호스트' },
      { id: 'media-6', label: '스포츠에이전트' },
      { id: 'media-7', label: '아나운서' },
      { id: 'media-8', label: '에디터' },
      { id: 'media-9', label: '연예매니저' },
    ],
  },
  {
    id: 'financeInsurance',
    label: '금융/보험',
    children: [
      { id: 'financeInsurance-0', label: '금융사무' },
      { id: 'financeInsurance-1', label: '은행원/텔러' },
      { id: 'financeInsurance-2', label: '보험설계사' },
      { id: 'financeInsurance-3', label: '손해사정사' },
      { id: 'financeInsurance-4', label: '심사역' },
      { id: 'financeInsurance-5', label: '애널리스트' },
      { id: 'financeInsurance-6', label: '펀드매니저' },
    ],
  },
  {
    id: 'public',
    label: '공공/복지',
    children: [
      { id: 'public-0', label: '사회복지사' },
      { id: 'public-1', label: '요양보호사' },
      { id: 'public-2', label: '환경미화원' },
      { id: 'public-3', label: '사서' },
      { id: 'public-4', label: '자원봉사자' },
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
      ? '직군 • 직무'
      : value.childIds.length === 0
        ? `${JOB_CATEGORY_GROUPS.find((g) => g.id === value.groupId)?.label ?? ''} 전체`
        : `직군 • 직무 · ${value.childIds.length}개`;

  return (
    <>
      <FilterTriggerButton onClick={() => setIsOpen(true)} isActive={isOpen || value !== null}>
        {label}
      </FilterTriggerButton>

      <SelectionModal
        title="직군 • 직무"
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
