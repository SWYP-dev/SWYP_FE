import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

// Figma Button 컴포넌트(node 9:7085) 실제 스펙 반영.
// ghost/danger는 디자인에 없어 제거, primary-outline은 outline으로 매핑.
const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    'bg-fill-primary text-base-white font-semibold hover:bg-action-primary-hover disabled:bg-action-primary-disabled',
  secondary:
    'bg-base-white text-label-base font-medium border border-line-secondary hover:bg-action-secondary-hover disabled:text-label-secondary-disabled',
  outline:
    'bg-base-white text-label-primary font-medium border border-line-primary hover:bg-fill-primary-light disabled:border-action-primary-disabled disabled:text-label-primary-disabled',
};

// md: Figma Button 컴포넌트 실측(px-12/py-8/text-14/radius-8) 그대로 반영.
// lg: Modal ModalFooter 버튼 실측(px-28/py-12/text-16/radius-12) 반영.
// sm: 아직 Figma 확인 전 (추후 확인 필요).
const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-2 rounded-lg', // 미확인
  md: 'px-4 py-3 text-3 rounded-lg',
  lg: 'px-[28px] py-4 text-5 rounded-xl',
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
      className={`inline-flex items-center justify-center gap-[2px] transition-colors disabled:cursor-not-allowed ${VARIANT_CLASS[variant]} ${SIZE_CLASS[size]} ${className}`}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}
