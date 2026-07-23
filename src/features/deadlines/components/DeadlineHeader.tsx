'use client';

import { NotificationBell } from '@/features/notification/components/NotificationBell';

// Figma "지원 마감일 메인" Header(node 101:17561) 스펙 반영 — 검색 없이 알림 벨만 배치.
export function DeadlineHeader() {
  return (
    <header className="flex min-h-[80px] w-full items-center justify-end gap-5 border-b border-line-secondary bg-base-white px-[80px] py-5">
      <NotificationBell />
    </header>
  );
}
