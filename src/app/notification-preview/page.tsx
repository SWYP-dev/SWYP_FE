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
 *
 * 카드 클릭 시 진입 방식: 지원 마감일 페이지(/deadlines)로 이동 후 해당 카드의
 * 상세 Drawer를 자동으로 열도록 결정 (별도 페이지 신규 생성 대신 기존 Drawer 재사용).
 */
export default function NotificationPreviewPage() {
  const router = useRouter();
  const groups = groupDeadlineNotifications(mockDeadlineNotifications, MOCK_REFERENCE_DATE);

  return (
    <EmailNotificationPreview
      groups={groups}
      onViewAllClick={() => router.push('/deadlines')}
      onCardClick={(cardId) => router.push(`/deadlines?cardId=${cardId}`)}
    />
  );
}
