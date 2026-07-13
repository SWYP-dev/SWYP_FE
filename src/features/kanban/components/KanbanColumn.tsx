'use client';

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { KanbanStage } from '@/types/api';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  stage: KanbanStage;
  onRenameStage?: (stageId: number, newName: string) => void;
  onDeleteStage?: (stageId: number) => void;
}

// Figma KanbanColumn 마스터 컴포넌트(node 50:14062) 스펙 반영.
// hasTextField prop 확인 → 스테이지 이름 수정은 별도 팝오버가 아니라
// 헤더 내 인라인 TextField(밑줄 스타일)로 처리하는 구조.
//
// 디자이너 코멘트: 세로/가로 스크롤은 직접 구현하지 않고 overflow-y/x: auto로 처리.
//
// ⚠️ 확인 필요: 헤더 스테이지명 옆 화살표 아이콘 — PRD v1.3.0에서 "카드 목록 접기" 기능
// 삭제됨. 여기서는 비활성 장식용으로만 렌더링.
// ⚠️ 확인 필요: ButtonGroup 아이콘 3개 — Figma 원본이 임시 asset URL이라 실제 의미 확인 불가.
// [드래그 핸들 / 이름 수정 / 삭제] 순서로 가정. (이전 버전에 있던 "카드 추가" 버튼은
// 마스터 컴포넌트에 존재하지 않아 제거함 — 카드 등록은 피드/스크랩의 "내 지원 현황에 추가"
// 버튼으로만 이루어짐, API 명세서 3.2 기준)
export function KanbanColumn({ stage, onRenameStage, onDeleteStage }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
    data: { stageId: stage.id },
  });

  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState(stage.name);

  function commitRename() {
    const trimmed = draftName.trim();
    setIsEditingName(false);
    if (trimmed && trimmed !== stage.name) {
      onRenameStage?.(stage.id, trimmed);
    } else {
      setDraftName(stage.name);
    }
  }

  return (
    <div
      className={`flex h-full min-w-[296px] flex-1 flex-col items-start overflow-hidden rounded-2xl bg-surface-card ${
        isOver ? 'ring-2 ring-line-primary' : ''
      }`}
    >
      {/* Header */}
      <div className="flex w-full items-start p-4">
        <div className="flex min-h-7 flex-1 items-center justify-between">
          <div className="flex items-center gap-2">
            <ChevronDecorativeIcon />
            {isEditingName ? (
              <input
                autoFocus
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitRename();
                  if (e.key === 'Escape') {
                    setDraftName(stage.name);
                    setIsEditingName(false);
                  }
                }}
                placeholder="텍스트를 입력해 주세요."
                className="w-[168px] border-b-2 border-line-secondary bg-transparent pb-1 text-5 font-medium text-label-base placeholder:text-label-placeholder outline-none"
              />
            ) : (
              <p className="whitespace-nowrap text-6 font-semibold text-label-base">{stage.name}</p>
            )}
            <p className="whitespace-nowrap text-5 font-medium text-label-body">
              {stage.cards.length}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="스테이지 순서 이동"
              className="flex size-4 cursor-grab items-center justify-center text-icon-gray"
            >
              <DragHandleIcon />
            </button>
            <button
              type="button"
              aria-label="스테이지 이름 수정"
              onClick={() => {
                setDraftName(stage.name);
                setIsEditingName(true);
              }}
              className="flex size-4 items-center justify-center text-icon-gray"
            >
              <PencilSmallIcon />
            </button>
            {!stage.isDefault && (
              <button
                type="button"
                aria-label="스테이지 삭제"
                onClick={() => onDeleteStage?.(stage.id)}
                className="flex size-4 items-center justify-center text-icon-gray"
              >
                <TrashSmallIcon />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* List — 세로 스크롤은 overflow-y-auto로만 처리 */}
      <div ref={setNodeRef} className="w-full flex-1 overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col gap-3 px-4 pb-4">
          {stage.cards.map((card) => (
            <KanbanCard key={card.id} card={card} stageId={stage.id} />
          ))}
          {stage.cards.length === 0 && (
            <div className="flex w-full items-center justify-center rounded-xl border border-dashed border-line-secondary py-8 text-2 text-label-description">
              등록된 공고가 없어요
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChevronDecorativeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5 6.5 8 10l3-3.5"
        stroke="#212123"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DragHandleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="6" cy="4" r="1.1" fill="currentColor" />
      <circle cx="10" cy="4" r="1.1" fill="currentColor" />
      <circle cx="6" cy="8" r="1.1" fill="currentColor" />
      <circle cx="10" cy="8" r="1.1" fill="currentColor" />
      <circle cx="6" cy="12" r="1.1" fill="currentColor" />
      <circle cx="10" cy="12" r="1.1" fill="currentColor" />
    </svg>
  );
}

function PencilSmallIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M11 2.5 13.5 5 5 13.5H2.5V11L11 2.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashSmallIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3 4.5h10M6.5 4.5V3a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1.5M4.5 4.5 5 13a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1l.5-8.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
