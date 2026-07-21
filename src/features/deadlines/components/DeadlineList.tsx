'use client';

import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { kanbanKeys, useKanbanBoard } from '@/features/kanban/api/useKanbanQuery';
import {
  useUpdateCard,
  useMoveCard,
  useDeleteCard,
} from '@/features/kanban/api/useKanbanMutations';
import { DeleteCardModal } from '@/features/kanban/components/DeleteCardModal';
import { CardDetailDrawer } from '@/features/kanban/components/CardDetailDrawer';
import { Toast } from '@/components/ui/toast';
import type { KanbanCard } from '@/types/api';
import { flattenKanbanCards, groupCardsByDeadline } from '../utils/groupByDeadline';
import { DeadlineGroup } from './DeadlineGroup';
import { EditDeadlineCardModal } from './EditDeadlineCardModal';

// Figma "지원 마감일 메인"(node 101:17608) 스펙 반영.
// 전용 목록 조회 API가 없어(⚠️ 세영님·동섭님 확인 필요) GET /api/v1/kanban(3.1) 응답을
// 프론트에서 평탄화 + 마감일순 그룹핑한다. 삭제/상세조회는 기존 칸반 로직
// (DeleteCardModal · CardDetailDrawer · useDeleteCard) 그대로 재사용하고, 수정은 이 페이지
// 전용 EditDeadlineCardModal(공고 링크 대신 전형 단계 선택 필드) 사용 — Figma node 101:17631.
export function DeadlineList() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useKanbanBoard();
  const updateCardMutation = useUpdateCard();
  const moveCardMutation = useMoveCard();
  const deleteCardMutation = useDeleteCard();

  const [viewingCardId, setViewingCardId] = useState<number | null>(null);
  const [editingCard, setEditingCard] = useState<KanbanCard | null>(null);
  const [deletingCard, setDeletingCard] = useState<KanbanCard | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const entries = useMemo(() => flattenKanbanCards(data?.stages ?? []), [data]);
  const groups = useMemo(() => groupCardsByDeadline(entries), [entries]);

  function findEntry(cardId: number) {
    return entries.find((e) => e.card.id === cardId);
  }

  function handleEditCard(cardId: number) {
    const entry = findEntry(cardId);
    if (entry) setEditingCard(entry.card);
  }

  function handleDeleteCard(cardId: number) {
    const entry = findEntry(cardId);
    if (entry) setDeletingCard(entry.card);
  }

  // 전형 단계는 원래 소속 단계에서 변경됐을 때만 별도로 이동 API(moveCard)를 호출한다.
  async function handleConfirmEditCard(formData: {
    cardId: number;
    companyName: string;
    jobTitle: string;
    deadline: string;
    stageId: number;
  }) {
    const entry = findEntry(formData.cardId);
    if (!entry) return;

    try {
      await updateCardMutation.mutateAsync({
        cardId: formData.cardId,
        companyName: formData.companyName,
        title: formData.jobTitle,
        originalUrl: entry.card.originalUrl, // 이 모달에는 공고 링크 필드가 없어 기존 값 유지
        deadline: formData.deadline,
      });

      if (formData.stageId !== entry.stageId) {
        await moveCardMutation.mutateAsync({
          cardId: formData.cardId,
          stageId: formData.stageId,
          position: 1,
        });
      }

      queryClient.invalidateQueries({ queryKey: kanbanKeys.board() });
      setEditingCard(null);
      setToastMessage('지원 마감일을 수정했어요.');
    } catch {
      setToastMessage('지원 내역 수정에 실패했어요.');
    }
  }

  function handleConfirmDeleteCard(cardId: number) {
    deleteCardMutation.mutate(cardId, {
      onSuccess: () => {
        setDeletingCard(null);
        if (viewingCardId === cardId) setViewingCardId(null);
        setToastMessage('지원 내역이 삭제되었어요.');
      },
      onError: () => setToastMessage('지원 내역 삭제에 실패했어요.'),
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

  const editingStageId = editingCard
    ? (entries.find((e) => e.card.id === editingCard.id)?.stageId ?? 0)
    : 0;

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
            onCardClick={(cardId) => setViewingCardId(cardId)}
            onEditCard={handleEditCard}
            onDeleteCard={handleDeleteCard}
          />
        ))}
      </div>

      <CardDetailDrawer
        isOpen={viewingCardId !== null}
        cardId={viewingCardId}
        onClose={() => setViewingCardId(null)}
        onEditCard={(card) => setEditingCard(card)}
        onDeleteCard={(card) => setDeletingCard(card)}
      />

      <EditDeadlineCardModal
        key={`edit-${editingCard?.id}`}
        isOpen={editingCard !== null}
        card={editingCard ?? undefined}
        currentStageId={editingStageId}
        stages={data?.stages ?? []}
        isOverDrawer={viewingCardId !== null}
        onClose={() => setEditingCard(null)}
        onConfirm={handleConfirmEditCard}
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
      />
    </>
  );
}
