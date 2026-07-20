import Image from 'next/image';

export function PinIcon() {
  return <Image src="/icons/location.png" alt="" width={16} height={16} />;
}

export function BriefcaseIcon() {
  return <Image src="/icons/briefcase.png" alt="" width={16} height={16} />;
}

export function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3.5" width="12" height="10.5" rx="1.5" stroke="#9E9EA1" strokeWidth="1.3" />
      <path d="M2 6.5h12M5 2v3M11 2v3" stroke="#9E9EA1" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

// name="drag-handle" — KanbanColumn 헤더 버튼그룹에서 사용.
export function DragHandleIcon() {
  return <Image src="/icons/drag-handle.png" alt="" width={16} height={16} />;
}

// name="Edit" — KanbanColumn 헤더 버튼그룹에서 사용.
export function EditIcon() {
  return <Image src="/icons/edit.png" alt="" width={16} height={16} />;
}

// name="trash" — KanbanColumn 헤더 버튼그룹에서 사용.
export function TrashIcon() {
  return <Image src="/icons/trash.png" alt="" width={16} height={16} />;
}

// name="close" — Drawer, Modal 등 닫기 버튼에서 공통 사용.
export function CloseIcon({ size = 16 }: { size?: number }) {
  return <Image src="/icons/close.png" alt="" width={size} height={size} />;
}

// name="plus" — KanbanColumn "지원 내역 추가" 버튼에서 사용.
export function PlusSmallIcon() {
  return <Image src="/icons/plus.png" alt="" width={16} height={16} />;
}

// name="triangle-down-fill" — KanbanColumn 헤더 장식용 화살표.
// PRD v1.3.0에서 "카드 목록 접기" 기능이 삭제되어 현재는 비활성 장식 아이콘으로만 사용.
export function TriangleDownFillIcon() {
  return <Image src="/icons/triangle-down-fill.png" alt="" width={16} height={16} />;
}
