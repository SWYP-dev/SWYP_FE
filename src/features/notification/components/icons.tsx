// notification-preview 페이지 전용 인라인 아이콘 모음.
// public/icons에 대응 에셋(bell 제외)이 없어, features/deadlines/components/DeadlineHeader.tsx의
// 인라인 SVG 패턴을 그대로 따라 직접 구현.

export function NotificationBellIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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

export function MailIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1.5" y="3" width="13" height="10" rx="1.5" stroke="#9E9EA1" strokeWidth="1.3" />
      <path
        d="M2 4.5 8 9l6-4.5"
        stroke="#9E9EA1"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CalendarSmallIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3" width="10" height="9" rx="1.2" stroke="#9E9EA1" strokeWidth="1.2" />
      <path
        d="M2 5.5h10M4.5 1.5v3M9.5 1.5v3"
        stroke="#9E9EA1"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// 안읽음 알림 표시용 작은 점.
export function UnreadDotIcon({ size = 8 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="4" cy="4" r="4" fill="#4864F1" />
    </svg>
  );
}
