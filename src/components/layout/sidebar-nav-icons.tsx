// Figma Sidebar nav 아이콘(node 36:545, 통합 공고 탐색 node 31:382) 스펙 반영.
// stroke + currentColor로 inactive/hover/active 텍스트 색과 함께 변하도록 inline svg 사용.
// (기존 public/icons/search.svg는 fill 방식이라 다른 nav 아이콘과 어긋났음)

interface SidebarNavIconProps {
  className?: string;
}

export function SearchNavIcon({ className }: SidebarNavIconProps) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M10.5 18C14.6421 18 18 14.6421 18 10.5C18 6.35786 14.6421 3 10.5 3C6.35786 3 3 6.35786 3 10.5C3 14.6421 6.35786 18 10.5 18Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M16 16L20 20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BookmarkNavIcon({ className }: SidebarNavIconProps) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M6.59513 20.1038C5.79037 20.5007 4.75 20.0405 4.75 19.2889V4.61348C4.75 4.13682 5.156 3.75 5.65625 3.75H18.3438C18.844 3.75 19.25 4.13682 19.25 4.61348V19.2889C19.25 20.0405 18.2096 20.5007 17.4049 20.1047L12.6368 17.7563C12.4476 17.662 12.2263 17.6118 12 17.6118C11.7737 17.6118 11.5524 17.662 11.3632 17.7563L6.59513 20.1038Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function KanbanNavIcon({ className }: SidebarNavIconProps) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M17 7V11M12 7V15M7 7V13M3 9.4C3 7.16 3 6.04 3.436 5.184C3.81949 4.43139 4.43139 3.81949 5.184 3.436C6.04 3 7.16 3 9.4 3H14.6C16.84 3 17.96 3 18.816 3.436C19.5686 3.81949 20.1805 4.43139 20.564 5.184C21 6.04 21 7.16 21 9.4V14.6C21 16.84 21 17.96 20.564 18.816C20.1805 19.5686 19.5686 20.1805 18.816 20.564C17.96 21 16.84 21 14.6 21H9.4C7.16 21 6.04 21 5.184 20.564C4.43139 20.1805 3.81949 19.5686 3.436 18.816C3 17.96 3 16.84 3 14.6V9.4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CalendarNavIcon({ className }: SidebarNavIconProps) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M3.25 9.25H20.75M7.361 4.75V2.75M16.611 4.75V2.75M17.25 4.75H6.75C5.82174 4.75 4.9315 5.11875 4.27513 5.77513C3.61875 6.4315 3.25 7.32174 3.25 8.25V17.75C3.25 18.6783 3.61875 19.5685 4.27513 20.2249C4.9315 20.8813 5.82174 21.25 6.75 21.25H17.25C18.1783 21.25 19.0685 20.8813 19.7249 20.2249C20.3813 19.5685 20.75 18.6783 20.75 17.75V8.25C20.75 7.32174 20.3813 6.4315 19.7249 5.77513C19.0685 5.11875 18.1783 4.75 17.25 4.75Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
