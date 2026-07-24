// career 값(콤마 구분 코드) → 표시 텍스트 변환. 피드/스크랩 카드 공통 사용.
export function formatCareer(raw: string | null | undefined): string {
  if (!raw) return '-';
  const codes = raw.split(',').filter(Boolean);
  if (codes.length >= 2) return '경력 + 신입';
  return codes[0] === 'NEW' ? '신입' : '경력';
}
