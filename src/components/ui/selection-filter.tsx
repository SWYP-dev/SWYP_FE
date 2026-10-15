'use client';

import { useState } from 'react';
import { Popover, usePopoverTrigger } from '@/components/ui/popover';
import { FilterSegment } from '@/components/ui/filter-segment';

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

interface SelectionFilterProps {
  /** 세그먼트 윗줄 라벨 (예: "지역", "직군 · 직무") */
  label: string;
  groups: SelectionGroup[];
  /** 현재 적용된 값 (드롭다운을 열 때 draft 초기값으로 씀) */
  value: SelectionValue | null;
  onApply: (value: SelectionValue | null) => void;
  emptyStateLines: [string, string];
  /**
   * value가 null(아직 아무것도 적용 안 된 상태)일 때 드롭다운을 처음 열면 사용할 기본 draft.
   * 예: 지역 필터는 Figma 초기 화면 기준 "전국"이 기본 선택되어 있어야 함(node 133:23198).
   * "초기화" 버튼도 완전히 빈 상태가 아니라 이 기본값으로 되돌아감.
   */
  defaultValue?: SelectionValue;
  /**
   * 세그먼트 값 텍스트에 그룹명을 접두어로 붙일지 여부. 기본 true.
   * 지역은 "중구"·"동구"처럼 여러 시/도에 같은 이름이 있어 접두어가 없으면 구분이 안 되지만,
   * 직군·직무는 직무명만으로 충분해서 false로 넘긴다.
   * ("OO 전체"는 이 값과 무관하게 항상 그룹명을 유지 — "전체"만으로는 어느 그룹인지 알 수 없음)
   */
  includeGroupLabel?: boolean;
}

function isSameValue(a: SelectionValue | null, b: SelectionValue | null): boolean {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

/**
 * 지역(36:766 등) / 직군·직무(36:905 등) 공용 필터 — FilterBar 안의 세그먼트 + 그 아래 드롭다운.
 * 기존 SelectionModal(전체 화면 모달)을 드롭다운으로 바꾼 것으로, 선택 규칙은 그대로다:
 * - 왼쪽 그룹은 여러 개를 동시에 선택 가능 (예: 서울 전체 + 충북 전체 동시 적용).
 *   클릭한 그룹은 즉시 선택 목록에 추가되고, 동시에 우측 하위 항목 편집 대상(포커스)이 됨.
 *   이미 선택된 그룹을 다시 클릭하면 선택이 해제됨(토글).
 * - "전국"은 다른 모든 지역 선택과 배타적 — 전국을 고르면 나머지 선택은 전부 해제되고,
 *   반대로 다른 지역을 고르면 전국 선택은 자동 해제됨.
 * - 오른쪽은 다중 선택 체크박스. "OO 전체"가 항상 첫 줄 — 하위 항목이 없는 그룹(전국/세종 등)도
 *   "OO 전체" 한 줄만 있는 형태로 동일하게 보여줌(빈 화면 X).
 * - 하단 초기화/적용 버튼. "초기화"는 defaultValue로 되돌리고, 적용 가능 여부는
 *   draft 또는 기존 적용값(value) 중 하나라도 있으면 활성화 (필터 해제 자체도 "적용"이므로).
 * - 드롭다운 바깥을 클릭하거나 Escape를 눌러 닫으면 선택 중이던 내용이 그대로 적용된다(QA-002).
 */
export function SelectionFilter({
  label,
  groups,
  value,
  onApply,
  emptyStateLines,
  defaultValue,
  includeGroupLabel = true,
}: SelectionFilterProps) {
  const { isOpen, triggerRef, open, close } = usePopoverTrigger<HTMLButtonElement>();

  // ⚠️ [QA #8 반영] 최초 마운트 시점부터 defaultValue(지역 필터="전국")가 draft에 반영되도록
  // lazy initializer 사용.
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

  const summary = getSelectionSummary(value, groups, includeGroupLabel);
  const valueText =
    summary === null
      ? '전체'
      : summary.totalCount === 1
        ? summary.firstLabel
        : `${summary.firstLabel} 외 ${summary.totalCount - 1}개`;

  // 바깥 클릭/Escape/같은 세그먼트 재클릭으로 닫을 때: 선택 중이던 내용을 그대로 적용한다.
  // 건드린 게 없으면(draft가 열 때와 같으면) 적용하지 않아, 열었다 닫는 것만으로 필터 상태가 바뀌지 않는다.
  function handleDismiss() {
    if (!isSameValue(draft, value ?? defaultValue ?? null)) onApply(draft);
    close();
  }

  const focusedGroup = groups.find((g) => g.id === focusedGroupId) ?? null;
  const focusedGroupValue = draft?.find((gv) => gv.groupId === focusedGroupId);

  const removeGroup = (groupId: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const next = prev.filter((gv) => gv.groupId !== groupId);
      return next.length > 0 ? next : null;
    });
    // ⚠️ [QA 반영] 제거된 그룹이 포커스 대상이었다면 포커스도 해제 (좌측 체크 아이콘이 남는 버그 방지).
    setFocusedGroupId((prev) => (prev === groupId ? null : prev));
  };

  const selectGroup = (group: SelectionGroup) => {
    // [QA 반영] 이미 선택된 그룹을 다시 클릭하면 선택 해제(토글).
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

  const hasSelection = draft !== null && draft.length > 0;
  // 초기화 후에도 적용을 눌러 "필터 해제" 자체를 반영할 수 있어야 하므로,
  // 기존 적용값(value)이 있었다면 draft가 비어도 적용 버튼은 활성 상태 유지.
  const canApply = hasSelection || (value !== null && value.length > 0);

  return (
    <>
      <FilterSegment
        ref={triggerRef}
        label={label}
        valueText={valueText}
        isApplied={value !== null}
        isOpen={isOpen}
        onClick={isOpen ? handleDismiss : open}
      />

      <Popover isOpen={isOpen} onClose={handleDismiss} triggerRef={triggerRef} align="start">
        <div className="flex w-[520px] flex-col gap-[var(--spacing-4)] overflow-clip rounded-[var(--radius-xl)] border border-[var(--color-line-secondary)] bg-[var(--color-base-white)] p-[var(--spacing-4)] shadow-[var(--shadow-spread-small)]">
          <div className="flex h-[320px] items-stretch rounded-[var(--radius-lg)] border border-[var(--color-line-secondary)]">
            {/* 좌측: 그룹(복수 선택) */}
            <div className="flex w-[180px] shrink-0 flex-col gap-1 overflow-y-auto border-r border-[var(--color-line-secondary)] p-[var(--spacing-3)]">
              {groups.map((group) => {
                const isSelected = draft?.some((gv) => gv.groupId === group.id) ?? false;
                const isFocused = group.id === focusedGroupId;
                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => selectGroup(group)}
                    className={`flex w-full shrink-0 items-center gap-2 rounded-lg px-4 py-3 text-left ${
                      isSelected
                        ? 'bg-[var(--color-fill-primary-light)]'
                        : 'bg-[var(--color-neutral-0)] hover:bg-[var(--color-neutral-50)]'
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
            <div
              className={`min-w-0 flex-1 overflow-y-auto [scrollbar-gutter:stable] ${
                focusedGroup ? 'p-[var(--spacing-3)]' : 'flex items-center justify-center'
              }`}
            >
              {focusedGroup ? (
                <div className="grid grid-cols-2 content-start items-start">
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
                <p className="whitespace-pre-line text-center text-[length:var(--text-3)] leading-[1.5] text-[var(--color-neutral-700)]">
                  {emptyStateLines.join('\n')}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-[var(--spacing-3)]">
            <button
              type="button"
              onClick={() => {
                const reset = defaultValue ?? null;
                setDraft(reset);
                setFocusedGroupId(reset && reset.length > 0 ? reset[0].groupId : null);
              }}
              className="flex-1 rounded-[var(--radius-lg)] border border-[var(--color-line-secondary)] py-[var(--spacing-4)] text-[length:var(--text-3)] font-medium text-[var(--color-label-base)]"
            >
              초기화
            </button>
            <button
              type="button"
              onClick={() => {
                onApply(draft);
                close();
              }}
              disabled={!canApply}
              className={`flex-1 rounded-[var(--radius-lg)] py-[var(--spacing-4)] text-[length:var(--text-3)] font-semibold text-[var(--color-neutral-0)] ${
                canApply
                  ? 'bg-[var(--color-fill-primary)]'
                  : 'cursor-not-allowed bg-[var(--color-label-primary-disabled)]'
              }`}
            >
              적용
            </button>
          </div>
        </div>
      </Popover>
    </>
  );
}

// ⚠️ [QA #4 반영] 여러 개 선택 시 "[가장 먼저 선택한 이름] 외 n개" 형식으로 표시하기 위한
// 공용 헬퍼. includeGroupLabel=false면 하위 항목에 그룹명 접두어를 붙이지 않는다
// (직군·직무처럼 직무명만으로 충분한 경우 사용).
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
      className="flex w-full min-w-0 items-center gap-3 rounded px-3 py-3 text-left"
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
