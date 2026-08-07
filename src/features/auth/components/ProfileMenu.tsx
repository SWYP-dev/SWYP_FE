'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Popover, usePopoverTrigger } from '@/components/ui/popover';
import { useAuthStore } from '../store/authStore';
import { useLogoutMutation } from '../hooks/useAuthMutations';

// Figma Sidebar "type=login"(node 111:23074) 프로필 영역 반영.
// 로그아웃 트리거는 시안에 없어서 확인 후 "프로필 클릭 → 드롭다운"으로 결정.
export function ProfileMenu() {
  const user = useAuthStore((s) => s.user);
  const { isOpen, triggerRef, toggle, close } = usePopoverTrigger<HTMLButtonElement>();
  const logoutMutation = useLogoutMutation();

  if (!user) return null;

  return (
    <div className="w-full">
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        className="flex w-full items-center justify-start gap-4 text-left"
      >
        <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-max border border-line-secondary bg-neutral-100">
          {user.profileImage ? (
            <Image
              src={user.profileImage}
              alt=""
              width={32}
              height={32}
              className="rounded-max object-cover"
            />
          ) : (
            <Image src="/icons/person-fill.svg" alt="" width={20} height={20} />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col items-start text-left leading-[1.5]">
          <p className="w-full truncate text-left text-3 font-semibold text-label-base">
            {user.nickname}
          </p>
          <p className="w-full truncate text-left text-1 text-neutral-700">{user.email ?? ''}</p>
        </div>
      </button>

      <Popover isOpen={isOpen} onClose={close} triggerRef={triggerRef} align="start">
        {/* Figma DropdownMenu(node 33:80) — w-[140px]. Tailwind arbitrary width가
            Popover 포털에서 간헐히 무시되어 inline width로 고정. */}
        <div
          role="menu"
          style={{ width: 140 }}
          className="box-border overflow-clip rounded-xl border border-line-secondary bg-base-white p-1"
        >
          <Link
            href="/settings"
            role="menuitem"
            onClick={close}
            className="flex h-10 w-full items-center rounded-lg px-4 text-left text-4 font-medium leading-[1.5] text-label-base hover:bg-action-secondary-hover"
          >
            설정
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              close();
              logoutMutation.mutate();
            }}
            className="flex h-10 w-full items-center rounded-lg px-4 text-left text-4 font-medium leading-[1.5] text-label-base hover:bg-action-secondary-hover"
          >
            로그아웃
          </button>
        </div>
      </Popover>
    </div>
  );
}
