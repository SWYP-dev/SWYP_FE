'use client';

import { useState } from 'react';
import { EditIcon, TrashIcon } from '@/components/ui/icons';
import { DatePicker } from '@/components/ui/date-picker';
import { formatDeadlineText } from '@/features/kanban/utils/formatDeadline';
import type { DeadlineCardEntry } from '../utils/groupByDeadline';

interface StageOption {
  id: number;
  name: string;
}

interface DeadlineCardProps {
  entry: DeadlineCardEntry;
  isUrgent: boolean;
  isSelected: boolean;
  availableStages: StageOption[];
  onClick: () => void;
  onDelete: () => void;
  onUpdateDeadline: (cardId: number, deadline: string) => void;
  onMoveStage: (cardId: number, stageId: number) => void;
}

function CalendarSmallIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3" width="10" height="9" rx="1.2" stroke="#9E9EA1" strokeWidth="1.2" />
      <path d="M2 5.5h10M4.5 1.5v3M9.5 1.5v3" stroke="#9E9EA1" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 6l4 4 4-4" stroke="#6B6B6E" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckSmallIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 8l3.5 3.5L13 5" stroke="#4C6EF5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseSmallIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 4l8 8M12 4l-8 8" stroke="#9E9EA1" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function parseDeadline(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDeadlineIso(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;
}

// Figma "지원 마감일 메인" Card(node 101:17530 등) 스펙 반영.
//
// ⚠️ [QA 반영] 기존엔 수정 아이콘 클릭 시 회사명·공고명·공고링크·지원마감일 전체를
// 입력받는 별도 모달(EditDeadlineCardModal)을 띄웠는데, 이 모달이 회사명/공고명을
// 안 바꿔도 항상 같이 전송해서 "직접 등록한 카드만 수정 가능"(K010) 에러가 났음.
// 회사명·공고명은 두 유형(직접 등록/피드 등록) 모두 수정 불가 항목으로 확정되어
// 항상 회색 비활성 텍스트로만 표시. 지원 마감일은 인라인 편집, 전형 단계는 카테고리
// 뱃지 클릭 시 드롭다운으로 각각 독립적으로 수정 — 두 API(마감일만 보내는 부분
// 업데이트 / 기존 이동 API moveCard)를 분리 호출해 K010을 회피함.
export function DeadlineCard({
  entry,
  isUrgent,
  isSelected,
  availableStages,
  onClick,
  onDelete,
  onUpdateDeadline,
  onMoveStage,
}: DeadlineCardProps) {
  const { card, stageId, stageName } = entry;

  const [isEditingDeadline, setIsEditingDeadline] = useState(false);
  const [draftDeadline, setDraftDeadline] = useState<Date | null>(parseDeadline(card.deadline));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStageDropdown, setShowStageDropdown] = useState(false);

  function startEditingDeadline(e: React.MouseEvent) {
    e.stopPropagation();
    setDraftDeadline(parseDeadline(card.deadline));
    setIsEditingDeadline(true);
    setShowDatePicker(true);
  }

  function confirmDeadline(e: React.MouseEvent) {
    e.stopPropagation();
    if (draftDeadline) onUpdateDeadline(card.id, formatDeadlineIso(draftDeadline));
    setIsEditingDeadline(false);
    setShowDatePicker(false);
  }

  function cancelDeadlineEdit(e: React.MouseEvent) {
    e.stopPropagation();
    setIsEditingDeadline(false);
    setShowDatePicker(false);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
      className={`flex w-full cursor-pointer items-start gap-1 overflow-hidden rounded-xl border px-4 py-3 transition-colors ${
        isSelected
          ? 'border-neutral-200 bg-neutral-50'
          : 'border-line-secondary bg-base-white hover:bg-neutral-50'
      }`}
    >
      <div className="flex flex-1 items-stretch gap-4">
        <div
          className={`w-2 shrink-0 self-stretch rounded-max ${
            isUrgent ? 'bg-fill-primary' : 'bg-[var(--color-label-base)]'
          }`}
        />

        <div className="flex flex-1 flex-col gap-2 py-1">
          <div className="flex flex-col gap-1">
            <div className="flex flex-col">
              {/* ⚠️ 회사명/공고명은 항상 회색 — 두 유형 모두 수정 불가 확정 */}
              <p className="text-3 font-medium text-neutral-400">{card.companyName}</p>
              <p className="w-full truncate text-5 font-semibold text-neutral-400">
                {card.jobTitle}
              </p>
            </div>

            {/* 지원 마감일 — 인라인 편집 */}
            {isEditingDeadline ? (
              <div className="relative flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <CalendarSmallIcon />
                <button
                  type="button"
                  onClick={() => setShowDatePicker((v) => !v)}
                  className="text-1 font-medium text-label-primary underline"
                >
                  {draftDeadline ? formatDeadlineIso(draftDeadline) : '날짜 선택'}
                </button>
                <button type="button" onClick={confirmDeadline} aria-label="마감일 저장">
                  <CheckSmallIcon />
                </button>
                <button type="button" onClick={cancelDeadlineEdit} aria-label="취소">
                  <CloseSmallIcon />
                </button>
                {showDatePicker && (
                  <div className="absolute left-0 top-[calc(100%+4px)] z-10">
                    <DatePicker
                      value={draftDeadline}
                      onChange={(date) => {
                        setDraftDeadline(date);
                        setShowDatePicker(false);
                      }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <CalendarSmallIcon />
                <span className="text-1 font-medium text-label-description">
                  {formatDeadlineText(card.deadline)}
                </span>
              </div>
            )}
          </div>

          {/* 전형 단계(카테고리) — 클릭 시 드롭다운으로 이동 */}
          <div className="relative w-fit" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setShowStageDropdown((v) => !v)}
              className="inline-flex items-center gap-[2px] rounded-md bg-neutral-200 px-2 py-[2px] text-0 font-medium text-label-body"
            >
              {stageName}
              <ChevronDownIcon />
            </button>
            {showStageDropdown && (
              <div className="absolute left-0 top-[calc(100%+4px)] z-10 w-[140px] overflow-hidden rounded-xl border border-line-secondary bg-base-white p-1 shadow-spread-small">
                {availableStages.map((stage) => (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => {
                      setShowStageDropdown(false);
                      if (stage.id !== stageId) onMoveStage(card.id, stage.id);
                    }}
                    className={`flex h-9 w-full items-center justify-between rounded-lg px-3 text-1 font-medium ${
                      stage.id === stageId
                        ? 'bg-neutral-100 text-label-base'
                        : 'text-label-body hover:bg-neutral-50'
                    }`}
                  >
                    {stage.name}
                    {stage.id === stageId && <CheckSmallIcon />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-start gap-[6px]" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={startEditingDeadline}
          aria-label="지원 마감일 수정"
          className="text-label-base"
        >
          <EditIcon size={16} />
        </button>
        <button type="button" onClick={onDelete} aria-label="삭제" className="text-label-base">
          <TrashIcon size={16} />
        </button>
      </div>
    </div>
  );
}
