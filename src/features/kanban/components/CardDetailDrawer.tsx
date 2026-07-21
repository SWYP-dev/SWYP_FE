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

interface CardDetailDrawerProps {
  isOpen: boolean;
  cardId: number | null;
  onClose: () => void;
  /** 헤더 연필 아이콘 — 기존 카드 수정 모달 재사용 */
  onEditCard: (card: KanbanCard) => void;
  /** 헤더 휴지통 아이콘 — 기존 카드 삭제 모달 재사용 */
  onDeleteCard: (card: KanbanCard) => void;
}

// Figma "CompanyInfo"(node 94:13267, Drawer node 94:13195) 스펙 반영.
// ⚠️ 확인 필요: Figma에는 썸네일/직무분류/위치/경력이 보이지만 API 3.5 응답에는 없음.
// 필드 확정 전까지 해당 영역은 값이 있을 때만 렌더링.
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
  const [linkInput, setLinkInput] = useState({ name: '', url: '' });
  const [isAddingLink, setIsAddingLink] = useState(false);

  // 상세 데이터 로드 시 1회만 memo 초기값 동기화
  if (detail && !isMemoSynced) {
    setMemoDraft(detail.memo ?? '');
    setIsMemoSynced(true);
  }
  if (!isOpen && isMemoSynced) {
    setIsMemoSynced(false);
  }

  function handleMemoBlur() {
    if (!cardId || !detail) return;
    if (memoDraft === detail.memo) return;
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
    if (!linkInput.name.trim() || !linkInput.url.trim()) return;
    registerLink.mutate(
      { name: linkInput.name.trim(), url: linkInput.url.trim() },
      { onSuccess: () => setLinkInput({ name: '', url: '' }) }
    );
    setIsAddingLink(false);
  }

  return (
    <Drawer isOpen={isOpen} onClose={onClose}>
      {isLoading || !detail ? (
        <div className="flex h-full w-full items-center justify-center text-label-description">
          불러오는 중...
        </div>
      ) : (
        <div className="flex w-full flex-col">
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
                        thumbnailUrl: '',
                        originalUrl: detail.originalUrl,
                        deadlineChanged: detail.deadlineChanged,
                        memo: detail.memo,
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
                        thumbnailUrl: '',
                        originalUrl: detail.originalUrl,
                        deadlineChanged: detail.deadlineChanged,
                        memo: detail.memo,
                        registeredAt: detail.registeredAt,
                      })
                    }
                  >
                    <TrashIcon size={16} />
                  </button>
                </div>
              </div>
              <p className="text-8 font-semibold text-label-base">{detail.jobTitle}</p>
            </div>

            {detail.deadlineChanged && (
              <p className="text-1 font-medium text-status-negative">
                마감일이 변경되었어요. 최신 정보를 확인해주세요.
              </p>
            )}

            {/* TODO: 위치/경력 필드 API 3.5에 없음 — 확정 후 연결 */}
            <div className="flex w-full items-center justify-center rounded-xl bg-neutral-50 py-3 text-center text-1">
              <div className="flex flex-1 flex-col gap-[2px]">
                <p className="text-label-description">위치</p>
                <p className="font-semibold text-label-body">-</p>
              </div>
              <div className="flex flex-1 flex-col gap-[2px] border-x border-neutral-200">
                <p className="text-label-description">경력</p>
                <p className="font-semibold text-label-body">-</p>
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

            {/* 메모 (3.6 카드 메모, blur 자동저장) */}
            <div className="flex flex-col gap-2">
              <p className="text-3 font-medium text-label-body">메모</p>
              <textarea
                value={memoDraft}
                onChange={(e) => setMemoDraft(e.target.value)}
                onBlur={handleMemoBlur}
                placeholder="메모할 내용을 입력해주세요."
                className="h-[156px] w-full resize-none rounded-xl border border-line-secondary p-4 text-4 leading-[1.6] text-label-base placeholder:text-label-placeholder"
              />
            </div>

            {/* 첨부 파일 (4.1/4.4/4.5/4.6) */}
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

            {/* URL (4.2/4.4/4.5) */}
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
                <div className="flex flex-col gap-2 rounded-lg border border-line-secondary p-3">
                  <input
                    value={linkInput.name}
                    onChange={(e) => setLinkInput((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="이름 (예: 포트폴리오 노션)"
                    className="rounded border border-line-secondary px-2 py-1 text-3"
                  />
                  <input
                    value={linkInput.url}
                    onChange={(e) => setLinkInput((prev) => ({ ...prev, url: e.target.value }))}
                    placeholder="https://..."
                    className="rounded border border-line-secondary px-2 py-1 text-3"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => setIsAddingLink(false)}
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
