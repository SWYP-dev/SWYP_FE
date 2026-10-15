'use client';

import { useState } from 'react';
import { Popover, usePopoverTrigger } from '@/components/ui/popover';
import { FilterSegment } from '@/components/ui/filter-segment';

export type CareerTagId = 'EXPERIENCED' | 'NEW' | 'BOTH' | 'FOREIGN';

interface CareerTagOption {
  id: CareerTagId;
  label: string;
}

// Figma "경력" 필터 모달(node 133:23476) 태그 순서 그대로.
const CAREER_TAG_OPTIONS: CareerTagOption[] = [
  { id: 'EXPERIENCED', label: '경력' },
  { id: 'NEW', label: '신입' },
  { id: 'BOTH', label: '경력 + 신입' },
  { id: 'FOREIGN', label: '외국인 전형' },
];

interface CareerFilterChipProps {
  /** URL 쿼리와 동기화된, 실제 적용 중인 태그 집합. 빈 배열 = "전체" */
  appliedTags: CareerTagId[];
  onApply: (tags: CareerTagId[]) => void;
}

function formatValueText(tags: CareerTagId[]): string {
  if (tags.length === 0) return '전체';
  const firstLabel = CAREER_TAG_OPTIONS.find((t) => t.id === tags[0])?.label ?? '';
  if (tags.length === 1) {
    return firstLabel;
  }
  return `${firstLabel} 외 ${tags.length - 1}개`;
}

function isSameTags(a: CareerTagId[], b: CareerTagId[]): boolean {
  return a.length === b.length && a.every((tag) => b.includes(tag));
}

/**
 * 통합 공고 피드의 경력 필터 — FilterBar 안의 세그먼트 + 그 아래 드롭다운.
 *
 * Figma 재확인(node 133:23476): 슬라이더(신입~15년)에서 태그 다중 선택 방식으로
 * 디자인 변경됨. "전체/경력/신입/경력+신입/외국인 전형" 5개 버튼, 여러 개 동시 선택
 * 가능 (2026-07-24 태영님 확인: 멀티 선택).
 * 드롭다운 바깥을 클릭하거나 Escape를 눌러 닫으면 선택 중이던 내용이 그대로 적용된다(QA-002).
 *
 * ⚠️ "외국인 전형"은 API 명세서 career enum(NEW/EXPERIENCED)에 없는 값. 백엔드 확인 전까지
 * UI 선택은 가능하지만 실제 쿼리 파라미터에는 반영하지 않음 (buildCareerParam 참고).
 */
export function CareerFilterChip({ appliedTags, onApply }: CareerFilterChipProps) {
  const { isOpen, triggerRef, open, close } = usePopoverTrigger<HTMLButtonElement>();
  const [draft, setDraft] = useState<CareerTagId[]>(appliedTags);

  // "닫힘 -> 열림"으로 바뀐 시점을 렌더링 중에 감지해서 draft를 현재 적용값으로 리셋.
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) setDraft(appliedTags);
  }

  // 바깥 클릭/Escape/같은 세그먼트 재클릭으로 닫을 때: 선택 중이던 내용을 그대로 적용한다.
  // 건드린 게 없으면 적용하지 않아, 열었다 닫는 것만으로 필터 상태가 바뀌지 않는다.
  const handleDismiss = () => {
    if (!isSameTags(draft, appliedTags)) onApply(draft);
    close();
  };

  const handleApply = () => {
    onApply(draft);
    close();
  };

  const toggleTag = (tagId: CareerTagId) => {
    setDraft((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]));
  };

  return (
    <>
      <FilterSegment
        ref={triggerRef}
        label="경력"
        valueText={formatValueText(appliedTags)}
        isApplied={appliedTags.length > 0}
        isOpen={isOpen}
        onClick={isOpen ? handleDismiss : open}
      />

      <Popover isOpen={isOpen} onClose={handleDismiss} triggerRef={triggerRef} align="start">
        <div className="flex w-[360px] flex-col gap-[var(--spacing-5)] rounded-[var(--radius-xl)] border border-[var(--color-line-secondary)] bg-[var(--color-base-white)] p-[var(--spacing-4)] shadow-[var(--shadow-spread-small)]">
          <div className="flex flex-wrap items-center gap-3">
            <TagButton label="전체" isActive={draft.length === 0} onClick={() => setDraft([])} />
            {CAREER_TAG_OPTIONS.map((tag) => (
              <TagButton
                key={tag.id}
                label={tag.label}
                isActive={draft.includes(tag.id)}
                onClick={() => toggleTag(tag.id)}
              />
            ))}
          </div>

          <div className="flex items-center gap-[var(--spacing-3)]">
            <button
              type="button"
              onClick={() => setDraft([])}
              className="flex-1 rounded-[var(--radius-lg)] border border-[var(--color-line-secondary)] py-[var(--spacing-4)] text-[length:var(--text-3)] font-medium text-[var(--color-label-base)]"
            >
              초기화
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 rounded-[var(--radius-lg)] bg-[var(--color-fill-primary)] py-[var(--spacing-4)] text-[length:var(--text-3)] font-semibold text-[var(--color-neutral-0)]"
            >
              {draft.length > 0 ? `${draft.length}개 적용` : '적용'}
            </button>
          </div>
        </div>
      </Popover>
    </>
  );
}

function TagButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center rounded-lg border bg-base-white px-4 py-3 ${
        isActive ? 'border-line-primary text-label-primary' : 'border-line-secondary text-label-body'
      }`}
    >
      <span className="text-3 font-medium">{label}</span>
    </button>
  );
}

// 태그 선택 결과 → API `career` 쿼리 파라미터(콤마 구분) 변환.
// BOTH는 NEW+EXPERIENCED 코드를 모두 포함, FOREIGN은 API 미지원이라 제외(TODO: 백엔드 확인 후 반영).
export function buildCareerParam(tags: CareerTagId[]): string | undefined {
  const codes = new Set<string>();
  tags.forEach((tag) => {
    if (tag === 'NEW') codes.add('NEW');
    if (tag === 'EXPERIENCED') codes.add('EXPERIENCED');
    if (tag === 'BOTH') {
      codes.add('NEW');
      codes.add('EXPERIENCED');
    }
  });
  return codes.size > 0 ? Array.from(codes).join(',') : undefined;
}
