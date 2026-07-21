'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { LoginModal } from '@/features/auth/components/LoginModal';
import { ProfileMenu } from '@/features/auth/components/ProfileMenu';

// Figma Sidebar 컴포넌트(node 36:545) 스펙 반영.
// TODO: 실제 라우팅 경로(/scraps, /kanban, /deadlines)는 페이지 생성 시 확정 필요.
const NAV_ITEMS = [
  { href: '/', icon: '/icons/search.svg', label: '통합 공고 탐색' },
  { href: '/scraps', icon: '/icons/bookmark.svg', label: '스크랩' },
  { href: '/kanban', icon: '/icons/kanban.svg', label: '지원 현황' },
  { href: '/deadlines', icon: '/icons/calendar.svg', label: '지원 마감일' },
];

// [2026-07-22] 로그인 기능 연동: userName/userEmail/avatarUrl props를 제거하고
// authStore(로그인 여부)에 따라 하단 Profile 영역을 분기하도록 변경.
//  - 로그아웃 상태(node 111:23072): "회원가입/로그인" 버튼 → 클릭 시 LoginModal 오픈
//  - 로그인 상태(node 111:23074): 아바타+닉네임+이메일 → 클릭 시 로그아웃 드롭다운(ProfileMenu)
export function Sidebar() {
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <aside className="flex h-full w-[257px] flex-col items-start justify-between border-r border-line-secondary bg-base-white">
      <div className="flex w-full flex-col items-start">
        <div className="flex h-[80px] w-full flex-col justify-center gap-3 px-6 py-3">
          <p className="w-full text-8 font-bold leading-[20px] text-label-base">CHWIHAP</p>
        </div>

        <nav className="flex w-full flex-col items-start gap-2 px-6">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex h-9 w-full items-center gap-3 rounded-xl px-5 py-4 ${
                  isActive
                    ? 'border border-line-secondary bg-neutral-100 text-label-base'
                    : 'text-label-body'
                }`}
              >
                <Image src={item.icon} alt="" width={16} height={16} className="shrink-0" />
                <span className="flex-1 truncate text-3 font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex w-full flex-col items-start px-6 py-5">
        {isAuthenticated ? (
          <ProfileMenu />
        ) : (
          <button
            type="button"
            onClick={() => setIsLoginModalOpen(true)}
            className="flex items-center justify-center rounded-lg border border-line-secondary bg-base-white px-3 py-2"
          >
            <span className="text-3 font-medium leading-[1.5] text-label-primary">
              회원가입/로그인
            </span>
          </button>
        )}
      </div>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </aside>
  );
}
