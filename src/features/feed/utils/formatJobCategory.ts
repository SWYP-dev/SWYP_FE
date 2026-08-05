// 통합 공고 탐색(피드)·스크랩 페이지 공통 직무 분류 표시 로직.
// 두 페이지의 카드가 서로 다른 문구를 보여주지 않도록 반드시 여기서만 관리한다.
export const JOB_CATEGORY_LABELS: Record<string, string> = {
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
