'use client';

import { useId, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { AttachIcon, CloseIcon } from '@/components/ui/icons';
import { useCurrentUserQuery } from '@/features/auth/hooks/useCurrentUserQuery';
import { useAuthStore } from '@/features/auth/store/authStore';
import { AttachedFileItem } from '@/features/documents/components/AttachedFileItem';
import { ApiClientError } from '@/lib/api/api-client';
import { useEscapeKey } from '@/lib/hooks/useEscapeKey';
import { useSubmitFeedbackMutation } from '../api/useFeedbackMutations';
import { FEEDBACK_TYPE_LABELS, type FeedbackType } from '../types/feedback';

interface FeedbackModalProps {
  onClose: () => void;
  onShowToast: (type: 'success' | 'error', message: string) => void;
}

const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const EMAIL_MAX_LENGTH = 254;
const CONTENT_LIMIT = 1000;
const IMAGE_SIZE_LIMIT = 10 * 1024 * 1024;
// 응답 code에 에러 번호와 이름 중 어느 쪽이 오는지 명세에 없어 둘 다 처리한다.
const FEEDBACK_IMAGE_ERROR_CODES = new Set([
  'FB006',
  'FB007',
  'FB008',
  'FEEDBACK_IMAGE_UNSUPPORTED_TYPE',
  'FEEDBACK_IMAGE_SIZE_EXCEEDED',
  'FEEDBACK_IMAGE_UPLOAD_FAILED',
]);
const FIELD_LABEL_CLASS = 'text-3 font-semibold text-label-base';
const REQUIRED_CLASS = 'text-3 font-bold text-status-negative';
const HINT_CLASS = 'text-1 font-medium text-label-caption';
const INPUT_CLASS =
  'h-10 box-border w-full rounded-xl border px-5 text-5 font-medium text-label-base placeholder:text-label-placeholder outline-none';

function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length <= EMAIL_MAX_LENGTH && EMAIL_PATTERN.test(trimmed);
}

function hasImageSignature(bytes: Uint8Array): boolean {
  const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  return (
    pngSignature.every((byte, index) => bytes[index] === byte) ||
    (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
  );
}

export function FeedbackModal({ onClose, onShowToast }: FeedbackModalProps) {
  const headingId = useId();
  const contentId = useId();
  const emailId = useId();
  const emailHintId = useId();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const isClosed = useRef(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [type, setType] = useState<FeedbackType | null>(null);
  const [content, setContent] = useState('');
  const [isContentFocused, setIsContentFocused] = useState(false);
  const [emailInput, setEmailInput] = useState<string | null>(null);
  const [hasEmailError, setHasEmailError] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [isCheckingImage, setIsCheckingImage] = useState(false);
  const mutation = useSubmitFeedbackMutation();

  const needsEmail = type === 'SERVICE_INQUIRY';
  const currentUserQuery = useCurrentUserQuery(isAuthenticated && needsEmail);
  const currentUser = isAuthenticated && currentUserQuery.isSuccess ? currentUserQuery.data : null;
  const email = emailInput ?? currentUser?.email ?? '';
  const trimmedContent = content.trim();
  const isEmailValid = isValidEmail(email);
  const canSubmit =
    type !== null &&
    trimmedContent.length > 0 &&
    (!needsEmail || isEmailValid) &&
    !isCheckingImage &&
    !mutation.isPending;

  function closeModal() {
    // 이전 모달의 검사나 요청이 뒤늦게 완료돼도 새 모달에 영향을 주지 않는다.
    isClosed.current = true;
    onClose();
  }

  useEscapeKey(true, closeModal);

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    const fileName = file.name.toLowerCase();
    if (!['.png', '.jpg', '.jpeg'].some((extension) => fileName.endsWith(extension))) {
      onShowToast('error', 'PNG, JPG 파일만 첨부할 수 있어요.');
      return;
    }
    setIsCheckingImage(true);
    try {
      const bytes = new Uint8Array(await file.slice(0, 8).arrayBuffer());
      if (isClosed.current) return;

      // 확장자만 바꾼 WebP·HEIC·GIF는 서버도 매직바이트로 FB006을 반환하므로 선택 시 막는다.
      if (!hasImageSignature(bytes)) {
        onShowToast('error', 'PNG, JPG 파일만 첨부할 수 있어요.');
        return;
      }
      if (file.size > IMAGE_SIZE_LIMIT) {
        onShowToast('error', '10MB 이하의 이미지만 첨부할 수 있어요.');
        return;
      }
      setImage(file);
    } catch {
      if (!isClosed.current) {
        onShowToast('error', '이미지 첨부에 실패했어요. 다시 시도해 주세요.');
      }
    } finally {
      if (!isClosed.current) setIsCheckingImage(false);
    }
  }

  async function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || type === null) return;

    try {
      await mutation.mutateAsync({
        type,
        content: trimmedContent,
        email: needsEmail ? email.trim() : null,
        image,
      });
      if (isClosed.current) return;
      onShowToast('success', '의견이 정상적으로 접수되었어요.');
      closeModal();
    } catch (err) {
      if (isClosed.current) return;
      const message =
        err instanceof ApiClientError && FEEDBACK_IMAGE_ERROR_CODES.has(err.code)
          ? err.message
          : '의견 제출에 실패했어요. 다시 시도해 주세요.';
      onShowToast('error', message);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-base-dimmed" onClick={closeModal} />
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        noValidate
        onSubmit={submitFeedback}
        className="relative flex w-[394px] flex-col gap-7 rounded-[20px] bg-base-white py-7 shadow-spread-small"
      >
        <div className="flex items-center justify-between px-8">
          <h2 id={headingId} className="text-7 font-semibold text-label-base">
            의견 보내기
          </h2>
          <button type="button" onClick={closeModal} aria-label="닫기">
            <CloseIcon size={24} />
          </button>
        </div>

        <div className="flex flex-col gap-6 px-8">
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-3 flex items-center gap-2">
              <span className={FIELD_LABEL_CLASS}>문의 유형</span>
              <span className={REQUIRED_CLASS} aria-hidden="true">
                *
              </span>
            </legend>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(FEEDBACK_TYPE_LABELS) as FeedbackType[]).map((value) => (
                <Button
                  key={value}
                  type="button"
                  size="md"
                  variant={type === value ? 'outline' : 'secondary'}
                  aria-pressed={type === value}
                  onClick={() => setType(value)}
                  className="w-full"
                >
                  {FEEDBACK_TYPE_LABELS[value]}
                </Button>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-col gap-3">
            <label htmlFor={contentId} className="flex items-center gap-2">
              <span className={FIELD_LABEL_CLASS}>내용</span>
              <span className={REQUIRED_CLASS} aria-hidden="true">
                *
              </span>
            </label>
            <textarea
              id={contentId}
              required
              value={content}
              onChange={(event) => setContent(event.target.value)}
              onFocus={() => setIsContentFocused(true)}
              onBlur={() => setIsContentFocused(false)}
              placeholder="의견을 자유롭게 작성해 주세요."
              maxLength={CONTENT_LIMIT}
              className={`h-[156px] w-full resize-none rounded-xl border-2 p-5 text-4 leading-[1.6] text-label-base outline-none placeholder:text-label-placeholder ${
                isContentFocused
                  ? 'border-line-primary bg-base-white'
                  : trimmedContent
                    ? 'border-line-secondary bg-neutral-100'
                    : 'border-line-secondary bg-base-white'
              }`}
            />
            {content.length > 0 && (
              <p className="text-right text-1 text-label-description">
                <span className="text-label-body">{content.length}</span>
                <span className="text-label-caption"> / {CONTENT_LIMIT}</span>
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className={FIELD_LABEL_CLASS}>이미지</span>
              <span className="text-3 font-medium text-label-caption">(선택)</span>
            </div>
            <input
              ref={imageInputRef}
              type="file"
              accept=".png,.jpg,.jpeg"
              onChange={handleImageChange}
              hidden
            />
            {image ? (
              <AttachedFileItem
                name={image.name}
                size={image.size}
                onDelete={() => setImage(null)}
              />
            ) : (
              <Button
                type="button"
                variant="secondary"
                size="md"
                disabled={isCheckingImage}
                onClick={() => imageInputRef.current?.click()}
                className="self-start"
              >
                <AttachIcon size={16} />
                이미지 첨부
              </Button>
            )}
            <p className={HINT_CLASS}>PNG, JPG 파일 1장, 10MB 이하로 첨부할 수 있어요.</p>
          </div>

          {needsEmail && (
            <div className="flex flex-col gap-3">
              <label htmlFor={emailId} className="flex items-center gap-2">
                <span className={FIELD_LABEL_CLASS}>답변 받을 이메일</span>
                <span className={REQUIRED_CLASS} aria-hidden="true">
                  *
                </span>
              </label>
              <input
                id={emailId}
                type="email"
                required
                value={email}
                onChange={(event) => {
                  const nextEmail = event.target.value;
                  setEmailInput(nextEmail);
                  if (hasEmailError && isValidEmail(nextEmail)) setHasEmailError(false);
                }}
                onBlur={() => setHasEmailError(!isEmailValid)}
                placeholder="이메일을 입력해 주세요."
                aria-invalid={hasEmailError}
                aria-describedby={emailHintId}
                className={`${INPUT_CLASS} ${hasEmailError ? 'border-status-negative' : 'border-line-secondary'}`}
              />
              <p
                id={emailHintId}
                className={hasEmailError ? 'text-1 font-medium text-status-negative' : HINT_CLASS}
              >
                {hasEmailError
                  ? '올바른 이메일 주소를 입력해 주세요.'
                  : '답변은 입력한 이메일로 보내드려요.'}
              </p>
            </div>
          )}
        </div>

        <div className="px-8">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={!canSubmit}
          >
            제출하기
          </Button>
        </div>
      </form>
    </div>
  );
}
