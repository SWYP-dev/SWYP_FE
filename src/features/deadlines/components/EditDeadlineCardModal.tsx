'use client';

import { useState } from 'react';
import { CloseIcon } from '@/components/ui/icons';
import { DatePicker } from '@/components/ui/date-picker';
import { Popover, usePopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, type DropdownMenuItem } from '@/components/ui/dropdown-menu';
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
  onConfirm: (data: {
    cardId: number;
    companyName: string;
    jobTitle: string;
    deadline: string;
    stageId: number;
  }) => void;
}

interface FormState {
  companyName: string;
  jobTitle: string;
  stageId: number;
  deadline: Date | null;
}

interface FormErrors {
  companyName?: string;
  jobTitle?: string;
  deadline?: string;
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
  const [errors, setErrors] = useState<FormErrors>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const stageDropdown = usePopoverTrigger<HTMLButtonElement>();

  if (!isOpen || !card) return null;

  const isAllFilled = form.companyName.trim() !== '' && form.jobTitle.trim() !== '' && form.deadline !== null;

  function validate(): boolean {
    const next: FormErrors = {};
    if (!form.companyName.trim() || form.companyName.trim().length < 2) {
      next.companyName = '2자 이상 입력해 주세요.';
    }
    if (!form.jobTitle.trim()) next.jobTitle = '공고명을 입력해 주세요.';
    if (!form.deadline) next.deadline = '지원 마감일을 입력해 주세요.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleConfirm() {
    if (!validate()) return;
    const d = form.deadline!;
    onConfirm({
      cardId: card!.id,
      companyName: form.companyName.trim(),
      jobTitle: form.jobTitle.trim(),
      deadline: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
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

        {/* 폼 */}
        <div className="flex flex-col gap-5 px-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1">
              <p className="text-3 font-semibold text-label-base">회사명</p>
              <p className="font-bold text-status-negative">*</p>
            </div>
            <input
              type="text"
              value={form.companyName}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, companyName: e.target.value }));
                if (errors.companyName) setErrors((prev) => ({ ...prev, companyName: undefined }));
              }}
              placeholder="지원할 회사명을 입력해 주세요."
              className={`w-full rounded-xl border px-4 py-3 text-5 font-medium text-label-base placeholder:text-label-placeholder outline-none ${
                errors.companyName ? 'border-status-negative' : 'border-line-secondary'
              }`}
            />
            {errors.companyName && (
              <p className="text-1 font-medium text-status-negative">{errors.companyName}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1">
              <p className="text-3 font-semibold text-label-base">공고명</p>
              <p className="font-bold text-status-negative">*</p>
            </div>
            <input
              type="text"
              value={form.jobTitle}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, jobTitle: e.target.value }));
                if (errors.jobTitle) setErrors((prev) => ({ ...prev, jobTitle: undefined }));
              }}
              placeholder="채용 공고의 제목을 입력해 주세요."
              className={`w-full rounded-xl border px-4 py-3 text-5 font-medium text-label-base placeholder:text-label-placeholder outline-none ${
                errors.jobTitle ? 'border-status-negative' : 'border-line-secondary'
              }`}
            />
            {errors.jobTitle && (
              <p className="text-1 font-medium text-status-negative">{errors.jobTitle}</p>
            )}
          </div>

          {/* 지원 마감일 */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1">
              <p className="text-3 font-semibold text-label-base">지원 마감일</p>
              <p className="font-bold text-status-negative">*</p>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDatePicker((v) => !v)}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-5 font-medium outline-none ${
                  errors.deadline ? 'border-status-negative' : 'border-line-secondary'
                } ${deadlineText ? 'text-label-base' : 'text-label-placeholder'}`}
              >
                <span>{deadlineText || '서류 접수 마감일을 입력해 주세요.'}</span>
                <CalendarIcon />
              </button>
              {showDatePicker && (
                <div className="absolute bottom-[calc(100%+8px)] left-0 z-10">
                  <DatePicker
                    value={form.deadline}
                    onChange={(date) => {
                      setForm((prev) => ({ ...prev, deadline: date }));
                      setShowDatePicker(false);
                      if (errors.deadline) setErrors((prev) => ({ ...prev, deadline: undefined }));
                    }}
                  />
                </div>
              )}
            </div>
            {errors.deadline && (
              <p className="text-1 font-medium text-status-negative">{errors.deadline}</p>
            )}
          </div>

          {/* 전형 단계 — Figma 그대로 지원 마감일 아래 배치 (사용자 확인 2026-07-23) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1">
              <p className="text-3 font-semibold text-label-base">전형 단계</p>
              <p className="font-bold text-status-negative">*</p>
            </div>
            <button
              ref={stageDropdown.triggerRef}
              type="button"
              onClick={stageDropdown.toggle}
              className="flex w-full items-center justify-between rounded-xl border border-line-secondary px-4 py-3 text-5 font-medium text-label-base outline-none"
            >
              <span>{selectedStageName}</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 10l5 5 5-5" stroke="#9E9EA1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <Popover
              isOpen={stageDropdown.isOpen}
              onClose={stageDropdown.close}
              triggerRef={stageDropdown.triggerRef}
              align="start"
            >
              <DropdownMenu
                items={stageItems}
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
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!isAllFilled}
            className={`flex w-full items-center justify-center rounded-xl py-3 text-5 font-semibold text-base-white transition-colors ${
              isAllFilled
                ? 'bg-fill-primary hover:bg-action-primary-hover'
                : 'bg-action-primary-disabled cursor-not-allowed'
            }`}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="#BDBDC0" strokeWidth="1.5" />
      <path d="M3 10h18M8 3v4M16 3v4" stroke="#BDBDC0" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
