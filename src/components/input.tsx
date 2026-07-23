import type { InputHTMLAttributes } from 'react';

type InputVariant = 'default' | 'line';
type InputState = 'default' | 'error' | 'disabled';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: InputVariant;
  inputState?: InputState;
}

// Figma Input 컴포넌트(node 24:3542) 스펙 반영.
// filled/focused는 실제 입력 상태(값 있음/포커스)로 자동 처리되므로 별도 prop 없음.
export function Input({
  variant = 'default',
  inputState = 'default',
  disabled,
  className = '',
  ...rest
}: InputProps) {
  const isDisabled = disabled || inputState === 'disabled';
  const isError = inputState === 'error';

  if (variant === 'line') {
    return (
      <input
        disabled={isDisabled}
        className={`w-full border-b-2 bg-transparent pb-2 text-5 text-label-base outline-none placeholder:text-label-placeholder disabled:text-label-secondary-disabled ${
          isError ? 'border-status-negative' : 'border-line-secondary focus:border-line-primary'
        } ${className}`}
        {...rest}
      />
    );
  }

  return (
    <input
      disabled={isDisabled}
      className={`w-full rounded-xl border bg-base-white px-5 py-4 text-5 text-label-base outline-none placeholder:text-label-placeholder disabled:bg-action-disabled disabled:text-label-secondary-disabled ${
        isError
          ? 'border-status-negative'
          : 'border-line-secondary focus:border-2 focus:border-line-primary'
      } ${className}`}
      {...rest}
    />
  );
}
