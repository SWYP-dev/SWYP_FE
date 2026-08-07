'use client';

import { useState } from 'react';
import { Popover, usePopoverTrigger } from '@/components/ui/popover';
import { NotificationModal } from './NotificationModal';
import { useNotificationInbox } from '../api/useNotificationQuery';
import { useAuthStore } from '@/features/auth/store/authStore';
import { LoginModal } from '@/features/auth/components/LoginModal';

// public/icons/bell.svg(Figma node 101:17618) 경로 그대로 — currentColor로 icon/default 적용
function BellIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-icon-default"
      aria-hidden="true"
    >
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

// Figma "지원 마감일 알림 확인 전/후"(node 101:17618, 101:17610) 스펙 반영.
// unreadCount > 0일 때만 벨 우측 상단에 빨간 점 표시. 클릭 시 Popover로 NotificationModal
// 오픈 — Figma 시안에 전체화면 딤 처리가 없어서(일반 Modal이 아니라 팝오버 형태) 기존
// Popover 패턴(ProfileMenu·AttachmentCategoryDropdown과 동일)을 재사용.
//
// ⚠️ [QA 반영] 비로그인 상태에서 클릭하면 알림 팝오버 대신 로그인 모달을 띄우도록 처리.
// useNotificationInbox는 enabled: isAuthenticated라 비로그인 땐 애초에 데이터가 없어
// 팝오버를 열어도 빈 화면/에러 상태만 보였음 — Sidebar의 로그인 유도 패턴과 동일하게 처리.
export function NotificationBell() {
  const { isOpen, triggerRef, toggle, close } = usePopoverTrigger<HTMLButtonElement>();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { data } = useNotificationInbox();
  const hasUnread = (data?.unreadCount ?? 0) > 0;

  function handleClick() {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }
    toggle();
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleClick}
        aria-label="알림"
        className="relative flex size-7 items-center justify-center"
      >
        {hasUnread && <span className="absolute left-6 top-0 size-2 rounded-max bg-status-negative" />}
        <BellIcon />
      </button>

      <Popover isOpen={isOpen} onClose={close} triggerRef={triggerRef} align="end">
        <NotificationModal />
      </Popover>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
}
