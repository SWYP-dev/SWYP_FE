'use client';

import Image from 'next/image';
import { Popover, usePopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { useAuthStore } from '../store/authStore';
import { useLogoutMutation } from '../hooks/useAuthMutations';

// Figma Sidebar "type=login"(node 111:23074) 프로필 영역 반영.
// 로그아웃 트리거는 시안에 없어서 확인 후 "프로필 클릭 → 드롭다운"으로 결정.
// 기존 AttachmentCategoryDropdown과 동일하게 Popover + DropdownMenu 재사용.
export function ProfileMenu() {
  const user = useAuthStore((s) => s.user);
  const { isOpen, triggerRef, toggle, close } = usePopoverTrigger<HTMLButtonElement>();
  const logoutMutation = useLogoutMutation();

  if (!user) return null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        className="flex w-full items-center gap-3"
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
            // 카카오 프로필 사진 미등록 시 profileImage가 null로 내려옴 (실제 응답으로 확인됨)
            <span className="text-1 font-semibold text-label-body">
              {user.nickname?.[0] ?? '?'}
            </span>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col items-start leading-[1.5]">
          <p className="w-full truncate text-3 font-semibold text-label-base">{user.nickname}</p>
          {/* email은 6.1 보완 호출 전까지 비어있을 수 있음 */}
          <p className="w-full truncate text-1 text-neutral-700">{user.email ?? ''}</p>
        </div>
      </button>

      <Popover isOpen={isOpen} onClose={close} triggerRef={triggerRef} align="start">
        <DropdownMenu
          items={[{ label: '로그아웃' }]}
          onSelect={() => {
            close();
            logoutMutation.mutate();
          }}
        />
      </Popover>
    </>
  );
}
