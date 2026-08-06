'use client';

import { useState } from 'react';
import { NotificationBell } from '@/features/notification/components/NotificationBell';

interface HeaderProps {
  onSearch?: (keyword: string) => void;
  /** 검색 바 노출 여부. 지원 현황(칸반)·스크랩 페이지는 헤더 내 검색 바를 제거 (기본값 true) */
  showSearch?: boolean;
}

// Figma Header 컴포넌트(node 24:3480/25:3571) 스펙 반영.
// SearchInput padding-y 8px, placeholder 14px medium 최신 스펙 적용 완료.
// 2026-07-23 디자인 변경점 반영: 검색 아이콘 24px로 확대, 알림 벨(NotificationBell) 추가.
export function Header({ onSearch, showSearch = true }: HeaderProps) {
  const [keyword, setKeyword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(keyword);
  };

  return (
    <header className="flex w-full min-h-12 items-center justify-end gap-6 border-b border-line-secondary bg-base-white px-12 py-6">
      {showSearch && (
        <form
          onSubmit={handleSubmit}
          className="flex h-[40px] w-[237px] box-border items-center overflow-hidden rounded-max border border-line-secondary bg-base-white px-6"
        >
          <div className="flex min-h-6 flex-1 items-center justify-between">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="텍스트를 입력해 주세요."
              className="flex-1 bg-transparent text-3 font-medium text-label-base placeholder:text-label-placeholder outline-none"
            />
            <button
              type="submit"
              aria-label="검색"
              className="flex size-7 shrink-0 items-center justify-center text-icon-default"
            >
              {/* public/icons/search.svg 경로 그대로 — currentColor로 icon/default 적용 */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M10.5 18C14.6421 18 18 14.6421 18 10.5C18 6.35786 14.6421 3 10.5 3C6.35786 3 3 6.35786 3 10.5C3 14.6421 6.35786 18 10.5 18Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path d="M16 16L20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </form>
      )}

      <NotificationBell />
    </header>
  );
}
