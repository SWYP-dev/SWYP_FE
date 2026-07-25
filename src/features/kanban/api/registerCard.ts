import { apiFetch } from '@/lib/api/api-client';
import type { KanbanCardRegisterResponse } from '@/types/api';

// 3.2 칸반 카드 자동 등록 (POST /api/v1/kanban/cards)
//
// ⚠️ 확인 완료 (2026-07-20, Swagger 실측): Request Body의 `postingId` 필드는 명세서
// 예시("postingId": 101, 즉 피드 id처럼 보임)와 달리, 실제로는 스크랩 시 생성되는
// job_postings 사본 id(jobPostingId)를 기대함.
//
// 실측 과정:
//   1) 피드 id 705로 호출 → 404 POSTING_NOT_FOUND (존재하는 공고인데도 못 찾음)
//   2) POST /feed/705/scrap → jobPostingId: 3 발급
//   3) jobPostingId 3으로 호출 → 201 Created
//
// 즉 "즐겨찾기 선행 정책" 문구 그대로, 스크랩된 공고만 등록 가능하고 식별자도
// 스크랩 사본 id 기준. 명세서 Request Body 예시는 후속 업데이트 필요 (동섭님 공유 완료).
export async function registerKanbanCard(
  jobPostingId: number
): Promise<KanbanCardRegisterResponse> {
  return apiFetch<KanbanCardRegisterResponse>('/api/v1/kanban/cards', {
    method: 'POST',
    body: { postingId: jobPostingId },
  });
}

// 2.6 스크랩 없이 바로 칸반 등록 (POST /api/v1/feed/{postingId}/kanban-card)
// ⚠️ [QA 반영] 기존엔 이 전용 API가 구현돼 있지 않아서, "지원 현황 추가" 클릭 시
// 스크랩(2.3)을 먼저 거친 뒤 등록(3.2)했음 — 그 결과 스크랩 탭에도 자동으로
// 올라가는 문제가 있었음. 이 API를 쓰면 스크랩 처리 없이 바로 등록됨.
export async function registerKanbanCardDirect(
  postingId: number
): Promise<KanbanCardRegisterResponse> {
  return apiFetch<KanbanCardRegisterResponse>(`/api/v1/feed/${postingId}/kanban-card`, {
    method: 'POST',
  });
}
