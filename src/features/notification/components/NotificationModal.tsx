'use client';

import { useState } from 'react';
import { NotificationItem } from './NotificationItem';
import { useNotificationInbox } from '../api/useNotificationQuery';
import { useMarkNotificationsRead } from '../api/useNotificationMutations';

// Figma "지원 마감일 알림 확인 후(알림 모달 등장)"(node 101:17610) 스펙 반영.
// ⚠️ "모두 삭제" 버튼: API 명세서 5장에 인앱 알림 삭제 API가 없어(조회 5.4 / 읽음처리 5.5만
// 존재) 사용자 확인(2026-07-23)에 따라 실제 동작은 "모두 읽음 처리"로 구현. 문구는 Figma
// 그대로 "모두 삭제"를 두되, 기획 쪽에 문구 수정 여부 확인 필요 — TODO 남김.
// ⚠️ "더보기": 5.4는 커서 페이지네이션이 없어(최신 N건만 반환) size를 늘려 재조회하는 방식으로
// 구현. 대량 이력이 필요하면 5.3(발송 이력) 연동을 별도로 검토해야 함.
export function NotificationModal() {
  const [size, setSize] = useState(20);
  const { data, isLoading } = useNotificationInbox(size);
  const markReadMutation = useMarkNotificationsRead();

  const items = data?.items ?? [];

  function handleDismiss(id: number) {
    markReadMutation.mutate([id]);
  }

  function handleMarkAllRead() {
    const unreadIds = items.filter((i) => !i.isRead).map((i) => i.id);
    if (unreadIds.length > 0) markReadMutation.mutate(unreadIds);
  }

  return (
    <div className="flex w-[475px] flex-col items-start gap-4 overflow-hidden rounded-[20px] bg-base-white py-6 shadow-spread-small">
      <div className="flex w-full items-center justify-between px-8">
        <p className="text-5 font-semibold text-label-base">알림</p>
        <button type="button" onClick={handleMarkAllRead} className="text-1 font-medium text-label-body">
          모두 삭제
        </button>
      </div>

      <div className="flex w-full flex-col items-start border-t border-line-secondary">
        <div className="flex max-h-[418px] w-full flex-col items-start overflow-y-auto">
          {isLoading && (
            <p className="w-full px-8 py-6 text-center text-3 text-label-description">불러오는 중...</p>
          )}
          {!isLoading && items.length === 0 && (
            <p className="w-full px-8 py-6 text-center text-3 text-label-description">
              새로운 알림이 없어요.
            </p>
          )}
          {items.map((item) => (
            <NotificationItem key={item.id} item={item} onDismiss={handleDismiss} />
          ))}
        </div>

        {items.length >= size && (
          <div className="flex w-full flex-col items-center pt-4">
            <button
              type="button"
              onClick={() => setSize((prev) => prev + 20)}
              className="flex items-center justify-center gap-[2px] rounded-lg border border-line-secondary bg-base-white py-2 pl-3 pr-[7px] text-3 font-medium text-label-base"
            >
              더보기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
