'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Figma Sidebar 컴포넌트(node 36:545) 스펙 반영.
// TODO: 실제 라우팅 경로(/scraps, /kanban, /deadlines)는 페이지 생성 시 확정 필요.
const NAV_ITEMS = [
  { href: '/', icon: '/icons/search.svg', label: '통합 공고 탐색' },
  { href: '/scraps', icon: '/icons/bookmark.svg', label: '스크랩' },
  { href: '/kanban', icon: '/icons/kanban.svg', label: '지원 현황' },
  { href: '/deadlines', icon: '/icons/calendar.svg', label: '지원 마감일' },
];

interface SidebarProps {
  userName: string;
  userEmail: string;
  avatarUrl: string;
}

export function Sidebar({ userName, userEmail, avatarUrl }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-[257px] flex-col items-start justify-between border-r border-line-secondary bg-base-white">
      <div className="flex w-full flex-col items-start">
        {/* Header: h-20(무효값) -> h-[80px], gap-0 -> gap-3(8px) */}
        <div className="flex h-[80px] w-full flex-col justify-center gap-3 px-6 py-3">
          <p className="w-full text-8 font-bold leading-[20px] text-label-base">CHWIHAP</p>
        </div>

        {/* Menu wrapper: gap-1(2px) -> gap-2(4px) */}
        <nav className="flex w-full flex-col items-start gap-2 px-6">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                // ListItem: h-10(48px, 오류) -> h-9(40px)
                // px-4 py-3(12px/8px) -> px-5 py-4(16px/12px)
                // gap-2(4px) -> gap-3(8px)
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

      {/* Profile: 기존 px-6 py-5, gap-4 이미 Figma 스펙과 일치 (수정 없음) */}
      <div className="flex w-full flex-col items-start px-6 py-5">
        <div className="flex w-full items-center gap-4">
          <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-max border border-line-secondary bg-neutral-100">
            <Image
              src={avatarUrl}
              alt=""
              width={32}
              height={32}
              className="rounded-max object-cover"
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col leading-[1.5]">
            <p className="w-full truncate text-3 font-semibold text-label-base">{userName}</p>
            <p className="w-full truncate text-1 text-neutral-700">{userEmail}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
