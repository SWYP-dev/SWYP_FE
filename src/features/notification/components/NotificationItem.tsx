'use client';

import { CloseIcon } from '@/components/ui/icons';
import type { InAppNotificationItem } from '@/types/api';

interface NotificationItemProps {
  item: InAppNotificationItem;
  onDismiss: (id: number) => void;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function formatNotificationDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, '0')}. ${String(d.getDate()).padStart(2, '0')}(${WEEKDAYS[d.getDay()]})`;
}

// Figma "NotificationItem"(node 101:17566 등) 스펙 반영.
// ⚠️ 단순화: API 5.4 응답에는 D-day 라벨·마감일 데이터가 없고 이미 완성된 `message` 문자열만
// 내려옴(예: "카카오 지원 마감 D-3입니다."). Figma처럼 별도 D-Day 뱃지·색상 강조는 생략하고
// message를 그대로 표시. isRead가 false일 때만 좌측에 안읽음 점을 표시.
export function NotificationItem({ item, onDismiss }: NotificationItemProps) {
  return (
    <div className="flex w-full flex-col items-start border-b border-line-secondary bg-base-white">
      <div className="flex w-full flex-col items-start gap-2 px-8 py-4">
        <div className="flex w-full items-center justify-between">
          {!item.isRead && <span className="size-[6px] shrink-0 rounded-max bg-status-negative" />}
          <button
            type="button"
            onClick={() => onDismiss(item.id)}
            aria-label="알림 읽음 처리"
            className="ml-auto text-label-description"
          >
            <CloseIcon size={14} />
          </button>
        </div>
        <p className="w-full text-3 font-medium leading-[1.6] text-label-base">{item.message}</p>
        <p className="text-1 font-medium text-label-description">
          {formatNotificationDate(item.createdAt)}
        </p>
      </div>
    </div>
  );
}
