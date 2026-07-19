/**
 * 직무가 여러 개인 경우 쉼표로 구분하고, 4개 이상이면 3개까지만 노출 후 '외 n건'을 붙인다.
 * ex. ['경영·비즈니스 기획', '웹 기획', '마케팅 기획', ...9개 더] → "경영·비즈니스 기획, 웹 기획, 마케팅 기획 외 9건"
 *
 * NOTE: API 명세서(2.1) 상 jobCategory는 현재 단일 문자열로 정의되어 있음.
 * 복수 직무 노출을 위해서는 백엔드 필드가 jobCategories: string[] 형태로 변경되어야 하므로,
 * 실제 연동 전 세영님/동섭님과 필드 스펙 확정 필요.
 */
export function formatJobCategories(categories: string[]): string {
  if (categories.length === 0) return '';
  if (categories.length <= 3) return categories.join(', ');

  const visible = categories.slice(0, 3).join(', ');
  const restCount = categories.length - 3;
  return `${visible} 외 ${restCount}건`;
}
