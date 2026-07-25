'use client';

import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import type { KanbanCard, KanbanStage } from '@/types/api';
import { KanbanColumn } from './KanbanColumn';
import { AddStageButton } from './AddStageButton';
import { AddStageModal } from './AddStageModal';
import { Toast } from '@/components/ui/toast';
import { DeleteStageModal } from './DeleteStageModal';
import { AddCardModal } from './AddCardModal';
import { DeleteCardModal } from './DeleteCardModal';
import { CardDetailDrawer } from './CardDetailDrawer';
import { StageFilterChip } from './StageFilterChip';
import { DeadlineSoonFilterButton } from '@/features/feed/components/DeadlineSoonFilterButton';
import {
  useCreateDirectCard,
  useUpdateCard,
  useMoveCard,
  useDeleteCard,
  useCreateStage,
  useUpdateStage,
  useDeleteStage,
} from '@/features/kanban/api/useKanbanMutations';
import { ApiClientError } from '@/lib/api/api-client';
import { useDraftStageStore } from '@/features/kanban/store/draftStageStore';
import { kanbanKeys } from '@/features/kanban/api/useKanbanQuery';

const MAX_STAGES = 10;

interface KanbanBoardProps {
  initialStages: KanbanStage[];
}

export function KanbanBoard({ initialStages }: KanbanBoardProps) {
  const queryClient = useQueryClient();
  const [stages, setStages] = useState(initialStages);
  const { isAddingStage, draftName, startDraft, setDraftName, clearDraft } = useDraftStageStore();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [toastAction, setToastAction] = useState<{ label: string; onClick: () => void } | null>(
    null
  );
  const [deletingStage, setDeletingStage] = useState<KanbanStage | null>(null);
  const [addCardStageId, setAddCardStageId] = useState<number | null>(null);
  const [editingCard, setEditingCard] = useState<KanbanCard | null>(null);
  const [deletingCard, setDeletingCard] = useState<KanbanCard | null>(null);
  const [viewingCardId, setViewingCardId] = useState<number | null>(null);
  const [selectedStageIds, setSelectedStageIds] = useState<number[]>([]);
  const [isDeadlineSoonOnly, setIsDeadlineSoonOnly] = useState(false);

  // fix: initialStages 변경 시 stages 동기화 — 컬럼 너비 변형 버그 수정 (버그2)
  // useEffect에서 setState를 호출하면 리렌더링이 한 번 더 발생해 깜빡임(컬럼 너비
  // 변형)이 생기므로, 렌더링 중 prop 변경을 감지해 즉시 동기화하는 패턴을 사용.
  // (참고: react.dev "You Might Not Need an Effect" — Adjusting state on prop change)
  const [prevInitialStages, setPrevInitialStages] = useState(initialStages);
  if (initialStages !== prevInitialStages) {
    setPrevInitialStages(initialStages);
    setStages(initialStages);
  }

  const createDirectCardMutation = useCreateDirectCard();
  const updateCardMutation = useUpdateCard();
  const moveCardMutation = useMoveCard();
  const deleteCardMutation = useDeleteCard();
  const createStageMutation = useCreateStage();
  const updateStageMutation = useUpdateStage();
  const deleteStageMutation = useDeleteStage();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function showToast(
    type: 'success' | 'error',
    message: string,
    action: { label: string; onClick: () => void } | null = null
  ) {
    setToastType(type);
    setToastMessage(message);
    setToastAction(action);
  }

  const dismissToast = useCallback(() => {
    setToastMessage(null);
    setToastAction(null);
  }, []);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    // 스테이지(컬럼) 순서 변경
    if (active.data.current?.type === 'stage') {
      const fromStageId = active.data.current.stageId as number;
      const toStageId = Number(over.id);
      if (fromStageId === toStageId) return;

      let newPosition = 0;
      setStages((prev) => {
        const sorted = [...prev].sort((a, b) => a.position - b.position);
        const fromIndex = sorted.findIndex((s) => s.id === fromStageId);
        const toIndex = sorted.findIndex((s) => s.id === toStageId);
        if (fromIndex === -1 || toIndex === -1) return prev;

        const reordered = [...sorted];
        const [moved] = reordered.splice(fromIndex, 1);
        reordered.splice(toIndex, 0, moved);

        newPosition = toIndex + 1;
        return reordered.map((s, idx) => ({ ...s, position: idx + 1 }));
      });

      // 세영님 확인(2026-07-25): PATCH /kanban/stages/{id}는 name, position 각각 생략 가능.
      // 한쪽만 보내면 다른 쪽은 기존 값 그대로 유지됨 — 순서만 바꿀 땐 position만 보내면 됨.
      updateStageMutation.mutate(
        { stageId: fromStageId, position: newPosition },
        {
          onError: (err) => {
            setStages(initialStages);
            setToastType('error');
            if (err instanceof ApiClientError && err.code === 'K023') {
              setToastMessage('기본 전형 단계는 이름을 변경할 수 없어요.');
            } else {
              setToastMessage('전형 단계 순서 변경에 실패했어요.');
            }
          },
        }
      );
      return;
    }

    // 카드 이동
    const cardId = Number(active.id);
    const fromStageId = active.data.current?.stageId as number;
    const toStageId = Number(over.id);

    if (!fromStageId || fromStageId === toStageId) return;

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
          setStages(initialStages);
          showToast('error', '카드 이동에 실패했어요.');
        },
      }
    );
  }

  function handleAddStageClick() {
    if (stages.length >= MAX_STAGES) {
      showToast('error', '전형 단계는 최대 10개까지 추가할 수 있어요.');
      return;
    }
    startDraft();
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
          clearDraft();
          showToast('success', '전형 단계가 추가되었어요.');
        },
        onError: (err) => {
          if (err instanceof ApiClientError) {
            switch (err.code) {
              case 'K005':
                showToast('error', '전형 이름을 입력해주세요.');
                break;
              case 'K006':
                showToast('error', '이미 존재하는 전형 이름이에요.');
                break;
              case 'K007':
                showToast('error', '전형 이름에 사용할 수 없는 문자가 포함돼 있어요.');
                break;
              case 'K008':
                showToast('error', '전형 이름은 2자 이상 입력해주세요.');
                break;
              case 'K009':
                showToast('error', '전형 이름은 20자를 초과할 수 없어요.');
                break;
              case 'K001':
                showToast('error', '전형 단계는 최대 10개까지 추가할 수 있어요.');
                break;
              default:
                showToast('error', '전형 단계 추가에 실패했어요.');
            }
          } else {
            showToast('error', '전형 단계 추가에 실패했어요.');
          }
          // ⚠️ 유효성 오류(이름 관련)는 입력값을 유지해 재입력하기 편하도록 clearDraft()를 호출하지 않음.
          // 그 외(한도 초과 등) 오류는 기존처럼 초안을 닫음.
          if (
            !(
              err instanceof ApiClientError &&
              ['K005', 'K006', 'K007', 'K008', 'K009'].includes(err.code)
            )
          ) {
            clearDraft();
          }
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
          showToast('success', '지원 내역이 수정되었어요.');
        },
        onError: () => showToast('error', '지원 내역 수정에 실패했어요.'),
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
        showToast('success', '지원 내역이 삭제되었어요.');
      },
      onError: () => showToast('error', '지원 내역 삭제에 실패했어요.'),
    });
  }

  function handleUndoDeleteStage(name: string, cards: KanbanCard[]) {
    createStageMutation.mutate(
      { name },
      {
        onSuccess: (res) => {
          const restoredStage: KanbanStage = {
            id: res.id,
            name: res.name,
            position: res.position,
            isDefault: false,
            cards: [],
          };
          setStages((prev) => [...prev, restoredStage]);

          cards.forEach((card, idx) => {
            moveCardMutation.mutate(
              { cardId: card.id, stageId: res.id, position: idx + 1 },
              {
                onSuccess: () => {
                  setStages((prev) =>
                    prev.map((s) =>
                      s.id === res.id && !s.cards.some((c) => c.id === card.id)
                        ? { ...s, cards: [...s.cards, card] }
                        : s
                    )
                  );
                },
              }
            );
          });

          showToast('success', '삭제를 취소했어요.');
        },
        onError: () => showToast('error', '되돌리기에 실패했어요.'),
      }
    );
  }

  function isDeadlineSoon(deadline: string): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil((new Date(deadline).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 7;
  }

  const visibleStages = [...stages]
    .sort((a, b) => a.position - b.position)
    .filter((stage) => selectedStageIds.length === 0 || selectedStageIds.includes(stage.id))
    .map((stage) => ({
      ...stage,
      cards: isDeadlineSoonOnly ? stage.cards.filter((c) => isDeadlineSoon(c.deadline)) : stage.cards,
    }));

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex h-full min-h-0 flex-1 flex-col">
        <div className="mb-4 flex items-center gap-2">
          <StageFilterChip
            stages={stages}
            appliedStageIds={selectedStageIds}
            onApply={setSelectedStageIds}
          />
          <DeadlineSoonFilterButton
            isActive={isDeadlineSoonOnly}
            onToggle={setIsDeadlineSoonOnly}
          />
        </div>

        <div className="flex h-full w-full flex-1 items-stretch gap-5 overflow-x-auto pb-2 kanban-scroll-x">
          {visibleStages.map((stage) => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              onRenameStage={(stageId, newName, position) => {
                updateStageMutation.mutate(
                  { stageId, name: newName, position },
                  {
                    onSuccess: () => {
                      setStages((prev) =>
                        prev.map((s) => (s.id === stageId ? { ...s, name: newName } : s))
                      );
                      showToast('success', '전형 단계 이름이 수정되었어요.');
                    },
                    onError: (err) => {
                      if (
                        err instanceof ApiClientError &&
                        err.code === 'DEFAULT_STAGE_NAME_CHANGE_NOT_ALLOWED'
                      ) {
                        showToast('error', '기본 전형 단계는 이름을 변경할 수 없어요.');
                      } else if (err instanceof ApiClientError && err.code === 'K007') {
                        showToast('error', '올바른 전형 이름을 입력해주세요.');
                      } else {
                        showToast('error', '전형 단계 수정에 실패했어요.');
                      }
                    },
                  }
                );
              }}
              onDeleteStage={(stageId) => {
                const target = stages.find((s) => s.id === stageId);
                if (target) setDeletingStage(target);
              }}
              onAddCard={(stageId) => setAddCardStageId(stageId)}
              onCardClick={(cardId) => setViewingCardId(cardId)}
            />
          ))}
        </div>

        <AddStageButton onClick={handleAddStageClick} />
      </div>

      <Toast
        message={toastMessage ?? ''}
        isVisible={toastMessage !== null}
        onDismiss={dismissToast}
        type={toastType}
        hasButton={toastAction !== null}
        actionLabel={toastAction?.label}
        onAction={toastAction?.onClick}
      />

      <DeleteStageModal
        isOpen={deletingStage !== null}
        stage={deletingStage}
        otherStages={stages.filter((s) => s.id !== deletingStage?.id)}
        onClose={() => setDeletingStage(null)}
        onConfirm={(stageId, moveToStageId) => {
          const target = stages.find((s) => s.id === stageId);
          const deletedName = target?.name ?? '';
          const deletedCards = target?.cards ?? [];

          deleteStageMutation.mutate(
            { stageId, moveToStageId },
            {
              onSuccess: () => {
                setStages((prev) => {
                  if (moveToStageId !== undefined) {
                    return prev
                      .filter((s) => s.id !== stageId)
                      .map((s) =>
                        s.id === moveToStageId ? { ...s, cards: [...s.cards, ...deletedCards] } : s
                      );
                  }
                  return prev.filter((s) => s.id !== stageId);
                });
                setDeletingStage(null);
                showToast('success', `'${deletedName}' 단계를 삭제했어요.`, {
                  label: '되돌리기',
                  onClick: () => handleUndoDeleteStage(deletedName, deletedCards),
                });
              },
              onError: (err) => {
                if (err instanceof ApiClientError && err.code === 'DEFAULT_STAGE_CANNOT_DELETE') {
                  showToast('error', '기본 전형 단계는 삭제할 수 없어요.');
                } else {
                  showToast('error', '전형 단계 삭제에 실패했어요.');
                }
              },
            }
          );
        }}
      />

      <AddStageModal
        isOpen={isAddingStage}
        value={draftName}
        onChange={setDraftName}
        onClose={() => clearDraft()}
        onConfirm={handleConfirmDraft}
      />

      <AddCardModal
        key={`add-${addCardStageId}`}
        isOpen={addCardStageId !== null}
        mode="add"
        stageId={addCardStageId ?? 0}
        onClose={() => setAddCardStageId(null)}
        onConfirm={(data) => {
          const targetStageId = data.stageId;

          createDirectCardMutation.mutate(
            {
              companyName: data.companyName,
              title: data.jobTitle,
              originalUrl: data.originalUrl,
              deadline: data.deadline,
            },
            {
              onSuccess: (res) => {
                const newCard = {
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
                };

                if (res.stageId !== targetStageId) {
                  setStages((prev) =>
                    prev.map((s) =>
                      s.id === targetStageId ? { ...s, cards: [...s.cards, newCard] } : s
                    )
                  );
                  moveCardMutation.mutate(
                    { cardId: res.cardId, stageId: targetStageId, position: 1 },
                    {
                      onSuccess: () => {
                        // ⚠️ 등록+이동이 전부 끝난 뒤 딱 한 번만 재조회 — 중간 재조회로
                        // 인한 "지원 전" 깜빡임 방지
                        queryClient.invalidateQueries({ queryKey: kanbanKeys.board() });
                      },
                      onError: () => {
                        setStages((prev) =>
                          prev.map((s) => {
                            if (s.id === targetStageId) {
                              return { ...s, cards: s.cards.filter((c) => c.id !== res.cardId) };
                            }
                            if (s.id === res.stageId) {
                              return { ...s, cards: [...s.cards, newCard] };
                            }
                            return s;
                          })
                        );
                        queryClient.invalidateQueries({ queryKey: kanbanKeys.board() });
                        showToast(
                          'error',
                          '카드는 등록됐지만 선택한 단계로 이동은 실패했어요. 지원 전 단계에서 확인해주세요.'
                        );
                      },
                    }
                  );
                } else {
                  setStages((prev) =>
                    prev.map((s) => (s.id === res.stageId ? { ...s, cards: [...s.cards, newCard] } : s))
                  );
                  // 이동이 필요 없는 경우(원래도 "지원 전"에서 등록)엔 여기서 한 번만 재조회
                  queryClient.invalidateQueries({ queryKey: kanbanKeys.board() });
                }

                setAddCardStageId(null);
                showToast('success', '지원 내역이 추가되었어요.');
              },
              onError: () => showToast('error', '지원 내역 추가에 실패했어요.'),
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

      <CardDetailDrawer
        isOpen={viewingCardId !== null}
        cardId={viewingCardId}
        onClose={() => setViewingCardId(null)}
        onEditCard={(card) => {
          setViewingCardId(null);
          setEditingCard(card); // 기존 AddCardModal(mode=edit) 재사용
        }}
        onDeleteCard={(card) => {
          setViewingCardId(null);
          setDeletingCard(card); // 기존 DeleteCardModal 재사용
        }}
      />
    </DndContext>
  );
}
