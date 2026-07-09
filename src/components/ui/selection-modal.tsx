'use client';

import { useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export interface SelectionChildOption {
  id: string;
  label: string;
}

export interface SelectionGroup {
  id: string;
  label: string;
  /** 하위 선택지가 없는 그룹(예: 지역의 "전국")은 빈 배열 */
  children: SelectionChildOption[];
}

export interface SelectionValue {
  groupId: string;
  /** 빈 배열이면 그룹 전체("OO 전체")를 의미 */
  childIds: string[];
}

interface SelectionModalProps {
  title: string;
  groups: SelectionGroup[];
  /** 현재 적용된 값 (모달 열 때 draft 초기값으로 씀) */
  value: SelectionValue | null;
  isOpen: boolean;
  onApply: (value: SelectionValue | null) => void;
  onClose: () => void;
  emptyStateLines: [string, string];
}

/**
 * 지역 선택(36:766 등) / 직군·직무 선택(36:905 등) 공용 모달.
 * Figma 확인 사항:
 * - 왼쪽 그룹은 단일 선택. 그룹 클릭 시 해당 그룹의 "전체"가 기본 선택됨.
 * - 오른쪽은 다중 선택 체크박스. "OO 전체"가 항상 첫 줄.
 * - 다른 그룹으로 전환하면 이전 그룹 선택은 사라짐 (그룹은 항상 1개만 활성).
 * - 하단 초기화/적용 버튼 있음. 선택 없으면 적용 비활성(label/primary-disabled).
 *
 * ⚠️ X 아이콘, 체크 아이콘은 Figma 임시 asset URL(7일 만료)이라 인라인 SVG로 대체.
 */
export function SelectionModal({
  title,
  groups,
  value,
  isOpen,
  onApply,
  onClose,
  emptyStateLines,
}: SelectionModalProps) {
  const [draft, setDraft] = useState<SelectionValue | null>(value);

  // "닫힘 -> 열림"으로 바뀐 시점을 렌더링 중에 감지해서 draft를 현재 적용값으로 리셋.
  // effect 안에서 동기적으로 setState를 호출하면 cascading render를 유발할 수 있어
  // react-hooks/set-state-in-effect 규칙에 걸리므로, React가 권장하는
  // "렌더링 중 상태 조정" 패턴을 씀 (popover.tsx와 동일한 이유/동일한 해법).
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) setDraft(value);
  }

  if (!isOpen || typeof document === 'undefined') return null;

  const activeGroup = groups.find((g) => g.id === draft?.groupId);

  const selectGroup = (group: SelectionGroup) => {
    // 그룹 전환 시 이전 그룹 선택은 버리고 새 그룹의 "전체"로 시작
    setDraft({ groupId: group.id, childIds: [] });
  };

  const toggleGroupAll = () => {
    if (!activeGroup) return;
    setDraft({ groupId: activeGroup.id, childIds: [] });
  };

  const toggleChild = (childId: string) => {
    if (!activeGroup || !draft) return;
    const isChecked = draft.childIds.includes(childId);
    const nextChildIds = isChecked
      ? draft.childIds.filter((id) => id !== childId)
      : [...draft.childIds, childId];
    setDraft({ groupId: activeGroup.id, childIds: nextChildIds });
  };

  const removeChip = (childId: string | null) => {
    if (!activeGroup || !draft) return;
    if (childId === null) {
      // "OO 전체" 칩 삭제 = 선택 자체를 비움
      setDraft(null);
      return;
    }
    setDraft({ groupId: activeGroup.id, childIds: draft.childIds.filter((id) => id !== childId) });
  };

  const chips: { key: string; label: string; onRemove: () => void }[] = [];
  if (draft && activeGroup) {
    if (draft.childIds.length === 0) {
      chips.push({
        key: 'all',
        label: `${activeGroup.label} 전체`,
        onRemove: () => removeChip(null),
      });
    } else {
      draft.childIds.forEach((childId) => {
        const child = activeGroup.children.find((c) => c.id === childId);
        if (!child) return;
        chips.push({
          key: childId,
          label: `${activeGroup.label} ${child.label}`,
          onRemove: () => removeChip(childId),
        });
      });
    }
  }

  const hasSelection = draft !== null;

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
            className="size-6 text-[var(--color-icon-default)]"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex flex-col items-start gap-5 px-[32px]">
          <div className="flex h-[331px] w-[1248px] items-stretch justify-between rounded-2xl border border-[var(--color-line-secondary)]">
            {/* 좌측: 그룹(단일 선택) */}
            <div className="flex flex-1 flex-wrap content-start items-start gap-x-0 gap-y-0 overflow-y-auto border-r border-[var(--color-line-secondary)] px-2 pt-2">
              {groups.map((group) => {
                const isActive = group.id === draft?.groupId;
                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => selectGroup(group)}
                    className={`flex h-10 w-[184px] items-center gap-2 rounded-lg px-4 py-3 text-left ${
                      isActive
                        ? 'bg-[var(--color-fill-primary-light)]'
                        : 'bg-[var(--color-neutral-0)]'
                    }`}
                  >
                    <span
                      className={`flex-1 truncate text-[length:var(--text-3)] leading-[1.5] ${
                        isActive
                          ? 'font-bold text-[var(--color-label-primary)]'
                          : 'font-medium text-[var(--color-label-base)]'
                      }`}
                    >
                      {group.label}
                    </span>
                    {isActive && <CheckIcon />}
                  </button>
                );
              })}
            </div>

            {/* 우측: 하위 항목(다중 선택 체크박스) */}
            <div className="flex w-[868px] flex-col items-start overflow-y-auto pt-10">
              {activeGroup && activeGroup.children.length > 0 ? (
                <div className="flex flex-wrap content-start items-start">
                  <ChildRow
                    label={`${activeGroup.label} 전체`}
                    checked={draft?.childIds.length === 0}
                    onToggle={toggleGroupAll}
                    emphasized
                  />
                  {activeGroup.children.map((child) => (
                    <ChildRow
                      key={child.id}
                      label={child.label}
                      checked={!!draft?.childIds.includes(child.id)}
                      onToggle={() => toggleChild(child.id)}
                    />
                  ))}
                </div>
              ) : (
                <p className="mx-auto max-w-[420px] whitespace-pre-line text-center text-[length:var(--text-5)] leading-[1.5] text-[var(--color-neutral-700)]">
                  {emptyStateLines.join('\n')}
                </p>
              )}
            </div>
          </div>

          {chips.length > 0 && (
            <div className="flex flex-wrap items-start gap-2">
              {chips.map((chip) => (
                <Chip key={chip.key} label={chip.label} onRemove={chip.onRemove} />
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-[var(--spacing-8)]">
          <button
            type="button"
            onClick={() => setDraft(null)}
            className="w-[98px] rounded-[var(--spacing-4)] border border-[var(--color-line-secondary)] py-[var(--spacing-4)] text-[length:var(--text-5)] text-[var(--color-label-base)]"
          >
            초기화
          </button>
          <button
            type="button"
            onClick={() => onApply(draft)}
            disabled={!hasSelection}
            className={`w-[98px] rounded-[var(--spacing-4)] py-[var(--spacing-4)] text-[length:var(--text-5)] font-semibold text-[var(--color-neutral-0)] ${
              hasSelection
                ? 'bg-[var(--color-fill-primary)]'
                : 'bg-[var(--color-label-primary-disabled)]'
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

function ChildRow({
  label,
  checked,
  onToggle,
  emphasized = false,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
  emphasized?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex h-10 w-[289.333px] items-center gap-2 rounded px-4 py-3 text-left"
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
    <span className="inline-flex items-center gap-1 rounded-lg bg-[var(--color-neutral-50)] px-[var(--spacing-3)] py-[6px]">
      <span className="text-[11px] font-semibold leading-[1.5] text-[var(--color-neutral-600)]">
        {label}
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`${label} 삭제`}
        className="flex size-3 items-center justify-center"
      >
        <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path
            d="M3 3L9 9M9 3L3 9"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </span>
  );
}

function CloseIcon(): ReactNode {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 6L18 18M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M4 9L7.5 12.5L14 5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
