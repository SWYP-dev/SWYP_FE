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
              {/* Figma Header(226:27922) SearchInput 아이콘 스펙(18x18, fill) 그대로 반영 */}
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 17.9999"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M7.36782 0C3.29869 0 0 3.2987 0 7.36785C0 11.437 3.29869 14.7357 7.36782 14.7357C9.10001 14.7357 10.6926 14.1379 11.9505 13.1374L16.5671 17.7541C16.8949 18.0818 17.4264 18.0818 17.7542 17.7541C18.0819 17.4263 18.0819 16.8948 17.7542 16.567L13.1375 11.9504C14.1379 10.6925 14.7356 9.09995 14.7356 7.36785C14.7356 3.2987 11.437 0 7.36782 0ZM1.67874 7.36785C1.67874 4.22585 4.22583 1.67875 7.36782 1.67875C10.5098 1.67875 13.0569 4.22585 13.0569 7.36785C13.0569 10.5099 10.5098 13.0569 7.36782 13.0569C4.22583 13.0569 1.67874 10.5099 1.67874 7.36785Z"
                  fill="currentColor"
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
