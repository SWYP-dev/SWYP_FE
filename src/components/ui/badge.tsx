import type { ReactNode } from 'react';

// PRD 4.1.3 / API 명세서 Appendix Platform enum 기준
export type Platform = 'SARAMIN' | 'WANTED' | 'WORKNET' | 'DIRECT';

interface PlatformBadgeProps {
  platform: Platform;
}

// 플랫폼별 표시 이름과 색상. 디자이너(진영님) 확인 후 색상 값만 교체하면 됨.
const PLATFORM_CONFIG: Record<Platform, { label: string; className: string }> = {
  SARAMIN: { label: '사람인', className: 'bg-blue-50 text-blue-700' },
  WANTED: { label: '원티드', className: 'bg-service-50 text-service-700' },
  WORKNET: { label: '워크넷', className: 'bg-green-50 text-green-700' },
  DIRECT: { label: '직접등록', className: 'bg-neutral-100 text-neutral-700' },
};

export function PlatformBadge({ platform }: PlatformBadgeProps) {
  const config = PLATFORM_CONFIG[platform];

  return (
    <span
      className={`inline-flex items-center rounded-max px-3 py-1 text-1 font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

interface DeadlineBadgeProps {
  deadline: string; // "2026-07-15" 형식 (API 명세서 date 필드)
}

// PRD 4.1.3 "마감 임박(7일 이내)" 기준. D-day 계산해서 임박 여부에 따라 색 다르게 표시.
export function DeadlineBadge({ deadline }: DeadlineBadgeProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(deadline);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return (
      <span className="inline-flex items-center rounded-max bg-neutral-100 px-3 py-1 text-1 font-medium text-neutral-500">
        마감
      </span>
    );
  }

  const isUrgent = diffDays <= 7; // PRD 기준 7일 이내는 임박으로 취급
  const label = diffDays === 0 ? '오늘 마감' : `D-${diffDays}`;

  return (
    <span
      className={`inline-flex items-center rounded-max px-3 py-1 text-1 font-medium ${
        isUrgent ? 'bg-fill-negative-light text-status-negative' : 'bg-neutral-100 text-neutral-700'
      }`}
    >
      {label}
    </span>
  );
}

// 범용 뱃지 (전형 단계, 서류 타입 등 자유롭게 쓰는 용도)
interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'neutral' | 'positive' | 'negative';
}

const VARIANT_CLASS: Record<NonNullable<BadgeProps['variant']>, string> = {
  primary: 'bg-service-50 text-service-700',
  neutral: 'bg-neutral-100 text-neutral-700',
  positive: 'bg-fill-positive-light text-status-positive',
  negative: 'bg-fill-negative-light text-status-negative',
};

export function Badge({ children, variant = 'neutral' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-max px-3 py-1 text-1 font-medium ${VARIANT_CLASS[variant]}`}
    >
      {children}
    </span>
  );
}
