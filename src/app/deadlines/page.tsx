'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { DeadlineHeader } from '@/features/deadlines/components/DeadlineHeader';
import { DeadlineList } from '@/features/deadlines/components/DeadlineList';

// Figma "지원 마감일 메인"(node 101:17608). sidebar '/deadlines' 라우팅 대상.
export default function DeadlinesPage() {
  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-base-white">
      <Sidebar
        userName="손진영"
        userEmail="sonjinyoung9849@gmail.com"
        avatarUrl="/images/avatar.png"
      />

      <main className="flex min-w-0 flex-1 flex-col self-stretch">
        <div className="sticky top-0 z-10">
          <DeadlineHeader
            onBellClick={() => {
              /* TODO: 알림 확인 모달 — "지원 마감일 알림 확인 전/후" 시안 확정 후 연결 */
            }}
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-neutral-50 px-[80px] py-6">
          <DeadlineList />
        </div>
      </main>
    </div>
  );
}
