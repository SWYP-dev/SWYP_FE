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
import { EditDeadlineCardModal } from './EditDeadlineCardModal';

// Figma "지원 마감일 메인"(node 101:17608) 스펙 반영.
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
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

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

  // ⚠️ 회사명/공고명은 폼에서 아예 안 보내서(비활성 필드), K010 걱정 없이
  // 지원 마감일 + 전형 단계만 독립적으로 업데이트
  async function handleConfirmEditCard(formData: { cardId: number; deadline: string; stageId: number }) {
    const entry = findEntry(formData.cardId);
    if (!entry) return;

    try {
      await updateCardMutation.mutateAsync({ cardId: formData.cardId, deadline: formData.deadline });

      if (formData.stageId !== entry.stageId) {
        await moveCardMutation.mutateAsync({
          cardId: formData.cardId,
          stageId: formData.stageId,
          position: 1,
        });
      }

      queryClient.invalidateQueries({ queryKey: kanbanKeys.board() });
      setEditingCard(null);
      setToastType('success');
      setToastMessage('수정 사항이 저장되었어요.');
    } catch {
      setToastType('error');
      setToastMessage('지원 내역 수정에 실패했어요.');
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
      <div className="flex w-full flex-col gap-9 rounded-[20px] bg-base-white p-[28px]">
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
        onEditCard={() => {}}
        onDeleteCard={(card) => setDeletingCard(card)}
      />

      <EditDeadlineCardModal
        key={`edit-${editingCard?.id}`}
        isOpen={editingCard !== null}
        card={editingCard ?? undefined}
        currentStageId={
          editingCard ? (entries.find((e) => e.card.id === editingCard.id)?.stageId ?? 0) : 0
        }
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
        type={toastType}
      />
    </>
  );
}
