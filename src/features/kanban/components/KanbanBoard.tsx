'use client';

import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { KanbanCard, KanbanStage } from '@/types/api';
import { KanbanColumn } from './KanbanColumn';
import { AddStageButton } from './AddStageButton';
import { AddStageModal } from './AddStageModal';
import { Toast } from '@/components/ui/toast';
import { DeleteStageModal } from './DeleteStageModal';
import { AddCardModal, type FormErrors } from './AddCardModal';
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

// API 명세서 3.10/3.11 에러 코드 → 필드별 에러 매핑 공용 헬퍼
function mapCardErrorCode(code: string): FormErrors | null {
  switch (code) {
    case 'K011':
      return { companyName: '회사명을 입력해 주세요.' };
    case 'K012':
      return { companyName: '올바른 회사명을 입력해 주세요.' };
    case 'K013':
      return { companyName: '2자 이상 입력해 주세요.' };
    case 'K014':
      return { companyName: '50자를 초과하여 입력할 수 없어요.' };
    case 'K015':
      return { jobTitle: '공고명을 입력해 주세요.' };
    case 'K016':
      return { jobTitle: '올바른 공고명을 입력해 주세요.' };
    case 'K017':
      return { jobTitle: '2자 이상 입력해 주세요.' };
    case 'K018':
      return { jobTitle: '100자를 초과하여 입력할 수 없어요.' };
    case 'K019':
      return { originalUrl: '공고 링크를 입력해 주세요.' };
    case 'K020':
      return { originalUrl: '올바른 공고 링크를 입력해 주세요.' };
    case 'K021':
      return { originalUrl: '2048자를 초과하여 입력할 수 없어요.' };
    case 'K003':
      return { originalUrl: '이미 등록된 공고예요.' };
    default:
      return null;
  }
}

function mapStageNameErrorCode(code: string): string | null {
  switch (code) {
    case 'K005':
      return '전형 단계 이름을 입력해 주세요.';
    case 'K006':
      return '이미 존재하는 전형 단계 이름이에요.';
    case 'K007':
      return '올바른 전형 단계 이름을 입력해 주세요.';
    case 'K008':
      return '2자 이상 입력해 주세요.';
    case 'K009':
      return '20자를 초과하여 입력할 수 없어요.';
    default:
      return null;
  }
}

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

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    if (active.data.current?.type === 'stage') return;

    const activeCardId = Number(active.id);
    const activeStageId = active.data.current?.stageId as number;
    if (!activeStageId) return;

    const overData = over.data.current as { type?: string; stageId?: number } | undefined;
    const overStageId = overData?.stageId;

    if (!overStageId || activeStageId === overStageId) return;

    setStages((prev) => {
      const fromStage = prev.find((s) => s.id === activeStageId);
      const card = fromStage?.cards.find((c) => c.id === activeCardId);
      if (!card) return prev;

      return prev.map((s) => {
        if (s.id === activeStageId) {
          return { ...s, cards: s.cards.filter((c) => c.id !== activeCardId) };
        }
        if (s.id === overStageId) {
          if (overData?.type === 'card') {
            const overCardId = Number(over.id);
            const idx = s.cards.findIndex((c) => c.id === overCardId);
            const insertAt = idx === -1 ? s.cards.length : idx;
            const next = [...s.cards];
            next.splice(insertAt, 0, card);
            return { ...s, cards: next };
          }
          return { ...s, cards: [...s.cards, card] };
        }
        return s;
      });
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) {
      // ⚠️ [QA 반영] 유효하지 않은 위치에 드롭하면 handleDragOver가 이미 낙관적으로
      // 옮겨놓은 로컬 상태가 서버에 반영되지 않은 채 남아있을 수 있어, 서버 기준
      // 상태로 되돌림 (다른 페이지에서 스테이지가 안 맞아 보이는 문제 방지).
      setStages(initialStages);
      return;
    }

    // 스테이지(컬럼) 순서 변경 — over.data.stageId를 사용 (over.id 파싱하지 않음)
    if (active.data.current?.type === 'stage') {
      const fromStageId = active.data.current.stageId as number;
      const overData = over.data.current as { stageId?: number } | undefined;
      const toStageId = overData?.stageId;
      if (!toStageId || fromStageId === toStageId) return;

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

    // 카드 이동/재정렬 — 스테이지 간 이동은 handleDragOver에서 이미 반영됨.
    // 여기서는 최종 소속 스테이지 내에서 정확한 순서만 확정.
    const cardId = Number(active.id);
    const currentStageId = stages.find((s) => s.cards.some((c) => c.id === cardId))?.id;
    if (!currentStageId) return;

    const overData = over.data.current as { type?: string } | undefined;
    const stageCards = stages.find((s) => s.id === currentStageId)!.cards;
    let finalCards = stageCards;

    if (overData?.type === 'card') {
      const overCardId = Number(over.id);
      if (overCardId !== cardId) {
        const oldIndex = stageCards.findIndex((c) => c.id === cardId);
        const newIndex = stageCards.findIndex((c) => c.id === overCardId);
        if (oldIndex !== -1 && newIndex !== -1) {
          finalCards = arrayMove(stageCards, oldIndex, newIndex);
          setStages((prev) =>
            prev.map((s) => (s.id === currentStageId ? { ...s, cards: finalCards } : s))
          );
        }
      }
    }

    const newPosition = finalCards.findIndex((c) => c.id === cardId) + 1;

    moveCardMutation.mutate(
      { cardId, stageId: currentStageId, position: newPosition },
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
          showToast('success', `'${res.name}' 단계가 추가되었어요.`);
        },
        onError: (err) => {
          const mapped = err instanceof ApiClientError ? mapStageNameErrorCode(err.code) : null;
          if (mapped) {
            showToast('error', mapped);
          } else if (err instanceof ApiClientError && err.code === 'K001') {
            showToast('error', '전형 단계는 최대 10개까지 추가할 수 있어요.');
          } else {
            showToast('error', '전형 단계 추가에 실패했어요.');
          }
          // ⚠️ 유효성 오류(이름 관련)는 입력값을 유지해 재입력하기 편하도록 clearDraft()를 호출하지 않음.
          if (!mapped) {
            clearDraft();
          }
        },
      }
    );
  }

  function handleUndoDeleteCard(card: KanbanCard, stageId: number, position: number) {
    createDirectCardMutation.mutate(
      {
        companyName: card.companyName,
        title: card.jobTitle,
        originalUrl: card.originalUrl,
        deadline: card.deadline,
      },
      {
        onSuccess: (res) => {
          const restoredCard = {
            id: res.cardId,
            postingId: res.postingId,
            companyName: res.companyName,
            jobTitle: res.jobTitle,
            deadline: res.deadline,
            thumbnailUrl: card.thumbnailUrl,
            originalUrl: card.originalUrl,
            deadlineChanged: false,
            memo: '', // ⚠️ 재등록 API로 복구하는 방식이라 메모는 복구 불가
            registeredAt: new Date().toISOString(),
          };

          if (res.stageId !== stageId) {
            setStages((prev) =>
              prev.map((s) => (s.id === stageId ? { ...s, cards: [...s.cards, restoredCard] } : s))
            );
            moveCardMutation.mutate(
              { cardId: res.cardId, stageId, position },
              {
                onSuccess: () => queryClient.invalidateQueries({ queryKey: kanbanKeys.board() }),
              }
            );
          } else {
            setStages((prev) =>
              prev.map((s) => (s.id === stageId ? { ...s, cards: [...s.cards, restoredCard] } : s))
            );
            queryClient.invalidateQueries({ queryKey: kanbanKeys.board() });
          }
        },
        onError: () => showToast('error', '되돌리기에 실패했어요.'),
      }
    );
  }

  function handleConfirmDeleteCard(cardId: number) {
    const fromStage = stages.find((s) => s.cards.some((c) => c.id === cardId));
    const deletedCard = fromStage?.cards.find((c) => c.id === cardId);
    const deletedStageId = fromStage?.id;
    const deletedPosition = fromStage ? fromStage.cards.findIndex((c) => c.id === cardId) + 1 : 1;

    deleteCardMutation.mutate(cardId, {
      onSuccess: () => {
        setStages((prev) =>
          prev.map((s) => ({ ...s, cards: s.cards.filter((c) => c.id !== cardId) }))
        );
        setDeletingCard(null);
        showToast('success', '지원 현황이 삭제되었어요.', {
          label: '되돌리기',
          onClick: () => {
            if (deletedCard && deletedStageId) {
              handleUndoDeleteCard(deletedCard, deletedStageId, deletedPosition);
            }
          },
        });
      },
      onError: () => showToast('error', '지원 내역 삭제에 실패했어요.'),
    });
  }

  function handleUndoDeleteStage(name: string, cards: KanbanCard[], position: number) {
    createStageMutation.mutate(
      { name, position },
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

          // ⚠️ [QA 반영] 되돌리기 성공 토스트 제거 — 디자인 명세에 없고, 삭제 취소라는
          // 결과가 화면에 이미 바로 반영되므로 추가 안내가 불필요함.
          // 위치가 다른 스테이지들에 영향(재정렬) 줄 수 있어 최종 상태 재조회.
          queryClient.invalidateQueries({ queryKey: kanbanKeys.board() });
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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
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
                        return;
                      }
                      const mapped = err instanceof ApiClientError ? mapStageNameErrorCode(err.code) : null;
                      showToast('error', mapped ?? '전형 단계 수정에 실패했어요.');
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
              onEditCard={(card) => setEditingCard(card)}
              onDeleteCard={(card) => setDeletingCard(card)}
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
        onClose={() => setDeletingStage(null)}
        onConfirm={(stageId) => {
          const target = stages.find((s) => s.id === stageId);
          const deletedName = target?.name ?? '';
          const deletedPosition = target?.position ?? 1;

          deleteStageMutation.mutate(
            { stageId },
            {
              onSuccess: () => {
                setStages((prev) => prev.filter((s) => s.id !== stageId));
                setDeletingStage(null);
                showToast('success', `'${deletedName}' 단계를 삭제했어요.`, {
                  label: '되돌리기',
                  onClick: () => handleUndoDeleteStage(deletedName, [], deletedPosition),
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
        onConfirm={async (data) => {
          try {
            const res = await createDirectCardMutation.mutateAsync({
              companyName: data.companyName,
              title: data.jobTitle,
              originalUrl: data.originalUrl,
              deadline: data.deadline,
            });
            const targetStageId = data.stageId;
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
                prev.map((s) => (s.id === targetStageId ? { ...s, cards: [...s.cards, newCard] } : s))
              );
              await moveCardMutation.mutateAsync({ cardId: res.cardId, stageId: targetStageId, position: 1 });
              queryClient.invalidateQueries({ queryKey: kanbanKeys.board() });
            } else {
              setStages((prev) =>
                prev.map((s) => (s.id === res.stageId ? { ...s, cards: [...s.cards, newCard] } : s))
              );
              queryClient.invalidateQueries({ queryKey: kanbanKeys.board() });
            }
            setAddCardStageId(null);
            showToast('success', '지원 현황이 추가되었어요.');
            return undefined;
          } catch (err) {
            if (err instanceof ApiClientError) {
              const mapped = mapCardErrorCode(err.code);
              if (mapped) return mapped;
            }
            showToast('error', '지원 내역 추가에 실패했어요.');
            return undefined;
          }
        }}
      />

      <AddCardModal
        key={`edit-${editingCard?.id}`}
        isOpen={editingCard !== null}
        mode="edit"
        stageId={stages.find((s) => s.cards.some((c) => c.id === editingCard?.id))?.id ?? 0}
        card={editingCard ?? undefined}
        onClose={() => setEditingCard(null)}
        onConfirm={async (data) => {
          if (!data.cardId) return undefined;
          try {
            await updateCardMutation.mutateAsync({
              cardId: data.cardId,
              companyName: data.companyName,
              title: data.jobTitle,
              originalUrl: data.originalUrl,
              deadline: data.deadline,
            });
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
            return undefined;
          } catch (err) {
            if (err instanceof ApiClientError) {
              // ⚠️ [QA 반영] K010은 특정 필드 문제가 아니라 "이 카드 자체를 수정할 수 없음"
              // (피드/스크랩에서 등록된 카드 — 3.11은 직접 등록한 카드만 수정 가능)이라
              // 필드 에러가 아니라 토스트로 명확히 안내하고 모달을 닫음.
              if (err.code === 'K010' || err.code === 'CARD_UPDATE_NOT_ALLOWED') {
                setEditingCard(null);
                showToast('error', '피드에서 등록된 공고는 수정할 수 없어요. (직접 등록한 공고만 수정 가능)');
                return undefined;
              }
              const mapped = mapCardErrorCode(err.code);
              if (mapped) return mapped;
            }
            showToast('error', '지원 내역 수정에 실패했어요.');
            return undefined;
          }
        }}
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
