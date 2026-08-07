'use client';

import { useState } from 'react';
import { FilterTriggerButton } from '@/components/ui/filter-trigger-button';
import {
  SelectionModal,
  getSelectionSummary,
  type SelectionGroup,
  type SelectionValue,
} from '@/components/ui/selection-modal';

// "직군 및 직무 도메인 정의.xlsx"(2026-08-08, 진영님 공유) 기준.
// B열(신규 직군) = 그룹, C열(신규 직무, 시트 내 숨김 컬럼) = 하위 직무.
// D열(매핑 키워드)은 백엔드가 공고 텍스트에서 직군을 자동 분류할 때만 쓰는
// 값이라 프론트에서는 사용하지 않음.
//
// ⚠️ jobCategory API는 "직군"(그룹) 레벨 값만 지원함 — 실제 배포 응답 확인
// (예: "jobCategory":"건설.건축,IT개발/데이터,제조.생산") 결과 직무 단위 값은
// 존재하지 않음. 그룹 id는 라벨의 "·"를 "."으로 치환한 코드로, 이 중
// 건설·건축→건설.건축 / IT개발/데이터 / 제조·생산→제조.생산 3개는 실제 응답으로
// 확인됨. 나머지는 동일 규칙 추정 — 세영님 확인 필요.
const JOB_CATEGORY_GROUPS: SelectionGroup[] = [
  {
    id: '기획.전략',
    label: '기획·전략',
    children: [
      '게임기획', '경영기획', '광고기획', '교육기획', '기술기획', '기획', '마케팅기획', '문화기획',
      '법인장', '브랜드기획', '사업기획', '상품기획', '서비스기획', '앱기획', '웹기획', '인사기획',
    ].map((label) => ({ id: label, label })),
  },
  {
    id: '회계.세무.재무',
    label: '회계·세무·재무',
    children: [
      '감사', '경리', '경리사무원', '공인회계사', '관세사', '관세사무원', '세무사', '재무', '전산회계',
      '행정사', '회계', '회계사', 'AICPA', 'CFA', 'CFO', 'IR/공시', 'KICPA',
    ].map((label) => ({ id: label, label })),
  },
  {
    id: '인사.노무.HR',
    label: '인사·노무·HR',
    children: [
      '노무사', '인사', '잡매니저', '직업상담사', '채용담당자', '헤드헌터', 'ER(노무관리)', 'HRD',
      'HRM', 'HR컨설팅',
    ].map((label) => ({ id: label, label })),
  },
  {
    id: '총무.법무.사무',
    label: '총무·법무·사무',
    children: [
      '법률사무원', '법무', '법무사', '변리사', '변호사', '비서', '사내변호사', '사무직', '서무',
      '송무비서', '수행기사', '수행비서', '임원비서', '총무', '컴플라이언스', '특허명세사',
    ].map((label) => ({ id: label, label })),
  },
  {
    id: '금융.보험',
    label: '금융·보험',
    children: [
      '금융사무', '은행원/텔러', '보험설계사', '손해사정사', '심사역', '애널리스트', '펀드매니저',
    ].map((label) => ({ id: label, label })),
  },
  {
    id: '교육',
    label: '교육',
    children: [
      '전문강사', '교육운영', '교육컨설턴트', '교재개발/교수설계', '교직원', '대학강사', '돌봄교사',
      '방과후교사/방문교사', '보건강사',
    ].map((label) => ({ id: label, label })),
  },
  {
    id: '보건.의료',
    label: '보건·의료',
    children: [
      '의사/한의사', '간호사', '간호조무사', '방사선사', '수의사', '수의테크니션', '병원코디네이터',
      '보건관리자', '상담실장', '약사/한약사', '기타의료종사자',
    ].map((label) => ({ id: label, label })),
  },
  {
    id: '공공.복지',
    label: '공공·복지',
    children: ['사회복지사', '요양보호사', '환경미화원', '사서', '자원봉사자'].map((label) => ({
      id: label,
      label,
    })),
  },
  {
    id: '미디어.문화.스포츠',
    label: '미디어·문화·스포츠',
    children: [
      '기자', '방송BJ', '방송엔지니어', '사운드엔지니어', '성우', '쇼호스트', '스포츠에이전트',
      '아나운서', '에디터', '연예매니저', 'PD·감독', '포토그래퍼', '영상편집자', '스태프',
      '출판·편집', '배급·제작자', '콘텐츠에디터', '크리에이터', '작가', '리포터·성우', 'MC', '모델',
      '연예인·매니저', '통번역사', '큐레이터', '음반기획', '스포츠강사', 'AI콘텐츠크리에이터',
    ].map((label) => ({ id: label, label })),
  },
  {
    id: '디자인',
    label: '디자인',
    children: [
      '가구디자인', '건축디자인', '게임디자인', '환경디자인', '공간디자인', '공공디자인', '공예디자인',
      '광고디자인', '그래픽디자인', '디지털디자인', 'UI/UX디자인', '모바일디자인', '무대디자인',
      '시각디자인', '패션디자인',
    ].map((label) => ({ id: label, label })),
  },
  {
    id: '운전.운송.배송',
    label: '운전·운송·배송',
    children: [
      '납품·배송기사', '배달기사', '수행·운전기사', '화물·중장비기사', '버스기사', '택시기사',
      '조종·기관사',
    ].map((label) => ({ id: label, label })),
  },
  {
    id: '영업.판매.무역',
    label: '영업·판매·무역',
    children: [
      '건설영업', '관세사', '관세사무원', '광고영업', '국제무역사', '기술영업', '네트워크영업',
      '무역MR', '무역경리', '무역사무원', '매장영업/판매', '공인중개사',
    ].map((label) => ({ id: label, label })),
  },
  {
    id: '고객상담.TM',
    label: '고객상담·TM',
    children: ['상담원', '섭외TM', '아웃바운드', '인바운드', '텔레마케터', 'CS', 'CX매니저'].map(
      (label) => ({ id: label, label })
    ),
  },
  {
    id: '서비스',
    label: '서비스',
    children: [
      '가사도우미', '가전제품설치', '검침원', '경비원', '경비지도사', '경호원', '관광가이드',
      '관광통역안내사', '나레이터', '네일리스트', '두피관리사', '라이더(배달원)', '룸메이드',
      '매장매니저', '매표/검표', '미용사',
    ].map((label) => ({ id: label, label })),
  },
  {
    id: '건설.건축',
    label: '건설·건축',
    children: [
      '감리원', '감정평가사', '건물관리자', '건축가', '공무', '기계기사', '기술도해사', '기전기사',
    ].map((label) => ({ id: label, label })),
  },
  {
    id: 'IT개발/데이터',
    label: 'IT개발/데이터',
    children: [
      '개발PM', '게임개발', '기술지원', '데이터분석가', '데이터엔지니어', '백엔드/서버개발', '보안관제',
      '보안컨설팅', '앱개발', '웹개발', '웹마스터', '유지보수', '정보보안', '퍼블리셔',
    ].map((label) => ({ id: label, label })),
  },
  { id: '환경.에너지.안전', label: '환경·에너지·안전', children: [] },
  { id: '농림어업', label: '농림어업', children: [] },
  {
    id: '연구.R&D',
    label: '연구·R&D',
    children: [
      '로봇엔지니어', '연구원', '인증심사원', '환경측정분석사', 'CRA(임상연구원)',
      'CRC(임상시험코디네이터)', 'CRM(임상연구전문가)', 'R&D',
    ].map((label) => ({ id: label, label })),
  },
  {
    id: '제조.생산',
    label: '제조·생산',
    children: [
      '계장설계', '공장장', '공정관리', '공정설계', '공정엔지니어', '구조해석/설계', '금형설계',
      '기계설계', '기계조작원', '기구설계', '기술설계', '기술엔지니어', '단순생산직',
    ].map((label) => ({ id: label, label })),
  },
  {
    id: '구매.자재.물류',
    label: '구매·자재·물류',
    children: [
      '구매관리', '구매기획', '국제물류', '물류관리', '물류기획', '물류사무원', '유통관리', '자재관리',
      '재고관리', '품질관리', 'SCM', 'SRM',
    ].map((label) => ({ id: label, label })),
  },
  {
    id: '마케팅.홍보.MD',
    label: '마케팅·홍보·MD',
    children: [
      '광고PD', '광고마케팅', '글로벌마케팅', '기업홍보', '디지털마케팅', '마케팅', '마케팅기획',
      '마케팅전략', '모바일마케팅', '미디어플래너', '바이럴마케팅', '브랜드마케팅',
    ].map((label) => ({ id: label, label })),
  },
];

interface JobCategoryFilterButtonProps {
  value: SelectionValue | null;
  onApply: (value: SelectionValue | null) => void;
}

export function JobCategoryFilterButton({ value, onApply }: JobCategoryFilterButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  // 그룹(직군)이 여러 개라 지역 필터와 동일하게 그룹명을 라벨에 포함.
  const summary = getSelectionSummary(value, JOB_CATEGORY_GROUPS);
  const label =
    summary === null
      ? '직군 · 직무'
      : summary.totalCount === 1
        ? summary.firstLabel
        : `${summary.firstLabel} 외 ${summary.totalCount - 1}개`;

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
// ⚠️ jobCategory API는 직군(그룹) 레벨만 지원 — 하위 직무를 체크해도 실제로는
// 부모 그룹의 코드만 전송함 (직무명을 그대로 보내면 서버에서 매칭되지 않음).
export function buildJobCategoryParam(value: SelectionValue | null): string | undefined {
  if (!value || value.length === 0) return undefined;

  const ids = value.map((gv) => gv.groupId);
  return ids.length > 0 ? ids.join(',') : undefined;
}
