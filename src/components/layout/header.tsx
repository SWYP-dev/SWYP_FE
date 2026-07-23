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
    <header className="flex w-full items-center justify-end gap-5 border-b border-line-secondary bg-base-white px-12 py-6">
      {showSearch && (
        <form
          onSubmit={handleSubmit}
          className="flex w-[237px] items-center overflow-hidden rounded-max border border-line-secondary bg-base-white px-6 py-3"
        >
          <div className="flex min-h-6 flex-1 items-center justify-between">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="텍스트를 입력해 주세요."
              className="flex-1 bg-transparent text-3 font-medium text-label-base placeholder:text-label-placeholder outline-none"
            />
            <button type="submit" aria-label="검색" className="shrink-0">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="11" cy="11" r="8" stroke="#BDBDC0" strokeWidth="2" />
                <path
                  d="M21 21L16.65 16.65"
                  stroke="#BDBDC0"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </form>
      )}

      <NotificationBell />
    </header>
  );
}
