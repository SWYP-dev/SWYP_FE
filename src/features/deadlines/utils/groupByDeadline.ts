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
//
// ⚠️ 기존엔 deadline 문자열을 localeCompare로 그대로 비교했는데, 이 방식은 날짜가
// "2026-07-15"처럼 항상 0 패딩된 형식일 때만 정확함. 여러 공공데이터 소스(워크넷·
// 공공기관·인사혁신처 등)를 그대로 수집하는 구조상 "2026-7-5"처럼 0 패딩 없는 값이
// 섞여 내려올 가능성을 배제할 수 없어(예: &apos; 엔티티 이슈처럼 원본 데이터 품질
// 이슈가 실제로 있었음), Date 객체 기반 비교로 변경해 이 문제를 근본적으로 방지함.
export function groupCardsByDeadline(entries: DeadlineCardEntry[]): DeadlineGroupData[] {
  const today = startOfDay(new Date());

  const sorted = [...entries].sort(
    (a, b) => new Date(a.card.deadline).getTime() - new Date(b.card.deadline).getTime()
  );

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
        // 오늘(D-Day)·내일(D-1) 여부 — true면 파란색 강조(헤더 텍스트, 카드 Divider).
        // Figma "지원 마감일 메인"(node 101:17608) 확인 완료 — 오늘/내일만 강조, 그 외는 검정/회색.
        isUrgent: diffDays <= 1,
        cards: [],
      });
    }
    groupMap.get(dateKey)!.cards.push(entry);
  }

  return Array.from(groupMap.values());
}
