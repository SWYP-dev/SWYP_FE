'use client';

import { useState } from 'react';

interface HeaderProps {
  onSearch?: (keyword: string) => void;
}

export function Header({ onSearch }: HeaderProps) {
  const [keyword, setKeyword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(keyword);
  };

  return (
    <header className="flex w-full flex-col items-end justify-center border-b border-line-secondary bg-base-white px-12 py-6">
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
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="8" cy="8" r="6" stroke="#BDBDC0" strokeWidth="1.5" />
              <path d="M16 16L13 13" stroke="#BDBDC0" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </form>
    </header>
  );
}
