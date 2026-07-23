'use client';

import { useRouter } from 'next/navigation';
import { EmailNotificationPreview } from '@/features/notification/components/EmailNotificationPreview';
import { groupDeadlineNotifications } from '@/features/notification/utils/groupDeadlineNotifications';
import {
  MOCK_REFERENCE_DATE,
  mockDeadlineNotifications,
} from '@/features/notification/mock/mockDeadlineNotifications';

/**
 * 이메일 알림 미리보기 페이지 (mock data 기준)
 * Figma: node-id=122-22880
 *
 * TODO(기획 확인): 이 페이지가 디자인 검수용으로만 쓰일지, 실제 데이터를 붙여
 * 사용자/관리자가 미리보기 할 수 있게 할지 세은님 확인 필요.
 * TODO(백엔드 확인): 실 데이터 연동 시 API 소스 확정 필요
 * (5.3 알림 발송 이력 vs 칸반 카드 마감일 데이터).
 * TODO: onViewAllClick의 라우팅 경로("/deadlines")는 임시 값입니다. 실제 마감일 페이지 경로로 수정 필요.
 */
export default function NotificationPreviewPage() {
  const router = useRouter();
  const groups = groupDeadlineNotifications(mockDeadlineNotifications, MOCK_REFERENCE_DATE);

  return (
    <EmailNotificationPreview
      groups={groups}
      onViewAllClick={() => router.push('/deadlines')}
      onCardClick={(cardId) => {
        // TODO: 마감일 상세 진입 방식(드로어 vs 별도 페이지) 확정 후 연결
        console.log('navigate to card', cardId);
      }}
    />
  );
}
