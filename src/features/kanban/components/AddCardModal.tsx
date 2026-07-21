'use client';

import { useState } from 'react';
import { CloseIcon } from '@/components/ui/icons';
import { DatePicker } from '@/components/ui/date-picker';
import type { KanbanCard } from '@/types/api';

type ModalMode = 'add' | 'edit';

interface AddCardModalProps {
  isOpen: boolean;
  mode: ModalMode;
  stageId: number;
  /** 수정 모드일 때 기존 카드 데이터 */
  card?: KanbanCard;
  /**
   * 상세 Drawer가 이미 열려있는 상태에서 뜬 모달인지 여부.
   * true면 Drawer가 이미 배경을 딤 처리하고 있으므로 이 모달은 자체 딤을 생략하고
   * Drawer보다 위(z-[60])에만 떠서, 뒤의 상세 정보 패널이 이중 딤으로 안 보이게 되는
   * 문제를 막는다. (지원 마감일 페이지에서 "수정" 클릭 시 Drawer가 사라지는 버그 수정)
   */
  isOverDrawer?: boolean;
  onClose: () => void;
  onConfirm: (data: {
    companyName: string;
    jobTitle: string;
    originalUrl: string;
    deadline: string;
    stageId: number;
    cardId?: number; // 수정 모드일 때만
  }) => void;
}

interface FormState {
  companyName: string;
  jobTitle: string;
  originalUrl: string;
  deadline: Date | null;
}

interface FormErrors {
  companyName?: string;
  jobTitle?: string;
  originalUrl?: string;
  deadline?: string;
}

// Figma "지원 내역 추가"(49:8042) / "지원 내역 수정"(49:8083) 모달 스펙 반영.
// 두 화면이 동일한 4개 필드 구조 + 동일한 레이아웃 → mode prop으로 구분.
// 추가: 전체 빈 상태 → 확인 버튼 비활성(disabled)
// 수정: 기존 값 채워진 상태로 열림 → 확인 버튼 처음부터 활성
export function AddCardModal({
  isOpen,
  mode,
  stageId,
  card,
  isOverDrawer = false,
  onClose,
  onConfirm,
}: AddCardModalProps) {
  const parseDeadline = (iso: string) => {
    const [year, month, day] = iso.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const [form, setForm] = useState<FormState>({
    companyName: card?.companyName ?? '',
    jobTitle: card?.jobTitle ?? '',
    originalUrl: card?.originalUrl ?? '',
    deadline: card?.deadline ? parseDeadline(card.deadline) : null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  if (!isOpen) return null;

  const isAllFilled =
    form.companyName.trim() !== '' &&
    form.jobTitle.trim() !== '' &&
    form.originalUrl.trim() !== '' &&
    form.deadline !== null;

  function validate(): boolean {
    const next: FormErrors = {};
    if (!form.companyName.trim()) next.companyName = '회사명을 입력해 주세요.';
    if (!form.jobTitle.trim()) next.jobTitle = '공고명을 입력해 주세요.';
    if (!form.originalUrl.trim()) next.originalUrl = '공고 링크를 입력해 주세요.';
    if (!form.deadline) next.deadline = '지원 마감일을 입력해 주세요.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleConfirm() {
    if (!validate()) return;
    const d = form.deadline!;
    onConfirm({
      companyName: form.companyName.trim(),
      jobTitle: form.jobTitle.trim(),
      originalUrl: form.originalUrl.trim(),
      deadline: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      stageId,
      cardId: mode === 'edit' ? card?.id : undefined,
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

  const FIELDS: {
    key: keyof Pick<FormState, 'companyName' | 'jobTitle' | 'originalUrl'>;
    label: string;
    placeholder: string;
    type?: string;
  }[] = [
    { key: 'companyName', label: '회사명', placeholder: '지원할 회사명을 입력해 주세요.' },
    { key: 'jobTitle', label: '공고명', placeholder: '채용 공고의 제목을 입력해 주세요.' },
    {
      key: 'originalUrl',
      label: '공고 링크',
      placeholder: '채용 공고로 이동할 링크를 입력해 주세요.',
      type: 'url',
    },
  ];

  return (
    <div className={`fixed inset-0 flex items-center justify-center ${isOverDrawer ? 'z-[60]' : 'z-50'}`}>
      <div
        className={`absolute inset-0 ${isOverDrawer ? '' : 'bg-base-dimmed'}`}
        onClick={handleClose}
        aria-hidden="true"
      />
      <div className="relative flex w-[394px] flex-col gap-6 overflow-visible rounded-[20px] bg-base-white py-6 shadow-spread-small">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-8">
          <p className="text-7 font-semibold text-label-base">
            {mode === 'add' ? '지원 내역 추가' : '지원 내역 수정'}
          </p>
          <button type="button" onClick={handleClose} aria-label="닫기" className="text-label-base">
            <CloseIcon size={24} />
          </button>
        </div>

        {/* 폼 */}
        <div className="flex flex-col gap-5 px-8">
          {FIELDS.map(({ key, label, placeholder, type }) => (
            <div key={key} className="flex flex-col gap-2">
              <div className="flex items-center gap-1">
                <p className="text-3 font-semibold text-label-base">{label}</p>
                <p className="font-bold text-status-negative">*</p>
              </div>
              <input
                type={type ?? 'text'}
                value={form[key]}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, [key]: e.target.value }));
                  if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
                }}
                placeholder={placeholder}
                className={`w-full rounded-xl border px-4 py-3 text-5 font-medium text-label-base placeholder:text-label-placeholder outline-none ${
                  errors[key] ? 'border-status-negative' : 'border-line-secondary'
                }`}
              />
              {errors[key] && (
                <p className="text-1 font-medium text-status-negative">{errors[key]}</p>
              )}
            </div>
          ))}

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
