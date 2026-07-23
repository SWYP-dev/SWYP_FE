'use client';

import { useState } from 'react';
import { Drawer } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { EditIcon, TrashIcon } from '@/components/ui/icons';
import type { KanbanCard } from '@/types/api';
import { useCardDetail } from '@/features/kanban/api/useKanbanQuery';
import { useUpdateCardMemo } from '@/features/kanban/api/useKanbanMutations';
import {
  useUploadDocumentFile,
  useRegisterDocumentLink,
  useDeleteDocument,
  useDownloadDocument,
} from '@/features/documents/api/useDocumentMutations';
import { AttachedFileItem } from '@/features/documents/components/AttachedFileItem';
import { AttachedLinkItem } from '@/features/documents/components/AttachedLinkItem';

// Figma node 94:13318 기준 — URL 카테고리 드롭다운 옵션
const URL_CATEGORIES = ['이력서', '포트폴리오', '개인 채널', '기타'] as const;
type UrlCategory = (typeof URL_CATEGORIES)[number];

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

// Figma "CompanyInfo"(node 94:13267) + "URL 카테고리 선택"(node 94:13318) 스펙 반영.
// 백엔드 확인 완료(2026-07-23): thumbnailUrl·region·career·jobCategory 모두 3.5 응답에 추가됨.
export function CardDetailDrawer({
  isOpen,
  cardId,
  onClose,
  onEditCard,
  onDeleteCard,
}: CardDetailDrawerProps) {
  const { data: detail, isLoading } = useCardDetail(cardId);
  const updateMemo = useUpdateCardMemo();
  const uploadFile = useUploadDocumentFile(cardId ?? -1);
  const registerLink = useRegisterDocumentLink(cardId ?? -1);
  const deleteDocumentMutation = useDeleteDocument(cardId ?? -1);
  const downloadDocument = useDownloadDocument(cardId ?? -1);

  const [memoDraft, setMemoDraft] = useState('');
  const [isMemoSynced, setIsMemoSynced] = useState(false);

  // URL 추가 상태
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [linkCategory, setLinkCategory] = useState<UrlCategory | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // 상세 데이터 로드 시 1회만 memo 초기값 동기화
  if (detail && !isMemoSynced) {
    setMemoDraft(detail.memo ?? '');
    setIsMemoSynced(true);
  }
  if (!isOpen && isMemoSynced) {
    setIsMemoSynced(false);
    setIsAddingLink(false);
    setLinkCategory(null);
    setLinkUrl('');
    setShowCategoryDropdown(false);
  }

  function handleMemoBlur() {
    if (!cardId || !detail) return;
    if (memoDraft === (detail.memo ?? '')) return;
    updateMemo.mutate({ cardId, memo: memoDraft });
  }

  function handleFileButtonClick() {
    const input = window.document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.ppt,.pptx';
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) uploadFile.mutate({ file, name: file.name });
    };
    input.click();
  }

  function handleLinkSubmit() {
    if (!linkUrl.trim()) return;
    const name = linkCategory ?? '기타';
    registerLink.mutate(
      { name, url: linkUrl.trim() },
      {
        onSuccess: () => {
          setLinkUrl('');
          setLinkCategory(null);
          setIsAddingLink(false);
        },
      }
    );
  }

  return (
    <Drawer isOpen={isOpen} onClose={onClose}>
      {isLoading || !detail ? (
        <div className="flex h-full w-full items-center justify-center text-label-description">
          불러오는 중...
        </div>
      ) : (
        <div className="flex w-full flex-col">
          {/* 썸네일 */}
          {detail.thumbnailUrl ? (
            <div className="h-[250px] w-full shrink-0 overflow-hidden">
              <img
                src={detail.thumbnailUrl}
                alt={detail.companyName}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="h-[250px] w-full shrink-0 bg-neutral-100" />
          )}

          {/* 회사/공고 정보 */}
          <div className="flex flex-col gap-4 border-b-4 border-line-secondary px-5 py-6">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <p className="text-3 font-medium text-label-body">{detail.companyName}</p>
                <div className="flex items-center gap-[6px]">
                  <button
                    type="button"
                    aria-label="지원 내역 수정"
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
                    aria-label="지원 내역 삭제"
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
              <p className="text-8 font-semibold text-label-base">{detail.jobTitle}</p>
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
            <div className="flex w-full items-center justify-center rounded-xl bg-neutral-50 py-3 text-center text-1">
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
                <p className="font-semibold text-label-body">{detail.deadline}</p>
              </div>
            </div>

            <a href={detail.originalUrl} target="_blank" rel="noreferrer" className="block w-full">
              <Button variant="primary" className="w-full">
                원본 공고 이동
              </Button>
            </a>
          </div>

          {/* 서류 첨부 */}
          <div className="flex flex-col gap-6 px-5 py-6">
            <p className="text-6 font-semibold text-label-base">서류 첨부</p>

            {/* 메모 */}
            <div className="flex flex-col gap-2">
              <p className="text-3 font-medium text-label-body">메모</p>
              <div className="flex flex-col gap-2">
                <textarea
                  value={memoDraft}
                  onChange={(e) => setMemoDraft(e.target.value)}
                  onBlur={handleMemoBlur}
                  placeholder="메모할 내용을 입력해주세요."
                  maxLength={1000}
                  className="h-[156px] w-full resize-none rounded-xl border-2 border-line-secondary bg-neutral-100 p-4 text-4 leading-[1.6] text-label-base placeholder:text-label-placeholder outline-none focus:border-line-primary"
                />
                <p className="text-right text-1 text-label-description">
                  <span className="text-label-body">{memoDraft.length}</span>
                  <span className="text-label-caption"> / 1000</span>
                </p>
              </div>
            </div>

            {/* 첨부 파일 */}
            <div className="flex flex-col gap-2">
              <p className="text-3 font-medium text-label-body">첨부 파일</p>
              {detail.documents
                .filter((doc): doc is Extract<typeof doc, { type: 'FILE' }> => doc.type === 'FILE')
                .map((doc) => (
                  <AttachedFileItem
                    key={doc.id}
                    document={doc}
                    onDownload={() => downloadDocument.mutate(doc.id)}
                    onDelete={() => deleteDocumentMutation.mutate(doc.id)}
                  />
                ))}
              <Button variant="secondary" className="w-full" onClick={handleFileButtonClick}>
                + 첨부 파일 추가
              </Button>
            </div>

            {/* URL — Figma node 94:13318 카테고리 드롭다운 반영 */}
            <div className="flex flex-col gap-2">
              <p className="text-3 font-medium text-label-body">URL</p>
              {detail.documents
                .filter((doc): doc is Extract<typeof doc, { type: 'LINK' }> => doc.type === 'LINK')
                .map((doc) => (
                  <AttachedLinkItem
                    key={doc.id}
                    document={doc}
                    onDelete={() => deleteDocumentMutation.mutate(doc.id)}
                  />
                ))}

              {isAddingLink ? (
                <div className="flex flex-col gap-2">
                  {/* 카테고리 선택 + URL 입력 행 */}
                  <div className="flex items-stretch gap-2">
                    {/* 카테고리 드롭다운 */}
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowCategoryDropdown((v) => !v)}
                        className="flex h-full min-w-[108px] items-center justify-between rounded-xl border border-line-secondary bg-base-white px-4 py-3 text-3 font-medium text-label-description"
                      >
                        <span className={linkCategory ? 'text-label-base' : ''}>
                          {linkCategory ?? '선택'}
                        </span>
                        <ChevronDownIcon />
                      </button>
                      {showCategoryDropdown && (
                        <div className="absolute bottom-[calc(100%+4px)] left-0 z-10 w-[108px] overflow-hidden rounded-xl border border-line-secondary bg-base-white p-1 shadow-spread-small">
                          {URL_CATEGORIES.map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => {
                                setLinkCategory(cat);
                                setShowCategoryDropdown(false);
                              }}
                              className={`flex h-10 w-full items-center px-4 text-3 font-medium text-label-base ${
                                linkCategory === cat
                                  ? 'rounded-lg bg-neutral-100'
                                  : 'hover:bg-neutral-50'
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* URL 입력 */}
                    <input
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleLinkSubmit()}
                      placeholder="텍스트를 입력해 주세요."
                      className="flex-1 rounded-xl border border-line-secondary px-4 py-3 text-3 font-medium text-label-base placeholder:text-label-placeholder outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => {
                        setIsAddingLink(false);
                        setLinkCategory(null);
                        setLinkUrl('');
                      }}
                    >
                      취소
                    </Button>
                    <Button variant="primary" className="flex-1" onClick={handleLinkSubmit}>
                      추가
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => setIsAddingLink(true)}
                >
                  + URL 추가
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 6l4 4 4-4"
        stroke="#BDBDC0"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
