import type { KanbanStage, KanbanCard } from '@/types/api';

export interface DeadlineCardEntry {
  card: KanbanCard;
  stageId: number;
  stageName: string;
}

export interface DeadlineGroupData {
  /** 그룹 키 — 마감일(YYYY-MM-DD) 기준 */
  key: string;
  /** 그룹 헤더 좌측 라벨: "오늘" | "내일" | "7월 23일 (목)" | "2027년 1월 5일 (화)" */
  label: string;
  /** 그룹 헤더 우측 D-day 라벨: "D-Day" | "D-1" | "D-10" */
  ddayLabel: string;
  /** 오늘(D-Day)·내일(D-1) 여부 — true면 파란색 강조(헤더 텍스트, 카드 Divider) */
  isUrgent: boolean;
  cards: DeadlineCardEntry[];
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

// PRD 4.3.1: "칸반 보드에 등록된 공고 전체"가 노출 대상. 전용 목록 조회 API가 없어
// GET /api/v1/kanban(3.1) 응답의 스테이지+카드 중첩 구조를 프론트에서 평탄화한다.
// ⚠️ TODO: 세영님·동섭님 확인 후 전용 API(정렬/그룹핑을 서버에서 처리)로 교체 검토.
// 사용자 확인(2026-07-22): 전형 단계(지원 전/면접/최종 결과)와 무관하게 전체 카드를 포함한다.
export function flattenKanbanCards(stages: KanbanStage[]): DeadlineCardEntry[] {
  return stages.flatMap((stage) =>
    stage.cards.map((card) => ({ card, stageId: stage.id, stageName: stage.name }))
  );
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// PRD 4.3.1 "정렬 옵션: 마감일 임박순 자동 정렬" 반영.
export function groupCardsByDeadline(entries: DeadlineCardEntry[]): DeadlineGroupData[] {
  const today = startOfDay(new Date());

  const sorted = [...entries].sort((a, b) => a.card.deadline.localeCompare(b.card.deadline));

  const groupMap = new Map<string, DeadlineGroupData>();

  for (const entry of sorted) {
    const dateKey = entry.card.deadline;
    if (!groupMap.has(dateKey)) {
      const target = startOfDay(new Date(dateKey));
      const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      let label: string;
      if (diffDays === 0) {
        label = '오늘';
      } else if (diffDays === 1) {
        label = '내일';
      } else {
        const yearPrefix =
          target.getFullYear() !== today.getFullYear() ? `${target.getFullYear()}년 ` : '';
        label = `${yearPrefix}${target.getMonth() + 1}월 ${target.getDate()}일 (${WEEKDAYS[target.getDay()]})`;
      }

      const ddayLabel =
        diffDays === 0 ? 'D-Day' : diffDays < 0 ? `D+${Math.abs(diffDays)}` : `D-${diffDays}`;

      groupMap.set(dateKey, {
        key: dateKey,
        label,
        ddayLabel,
        // ⚠️ 가정: 오늘/내일 그룹만 파란색 강조. Figma 시안 기준 추정 — 디자이너 확인 필요.
        isUrgent: diffDays <= 1,
        cards: [],
      });
    }
    groupMap.get(dateKey)!.cards.push(entry);
  }

  return Array.from(groupMap.values());
}
