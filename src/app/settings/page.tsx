'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useDeleteAccountMutation } from '@/features/auth/hooks/useAuthMutations';
import { DeleteAccountModal } from '@/features/auth/components/DeleteAccountModal';
import { ProfileEditModal } from '@/features/auth/components/ProfileEditModal';

// Figma "설정 - 계정"(node 226:28863) 스펙 반영.
export default function SettingsAccountPage() {
  const user = useAuthStore((s) => s.user);
  const deleteAccountMutation = useDeleteAccountMutation();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="flex w-full flex-col items-start gap-4">
      <div className="flex w-full flex-col items-start gap-7 rounded-xl bg-base-white p-7">
        <p className="w-full text-7 font-semibold leading-[1.4] text-label-base">계정</p>

        <div className="flex w-full flex-col items-start gap-6">
          <div className="flex w-full items-center">
            <p className="w-[110px] shrink-0 truncate text-3 font-medium text-label-base">프로필</p>
            <div className="flex flex-1 items-center justify-between">
              <div className="flex items-center gap-3">
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
                <p className="truncate text-3 font-medium text-label-base">{user.nickname}</p>
              </div>

              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center justify-center rounded-lg border border-line-secondary bg-base-white px-4 py-3"
              >
                <span className="text-3 font-medium text-label-body">프로필 수정</span>
              </button>
            </div>
          </div>

          <div className="h-px w-full bg-line-secondary" />

          <div className="flex w-full items-center">
            <p className="w-[110px] shrink-0 truncate text-3 font-medium text-label-base">
              이메일 주소
            </p>
            <div className="flex flex-1 items-center justify-between">
              <p className="truncate text-3 font-medium text-label-base">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col items-start gap-6 rounded-xl bg-base-white p-7">
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-1 flex-col items-start gap-2">
            <p className="text-3 font-medium text-label-base">계정 삭제</p>
            <p className="text-1 font-medium text-label-body">
              지원 현황과 스크랩이 모두 삭제되고, 되돌릴 수 없어요.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex items-center justify-center rounded-lg border border-status-negative bg-base-white px-4 py-3"
          >
            <span className="text-3 font-medium text-status-negative">계정 삭제</span>
          </button>
        </div>
      </div>

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        isDeleting={deleteAccountMutation.isPending}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteAccountMutation.mutate()}
      />

      <ProfileEditModal
        isOpen={isProfileModalOpen}
        user={user}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
}
