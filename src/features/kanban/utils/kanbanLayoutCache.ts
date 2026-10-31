// QA-026: 스켈레톤을 그리는 시점에는 보드 응답이 없어 단계/카드 개수를 알 수 없다.
// 그래서 직전 조회 때의 개수만 저장해 두고 다음 로딩의 스켈레톤에 쓴다 (단계별 카드 수 배열).
const KANBAN_LAYOUT_KEY = 'chwihap_kanban_layout';

export function readKanbanLayoutCache(): string | null {
  try {
    return localStorage.getItem(KANBAN_LAYOUT_KEY);
  } catch {
    return null;
  }
}

export function saveKanbanLayoutCache(cardCounts: number[]) {
  try {
    localStorage.setItem(KANBAN_LAYOUT_KEY, JSON.stringify(cardCounts));
  } catch {
    // 저장에 실패해도 스켈레톤이 기본 형태로 나올 뿐이라 무시한다.
  }
}

export function clearKanbanLayoutCache() {
  try {
    localStorage.removeItem(KANBAN_LAYOUT_KEY);
  } catch {
    // 위와 같은 이유로 무시한다.
  }
}

export function parseKanbanLayoutCache(raw: string | null): number[] | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    const isValid =
      Array.isArray(parsed) &&
      parsed.length > 0 &&
      parsed.every((count) => Number.isInteger(count) && count >= 0);
    return isValid ? (parsed as number[]) : null;
  } catch {
    return null;
  }
}
