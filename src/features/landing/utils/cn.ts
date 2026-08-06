import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// 조건부 className을 합치고 Tailwind 클래스 충돌은 뒤쪽 값으로 정리한다.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
