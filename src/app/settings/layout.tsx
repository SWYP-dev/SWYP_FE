import type { ReactNode } from 'react';
import { SettingsSidebar } from '@/components/layout/settings-sidebar';

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
