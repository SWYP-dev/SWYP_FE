import Image from 'next/image';

export function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="1.5"
        y="2.5"
        width="11"
        height="10"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      <path d="M1.5 5.5H12.5" stroke="currentColor" strokeWidth="1.1" />
      <path d="M4 1.5V3.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M10 1.5V3.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <Image src="/icons/chevron-right.svg" alt="" width={18} height={18} className={className} />
  );
}

// Figma 원본 로고(node 122:22883) 반영 완료.
export function ChwihapWordmark({ className }: { className?: string }) {
  return (
    <Image
      src="/logo/chwihap-logo.svg"
      alt="Chwihap"
      width={110}
      height={20}
      className={className}
      priority
    />
  );
}
