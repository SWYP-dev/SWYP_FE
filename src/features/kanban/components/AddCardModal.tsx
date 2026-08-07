'use client';

import { useState } from 'react';
import { CloseIcon } from '@/components/ui/icons';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';
import { useEscapeKey } from '@/lib/hooks/useEscapeKey';
import type { KanbanCard } from '@/types/api';

type ModalMode = 'add' | 'edit';

interface AddCardModalProps {
  isOpen: boolean;
  mode: ModalMode;
  stageId: number;
  card?: KanbanCard;
  isOverDrawer?: boolean;
  onClose: () => void;
  /**
   * ⚠️ [QA 반영] 서버 검증 실패(K011~K021)를 모달 내 인라인 에러로 보여주기 위해
   * Promise<FormErrors | undefined>로 변경. undefined 반환 시 성공으로 간주하고
   * 부모가 모달을 닫음. FormErrors 반환 시 모달은 열린 채로 해당 필드에 에러 표시.
   */
  onConfirm: (data: {
    companyName: string;
    jobTitle: string;
    originalUrl: string;
    // 상시채용 이슈 대응: 마감일 미입력 시 null(상시채용)로 전송.
    deadline: string | null;
    stageId: number;
    cardId?: number;
  }) => Promise<FormErrors | undefined>;
}

interface FormState {
  companyName: string;
  jobTitle: string;
  originalUrl: string;
  deadline: Date | null;
}

export interface FormErrors {
  companyName?: string;
  jobTitle?: string;
  originalUrl?: string;
}

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

// 문자(한글/영문 등)나 숫자가 하나도 없으면 특수문자/이모지로만 이루어진 것으로 간주
function hasNoLetterOrDigit(value: string): boolean {
  return !/[\p{L}\p{N}]/u.test(value);
}

// ⚠️ [QA 반영] 완성된 한글 음절(가~힣)이 아닌 낱자음/낱모음(ㄱ~ㅎ, ㅏ~ㅣ)만으로
// 이루어진 입력은 hasNoLetterOrDigit로 걸러지지 않음(Unicode상 "글자"로 분류되어
// \p{L}에 매칭됨) — 별도로 감지해 더 구체적인 안내 메시지를 보여주기 위한 검사.
function isOnlyHangulJamo(value: string): boolean {
  return /^[ㄱ-ㅎㅏ-ㅣ\s]+$/.test(value);
}

// API 명세서 3.10/3.11 필드 검증 규칙(K011~K021)과 동일한 기준으로 클라이언트 사전 검증.
// 서버 왕복 없이도 대부분의 케이스를 즉시 안내하기 위함.
function validateField(key: keyof FormState, form: FormState): string | undefined {
  if (key === 'companyName') {
    const trimmed = form.companyName.trim();
    if (!trimmed) return '회사명을 입력해 주세요.';
    if (isOnlyHangulJamo(trimmed)) return '올바른 단어 형태로 입력해 주세요.';
    if (trimmed.length < 2) return '2자 이상 입력해 주세요.';
    if (trimmed.length > 50) return '50자를 초과하여 입력할 수 없어요.';
    if (hasNoLetterOrDigit(trimmed)) return '특수문자나 이모지는 입력할 수 없어요.';
  }
  if (key === 'jobTitle') {
    const trimmed = form.jobTitle.trim();
    if (!trimmed) return '공고명을 입력해 주세요.';
    if (isOnlyHangulJamo(trimmed)) return '올바른 단어 형태로 입력해 주세요.';
    if (trimmed.length < 2) return '2자 이상 입력해 주세요.';
    if (trimmed.length > 100) return '100자를 초과하여 입력할 수 없어요.';
    if (hasNoLetterOrDigit(trimmed)) return '특수문자나 이모지는 입력할 수 없어요.';
  }
  if (key === 'originalUrl') {
    const trimmed = form.originalUrl.trim();
    if (!trimmed) return '공고 링크를 입력해 주세요.';
    // 최소한의 도메인 형태(점 포함) 검증 — "abcde" 같은 비URL 텍스트 차단
    if (!trimmed.includes('.') || trimmed.includes(' ')) {
      return '올바른 URL 형식(https://...)으로 입력해 주세요.';
    }
    try {
      new URL(normalizeUrl(trimmed));
    } catch {
      return '올바른 URL 형식(https://...)으로 입력해 주세요.';
    }
    if (trimmed.length > 2048) return '2048자를 초과하여 입력할 수 없어요.';
  }
  return undefined;
}

function validateAll(form: FormState): FormErrors {
  return {
    companyName: validateField('companyName', form),
    jobTitle: validateField('jobTitle', form),
    originalUrl: validateField('originalUrl', form),
  };
}

// Figma "지원 내역 추가"(49:8042) / "지원 내역 수정"(49:8083) 모달 스펙 반영.
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEscapeKey(isOpen, () => {
    setShowDatePicker(false);
    onClose();
  });

  if (!isOpen) return null;

  // ⚠️ [QA 반영] 필드가 비어있지 않아도 길이·형식 규칙을 어기면 확인 버튼이 비활성 상태를
  // 유지하도록, 매 렌더마다 실시간으로 검증 결과를 계산 (제출 시점까지 기다리지 않음).
  const liveErrors = validateAll(form);
  const isFormValid = Object.values(liveErrors).every((e) => !e);

  function updateField(key: keyof FormState, value: FormState[typeof key]) {
    const nextForm = { ...form, [key]: value } as FormState;
    setForm(nextForm);
    setErrors((prev) => ({ ...prev, [key]: validateField(key, nextForm) }));
  }

  async function handleConfirm() {
    const finalErrors = validateAll(form);
    setErrors(finalErrors);
    if (Object.values(finalErrors).some(Boolean)) return;

    const d = form.deadline;
    setIsSubmitting(true);
    try {
      const serverErrors = await onConfirm({
        companyName: form.companyName.trim(),
        jobTitle: form.jobTitle.trim(),
        originalUrl: normalizeUrl(form.originalUrl),
        // 상시채용 이슈 대응: 마감일을 선택하지 않으면 null(상시채용)로 전송.
        deadline: d
          ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
          : null,
        stageId,
        cardId: mode === 'edit' ? card?.id : undefined,
      });
      if (serverErrors) setErrors(serverErrors);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    setShowDatePicker(false);
    onClose();
  }

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

  const canSubmit = isFormValid && !isSubmitting;

  return (
    <div className={`fixed inset-0 flex items-center justify-center ${isOverDrawer ? 'z-[60]' : 'z-50'}`}>
      <div
        className={`absolute inset-0 ${isOverDrawer ? '' : 'bg-base-dimmed'}`}
        onClick={handleClose}
        aria-hidden="true"
      />
      <div className="relative flex w-[394px] flex-col gap-7 overflow-visible rounded-[20px] bg-base-white py-7 shadow-spread-small">
        <div className="flex items-center justify-between px-8">
          <p className="text-7 font-semibold text-label-base">
            {mode === 'add' ? '지원 현황 추가' : '지원 내역 수정'}
          </p>
          <button type="button" onClick={handleClose} aria-label="닫기" className="text-label-base">
            <CloseIcon size={24} />
          </button>
        </div>

        <div className="flex flex-col gap-6 px-8">
          {FIELDS.map(({ key, label, placeholder, type }) => (
            <div key={key} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <p className="text-3 font-semibold text-label-base">{label}</p>
                <p className="text-3 font-bold text-status-negative">*</p>
              </div>
              <input
                type={type ?? 'text'}
                value={form[key]}
                onChange={(e) => updateField(key, e.target.value)}
                placeholder={placeholder}
                className={`${INPUT_CLASS} ${
                  errors[key] ? 'border-status-negative' : 'border-line-secondary'
                }`}
              />
              {errors[key] && <p className="text-1 font-medium text-status-negative">{errors[key]}</p>}
            </div>
          ))}

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <p className="text-3 font-semibold text-label-base">지원 마감일</p>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDatePicker((v) => !v)}
                className={`${FIELD_TRIGGER_CLASS} ring-1 ring-inset ${
                  showDatePicker ? 'ring-line-primary' : 'ring-line-secondary'
                } ${deadlineText ? 'text-label-base' : 'text-label-placeholder'}`}
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
                        updateField('deadline', null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.stopPropagation();
                          updateField('deadline', null);
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
                      updateField('deadline', date);
                      setShowDatePicker(false);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-8">
          <Button variant="primary" size="lg" onClick={handleConfirm} disabled={!canSubmit} className="w-full">
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
      <path
        d="M6 6L18 18M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
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

// Figma Input(node 49:8042) — h-10(48px) + px-5(16px), border-box로 border 포함
const INPUT_CLASS =
  'h-10 box-border w-full rounded-xl border px-5 text-5 font-medium text-label-base placeholder:text-label-placeholder outline-none';

const FIELD_TRIGGER_CLASS =
  'flex h-10 box-border w-full items-center justify-between rounded-xl border px-5 text-5 font-medium outline-none';
