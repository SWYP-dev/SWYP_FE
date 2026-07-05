import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

// 토큰(token.css) 기준 색상 매핑. disabled는 각 variant의 disabled 토큰을 사용.
const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    'bg-fill-primary text-base-white hover:bg-action-primary-hover disabled:bg-action-primary-disabled',
  secondary:
    'bg-base-white text-label-base border border-line-secondary hover:bg-action-secondary-hover disabled:text-label-secondary-disabled',
  ghost:
    'bg-transparent text-label-primary hover:bg-action-secondary-hover disabled:text-label-primary-disabled',
  danger:
    'bg-status-negative text-base-white hover:opacity-90 disabled:bg-fill-negative-light disabled:text-status-negative',
};

// 뱃지와 동일하게 text-N 토큰 사용, 버튼은 패딩이 더 필요해서 spacing 토큰 조합
const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-2',
  md: 'px-5 py-3 text-3',
  lg: 'px-6 py-3 text-4',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed ${VARIANT_CLASS[variant]} ${SIZE_CLASS[size]} ${className}`}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}
