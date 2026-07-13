'use client';

import { useState } from 'react';
import { CloseIcon } from '@/components/ui/icons';
import { DatePicker } from '@/components/ui/date-picker';

interface AddCardModalProps {
  isOpen: boolean;
  stageId: number;
  onClose: () => void;
  onConfirm: (data: {
    companyName: string;
    jobTitle: string;
    originalUrl: string;
    deadline: string;
    stageId: number;
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

// Figma "지원 내역 추가" 모달(node 49:8042) 스펙 반영.
// PRD v1.4.0: 마감일 설정 필수 팝업 삭제 → 이 모달 자체가 입력 창.
// 4개 필드 전부 필수(*): 회사명 / 공고명 / 공고 링크 / 지원 마감일
// 확인 버튼: 미입력 시 action/primary-disabled(비활성), 전체 입력 시 fill/primary(활성)
// 지원 마감일 필드 우측 캘린더 아이콘 클릭 시 DatePicker 드롭다운 노출.
export function AddCardModal({ isOpen, stageId, onClose, onConfirm }: AddCardModalProps) {
  const [form, setForm] = useState<FormState>({
    companyName: '',
    jobTitle: '',
    originalUrl: '',
    deadline: null,
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
    const deadline = form.deadline!;
    onConfirm({
      companyName: form.companyName.trim(),
      jobTitle: form.jobTitle.trim(),
      originalUrl: form.originalUrl.trim(),
      deadline: `${deadline.getFullYear()}-${String(deadline.getMonth() + 1).padStart(2, '0')}-${String(deadline.getDate()).padStart(2, '0')}`,
      stageId,
    });
    // 폼 초기화
    setForm({ companyName: '', jobTitle: '', originalUrl: '', deadline: null });
    setErrors({});
    setShowDatePicker(false);
  }

  function handleClose() {
    setForm({ companyName: '', jobTitle: '', originalUrl: '', deadline: null });
    setErrors({});
    setShowDatePicker(false);
    onClose();
  }

  const FIELDS: {
    key: keyof FormState;
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

  const deadlineText = form.deadline
    ? `${form.deadline.getFullYear()}.${String(form.deadline.getMonth() + 1).padStart(2, '0')}.${String(form.deadline.getDate()).padStart(2, '0')}`
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-base-dimmed" onClick={handleClose} aria-hidden="true" />

      <div className="relative flex w-[394px] flex-col gap-6 overflow-hidden rounded-[20px] bg-base-white py-6 shadow-spread-small">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-8">
          <p className="text-7 font-semibold text-label-base">지원 내역 추가</p>
          <button type="button" onClick={handleClose} aria-label="닫기" className="text-label-base">
            <CloseIcon size={24} />
          </button>
        </div>

        {/* 폼 필드 */}
        <div className="flex flex-col gap-5 px-8">
          {FIELDS.map(({ key, label, placeholder, type }) => (
            <div key={key} className="flex flex-col gap-2">
              <div className="flex items-center gap-1">
                <p className="text-3 font-semibold text-label-base">{label}</p>
                <p className="font-bold text-status-negative">*</p>
              </div>
              <input
                type={type ?? 'text'}
                value={form[key] as string}
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
                <div className="absolute left-0 top-[calc(100%+8px)] z-10">
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
              isAllFilled ? 'bg-fill-primary' : 'bg-action-primary-disabled cursor-not-allowed'
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
