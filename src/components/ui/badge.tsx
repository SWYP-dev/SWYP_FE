import type { ReactNode } from 'react';

// Figma "Badge" 컴포넌트(node 9:7202) 스펙 그대로 반영.
// 크기(padding/radius/font)는 고정, 색상은 type 또는 className으로 확장.

type BadgeType = 'default' | 'primary';

interface BaseBadgeProps {
  children: ReactNode;
  type?: BadgeType;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string; // 플랫폼/마감일 등 커스텀 색상 override용
}

const TYPE_CLASS: Record<BadgeType, string> = {
  default: 'bg-base-white text-neutral-1000',
  primary: 'bg-fill-primary-light text-label-primary',
};

export function Badge({
  children,
  type = 'default',
  leftIcon,
  rightIcon,
  className,
}: BaseBadgeProps) {
  return (
    <span
      className={`inline-flex items-center justify-center gap-[2px] rounded-md px-3 py-2 text-0 font-medium ${
        className ?? TYPE_CLASS[type]
      }`}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </span>
  );
}

// ===================================
// 플랫폼 뱃지 (위 Badge를 기반으로 색상만 커스텀)
// PRD 4.1.2 / API 명세서 Appendix Platform enum 기준
// ===================================
export type Platform = 'SARAMIN' | 'WANTED' | 'WORKNET' | 'DIRECT' | 'PUBLIC' | 'PUBLIC_PERSONNEL';

interface PlatformBadgeProps {
  platform: Platform;
}

// 디자이너(진영님) 확인 전까지 임시 색상 매핑
const PLATFORM_CONFIG: Record<Platform, { label: string; className: string }> = {
  SARAMIN: { label: '사람인', className: 'bg-blue-50 text-blue-700' },
  WANTED: { label: '원티드', className: 'bg-service-50 text-service-700' },
  WORKNET: { label: '워크넷', className: 'bg-green-50 text-green-700' },
  DIRECT: { label: '직접등록', className: 'bg-neutral-100 text-neutral-700' },
  PUBLIC: { label: '공공기관', className: 'bg-neutral-100 text-neutral-700' },
  PUBLIC_PERSONNEL: { label: '공공기관', className: 'bg-neutral-100 text-neutral-700' },
};

export function PlatformBadge({ platform }: PlatformBadgeProps) {
  const config = PLATFORM_CONFIG[platform];
  return <Badge className={config.className}>{config.label}</Badge>;
}

// ===================================
// 마감일 뱃지 (PRD 4.1.3 "마감 임박(7일 이내)" 기준)
// ===================================
interface DeadlineBadgeProps {
  deadline: string; // "2026-07-15" 형식
}

export function DeadlineBadge({ deadline }: DeadlineBadgeProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(deadline);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return <Badge className="bg-neutral-100 text-neutral-500">마감</Badge>;
  }

  const isUrgent = diffDays <= 7;
  const label = diffDays === 0 ? '오늘 마감' : `D-${diffDays}`;

  return (
    <Badge
      className={
        isUrgent ? 'bg-fill-negative-light text-status-negative' : 'bg-neutral-100 text-neutral-700'
      }
    >
      {label}
    </Badge>
  );
}
