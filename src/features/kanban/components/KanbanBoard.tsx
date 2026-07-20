'use client';

import { useState, useCallback } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import type { KanbanCard, KanbanStage } from '@/types/api';
import { KanbanColumn } from './KanbanColumn';
import { AddStageButton } from './AddStageButton';
import { Toast } from '@/components/ui/toast';
import { DeleteStageModal } from './DeleteStageModal';
import { AddCardModal } from './AddCardModal';
import { DeleteCardModal } from './DeleteCardModal';
import {
  useCreateDirectCard,
  useUpdateCard,
  useMoveCard,
  useDeleteCard,
  useCreateStage,
  useUpdateStage,
  useDeleteStage,
} from '@/features/kanban/api/useKanbanMutations';

const MAX_STAGES = 10;

interface KanbanBoardProps {
  initialStages: KanbanStage[];
}

export function KanbanBoard({ initialStages }: KanbanBoardProps) {
  const [stages, setStages] = useState(initialStages);
  const [isAddingStage, setIsAddingStage] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deletingStage, setDeletingStage] = useState<KanbanStage | null>(null);
  const [addCardStageId, setAddCardStageId] = useState<number | null>(null);
  const [editingCard, setEditingCard] = useState<KanbanCard | null>(null);
  const [deletingCard, setDeletingCard] = useState<KanbanCard | null>(null);

  const createDirectCardMutation = useCreateDirectCard();
  const updateCardMutation = useUpdateCard();
  const moveCardMutation = useMoveCard();
  const deleteCardMutation = useDeleteCard();
  const createStageMutation = useCreateStage();
  const updateStageMutation = useUpdateStage();
  const deleteStageMutation = useDeleteStage();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const dismissToast = useCallback(() => setToastMessage(null), []);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const cardId = active.id as number;
    const fromStageId = active.data.current?.stageId as number;
    const toStageId = over.id as number;

    if (!fromStageId || fromStageId === toStageId) return;

    // 낙관적 업데이트
    setStages((prev) => {
      const fromStage = prev.find((s) => s.id === fromStageId);
      const card = fromStage?.cards.find((c) => c.id === cardId);
      if (!card) return prev;
      return prev.map((s) => {
        if (s.id === fromStageId) return { ...s, cards: s.cards.filter((c) => c.id !== cardId) };
        if (s.id === toStageId) return { ...s, cards: [...s.cards, card] };
        return s;
      });
    });

    moveCardMutation.mutate(
      { cardId, stageId: toStageId, position: 1 },
      {
        onError: () => {
          // 실패 시 롤백
          setStages(initialStages);
          setToastMessage('카드 이동에 실패했어요.');
        },
      }
    );
  }

  function handleAddStageClick() {
    if (stages.length >= MAX_STAGES) {
      setToastMessage('전형 단계는 최대 10개까지 추가할 수 있어요.');
      return;
    }
    setIsAddingStage(true);
  }

  function handleConfirmDraft(name: string) {
    createStageMutation.mutate(
      { name },
      {
        onSuccess: (res) => {
          setStages((prev) => [
            ...prev,
            { id: res.id, name: res.name, position: res.position, isDefault: false, cards: [] },
          ]);
          setIsAddingStage(false);
          setToastMessage('전형 단계가 추가되었어요.');
        },
        onError: () => {
          setToastMessage('전형 단계 추가에 실패했어요.');
          setIsAddingStage(false);
        },
      }
    );
  }

  function handleConfirmEditCard(data: {
    companyName: string;
    jobTitle: string;
    originalUrl: string;
    deadline: string;
    stageId: number;
    cardId?: number;
  }) {
    if (!data.cardId) return;
    updateCardMutation.mutate(
      {
        cardId: data.cardId,
        companyName: data.companyName,
        title: data.jobTitle,
        originalUrl: data.originalUrl,
        deadline: data.deadline,
      },
      {
        onSuccess: () => {
          setStages((prev) =>
            prev.map((s) => ({
              ...s,
              cards: s.cards.map((c) =>
                c.id === data.cardId
                  ? {
                      ...c,
                      companyName: data.companyName,
                      jobTitle: data.jobTitle,
                      originalUrl: data.originalUrl,
                      deadline: data.deadline,
                    }
                  : c
              ),
            }))
          );
          setEditingCard(null);
          setToastMessage('지원 내역이 수정되었어요.');
        },
        onError: () => setToastMessage('지원 내역 수정에 실패했어요.'),
      }
    );
  }

  function handleConfirmDeleteCard(cardId: number) {
    deleteCardMutation.mutate(cardId, {
      onSuccess: () => {
        setStages((prev) =>
          prev.map((s) => ({ ...s, cards: s.cards.filter((c) => c.id !== cardId) }))
        );
        setDeletingCard(null);
        setToastMessage('지원 내역이 삭제되었어요.');
      },
      onError: () => setToastMessage('지원 내역 삭제에 실패했어요.'),
    });
  }

  const draftStage: KanbanStage = {
    id: -1,
    name: '',
    position: stages.length + 1,
    isDefault: false,
    cards: [],
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex h-full w-full flex-1 items-stretch gap-5 overflow-x-auto pb-2">
        {[...stages]
          .sort((a, b) => a.position - b.position)
          .map((stage) => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              onRenameStage={(stageId, newName) => {
                updateStageMutation.mutate(
                  { stageId, name: newName },
                  {
                    onSuccess: () => {
                      setStages((prev) =>
                        prev.map((s) => (s.id === stageId ? { ...s, name: newName } : s))
                      );
                      setToastMessage('전형 단계 이름이 수정되었어요.');
                    },
                    onError: () => setToastMessage('전형 단계 수정에 실패했어요.'),
                  }
                );
              }}
              onDeleteStage={(stageId) => {
                const target = stages.find((s) => s.id === stageId);
                if (target) setDeletingStage(target);
              }}
              onAddCard={(stageId) => setAddCardStageId(stageId)}
              onEditCard={(card) => setEditingCard(card)}
              onDeleteCard={(card) => setDeletingCard(card)}
            />
          ))}
        {isAddingStage && (
          <KanbanColumn
            key="draft"
            stage={draftStage}
            isDraft
            onConfirmDraft={handleConfirmDraft}
            onCancelDraft={() => setIsAddingStage(false)}
          />
        )}
      </div>

      <AddStageButton onClick={handleAddStageClick} />

      <Toast
        message={toastMessage ?? ''}
        isVisible={toastMessage !== null}
        onDismiss={dismissToast}
      />

      <DeleteStageModal
        isOpen={deletingStage !== null}
        stage={deletingStage}
        otherStages={stages.filter((s) => s.id !== deletingStage?.id)}
        onClose={() => setDeletingStage(null)}
        onConfirm={(stageId, moveToStageId) => {
          deleteStageMutation.mutate(
            { stageId, moveToStageId },
            {
              onSuccess: () => {
                setStages((prev) => {
                  if (moveToStageId !== undefined) {
                    const targetCards = prev.find((s) => s.id === stageId)?.cards ?? [];
                    return prev
                      .filter((s) => s.id !== stageId)
                      .map((s) =>
                        s.id === moveToStageId ? { ...s, cards: [...s.cards, ...targetCards] } : s
                      );
                  }
                  return prev.filter((s) => s.id !== stageId);
                });
                setDeletingStage(null);
                setToastMessage('전형 단계가 삭제되었어요.');
              },
              onError: () => setToastMessage('전형 단계 삭제에 실패했어요.'),
            }
          );
        }}
      />

      <AddCardModal
        key={`add-${addCardStageId}`}
        isOpen={addCardStageId !== null}
        mode="add"
        stageId={addCardStageId ?? 0}
        onClose={() => setAddCardStageId(null)}
        onConfirm={(data) => {
          createDirectCardMutation.mutate(
            {
              companyName: data.companyName,
              title: data.jobTitle,
              originalUrl: data.originalUrl,
              deadline: data.deadline,
            },
            {
              onSuccess: (res) => {
                setStages((prev) =>
                  prev.map((s) =>
                    s.id === data.stageId
                      ? {
                          ...s,
                          cards: [
                            ...s.cards,
                            {
                              id: res.cardId,
                              postingId: res.postingId,
                              companyName: res.companyName,
                              jobTitle: res.jobTitle,
                              deadline: res.deadline,
                              thumbnailUrl: '',
                              originalUrl: data.originalUrl,
                              deadlineChanged: false,
                              memo: '',
                              registeredAt: new Date().toISOString(),
                            },
                          ],
                        }
                      : s
                  )
                );
                setAddCardStageId(null);
                setToastMessage('지원 내역이 추가되었어요.');
              },
              onError: () => setToastMessage('지원 내역 추가에 실패했어요.'),
            }
          );
        }}
      />

      <AddCardModal
        key={`edit-${editingCard?.id}`}
        isOpen={editingCard !== null}
        mode="edit"
        stageId={stages.find((s) => s.cards.some((c) => c.id === editingCard?.id))?.id ?? 0}
        card={editingCard ?? undefined}
        onClose={() => setEditingCard(null)}
        onConfirm={handleConfirmEditCard}
      />

      <DeleteCardModal
        isOpen={deletingCard !== null}
        card={deletingCard}
        onClose={() => setDeletingCard(null)}
        onConfirm={handleConfirmDeleteCard}
      />
    </DndContext>
  );
}
