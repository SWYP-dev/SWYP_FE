export function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8 14.5s5-4.2 5-8.2A5 5 0 0 0 3 6.3c0 4 5 8.2 5 8.2Z"
        stroke="#9E9EA1"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="6.3" r="1.8" stroke="#9E9EA1" strokeWidth="1.3" />
    </svg>
  );
}

export function BriefcaseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="5" width="12" height="8" rx="1.5" stroke="#9E9EA1" strokeWidth="1.3" />
      <path
        d="M6 5V3.5A1.5 1.5 0 0 1 7.5 2h1A1.5 1.5 0 0 1 10 3.5V5"
        stroke="#9E9EA1"
        strokeWidth="1.3"
      />
    </svg>
  );
}

export function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3.5" width="12" height="10.5" rx="1.5" stroke="#9E9EA1" strokeWidth="1.3" />
      <path d="M2 6.5h12M5 2v3M11 2v3" stroke="#9E9EA1" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

// Figma Icon 컴포넌트(node 51:16)에서 실제 아이콘 이름 확인 완료.
// name="drag-handle" / "Edit" / "trash" — KanbanColumn 헤더 버튼그룹에서 사용.
// (실제 SVG는 Figma가 임시 asset URL로만 제공해 직접 가져올 수 없어 대체 아이콘으로 구현)
export function DragHandleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="6" cy="4" r="1.1" fill="currentColor" />
      <circle cx="10" cy="4" r="1.1" fill="currentColor" />
      <circle cx="6" cy="8" r="1.1" fill="currentColor" />
      <circle cx="10" cy="8" r="1.1" fill="currentColor" />
      <circle cx="6" cy="12" r="1.1" fill="currentColor" />
      <circle cx="10" cy="12" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M11 2.5 13.5 5 5 13.5H2.5V11L11 2.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3 4.5h10M6.5 4.5V3a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1.5M4.5 4.5 5 13a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1l.5-8.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// name="close" — Drawer, Modal 등 닫기 버튼에서 공통 사용.
export function CloseIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 4l8 8M12 4l-8 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PlusSmallIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 3.5v9M3.5 8h9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

// name="triangle-down-fill" — KanbanColumn 헤더 장식용 화살표.
// PRD v1.3.0에서 "카드 목록 접기" 기능이 삭제되어 현재는 비활성 장식 아이콘으로만 사용.
export function TriangleDownFillIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.5 6h7L8 10.5 4.5 6Z" fill="currentColor" />
    </svg>
  );
}
