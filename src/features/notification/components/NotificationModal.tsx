'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [size, setSize] = useState(10);
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
            <div className="flex w-full flex-1 flex-col items-center justify-center gap-4 px-8 py-10">
              <EmptyBellIcon />
              <div className="flex flex-col items-center gap-4">
                <div className="flex flex-col items-center gap-1 text-center">
                  <p className="text-6 font-semibold leading-[1.4] text-label-base">아직 알림이 없어요</p>
                  <p className="whitespace-pre-line text-3 font-medium leading-[1.6] text-label-body">
                    {'지원 현황에 공고를 추가하면\n마감일이 다가올 때 알림이 도착해요.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="flex items-center justify-center rounded-lg border border-line-primary bg-base-white px-4 py-2"
                >
                  <span className="text-3 font-medium text-label-primary">공고 둘러보기</span>
                </button>
              </div>
            </div>
          )}
          {items.map((item) => (
            <NotificationItem key={item.id} item={item} onDismiss={handleDismiss} />
          ))}
        </div>

        {data?.hasNext && (
          <div className="flex w-full flex-col items-center pt-4">
            <button
              type="button"
              onClick={() => setSize((prev) => prev + 10)}
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

function EmptyBellIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 6c-5.5 0-9 3.8-9 9.5v5c0 1-.3 2-.9 2.8L8.3 26c-1 1.3 0 3.2 1.6 3.2h20.2c1.6 0 2.6-1.9 1.6-3.2l-1.8-2.7c-.6-.8-.9-1.8-.9-2.8v-5c0-5.7-3.5-9.5-9-9.5Z"
        stroke="#BDBDC0"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M16.5 32a3.5 3.5 0 0 0 7 0" stroke="#BDBDC0" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
