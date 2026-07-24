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
            <button
              type="submit"
              aria-label="검색"
              className="flex size-6 shrink-0 items-center justify-center"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10.3678 3.00006C6.29869 3.00006 3 6.29876 3 10.3679C3 14.4371 6.29869 17.7358 10.3678 17.7358C12.1 17.7358 13.6926 17.138 14.9505 16.1375L19.5671 20.7541C19.8949 21.0819 20.4264 21.0819 20.7542 20.7541C21.0819 20.4263 21.0819 19.8949 20.7542 19.5671L16.1375 14.9504C17.1379 13.6925 17.7356 12.1 17.7356 10.3679C17.7356 6.29876 14.437 3.00006 10.3678 3.00006ZM4.67874 10.3679C4.67874 7.22591 7.22583 4.67881 10.3678 4.67881C13.5098 4.67881 16.0569 7.22591 16.0569 10.3679C16.0569 13.5099 13.5098 16.057 10.3678 16.057C7.22583 16.057 4.67874 13.5099 4.67874 10.3679Z"
                  fill="#212123"
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
