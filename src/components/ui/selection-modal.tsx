'use client';

import { useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useEscapeKey } from '@/lib/hooks/useEscapeKey';

export interface SelectionChildOption {
  id: string;
  label: string;
}

export interface SelectionGroup {
  id: string;
  label: string;
  /** 하위 선택지가 없는 그룹(예: 지역의 "전국", "세종")은 빈 배열 */
  children: SelectionChildOption[];
}

export interface SelectionGroupValue {
  groupId: string;
  /** 빈 배열이면 그룹 전체("OO 전체")를 의미 */
  childIds: string[];
}

// ⚠️ [QA 반영] 기존엔 groupId 1개만 가질 수 있는 단일 객체였음 — 그래서 "서울 전체"를
// 고르고 "충북 전체"를 추가로 고르면 서울 선택이 통째로 사라지는 버그가 있었음.
// 여러 대분류 그룹을 동시에 선택할 수 있도록 배열로 변경.
export type SelectionValue = SelectionGroupValue[];

interface SelectionModalProps {
  title: string;
  groups: SelectionGroup[];
  /** 현재 적용된 값 (모달 열 때 draft 초기값으로 씀) */
  value: SelectionValue | null;
  isOpen: boolean;
  onApply: (value: SelectionValue | null) => void;
  onClose: () => void;
  emptyStateLines: [string, string];
  /**
   * value가 null(아직 아무것도 적용 안 된 상태)일 때 모달을 처음 열면 사용할 기본 draft.
   * 예: 지역 필터는 Figma 초기 화면 기준 "전국"이 기본 선택되어 있어야 함(node 133:23198).
   * "초기화" 버튼도 완전히 빈 상태가 아니라 이 기본값으로 되돌아감.
   */
  defaultValue?: SelectionValue;
  /**
   * 하단 칩에 그룹명을 접두어로 붙일지 여부. 기본 true.
   * 지역은 "중구"·"동구"처럼 여러 시/도에 같은 이름이 있어 접두어가 없으면 구분이 안 되지만,
   * 직군·직무는 직무명만으로 충분해서 false로 넘긴다.
   * ("OO 전체" 칩은 이 값과 무관하게 항상 그룹명을 유지 — "전체"만으로는 어느 그룹인지 알 수 없음)
   */
  includeGroupLabelInChips?: boolean;
}

/**
 * 지역 선택(36:766 등) / 직군·직무 선택(36:905 등) 공용 모달.
 * Figma 확인 사항 (node 133:23198, 초기 화면 기준 재확인):
 * - 왼쪽 그룹은 여러 개를 동시에 선택 가능 (예: 서울 전체 + 충북 전체 동시 적용).
 *   단, 클릭한 그룹은 즉시 선택 목록에 추가되고, 동시에 우측 하위 항목 편집 대상(포커스)이 됨.
 *   이미 선택된 그룹을 다시 클릭하면 선택이 해제됨(토글).
 *   [QA 반영] 기존엔 "선택 유지 + 포커스만 이동"이었으나, 다시 클릭 시 선택 해제를
 *   기대하는 사용자 피드백에 따라 토글 방식으로 변경.
 * - "전국"은 다른 모든 지역 선택과 배타적 — 전국을 고르면 나머지 선택은 전부 해제되고,
 *   반대로 다른 지역을 고르면 전국 선택은 자동 해제됨.
 * - 왼쪽 그룹 목록은 2열 그리드.
 * - 오른쪽은 다중 선택 체크박스, 3열 그리드. "OO 전체"가 항상 첫 줄 — 하위 항목이 없는
 *   그룹(전국/세종 등)도 "OO 전체" 한 줄만 있는 형태로 동일하게 보여줌(빈 화면 X).
 * - 하단 칩 목록은 선택된 모든 그룹을 가로질러 전부 표시 (포커스된 그룹만이 아님).
 * - 하단 초기화/적용 버튼 있음. "초기화"는 defaultValue로 되돌리고, 적용 가능 여부는
 *   draft 또는 기존 적용값(value) 중 하나라도 있으면 활성화 (필터 해제 자체도 "적용"이므로).
 */
export function SelectionModal({
  title,
  groups,
  value,
  isOpen,
  onApply,
  onClose,
  emptyStateLines,
  defaultValue,
  includeGroupLabelInChips = true,
}: SelectionModalProps) {
  // ⚠️ [QA #8 반영] 최초 마운트 시점부터 defaultValue(지역 필터="전국")가 draft에 반영되도록
  // lazy initializer로 변경. 기존엔 열림 전환 effect에만 의존해 초기 렌더 타이밍에 따라
  // "선택 안 된" 상태로 보이는 경우가 있었음.
  const [draft, setDraft] = useState<SelectionValue | null>(() => value ?? defaultValue ?? null);
  const [focusedGroupId, setFocusedGroupId] = useState<string | null>(
    value && value.length > 0 ? value[0].groupId : (defaultValue?.[0]?.groupId ?? null)
  );

  // "닫힘 -> 열림"으로 바뀐 시점을 렌더링 중에 감지해서 draft를 현재 적용값(없으면 기본값)으로 리셋.
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      const initial = value ?? defaultValue ?? null;
      setDraft(initial);
      setFocusedGroupId(initial && initial.length > 0 ? initial[0].groupId : null);
    }
  }

  useEscapeKey(isOpen, onClose);

  if (!isOpen || typeof document === 'undefined') return null;

  const focusedGroup = groups.find((g) => g.id === focusedGroupId) ?? null;
  const focusedGroupValue = draft?.find((gv) => gv.groupId === focusedGroupId);

  const removeGroup = (groupId: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const next = prev.filter((gv) => gv.groupId !== groupId);
      return next.length > 0 ? next : null;
    });
    // ⚠️ [QA 반영] 칩의 X로 그룹을 제거해도 focusedGroupId가 그대로 남아있어
    // 좌측 메뉴의 체크 아이콘이 사라지지 않는 버그 — 제거된 그룹이 포커스 대상이었다면 해제.
    setFocusedGroupId((prev) => (prev === groupId ? null : prev));
  };

  const selectGroup = (group: SelectionGroup) => {
    // [QA 반영] 이미 선택된 그룹을 다시 클릭하면 선택 해제(토글). focusedGroupId 정리는
    // removeGroup 내부에서 처리됨(포커스 대상이 제거되는 그룹이면 함께 초기화).
    const alreadySelected = draft?.some((gv) => gv.groupId === group.id) ?? false;
    if (alreadySelected) {
      removeGroup(group.id);
      return;
    }

    setFocusedGroupId(group.id);
    setDraft((prev) => {
      const list = prev ?? [];
      // "전국"은 다른 모든 선택과 배타적
      if (group.id === 'nationwide') return [{ groupId: 'nationwide', childIds: [] }];
      const withoutNationwide = list.filter((gv) => gv.groupId !== 'nationwide');
      return [...withoutNationwide, { groupId: group.id, childIds: [] }];
    });
  };

  const toggleGroupAll = () => {
    if (!focusedGroup) return;
    const isCurrentlyAll = focusedGroupValue?.childIds.length === 0;
    if (isCurrentlyAll) {
      // 이미 "OO 전체" 상태에서 다시 누르면 그룹 선택 자체를 해제
      removeGroup(focusedGroup.id);
      return;
    }
    setDraft((prev) => {
      const list = prev ?? [];
      const exists = list.some((gv) => gv.groupId === focusedGroup.id);
      const updated = { groupId: focusedGroup.id, childIds: [] };
      return exists
        ? list.map((gv) => (gv.groupId === focusedGroup.id ? updated : gv))
        : [...list, updated];
    });
  };

  const toggleChild = (childId: string) => {
    if (!focusedGroup) return;
    setDraft((prev) => {
      const list = prev ?? [];
      const existing = list.find((gv) => gv.groupId === focusedGroup.id);
      const currentChildIds = existing?.childIds ?? [];
      const isChecked = currentChildIds.includes(childId);
      const nextChildIds = isChecked
        ? currentChildIds.filter((id) => id !== childId)
        : [...currentChildIds, childId];
      const updated = { groupId: focusedGroup.id, childIds: nextChildIds };
      return existing
        ? list.map((gv) => (gv.groupId === focusedGroup.id ? updated : gv))
        : [...list, updated];
    });
  };

  const removeChildChip = (groupId: string, childId: string | null) => {
    if (childId === null) {
      removeGroup(groupId);
      return;
    }
    setDraft((prev) => {
      if (!prev) return prev;
      return prev.map((gv) =>
        gv.groupId === groupId ? { ...gv, childIds: gv.childIds.filter((id) => id !== childId) } : gv
      );
    });
  };

  // 선택된 모든 그룹을 가로질러 칩 생성 (포커스된 그룹만이 아니라 전체)
  const chips: { key: string; label: string; onRemove: () => void }[] = [];
  (draft ?? []).forEach((gv) => {
    const group = groups.find((g) => g.id === gv.groupId);
    if (!group) return;
    if (gv.childIds.length === 0) {
      chips.push({
        key: `${gv.groupId}-all`,
        label: `${group.label} 전체`,
        onRemove: () => removeChildChip(gv.groupId, null),
      });
    } else {
      gv.childIds.forEach((childId) => {
        const child = group.children.find((c) => c.id === childId);
        if (!child) return;
        chips.push({
          key: `${gv.groupId}-${childId}`,
          label: includeGroupLabelInChips ? `${group.label} ${child.label}` : child.label,
          onRemove: () => removeChildChip(gv.groupId, childId),
        });
      });
    }
  });

  const hasSelection = draft !== null && draft.length > 0;
  // 초기화 후에도 적용을 눌러 "필터 해제" 자체를 반영할 수 있어야 하므로,
  // 기존 적용값(value)이 있었다면 draft가 비어도 적용 버튼은 활성 상태 유지.
  const canApply = hasSelection || (value !== null && value.length > 0);

  return createPortal(
    <div
      role="dialog"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-base-dimmed)]"
    >
      <div className="flex w-[1312px] max-w-[1312px] flex-col gap-[var(--spacing-6)] overflow-clip rounded-[var(--spacing-6)] bg-[var(--color-neutral-0)] py-[var(--spacing-7)] shadow-[var(--shadow-spread-small)]">
        <div className="flex items-center justify-between px-[var(--spacing-8)]">
          <p className="text-[length:var(--text-8)] font-semibold leading-[1.4] text-[var(--color-label-base)]">
            {title}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="size-7 text-[var(--color-icon-default)]"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex flex-col items-start gap-5 px-[32px]">
          <div className="flex h-[331px] w-[1248px] items-stretch justify-between rounded-2xl border border-[var(--color-line-secondary)]">
            {/* 좌측: 그룹(복수 선택) — grid-cols-2 */}
            <div className="grid flex-1 grid-cols-2 content-start items-start gap-2 overflow-y-auto border-r border-[var(--color-line-secondary)] p-3">
              {groups.map((group) => {
                const isSelected = draft?.some((gv) => gv.groupId === group.id) ?? false;
                const isFocused = group.id === focusedGroupId;
                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => selectGroup(group)}
                    className={`flex w-full items-center gap-2 rounded-lg px-4 py-3 text-left ${
                      isSelected ? 'bg-[var(--color-fill-primary-light)]' : 'bg-[var(--color-neutral-0)]'
                    }`}
                  >
                    <span
                      className={`flex-1 truncate text-[length:var(--text-3)] leading-[1.5] ${
                        isSelected
                          ? 'font-bold text-[var(--color-label-primary)]'
                          : 'font-medium text-[var(--color-label-base)]'
                      }`}
                    >
                      {group.label}
                    </span>
                    {isFocused && group.children.length > 0 && <ChevronRightIcon />}
                  </button>
                );
              })}
            </div>

            {/* 우측: 하위 항목(다중 선택 체크박스) — 하위 항목이 없는 그룹도 "OO 전체" 한 줄로 표시 */}
            {/* ⚠️ [QA #6 반영] 부모가 items-start라 mx-auto가 동작하지 않아 좌측 정렬돼 보이던 문제.
                빈 상태일 때만 컨테이너를 items-center + justify-center로 전환해 완전히 중앙 정렬. */}
            <div
              className={`w-[868px] overflow-y-auto [scrollbar-gutter:stable] ${
                focusedGroup ? 'pt-10' : 'flex h-full items-center justify-center'
              }`}
            >
              {focusedGroup ? (
                <div className="grid w-full grid-cols-3 content-start items-start">
                  <ChildRow
                    label={`${focusedGroup.label} 전체`}
                    checked={focusedGroupValue?.childIds.length === 0}
                    onToggle={toggleGroupAll}
                    emphasized
                  />
                  {focusedGroup.children.map((child) => (
                    <ChildRow
                      key={child.id}
                      label={child.label}
                      checked={!!focusedGroupValue?.childIds.includes(child.id)}
                      onToggle={() => toggleChild(child.id)}
                    />
                  ))}
                </div>
              ) : (
                <p className="max-w-[420px] whitespace-pre-line text-center text-[length:var(--text-5)] leading-[1.5] text-[var(--color-neutral-700)]">
                  {emptyStateLines.join('\n')}
                </p>
              )}
            </div>
          </div>

          {chips.length > 0 && (
            <div className="flex flex-wrap items-start gap-3">
              {chips.map((chip) => (
                <Chip key={chip.key} label={chip.label} onRemove={chip.onRemove} />
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-[var(--spacing-8)]">
          <button
            type="button"
            onClick={() => {
              const reset = defaultValue ?? null;
              setDraft(reset);
              setFocusedGroupId(reset && reset.length > 0 ? reset[0].groupId : null);
            }}
            className="w-[98px] rounded-[var(--spacing-4)] border border-[var(--color-line-secondary)] py-[var(--spacing-4)] text-[length:var(--text-5)] text-[var(--color-label-base)]"
          >
            초기화
          </button>
          <button
            type="button"
            onClick={() => onApply(draft)}
            disabled={!canApply}
            className={`w-[98px] rounded-[var(--spacing-4)] py-[var(--spacing-4)] text-[length:var(--text-5)] font-semibold text-[var(--color-neutral-0)] ${
              canApply ? 'bg-[var(--color-fill-primary)]' : 'bg-[var(--color-label-primary-disabled)]'
            }`}
          >
            적용
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ⚠️ [QA #4 반영] 여러 개 선택 시 "[가장 먼저 선택한 이름] 외 n개" 형식으로 표시하기 위한
// 공용 헬퍼. includeGroupLabel=false면 하위 항목에 그룹명 접두어를 붙이지 않는다
// (직군·직무처럼 직무명만으로 충분한 경우 사용). 모달 하단 칩과 동일한 규칙.
// "OO 전체"는 이 값과 무관하게 항상 그룹명을 유지 — "전체"만으로는 어느 그룹인지 알 수 없음.
export function getSelectionSummary(
  value: SelectionValue | null,
  groups: SelectionGroup[],
  includeGroupLabel = true
): { firstLabel: string; totalCount: number } | null {
  if (!value || value.length === 0) return null;

  let firstLabel: string | null = null;
  let totalCount = 0;

  for (const gv of value) {
    const group = groups.find((g) => g.id === gv.groupId);
    if (!group) continue;

    if (gv.childIds.length === 0) {
      totalCount += 1;
      if (firstLabel === null) firstLabel = `${group.label} 전체`;
    } else {
      for (const childId of gv.childIds) {
        const child = group.children.find((c) => c.id === childId);
        if (!child) continue;
        totalCount += 1;
        if (firstLabel === null) {
          firstLabel = includeGroupLabel ? `${group.label} ${child.label}` : child.label;
        }
      }
    }
  }

  if (firstLabel === null) return null;
  return { firstLabel, totalCount };
}

function ChildRow({
  label,
  checked,
  onToggle,
  emphasized = false,
}: {
  label: string;
  checked?: boolean;
  onToggle: () => void;
  emphasized?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full min-w-0 items-center gap-3 rounded px-5 py-4 text-left"
    >
      <span
        className={`flex size-[18px] shrink-0 items-center justify-center rounded-[4px] border ${
          checked
            ? 'border-[var(--color-line-primary)] bg-[var(--color-fill-primary)]'
            : 'border-[var(--color-line-secondary)]'
        }`}
      >
        {checked && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path
              d="M2.5 6L5 8.5L9.5 3"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <span
        className={`flex-1 truncate text-[length:var(--text-3)] leading-[1.5] ${
          checked
            ? `text-[var(--color-label-primary)] ${emphasized ? 'font-bold' : 'font-semibold'}`
            : 'font-medium text-[var(--color-label-base)]'
        }`}
      >
        {label}
      </span>
    </button>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-neutral-50)] px-[var(--spacing-3)] py-[6px]">
      <span className="text-[length:var(--text-1)] font-semibold leading-[1.5] text-[var(--color-neutral-600)]">
        {label}
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`${label} 삭제`}
        className="flex size-4 items-center justify-center"
      >
        <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </button>
    </span>
  );
}

function CloseIcon(): ReactNode {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="shrink-0 text-[var(--color-label-primary)]"
    >
      <path
        d="M6 4L10 8L6 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
