'use client';

import { useState } from 'react';
import { CloseIcon } from '@/components/ui/icons';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';
import { Popover, usePopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, type DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useEscapeKey } from '@/lib/hooks/useEscapeKey';
import type { KanbanCard, KanbanStage } from '@/types/api';

interface EditDeadlineCardModalProps {
  isOpen: boolean;
  card?: KanbanCard;
  /** 현재 카드가 속한 전형 단계 — 폼의 "전형 단계" 초기값 */
  currentStageId: number;
  stages: KanbanStage[];
  /**
   * 상세 Drawer가 이미 열려있는 상태에서 뜬 모달인지 여부.
   * true면 Drawer가 이미 배경을 딤 처리하고 있으므로 이 모달은 자체 딤을 생략하고
   * Drawer보다 위(z-[60])에만 떠서, 뒤의 상세 정보 패널이 이중 딤으로 안 보이게 되는
   * 문제를 막는다.
   */
  isOverDrawer?: boolean;
  onClose: () => void;
  // 상시채용 이슈 대응: 마감일 미입력 시 null(상시채용)로 전송.
  onConfirm: (data: { cardId: number; deadline: string | null; stageId: number }) => void;
}

interface FormState {
  companyName: string;
  jobTitle: string;
  stageId: number;
  deadline: Date | null;
}

// Figma "지원 마감일 수정"(node 101:17631) 스펙 반영.
// 칸반 보드의 AddCardModal(mode=edit)과 달리 "공고 링크" 필드는 없고, 대신 이 카드가
// 속한 "전형 단계"를 선택/변경하는 필드가 들어간다 — 지원 마감일 페이지에서는 원본
// 공고 링크 편집이 필요 없고, 전형 단계 확인·이동이 핵심 액션이기 때문.
export function EditDeadlineCardModal({
  isOpen,
  card,
  currentStageId,
  stages,
  isOverDrawer = false,
  onClose,
  onConfirm,
}: EditDeadlineCardModalProps) {
  const parseDeadline = (iso: string) => {
    const [year, month, day] = iso.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const [form, setForm] = useState<FormState>({
    companyName: card?.companyName ?? '',
    jobTitle: card?.jobTitle ?? '',
    stageId: currentStageId,
    deadline: card?.deadline ? parseDeadline(card.deadline) : null,
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const stageDropdown = usePopoverTrigger<HTMLButtonElement>();

  useEscapeKey(isOpen, () => {
    setShowDatePicker(false);
    onClose();
  });

  if (!isOpen || !card) return null;

  function handleConfirm() {
    const d = form.deadline;
    onConfirm({
      cardId: card!.id,
      // 상시채용 이슈 대응: 마감일을 선택하지 않으면 null(상시채용)로 전송.
      deadline: d
        ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        : null,
      stageId: form.stageId,
    });
  }

  function handleClose() {
    setShowDatePicker(false);
    onClose();
  }

  // Figma 마감일 표시 형식: "2026. 7. 2"
  const deadlineText = form.deadline
    ? `${form.deadline.getFullYear()}. ${form.deadline.getMonth() + 1}. ${form.deadline.getDate()}`
    : '';

  const stageItems: DropdownMenuItem[] = stages.map((s) => ({ label: s.name }));
  const selectedStageName = stages.find((s) => s.id === form.stageId)?.name ?? '';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div
        className={`absolute inset-0 ${isOverDrawer ? '' : 'bg-base-dimmed'}`}
        onClick={handleClose}
        aria-hidden="true"
      />
      <div className="relative flex w-[394px] flex-col gap-6 overflow-visible rounded-[20px] bg-base-white py-6 shadow-spread-small">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-8">
          <p className="text-7 font-semibold text-label-base">지원 마감일 수정</p>
          <button type="button" onClick={handleClose} aria-label="닫기" className="text-label-base">
            <CloseIcon size={24} />
          </button>
        </div>

        {/* 폼 — Figma FieldGroup gap-6(20px), Label-Input gap-3(8px) */}
        <div className="flex flex-col gap-6 px-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <p className="text-3 font-semibold text-label-base">회사명</p>
            </div>
            <input
              type="text"
              value={form.companyName}
              disabled
              readOnly
              className={`${INPUT_CLASS} cursor-not-allowed border-line-secondary bg-neutral-100 text-neutral-400`}
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <p className="text-3 font-semibold text-label-base">공고명</p>
            </div>
            <input
              type="text"
              value={form.jobTitle}
              disabled
              readOnly
              className={`${INPUT_CLASS} cursor-not-allowed border-line-secondary bg-neutral-100 text-neutral-400`}
            />
          </div>

          {/* 지원 마감일 */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <p className="text-3 font-semibold text-label-base">지원 마감일</p>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDatePicker((v) => !v)}
                className={`${FIELD_TRIGGER_CLASS} border-line-secondary ${
                  deadlineText ? 'text-label-base' : 'text-label-placeholder'
                }`}
              >
                <span>{deadlineText || '입력하지 않으면 상시채용으로 등록돼요.'}</span>
                <span className="flex items-center gap-2">
                  {deadlineText && (
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label="지원 마감일 지우기(상시채용으로 전환)"
                      onClick={(e) => {
                        e.stopPropagation();
                        setForm((prev) => ({ ...prev, deadline: null }));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.stopPropagation();
                          setForm((prev) => ({ ...prev, deadline: null }));
                        }
                      }}
                      className="text-label-description hover:text-label-body"
                    >
                      <ClearIcon />
                    </span>
                  )}
                  <CalendarIcon />
                </span>
              </button>
              {showDatePicker && (
                <div className="absolute bottom-[calc(100%+8px)] left-0 z-10">
                  <DatePicker
                    value={form.deadline}
                    onChange={(date) => {
                      setForm((prev) => ({ ...prev, deadline: date }));
                      setShowDatePicker(false);
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* 전형 단계 — Figma 그대로 지원 마감일 아래 배치 (사용자 확인 2026-07-23) */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <p className="text-3 font-semibold text-label-base">전형 단계</p>
              <p className="text-3 font-bold text-status-negative">*</p>
            </div>
            <button
              ref={stageDropdown.triggerRef}
              type="button"
              onClick={stageDropdown.toggle}
              className={`${FIELD_TRIGGER_CLASS} border-line-secondary text-label-base`}
            >
              <span>{selectedStageName}</span>
              <ChevronDownIcon />
            </button>
            <Popover
              isOpen={stageDropdown.isOpen}
              onClose={stageDropdown.close}
              triggerRef={stageDropdown.triggerRef}
              align="start"
            >
              <DropdownMenu
                items={stageItems}
                selectedIndex={stages.findIndex((s) => s.id === form.stageId)}
                className="w-[330px]"
                onSelect={(_, index) => {
                  setForm((prev) => ({ ...prev, stageId: stages[index].id }));
                  stageDropdown.close();
                }}
              />
            </Popover>
          </div>
        </div>

        {/* 푸터 */}
        <div className="px-8">
          <Button variant="primary" size="lg" onClick={handleConfirm} className="w-full">
            확인
          </Button>
        </div>
      </div>
    </div>
  );
}

function ClearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 text-icon-default"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M3 10h18M8 3v4M16 3v4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 text-icon-default"
      aria-hidden="true"
    >
      <path
        d="M7 10l5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Figma Input(node 101:17631) — h-10(48px) + px-5(16px), border-box로 border 포함
const INPUT_CLASS =
  'h-10 box-border w-full rounded-xl border px-5 text-5 font-medium text-label-base placeholder:text-label-placeholder outline-none';

const FIELD_TRIGGER_CLASS =
  'flex h-10 box-border w-full items-center justify-between rounded-xl border px-5 text-5 font-medium outline-none';
