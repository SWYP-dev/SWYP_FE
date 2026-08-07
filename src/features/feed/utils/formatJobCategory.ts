// 통합 공고 탐색(피드)·스크랩 페이지 공통 직무 분류 표시 로직.
// 두 페이지의 카드가 서로 다른 문구를 보여주지 않도록 반드시 여기서만 관리한다.
//
// "직군 및 직무 도메인 정의.xlsx"(2026-08-08, 진영님 공유) 기준으로 전면 교체.
// 실제 배포 API 응답 확인 결과 jobCategory는 이 새 직군 코드로 내려옴
// (예: "건설.건축,IT개발/데이터,제조.생산"). 기존 24개 공공데이터 직군 매핑은
// 백엔드 마이그레이션 완료로 더 이상 내려오지 않아 제거.
export const JOB_CATEGORY_LABELS: Record<string, string> = {
  '기획.전략': '기획·전략',
  '회계.세무.재무': '회계·세무·재무',
  '인사.노무.HR': '인사·노무·HR',
  '총무.법무.사무': '총무·법무·사무',
  '금융.보험': '금융·보험',
  교육: '교육',
  '보건.의료': '보건·의료',
  '공공.복지': '공공·복지',
  '미디어.문화.스포츠': '미디어·문화·스포츠',
  디자인: '디자인',
  '운전.운송.배송': '운전·운송·배송',
  '영업.판매.무역': '영업·판매·무역',
  '고객상담.TM': '고객상담·TM',
  서비스: '서비스',
  '건설.건축': '건설·건축',
  'IT개발/데이터': 'IT개발/데이터',
  '환경.에너지.안전': '환경·에너지·안전',
  농림어업: '농림어업',
  '연구.R&D': '연구·R&D',
  '제조.생산': '제조·생산',
  '구매.자재.물류': '구매·자재·물류',
  '마케팅.홍보.MD': '마케팅·홍보·MD',
};

// ⚠️ [2026-07-23] 배포 크래시 수정: 백엔드가 jobCategory/career를 null로 내려주는
// 공고가 실제로 존재함 (feed 401 이슈 해결 후 실데이터 렌더링되며 처음 발견됨).
// raw가 null/undefined일 때 raw.split()에서 TypeError로 페이지 전체가 크래시됨.
export function formatJobCategory(raw: string | null | undefined): string {
  if (!raw) return '-';
  const codes = raw.split(',').filter(Boolean);
  const labels = codes.map((code) => JOB_CATEGORY_LABELS[code] ?? code);
  if (labels.length <= 3) return labels.join(', ');
  return `${labels.slice(0, 3).join(', ')} 외 ${labels.length - 3}건`;
}
