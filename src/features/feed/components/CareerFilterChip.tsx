'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Modal } from '@/components/ui/modal';
import { FilterTriggerButton } from '@/components/ui/filter-trigger-button';

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

function formatChipLabel(tags: CareerTagId[]): string {
  if (tags.length === 0) return '경력';
  if (tags.length === 1) {
    return `경력 · ${CAREER_TAG_OPTIONS.find((t) => t.id === tags[0])?.label}`;
  }
  return `경력 · ${tags.length}개`;
}

/**
 * 통합 공고 피드의 경력 필터.
 *
 * Figma 재확인(node 133:23476): 슬라이더(신입~15년)에서 태그 다중 선택 방식으로
 * 디자인 변경됨. "전체/경력/신입/경력+신입/외국인 전형" 5개 버튼, 여러 개 동시 선택
 * 가능 (2026-07-24 태영님 확인: 멀티 선택).
 *
 * ⚠️ "외국인 전형"은 API 명세서 career enum(NEW/EXPERIENCED)에 없는 값. 백엔드 확인
 * 전까지 UI 선택은 가능하지만 실제 쿼리 파라미터에는 반영하지 않음 (buildCareerParam 참고).
 */
export function CareerFilterChip({ appliedTags, onApply }: CareerFilterChipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<CareerTagId[]>(appliedTags);

  const openModal = () => {
    setDraft(appliedTags);
    setIsOpen(true);
  };

  const handleApply = () => {
    onApply(draft);
    setIsOpen(false);
  };

  const handleReset = () => {
    setDraft([]);
  };

  const toggleTag = (tagId: CareerTagId) => {
    setDraft((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]));
  };

  return (
    <>
      <FilterTriggerButton onClick={openModal} isActive={isOpen || appliedTags.length > 0}>
        {formatChipLabel(appliedTags)}
      </FilterTriggerButton>

      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="dialog"
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-base-dimmed)]"
            onClick={() => setIsOpen(false)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <Modal
                title="경력"
                onClose={() => setIsOpen(false)}
                primaryLabel={draft.length > 0 ? `${draft.length}개 적용` : '적용'}
                secondaryLabel="초기화"
                onPrimaryClick={handleApply}
                onSecondaryClick={handleReset}
              >
                <div className="flex flex-wrap items-center gap-2 py-4">
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
              </Modal>
            </div>
          </div>,
          document.body
        )}
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
      className={`flex items-center justify-center rounded-lg border bg-base-white px-4 py-2 ${
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
