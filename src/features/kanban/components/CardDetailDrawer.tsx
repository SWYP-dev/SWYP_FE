'use client';

import { useEffect, useRef, useState } from 'react';
import { Drawer } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Toast } from '@/components/ui/toast';
import { AttachIcon, EditIcon, TrashIcon } from '@/components/ui/icons';
import type { KanbanCard, DocumentItem } from '@/types/api';
import { useCardDetail } from '@/features/kanban/api/useKanbanQuery';
import {
  useDownloadDocument,
  useSaveCardDetail,
  type SaveCardDetailPayload,
} from '@/features/documents/api/useDocumentMutations';
import { AttachedFileItem } from '@/features/documents/components/AttachedFileItem';
import {
  AttachedLinkItem,
  URL_CATEGORIES,
  type UrlCategoryValue,
} from '@/features/documents/components/AttachedLinkItem';
import { UnsavedChangesModal } from './UnsavedChangesModal';
import { ApiClientError } from '@/lib/api/api-client';
import { isAlwaysHiring } from '@/lib/utils/deadline';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB (API 명세서 4.4.2 정책)
const ALLOWED_FILE_EXTENSIONS = ['.pdf', '.docx', '.pptx'];

// 파일 선택 즉시 검증한다 — 저장까지 갔다가 실패하는 헛걸음을 막기 위함.
// 계정 저장 용량 초과처럼 서버만 알 수 있는 건 여기서 걸러지지 않는다.
function validateFile(file: File): string | undefined {
  const lowerName = file.name.toLowerCase();
  if (!ALLOWED_FILE_EXTENSIONS.some((ext) => lowerName.endsWith(ext))) {
    return 'PDF, DOCX, PPTX 파일만 첨부할 수 있어요.';
  }
  if (file.size > MAX_FILE_SIZE) return '파일 용량은 10MB를 초과할 수 없어요.';
  return undefined;
}

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

// ⚠️ [백엔드 확인 완료] 서버는 URL 접근 가능 여부(reachability)를 확인하지 않고
// http(s) 형식·유효한 호스트 포함 여부만 검증 — 클라이언트도 형식 검증까지만 처리.
function validateLinkFormat(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed.includes('.') || trimmed.includes(' ')) {
    return '올바른 URL 형식(https://...)으로 입력해 주세요.';
  }
  try {
    new URL(normalizeUrl(trimmed));
  } catch {
    return '올바른 URL 형식(https://...)으로 입력해 주세요.';
  }
  if (trimmed.length > 2048) return '2048자를 초과하여 입력할 수 없어요.';
  return undefined;
}

type LinkDocument = Extract<DocumentItem, { type: 'LINK' }>;
type FileDocument = Extract<DocumentItem, { type: 'FILE' }>;

function isLinkDocument(doc: DocumentItem): doc is LinkDocument {
  return doc.type === 'LINK';
}

function isFileDocument(doc: DocumentItem): doc is FileDocument {
  return doc.type === 'FILE';
}

// 누적 리스트의 한 항목. id가 null이면 아직 서버에 없는 신규 항목.
interface LinkDraft {
  key: string;
  id: number | null;
  category: string;
  url: string;
}

interface FileDraft {
  key: string;
  id: number | null;
  name: string;
  size?: number;
  file: File | null;
}

function toLinkDraft(doc: LinkDocument): LinkDraft {
  return { key: `link-${doc.id}`, id: doc.id, category: doc.category, url: doc.url };
}

function toFileDraft(doc: FileDocument): FileDraft {
  return { key: `file-${doc.id}`, id: doc.id, name: doc.name, size: doc.size, file: null };
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

// 지원 마감일 표시 포맷 — 올해(현재 연도)면 "dd(요일)", 그 외 연도면 "yyyy. mm. dd(요일)"
function formatDrawerDeadline(deadlineIso: string | null): string {
  if (isAlwaysHiring(deadlineIso)) return '상시채용';
  const date = new Date(deadlineIso);
  const weekday = WEEKDAYS[date.getDay()];
  const month = date.getMonth() + 1;
  const day = date.getDate();
  if (date.getFullYear() === new Date().getFullYear()) {
    return `${month}.${day} (${weekday})`;
  }
  const year = date.getFullYear();
  return `${year}. ${String(month).padStart(2, '0')}. ${String(day).padStart(2, '0')}(${weekday})`;
}

// career 값 → 표시 텍스트 변환
function formatCareer(career: string | null): string {
  if (!career) return '-';
  if (career === 'NEW') return '신입';
  if (career === 'EXPERIENCED') return '경력';
  return career;
}

interface CardDetailDrawerProps {
  isOpen: boolean;
  cardId: number | null;
  onClose: () => void;
  onEditCard: (card: KanbanCard) => void;
  onDeleteCard: (card: KanbanCard) => void;
}

// Figma "CompanyInfo"(node 847:67327) 스펙 반영.
//
// 입력 모델: 첨부 파일·URL 모두 "상단 입력 슬롯 → 하단 누적 리스트" 구조.
//   - 첨부 파일: 슬롯 클릭 → 파일 선택 → 리스트에 누적
//   - URL: 카테고리 선택 → URL 입력 → 등록 → 리스트에 누적
// 커밋 모델: 누적된 항목과 메모는 하단 "저장"에서 한 번에 서버로 간다.
// 저장 전까지는 로컬 draft로만 존재하므로 저장하지 않고 새로고침하면 입력값이 남지 않는다.
export function CardDetailDrawer({
  isOpen,
  cardId,
  onClose,
  onEditCard,
  onDeleteCard,
}: CardDetailDrawerProps) {
  const { data: detail, isLoading } = useCardDetail(cardId);
  const downloadDocument = useDownloadDocument(cardId ?? -1);
  const saveCardDetail = useSaveCardDetail(cardId ?? -1);

  const [memoDraft, setMemoDraft] = useState('');
  const [isMemoFocused, setIsMemoFocused] = useState(false);
  const [linkItems, setLinkItems] = useState<LinkDraft[]>([]);
  const [fileItems, setFileItems] = useState<FileDraft[]>([]);

  // URL 입력 슬롯 — 등록하면 비워지고 항목은 linkItems로 내려간다.
  const [slotCategory, setSlotCategory] = useState<UrlCategoryValue | null>(null);
  const [slotUrl, setSlotUrl] = useState('');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);

  // 'all' = 메모까지 서버 값으로 맞춤, 'documents' = 파일·URL 목록만 맞춤(입력 중인 메모는 보존),
  // null = 동기화 완료
  const [syncRequest, setSyncRequest] = useState<'all' | 'documents' | null>('all');
  const [fileError, setFileError] = useState<string | null>(null);
  const [isUnsavedModalOpen, setIsUnsavedModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const newItemSeq = useRef(0);

  const originalLinks = detail ? detail.documents.filter(isLinkDocument) : [];
  const originalFiles = detail ? detail.documents.filter(isFileDocument) : [];

  // 카테고리 드롭다운 바깥 클릭 시 닫기 — 입력 중인 URL 값은 유지된다.
  useEffect(() => {
    if (!isCategoryOpen) return;
    function handleMouseDown(e: MouseEvent) {
      if (categoryRef.current?.contains(e.target as Node)) return;
      setIsCategoryOpen(false);
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [isCategoryOpen]);

  // 상세 데이터 로드 시 draft 동기화. 저장 후에도 재동기화를 요청해 draft의 서류 id를
  // 서버 값과 맞춘다 — 저장 mutation이 재조회 완료까지 기다리므로 이 시점의 detail은 최신 값.
  if (isOpen && detail && syncRequest) {
    if (syncRequest === 'all') setMemoDraft(detail.memo ?? '');
    setLinkItems(originalLinks.map(toLinkDraft));
    setFileItems(originalFiles.map(toFileDraft));
    setSyncRequest(null);
  }
  if (!isOpen && syncRequest !== 'all') {
    setSyncRequest('all');
    setIsMemoFocused(false);
    setMemoDraft('');
    setLinkItems([]);
    setFileItems([]);
    setSlotCategory(null);
    setSlotUrl('');
    setIsCategoryOpen(false);
    setFileError(null);
    setIsUnsavedModalOpen(false);
  }

  const memoChanged = detail ? memoDraft !== (detail.memo ?? '') : false;

  const createdLinks = linkItems
    .filter((item) => item.id === null)
    .map((item) => ({ category: item.category, url: item.url }));

  const createdFiles = fileItems
    .filter((item) => item.id === null && item.file)
    .map((item) => item.file as File);

  // 파일·링크는 DELETE 엔드포인트가 같아 삭제 목록을 하나로 합친다.
  const keptIds = new Set(
    [...linkItems, ...fileItems].map((item) => item.id).filter((id) => id !== null)
  );
  const deletedIds = [...originalLinks, ...originalFiles]
    .filter((doc) => !keptIds.has(doc.id))
    .map((doc) => doc.id);

  const isDirty =
    memoChanged || createdLinks.length > 0 || createdFiles.length > 0 || deletedIds.length > 0;

  const isSaving = saveCardDetail.isPending;
  const canSave = isDirty && !isSaving;

  // 입력할 때마다 즉시 검증한다(등록·저장을 기다리지 않음). 파생 값이라 항상 입력과 동기화된다.
  // 빈 값은 검증 대상이 아니다 — 아직 입력하지 않은 슬롯에 에러가 뜨면 안 되기 때문.
  const slotUrlError = slotUrl.trim() ? validateLinkFormat(slotUrl) : undefined;
  const canRegisterUrl = slotUrl.trim().length > 0 && !slotUrlError && !isSaving;

  function handleRequestClose() {
    if (isDirty && !isSaving) {
      setIsUnsavedModalOpen(true);
      return;
    }
    onClose();
  }

  async function handleSave() {
    if (!cardId || !canSave) return;
    const payload: SaveCardDetailPayload = {
      createdFiles,
      createdLinks,
      deleted: deletedIds,
      ...(memoChanged ? { memo: memoDraft, previousMemo: detail?.memo ?? '' } : {}),
    };
    setFileError(null);
    try {
      await saveCardDetail.mutateAsync(payload);
      setSyncRequest('all'); // 갱신된 상세 데이터로 draft 재동기화
      setToast({ message: '저장되었어요.', type: 'success' });
    } catch (err) {
      // 실패하면 서버는 저장 이전 상태로 되돌아가 있고(보상 요청), 화면의 입력값은 그대로 둔다.
      // 파일을 다시 고르지 않고 용량만 줄여서 바로 재시도할 수 있게 하기 위함 —
      // 새로고침하면 로컬 draft가 사라지므로 서버 값(= 저장 이전 상태)만 남는다.
      if (err instanceof ApiClientError && err.code === 'STORAGE_LIMIT_EXCEEDED') {
        setFileError('계정 저장 용량(100MB)이 초과됐어요. 일부 파일을 지우고 다시 저장해 주세요.');
      } else {
        setFileError('저장하지 못했어요. 첨부 파일 용량을 확인한 뒤 다시 시도해 주세요.');
      }
      setToast({ message: '저장에 실패했어요. 입력한 내용은 그대로 있어요.', type: 'error' });
    }
  }

  // URL 슬롯 → 누적 리스트. 카테고리 미선택 시 기타(OTHER)로 저장된다.
  function handleRegisterUrl() {
    // 형식 검증은 입력 중에 이미 끝나 있고, 실패하면 등록 자체가 비활성이다.
    if (!canRegisterUrl) return;
    newItemSeq.current += 1;
    setLinkItems((prev) => [
      ...prev,
      {
        key: `new-link-${newItemSeq.current}`,
        id: null,
        category: slotCategory ?? 'OTHER',
        url: normalizeUrl(slotUrl.trim()),
      },
    ]);
    setSlotCategory(null);
    setSlotUrl('');
  }

  // 파일 슬롯 → 누적 리스트. 업로드는 하지 않고 목록에만 쌓아둔다(실제 전송은 "저장").
  function handleFileSlotClick() {
    if (isSaving) return;
    const input = window.document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.docx,.pptx';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;

      const validationError = validateFile(file);
      if (validationError) {
        setFileError(validationError);
        return;
      }

      setFileError(null);
      newItemSeq.current += 1;
      setFileItems((prev) => [
        ...prev,
        { key: `new-file-${newItemSeq.current}`, id: null, name: file.name, size: file.size, file },
      ]);
    };
    input.click();
  }

  return (
    <>
      <Drawer
        isOpen={isOpen}
        onClose={handleRequestClose}
        footer={
          detail ? (
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className="flex h-[44px] items-center justify-center gap-2 rounded-lg bg-fill-primary px-6 text-3 font-semibold text-neutral-0 transition-colors hover:bg-action-primary-hover disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-label-placeholder"
            >
              {isSaving && <ButtonSpinnerIcon />}
              {isSaving ? '저장 중' : '저장'}
            </button>
          ) : undefined
        }
      >
        {isLoading || !detail ? (
          <div className="flex h-full w-full items-center justify-center text-label-description">
            불러오는 중...
          </div>
        ) : (
          <div className="flex w-full flex-col">
            {/* 회사/공고 정보 */}
            <div className="flex flex-col gap-5 border-b-4 border-line-secondary px-6 py-7">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <p className="text-3 font-medium text-label-body">{detail.companyName}</p>
                  <div className="flex items-center gap-[6px]">
                    <button
                      type="button"
                      aria-label="지원 현황 수정"
                      onClick={() =>
                        onEditCard({
                          id: detail.id,
                          postingId: detail.postingId,
                          companyName: detail.companyName,
                          jobTitle: detail.jobTitle,
                          deadline: detail.deadline,
                          thumbnailUrl: detail.thumbnailUrl ?? '',
                          originalUrl: detail.originalUrl,
                          deadlineChanged: detail.deadlineChanged,
                          memo: detail.memo ?? '',
                          registeredAt: detail.registeredAt,
                        })
                      }
                    >
                      <EditIcon size={16} />
                    </button>
                    <button
                      type="button"
                      aria-label="지원 현황 삭제"
                      onClick={() =>
                        onDeleteCard({
                          id: detail.id,
                          postingId: detail.postingId,
                          companyName: detail.companyName,
                          jobTitle: detail.jobTitle,
                          deadline: detail.deadline,
                          thumbnailUrl: detail.thumbnailUrl ?? '',
                          originalUrl: detail.originalUrl,
                          deadlineChanged: detail.deadlineChanged,
                          memo: detail.memo ?? '',
                          registeredAt: detail.registeredAt,
                        })
                      }
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-7 font-semibold text-label-base">{detail.jobTitle}</p>
                {/* 직무 분류 */}
                {detail.jobCategory && (
                  <p className="text-1 font-medium text-label-description">{detail.jobCategory}</p>
                )}
              </div>

              {detail.deadlineChanged && (
                <p className="text-1 font-medium text-status-negative">
                  마감일이 변경되었어요. 최신 정보를 확인해주세요.
                </p>
              )}

              {/* 위치 / 경력 / 지원 마감일 — Figma JobSummary */}
              <div className="flex w-full items-center justify-center rounded-xl bg-neutral-50 py-4 text-center text-1">
                <div className="flex flex-1 flex-col gap-[2px]">
                  <p className="text-label-description">위치</p>
                  <p className="font-semibold text-label-body">{detail.region ?? '-'}</p>
                </div>
                <div className="flex flex-1 flex-col gap-[2px] border-x border-neutral-200">
                  <p className="text-label-description">경력</p>
                  <p className="font-semibold text-label-body">{formatCareer(detail.career)}</p>
                </div>
                <div className="flex flex-1 flex-col gap-[2px]">
                  <p className="text-label-description">지원 마감일</p>
                  <p className="font-semibold text-label-body">
                    {formatDrawerDeadline(detail.deadline)}
                  </p>
                </div>
              </div>

              <a
                href={detail.originalUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block"
              >
                <Button variant="outline">
                  <span className="flex items-center gap-1">
                    원본 공고 이동
                    <ExternalLinkIcon />
                  </span>
                </Button>
              </a>
            </div>

            {/* 서류 첨부 — Figma Container(px 20 / py 24, gap 12), 섹션 간 gap 40 */}
            <div className="flex flex-col gap-4 px-6 py-7">
              <p className="text-5 font-semibold text-label-base">서류 첨부</p>

              <div className="flex flex-col gap-9">
                {/* 메모 — 하단 저장 버튼에서 함께 커밋된다 */}
                <div className="flex flex-col gap-3">
                  <p className="text-3 font-medium text-label-body">메모</p>
                  <div className="flex flex-col gap-3">
                    <textarea
                      value={memoDraft}
                      onChange={(e) => setMemoDraft(e.target.value)}
                      onFocus={() => setIsMemoFocused(true)}
                      onBlur={() => setIsMemoFocused(false)}
                      placeholder="메모할 내용을 입력해주세요."
                      maxLength={1000}
                      className={`h-[156px] w-full resize-none rounded-xl border-2 p-5 text-4 leading-[1.6] text-label-base outline-none placeholder:text-label-placeholder ${
                        isMemoFocused
                          ? 'border-line-primary bg-base-white'
                          : memoDraft.trim()
                            ? 'border-line-secondary bg-neutral-100'
                            : 'border-line-secondary bg-base-white'
                      }`}
                    />
                    {memoDraft.length > 0 && (
                      <p className="text-right text-1 text-label-description">
                        <span className="text-label-body">{memoDraft.length}</span>
                        <span className="text-label-caption"> / 1000</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* 첨부 파일 — 슬롯 클릭 → 파일 선택 → 아래 리스트에 누적 */}
                <div className="flex flex-col gap-3">
                  <p className="text-3 font-medium text-label-body">첨부 파일</p>
                  <button
                    type="button"
                    onClick={handleFileSlotClick}
                    disabled={isSaving}
                    className="flex h-[45px] w-full items-center rounded-xl border border-line-secondary bg-base-white px-5 py-4 text-left disabled:cursor-not-allowed"
                  >
                    <span className="flex min-h-[24px] min-w-0 flex-1 items-center gap-3">
                      <span className="shrink-0 text-label-placeholder">
                        <AttachIcon size={18} />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-3 font-medium text-label-placeholder">
                        첨부할 파일을 추가해주세요.
                      </span>
                    </span>
                  </button>
                  {fileItems.length > 0 && (
                    <div className="flex min-w-0 flex-col gap-3">
                      {fileItems.map((item) => (
                        <AttachedFileItem
                          key={item.key}
                          name={item.name}
                          size={item.size}
                          disabled={isSaving}
                          // 아직 업로드 전인 파일은 발급받을 다운로드 URL이 없다.
                          onDownload={
                            item.id !== null
                              ? () => downloadDocument.mutate(item.id as number)
                              : undefined
                          }
                          onDelete={() =>
                            setFileItems((prev) => prev.filter((f) => f.key !== item.key))
                          }
                        />
                      ))}
                    </div>
                  )}
                  {fileError && (
                    <p className="text-1 font-medium text-status-negative">{fileError}</p>
                  )}
                </div>

                {/* URL — 카테고리 선택 → URL 입력 → 등록 → 아래 리스트에 누적 */}
                <div className="flex flex-col gap-3">
                  <p className="text-3 font-medium text-label-body">URL</p>

                  <div className="flex h-[45px] w-full items-center gap-3">
                    <div ref={categoryRef} className="relative h-full shrink-0">
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => setIsCategoryOpen((v) => !v)}
                        className="flex h-full w-[108px] items-center rounded-xl border border-line-secondary bg-base-white py-3 pl-5 pr-[11px] disabled:cursor-not-allowed"
                      >
                        <span className="flex min-h-[16px] flex-1 items-center justify-between">
                          <span
                            className={`text-3 font-medium ${
                              slotCategory ? 'text-label-base' : 'text-label-description'
                            }`}
                          >
                            {URL_CATEGORIES.find((c) => c.value === slotCategory)?.label ?? '선택'}
                          </span>
                          <ChevronDownIcon />
                        </span>
                      </button>
                      {isCategoryOpen && (
                        // URL 섹션이 드로어 최하단이라 아래로 열면 저장 바에 잘린다 → 위로 펼침.
                        <div className="absolute bottom-[calc(100%+4px)] left-0 z-10 flex w-[108px] flex-col gap-1 overflow-hidden rounded-xl border border-line-secondary bg-base-white p-2">
                          {URL_CATEGORIES.map((cat) => (
                            <button
                              key={cat.value}
                              type="button"
                              onClick={() => {
                                setSlotCategory(cat.value);
                                setIsCategoryOpen(false);
                              }}
                              className={`flex w-full items-center rounded-lg px-5 py-[10px] text-3 font-medium text-label-base ${
                                slotCategory === cat.value
                                  ? 'bg-neutral-100'
                                  : 'hover:bg-neutral-50'
                              }`}
                            >
                              {cat.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div
                      className={`flex h-[45px] min-w-0 flex-1 items-center rounded-xl border bg-base-white px-5 py-4 ${
                        slotUrlError ? 'border-status-negative' : 'border-line-secondary'
                      }`}
                    >
                      <div className="flex min-h-[24px] min-w-0 flex-1 items-center gap-3">
                        <input
                          value={slotUrl}
                          disabled={isSaving}
                          onChange={(e) => setSlotUrl(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleRegisterUrl()}
                          placeholder="URL 링크를 입력해 주세요."
                          className="min-w-0 flex-1 bg-transparent text-3 font-medium text-label-base outline-none placeholder:text-label-placeholder disabled:cursor-not-allowed"
                        />
                        {/* 값이 없거나 형식이 틀리면 비활성. 활성 색은 Service/400, 밑줄 없음 */}
                        <button
                          type="button"
                          onClick={handleRegisterUrl}
                          disabled={!canRegisterUrl}
                          className="shrink-0 text-3 font-semibold text-label-primary disabled:cursor-not-allowed disabled:text-label-secondary-disabled"
                        >
                          등록
                        </button>
                      </div>
                    </div>
                  </div>

                  {slotUrlError && (
                    <p className="text-1 font-medium text-status-negative">{slotUrlError}</p>
                  )}

                  {linkItems.length > 0 && (
                    <div className="flex min-w-0 flex-col gap-3">
                      {linkItems.map((item) => (
                        <AttachedLinkItem
                          key={item.key}
                          category={item.category}
                          url={item.url}
                          disabled={isSaving}
                          onDelete={() =>
                            setLinkItems((prev) => prev.filter((l) => l.key !== item.key))
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      <UnsavedChangesModal
        isOpen={isUnsavedModalOpen}
        onCancel={() => setIsUnsavedModalOpen(false)}
        onConfirm={() => {
          setIsUnsavedModalOpen(false);
          onClose();
        }}
      />

      <Toast
        message={toast?.message ?? ''}
        isVisible={toast !== null}
        type={toast?.type ?? 'success'}
        onDismiss={() => setToast(null)}
      />
    </>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 6l4 4 4-4"
        stroke="var(--color-icon-gray)"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ButtonSpinnerIcon() {
  return (
    <svg
      className="animate-spin"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" opacity="0.3" />
      <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// stroke는 currentColor — Button variant(primary=흰색 / outline=Service/400)를 그대로 따라간다.
function ExternalLinkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6 4H4a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-2M9 3h4v4M13 3 7 9"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
