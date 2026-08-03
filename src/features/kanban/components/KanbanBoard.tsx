'use client';

import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import type { KanbanCard, KanbanStage } from '@/types/api';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCardContent } from './KanbanCard';
import { AddStageButton } from './AddStageButton';
import { Toast } from '@/components/ui/toast';
import { DeleteStageModal } from './DeleteStageModal';
import { AddCardModal, type FormErrors } from './AddCardModal';
import { DeleteCardModal } from './DeleteCardModal';
import { CardDetailDrawer } from './CardDetailDrawer';
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
      return { companyName: '특수문자나 이모지는 입력할 수 없어요.' };
    case 'K013':
      return { companyName: '2자 이상 입력해 주세요.' };
    case 'K014':
      return { companyName: '50자를 초과하여 입력할 수 없어요.' };
    case 'K015':
      return { jobTitle: '공고명을 입력해 주세요.' };
    case 'K016':
      return { jobTitle: '특수문자나 이모지는 입력할 수 없어요.' };
    case 'K017':
      return { jobTitle: '2자 이상 입력해 주세요.' };
    case 'K018':
      return { jobTitle: '100자를 초과하여 입력할 수 없어요.' };
    case 'K019':
      return { originalUrl: '공고 링크를 입력해 주세요.' };
    case 'K020':
      return { originalUrl: '웹페이지를 찾을 수 없어요. URL 주소를 다시 확인해 주세요.' };
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
      return '특수문자나 이모지는 입력할 수 없어요.';
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
  // 드래그 중인 카드를 DragOverlay로 별도 렌더링하기 위한 상태 (overflow-y-auto 컬럼
  // 밖으로 나가도 잘리지 않게 하려는 목적 — KanbanCard.tsx 상단 주석 참고)
  const [activeDragCard, setActiveDragCard] = useState<KanbanCard | null>(null);
  const [activeDragWidth, setActiveDragWidth] = useState<number | null>(null);

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

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    if (active.data.current?.type !== 'card') return;
    setActiveDragCard(active.data.current.card as KanbanCard);
    setActiveDragWidth(active.rect.current.initial?.width ?? null);
  }

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
    setActiveDragCard(null);
    setActiveDragWidth(null);

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
      const overData = over.data.current as { stageId?: number; type?: string } | undefined;
      const toStageId = overData?.stageId;
      if (!toStageId || fromStageId === toStageId) return;

      const fromStage = stages.find((s) => s.id === fromStageId);
      const toStage = stages.find((s) => s.id === toStageId);
      if (fromStage?.name === '지원 전' || toStage?.name === '지원 전') return;

      let newPosition = 0;
      setStages((prev) => {
        const sorted = [...prev].sort((a, b) => a.position - b.position);
        const lockedStages = sorted.filter((s) => s.name === '지원 전');
        const reorderable = sorted.filter((s) => s.name !== '지원 전');

        const fromIndex = reorderable.findIndex((s) => s.id === fromStageId);
        const toIndex = reorderable.findIndex((s) => s.id === toStageId);
        if (fromIndex === -1 || toIndex === -1) return prev;

        // arrayMove로 통일 — 카드 재정렬과 동일한 방식
        const reordered = arrayMove(reorderable, fromIndex, toIndex);
        const finalOrder = [...lockedStages, ...reordered];
        newPosition = finalOrder.findIndex((s) => s.id === fromStageId) + 1;

        return finalOrder.map((s, idx) => ({ ...s, position: idx + 1 }));
      });

      updateStageMutation.mutate(
        { stageId: fromStageId, position: newPosition },
        {
          onError: (err) => {
            setStages(initialStages);
            setToastType('error');
            if (err instanceof ApiClientError && err.code === 'K024') {
              setToastMessage('지원 전 단계는 항상 첫 번째 위치에 고정돼요.');
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

  // ⚠️ [QA 반영] 기존엔 여기서 setStages(prev => [...prev, restoredStage])로 직접
  // 낙관적 추가를 했는데, createStage 훅 자체에도 이미 onSuccess에 invalidateQueries가
  // 걸려있어 재조회가 먼저 끝나 버리면 "재조회로 이미 반영된 스테이지" 위에 이 낙관적
  // 추가분이 또 쌓여 전형이 중복으로 보이는 버그가 있었음. 로컬 상태를 직접 조작하지
  // 않고 최종 상태 재조회(invalidateQueries)만 믿도록 변경.
  //
  // ⚠️ [QA 반영] 생성 직후 위치 보정을 위해 updateStage를 곧바로(fire-and-forget으로)
  // 이어 호출했더니, 생성 API 자체의 자동 재조회와 겹치면서 방금 만든 스테이지가
  // 일시적으로 "찾을 수 없음"(404 C003)으로 보이는 레이스가 있었음(새로고침하면
  // 정상화됨 — 데이터 손상이 아니라 클라이언트 캐시 타이밍 문제). 각 단계를 await로
  // 완전히 순차 진행해 동시에 여러 요청이 겹치지 않도록 함.
  async function handleUndoDeleteStage(name: string, cards: KanbanCard[], position: number) {
    try {
      const res = await createStageMutation.mutateAsync({ name, position });

      // 스테이지 생성(POST) API에 원래 position을 함께 보내도 실제 응답이 요청한
      // position을 반영하지 않는 경우가 있어(명세 vs 실제 동작 불일치 가능성),
      // 응답 position이 요청과 다르면 스테이지 순서 변경(PATCH) API로 한 번 더
      // 명시적으로 원래 위치로 이동시켜 "삭제 전 위치로 복구"를 보장.
      if (res.position !== position) {
        await updateStageMutation.mutateAsync({ stageId: res.id, position });
      }

      if (cards.length > 0) {
        for (let idx = 0; idx < cards.length; idx++) {
          await moveCardMutation.mutateAsync({ cardId: cards[idx].id, stageId: res.id, position: idx + 1 });
        }
      }
    } catch {
      showToast('error', '되돌리기에 실패했어요.');
      return;
    }
    queryClient.invalidateQueries({ queryKey: kanbanKeys.board() });
  }

  // ⚠️ [QA 반영] 스테이지/마감임박 필터 UI 제거 — PRD 4.2에 칸반 보드용 필터 명세 없음.
  const sortedStages = [...stages].sort((a, b) => a.position - b.position);

  const draftStage: KanbanStage = {
    id: -1,
    name: '',
    position: stages.length + 1,
    isDefault: false,
    cards: [],
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        setActiveDragCard(null);
        setActiveDragWidth(null);
      }}
    >
      <div className="flex h-full min-h-0 flex-1 flex-col">
        <div className="flex h-full w-full flex-1 items-stretch gap-6 overflow-x-auto pb-2 kanban-scroll-x">
          <SortableContext
            items={sortedStages.map((s) => `stage-drag-${s.id}`)}
            strategy={horizontalListSortingStrategy}
          >
            {sortedStages.map((stage) => (
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
          </SortableContext>
          {isAddingStage && (
            <KanbanColumn
              key="draft-stage"
              stage={draftStage}
              isDraft
              draftName={draftName}
              onDraftNameChange={setDraftName}
              onConfirmDraft={handleConfirmDraft}
              onCancelDraft={clearDraft}
            />
          )}
        </div>

        <AddStageButton onClick={handleAddStageClick} />
      </div>

      <DragOverlay>
        {activeDragCard && (
          <div style={activeDragWidth ? { width: activeDragWidth } : undefined} className="cursor-grabbing">
            <KanbanCardContent card={activeDragCard} />
          </div>
        )}
      </DragOverlay>

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
