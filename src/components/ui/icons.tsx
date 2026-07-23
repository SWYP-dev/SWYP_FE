import Image from 'next/image';

export function PinIcon() {
  return <Image src="/icons/location.svg" alt="" width={16} height={16} />;
}

export function BriefcaseIcon() {
  return <Image src="/icons/briefcase.svg" alt="" width={16} height={16} />;
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
export function DragHandleIcon({ size = 16 }: { size?: number }) {
  return <Image src="/icons/drag-handle.svg" alt="" width={size} height={size} />;
}

// name="Edit" — KanbanColumn 헤더 버튼그룹에서 사용.
export function EditIcon({ size = 16 }: { size?: number }) {
  return <Image src="/icons/edit.svg" alt="" width={size} height={size} />;
}

// name="trash" — KanbanColumn 헤더 버튼그룹에서 사용.
export function TrashIcon({ size = 16 }: { size?: number }) {
  return <Image src="/icons/trash.svg" alt="" width={size} height={size} />;
}

// name="close" — Drawer, Modal 등 닫기 버튼에서 공통 사용.
export function CloseIcon({ size = 16 }: { size?: number }) {
  return <Image src="/icons/close.svg" alt="" width={size} height={size} />;
}

// name="plus" — KanbanColumn "지원 내역 추가" 버튼에서 사용.
export function PlusSmallIcon({ size = 16 }: { size?: number }) {
  return <Image src="/icons/plus.svg" alt="" width={size} height={size} />;
}

// name="triangle-down-fill" — KanbanColumn 헤더 장식용 화살표.
// PRD v1.3.0에서 "카드 목록 접기" 기능이 삭제되어 현재는 비활성 장식 아이콘으로만 사용.
export function TriangleDownFillIcon({ size = 16 }: { size?: number }) {
  return <Image src="/icons/triangle-down-fill.svg" alt="" width={size} height={size} />;
}
