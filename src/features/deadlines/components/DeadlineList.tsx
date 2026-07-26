'use client';

import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { kanbanKeys, useKanbanBoard } from '@/features/kanban/api/useKanbanQuery';
import { useUpdateCard, useMoveCard, useDeleteCard } from '@/features/kanban/api/useKanbanMutations';
import { DeleteCardModal } from '@/features/kanban/components/DeleteCardModal';
import { CardDetailDrawer } from '@/features/kanban/components/CardDetailDrawer';
import { Toast } from '@/components/ui/toast';
import type { KanbanCard } from '@/types/api';
import { flattenKanbanCards, groupCardsByDeadline } from '../utils/groupByDeadline';
import { DeadlineGroup } from './DeadlineGroup';

// Figma "지원 마감일 메인"(node 101:17608) 스펙 반영.
//
// ⚠️ [QA 반영] 기존 EditDeadlineCardModal(전체 필드 입력 모달) 제거.
// 회사명·공고명은 두 유형(직접 등록/피드 등록) 모두 수정 불가로 확정되어, 지원
// 마감일(인라인 편집)과 전형 단계(카테고리 뱃지 드롭다운)만 각각 독립적으로 수정.
export function DeadlineList() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useKanbanBoard();
  const updateCardMutation = useUpdateCard();
  const moveCardMutation = useMoveCard();
  const deleteCardMutation = useDeleteCard();

  const [viewingCardId, setViewingCardId] = useState<number | null>(null);
  const [deletingCard, setDeletingCard] = useState<KanbanCard | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const entries = useMemo(() => flattenKanbanCards(data?.stages ?? []), [data]);
  const groups = useMemo(() => groupCardsByDeadline(entries), [entries]);
  const availableStages = useMemo(
    () => (data?.stages ?? []).map((s) => ({ id: s.id, name: s.name })),
    [data]
  );

  function findEntry(cardId: number) {
    return entries.find((e) => e.card.id === cardId);
  }

  function handleDeleteCard(cardId: number) {
    const entry = findEntry(cardId);
    if (entry) setDeletingCard(entry.card);
  }

  // 지원 마감일 인라인 수정 — 회사명/공고명/공고링크는 전송하지 않아 K010 회피
  async function handleUpdateDeadline(cardId: number, deadline: string) {
    try {
      await updateCardMutation.mutateAsync({ cardId, deadline });
      queryClient.invalidateQueries({ queryKey: kanbanKeys.board() });
      setToastType('success');
      setToastMessage('수정 사항이 저장되었어요.');
    } catch {
      setToastType('error');
      setToastMessage('지원 마감일 수정에 실패했어요.');
    }
  }

  // 전형 단계 변경 — 기존 이동 API(moveCard) 재사용, 직접 등록 여부와 무관하게 항상 허용
  async function handleMoveStage(cardId: number, stageId: number) {
    try {
      await moveCardMutation.mutateAsync({ cardId, stageId, position: 1 });
      queryClient.invalidateQueries({ queryKey: kanbanKeys.board() });
      setToastType('success');
      setToastMessage('전형 단계가 변경되었어요.');
    } catch {
      setToastType('error');
      setToastMessage('전형 단계 변경에 실패했어요.');
    }
  }

  function handleConfirmDeleteCard(cardId: number) {
    deleteCardMutation.mutate(cardId, {
      onSuccess: () => {
        setDeletingCard(null);
        if (viewingCardId === cardId) setViewingCardId(null);
        setToastType('success');
        setToastMessage('지원 현황이 삭제되었어요.');
      },
      onError: () => {
        setToastType('error');
        setToastMessage('지원 내역 삭제에 실패했어요.');
      },
    });
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-3 text-label-description">
        불러오는 중...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center text-3 text-status-negative">
        데이터를 불러오지 못했어요. 다시 시도해 주세요.
      </div>
    );
  }

  return (
    <>
      <div className="flex w-full flex-col gap-10 rounded-[20px] bg-base-white p-7">
        {groups.length === 0 && (
          <div className="flex w-full items-center justify-center py-20 text-3 text-label-description">
            지원 현황에 등록된 공고가 없어요.
          </div>
        )}
        {groups.map((group) => (
          <DeadlineGroup
            key={group.key}
            group={group}
            selectedCardId={viewingCardId}
            availableStages={availableStages}
            onCardClick={(cardId) => setViewingCardId(cardId)}
            onDeleteCard={handleDeleteCard}
            onUpdateDeadline={handleUpdateDeadline}
            onMoveStage={handleMoveStage}
          />
        ))}
      </div>

      <CardDetailDrawer
        isOpen={viewingCardId !== null}
        cardId={viewingCardId}
        onClose={() => setViewingCardId(null)}
        onEditCard={() => {}}
        onDeleteCard={(card) => setDeletingCard(card)}
      />

      <DeleteCardModal
        isOpen={deletingCard !== null}
        card={deletingCard}
        isOverDrawer={viewingCardId !== null}
        onClose={() => setDeletingCard(null)}
        onConfirm={handleConfirmDeleteCard}
      />

      <Toast
        message={toastMessage ?? ''}
        isVisible={toastMessage !== null}
        onDismiss={() => setToastMessage(null)}
        type={toastType}
      />
    </>
  );
}
