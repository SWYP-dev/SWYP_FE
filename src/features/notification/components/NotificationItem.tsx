'use client';

import { CloseIcon } from '@/components/ui/icons';
import { Badge } from '@/components/ui/badge';
import type { InAppNotificationItem } from '@/types/api';

interface NotificationItemProps {
  item: InAppNotificationItem;
  onDelete: (id: number) => void;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function formatNotificationDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, '0')}. ${String(d.getDate()).padStart(2, '0')}(${WEEKDAYS[d.getDay()]})`;
}

// Figma "NotificationItem"(node 101:17566 등) 스펙 반영.
// ⚠️ [2026-08-04] 백엔드 알림 API 변경(프론트 연동 공유) 반영:
// - 기존 단일 message 문자열 → dDayLabel/title/description 3개 필드로 분리.
// - title/description은 백엔드가 완성한 문구를 그대로 표시하며 프론트에서 조합하지 않음.
// - dDayLabel은 알림 배지로 표시. 다만 이 배지의 정확한 색상/크기 Figma 스펙은 아직 확인
//   전이라(기존 node 101:17566이 현재 Figma 파일에서 조회되지 않음) 우선 DeadlineBadge와
//   동일한 Badge(type="primary")를 재사용함 — 진영님 확인 후 조정 필요 (TODO).
// - X 버튼: 신규 단일 삭제 API(5.6) 연동. 기존엔 삭제 API가 없어 "읽음 처리"로 대체
//   구현했었지만, 본래 "닫기(X) = 삭제" 의도대로 실제 삭제 동작으로 변경 — 세은님 확인 필요 (TODO).
export function NotificationItem({ item, onDelete }: NotificationItemProps) {
  return (
    <div className="flex w-full flex-col items-start border-b border-line-secondary bg-base-white">
      <div className="flex w-full flex-col items-start gap-2 px-8 py-4">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            {!item.isRead && <span className="size-[6px] shrink-0 rounded-max bg-status-negative" />}
            <Badge type="primary">{item.dDayLabel}</Badge>
          </div>
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            aria-label="알림 삭제"
            className="text-label-description"
          >
            <CloseIcon size={14} />
          </button>
        </div>
        <div className="flex w-full flex-col items-start gap-1">
          <p className="w-full text-3 font-semibold leading-[1.6] text-label-base">{item.title}</p>
          <p className="w-full text-2 font-medium leading-[1.6] text-label-body">{item.description}</p>
        </div>
        <p className="text-1 font-medium text-label-description">
          {formatNotificationDate(item.createdAt)}
        </p>
      </div>
    </div>
  );
}
