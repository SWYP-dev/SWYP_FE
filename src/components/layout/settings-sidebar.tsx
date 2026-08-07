'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLogoutMutation } from '@/features/auth/hooks/useAuthMutations';

function BackArrowIcon() {
  return (
    <svg width="7" height="13" viewBox="0 0 7.03333 12.8667" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6.43333 0.6L0.6 6.43333L6.43333 12.2667"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AccountTabIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.00006 0C4.17566 0 2.69669 1.40035 2.69669 3.12777C2.69669 4.85519 4.17566 6.25553 6.00006 6.25553C7.82446 6.25553 9.30343 4.85519 9.30343 3.12777C9.30343 1.40035 7.82446 0 6.00006 0ZM3.91017 3.12777C3.91017 2.03491 4.84585 1.14898 6.00006 1.14898C7.15427 1.14898 8.08995 2.03491 8.08995 3.12777C8.08995 4.22062 7.15427 5.10656 6.00006 5.10656C4.84585 5.10656 3.91017 4.22062 3.91017 3.12777Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 7.02052C4.44139 7.02052 2.98693 7.3094 1.89866 7.86445C0.811152 8.4191 3.98234e-06 9.2969 3.98234e-06 10.4674L1.9732e-06 10.6766C-1.86004e-05 10.7958 -3.95356e-05 10.9171 0.00890827 11.0208C0.0188631 11.1361 0.0428468 11.2793 0.121253 11.425C0.227906 11.6231 0.398087 11.7843 0.607403 11.8852C0.761282 11.9595 0.912462 11.9822 1.0343 11.9916C1.14381 12.0001 1.27192 12 1.39776 12L10.6024 11.9995C10.7282 11.9995 10.8563 11.9995 10.9658 11.991C11.0877 11.9816 11.2388 11.9589 11.3927 11.8847C11.602 11.7837 11.7721 11.6225 11.8788 11.4244C11.9572 11.2787 11.9811 11.1356 11.9911 11.0202C12 10.9165 12 10.7952 12 10.6761L12 10.4674C12 9.2969 11.1888 8.4191 10.1013 7.86445C9.01307 7.3094 7.55861 7.02052 6 7.02052ZM1.21349 10.4674C1.21349 9.87533 1.60966 9.31691 2.47413 8.87601C3.33783 8.4355 4.58 8.1695 6 8.1695C7.42 8.1695 8.66217 8.4355 9.52587 8.87601C10.3903 9.31691 10.7865 9.87533 10.7865 10.4674L10.7853 10.8493L1.21471 10.8499L1.21349 10.4674Z"
        fill="currentColor"
      />
    </svg>
  );
}

// NotificationBell.tsx의 벨 아이콘과 동일 경로(Figma node 101:17618).
function NotificationTabIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M9.98141 21.2505H14.0186M18.9985 14.9805C18.6973 14.5038 18.5375 13.9529 18.5372 13.3905V9.22651C18.5372 7.5087 17.8485 5.86125 16.6225 4.64658C15.3965 3.43191 13.7338 2.74951 12 2.74951C10.2662 2.74951 8.60345 3.43191 7.37749 4.64658C6.15152 5.86125 5.46278 7.5087 5.46278 9.22651V13.3885C5.46286 13.9515 5.30302 14.5032 5.00153 14.9805L3.90342 16.7205C3.80793 16.8719 3.75508 17.0458 3.75035 17.2243C3.74562 17.4027 3.78919 17.5792 3.87652 17.7353C3.96386 17.8914 4.09179 18.0215 4.24702 18.1121C4.40225 18.2027 4.57914 18.2505 4.7593 18.2505H19.2407C19.4209 18.2505 19.5977 18.2027 19.753 18.1121C19.9082 18.0215 20.0361 17.8914 20.1235 17.7353C20.2108 17.5792 20.2544 17.4027 20.2497 17.2243C20.2449 17.0458 20.1921 16.8719 20.0966 16.7205L18.9985 14.9805Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const SETTINGS_NAV_ITEMS = [
  { href: '/settings', label: '계정', icon: AccountTabIcon },
  { href: '/settings/notifications', label: '알림', icon: NotificationTabIcon },
];

// Figma Sidebar "type=setting"(node 226:26429) 스펙 반영.
export function SettingsSidebar() {
  const pathname = usePathname();
  const logoutMutation = useLogoutMutation();

  return (
    <aside className="flex h-full w-[257px] flex-col items-start justify-between border-r border-line-secondary bg-base-white">
      <div className="flex w-full flex-col items-start">
        <Link
          href="/jobs"
          aria-label="이전 화면으로"
          className="flex h-[80px] w-full flex-col items-start justify-center px-6"
        >
          <div className="flex items-center gap-3 text-label-base">
            <BackArrowIcon />
            <span className="text-5 font-semibold">설정</span>
          </div>
        </Link>

        <nav className="flex w-full flex-col items-start gap-2 px-6">
          <div className="flex w-full flex-col items-start gap-1">
            {SETTINGS_NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex h-10 w-full items-center gap-3 rounded-xl border px-5 py-4 transition-colors ${
                    isActive
                      ? 'border-line-secondary bg-neutral-100 text-label-base'
                      : 'border-transparent text-label-body hover:bg-neutral-100 hover:text-label-base'
                  }`}
                >
                  <Icon />
                  <span className="flex-1 truncate text-3 font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      <div className="flex w-full flex-col items-start px-6 py-5">
        <button
          type="button"
          onClick={() => logoutMutation.mutate()}
          className="flex items-center justify-center rounded-lg border border-line-secondary bg-base-white px-4 py-3"
        >
          <span className="text-3 font-medium leading-[1.5] text-label-base">로그아웃</span>
        </button>
      </div>
    </aside>
  );
}
