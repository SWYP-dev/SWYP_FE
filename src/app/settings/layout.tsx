import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SettingsSidebar } from '@/components/layout/settings-sidebar';

// 계정·알림 설정 하위 페이지 공통 타이틀 ("취합 | 계정 및 설정")
export const metadata: Metadata = {
  title: '계정 및 설정',
};

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-base-white">
      <SettingsSidebar />
      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-neutral-50 px-12 py-9">
        {children}
      </main>
    </div>
  );
}
