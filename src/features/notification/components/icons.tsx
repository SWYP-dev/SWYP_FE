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
    <svg
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M7 4.5L11.5 9L7 13.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * TODO: 실제 로고 SVG 에셋으로 교체 필요.
 * 샌드박스 네트워크 제약으로 Figma 원본 로고(node 122:22883)를 내려받지 못해 임시로 재현했습니다.
 * public/logo/chwihap-logo.svg 등으로 실제 파일을 받아 교체해주세요.
 */
export function ChwihapWordmark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 110 20"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Chwihap"
    >
      <circle cx="9" cy="10" r="8" fill="#4864F1" />
      <path
        d="M12.2 7.2a4.2 4.2 0 1 0 0 5.6"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
      <text
        x="21"
        y="15"
        fontFamily="Pretendard, sans-serif"
        fontWeight="700"
        fontSize="13"
        fill="#212123"
      >
        Chwihap
      </text>
    </svg>
  );
}
