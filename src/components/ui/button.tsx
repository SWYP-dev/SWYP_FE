import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

// Figma Modal/ModalFooter 스펙 확인 결과 반영: primary는 SemiBold, 나머지는 Medium
const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    'bg-fill-primary text-base-white font-semibold hover:bg-action-primary-hover disabled:bg-action-primary-disabled',
  secondary:
    'bg-base-white text-label-base font-medium border border-line-secondary hover:bg-action-secondary-hover disabled:text-label-secondary-disabled',
  ghost:
    'bg-transparent text-label-primary font-medium hover:bg-action-secondary-hover disabled:text-label-primary-disabled',
  danger:
    'bg-status-negative text-base-white font-semibold hover:opacity-90 disabled:bg-fill-negative-light disabled:text-status-negative',
};

// lg 사이즈는 Figma ModalFooter 버튼 실측값(px-28/py-12/text-16) 그대로 반영
const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-2',
  md: 'px-5 py-3 text-3',
  lg: 'px-[28px] py-4 text-5', // py-4 = --spacing-4(12px), text-5 = 16px
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
      className={`inline-flex items-center justify-center gap-2 rounded-xl transition-colors disabled:cursor-not-allowed ${VARIANT_CLASS[variant]} ${SIZE_CLASS[size]} ${className}`}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}
