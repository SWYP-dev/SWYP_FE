import Image from 'next/image';

// ⚠️ [QA 반영] 원본 svg(public/icons/location.svg, briefcase.svg)가 stroke="#212123"로
// 하드코딩돼 있어 next/image로는 색을 override 할 수 없었음 → 인라인 svg로 전환해
// neutral-500 토큰(--color-neutral-500) 적용.
export function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M17.1265 4.91741C15.7669 3.52964 13.9228 2.75 12 2.75C10.0772 2.75 8.23311 3.52964 6.87348 4.91741C5.51384 6.30518 4.75 8.1874 4.75 10.15C4.75 16.1625 12 21.25 12 21.25C12 21.25 19.25 16.1625 19.25 10.15C19.25 8.1874 18.4862 6.30518 17.1265 4.91741Z"
        stroke="var(--color-neutral-500)"
        strokeWidth="1.5"
      />
      <path
        d="M14.7188 10.15C14.7188 10.886 14.4323 11.5918 13.9224 12.1122C13.4126 12.6326 12.7211 12.925 12 12.925C11.2789 12.925 10.5874 12.6326 10.0776 12.1122C9.56769 11.5918 9.28125 10.886 9.28125 10.15C9.28125 9.41402 9.56769 8.70819 10.0776 8.18778C10.5874 7.66737 11.2789 7.375 12 7.375C12.7211 7.375 13.4126 7.66737 13.9224 8.18778C14.4323 8.70819 14.7188 9.41402 14.7188 10.15Z"
        stroke="var(--color-neutral-500)"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function BriefcaseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M9 7.5H20C20.55 7.5 21 7.95 21 8.5V19.5C21 20.05 20.55 20.5 20 20.5H4C3.45 20.5 3 20.05 3 19.5V8.5C3 7.95 3.45 7.5 4 7.5H9ZM9 7.5V4.5C9 3.95 9.45 3.5 10 3.5H14C14.55 3.5 15 3.95 15 4.5V7.5"
        stroke="var(--color-neutral-500)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
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
