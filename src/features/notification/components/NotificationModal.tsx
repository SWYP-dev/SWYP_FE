'use client';

import { useRouter } from 'next/navigation';
import { NotificationItem } from './NotificationItem';
import { useNotificationInboxInfinite } from '../api/useNotificationQuery';
import { useDeleteNotification, useDeleteAllNotifications } from '../api/useNotificationMutations';

// Figma "지원 마감일 알림 확인 후(알림 모달 등장)"(node 101:17610) 스펙 반영.
// ⚠️ [2026-08-04] 백엔드 알림 API 변경(프론트 연동 공유) 반영: 인앱 알림 단일/전체 삭제
// API(5.6/5.7)가 신규로 추가됨. 기존엔 삭제 API가 없어 "모두 삭제" 버튼이 실제로는
// "모두 읽음 처리"만 수행하는 임시 조치였음(사용자 확인 2026-07-23) — 이번에 실제 삭제
// API로 교체함. 삭제는 되돌릴 수 없는 동작인데 확인 다이얼로그 없이 즉시 실행되므로,
// UX상 확인 절차가 필요한지 세은님 확인 필요 (TODO).
// "더보기": v1.11 정정에 따라 5.3과 동일한 cursor/nextCursor/hasNext 커서 페이지네이션 —
// 클릭 시 직전 응답의 nextCursor로 다음 페이지만 이어서 조회(재조회 아님).
export function NotificationModal() {
  const router = useRouter();
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useNotificationInboxInfinite();
  const deleteMutation = useDeleteNotification();
  const deleteAllMutation = useDeleteAllNotifications();

  const items = data?.pages.flatMap((page) => page.items) ?? [];

  function handleDelete(id: number) {
    deleteMutation.mutate(id);
  }

  function handleDeleteAll() {
    if (items.length === 0) return;
    deleteAllMutation.mutate();
  }

  return (
    <div className="flex w-[475px] flex-col items-start gap-4 overflow-hidden rounded-[20px] bg-base-white py-6 shadow-spread-small">
      <div className="flex w-full items-center justify-between px-8">
        <p className="text-5 font-semibold text-label-base">알림</p>
        <button
          type="button"
          onClick={handleDeleteAll}
          disabled={items.length === 0 || deleteAllMutation.isPending}
          className={`text-1 font-medium ${
            items.length === 0 ? 'cursor-not-allowed text-neutral-300' : 'text-label-body'
          }`}
        >
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
            <NotificationItem key={item.id} item={item} onDelete={handleDelete} />
          ))}
        </div>

        {hasNextPage && (
          <div className="flex w-full flex-col items-center pt-4">
            <button
              type="button"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
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
