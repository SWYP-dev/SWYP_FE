'use client';

import { Popover, usePopoverTrigger } from '@/components/ui/popover';
import { NotificationModal } from './NotificationModal';
import { useNotificationInbox } from '../api/useNotificationQuery';

function BellIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 3.5c-3.5 0-5.5 2.4-5.5 6v3.2c0 .6-.2 1.2-.6 1.7l-1 1.3c-.6.8 0 2 1 2h12.2c1 0 1.6-1.2 1-2l-1-1.3c-.4-.5-.6-1.1-.6-1.7V9.5c0-3.6-2-6-5.5-6Z"
        stroke="#212123"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 19a2 2 0 0 0 4 0" stroke="#212123" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Figma "지원 마감일 알림 확인 전/후"(node 101:17618, 101:17610) 스펙 반영.
// unreadCount > 0일 때만 벨 우측 상단에 빨간 점 표시. 클릭 시 Popover로 NotificationModal
// 오픈 — Figma 시안에 전체화면 딤 처리가 없어서(일반 Modal이 아니라 팝오버 형태) 기존
// Popover 패턴(ProfileMenu·AttachmentCategoryDropdown과 동일)을 재사용.
export function NotificationBell() {
  const { isOpen, triggerRef, toggle, close } = usePopoverTrigger<HTMLButtonElement>();
  const { data } = useNotificationInbox();
  const hasUnread = (data?.unreadCount ?? 0) > 0;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-label="알림"
        className="relative flex size-6 items-center justify-center"
      >
        {hasUnread && <span className="absolute right-[1px] top-0 size-1 rounded-max bg-status-negative" />}
        <BellIcon />
      </button>

      <Popover isOpen={isOpen} onClose={close} triggerRef={triggerRef} align="end">
        <NotificationModal />
      </Popover>
    </>
  );
}
