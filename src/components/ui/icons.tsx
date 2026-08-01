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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3.25 9.25H20.75M7.361 4.75V2.75M16.611 4.75V2.75M17.25 4.75H6.75C5.82174 4.75 4.9315 5.11875 4.27513 5.77513C3.61875 6.4315 3.25 7.32174 3.25 8.25V17.75C3.25 18.6783 3.61875 19.5685 4.27513 20.2249C4.9315 20.8813 5.82174 21.25 6.75 21.25H17.25C18.1783 21.25 19.0685 20.8813 19.7249 20.2249C20.3813 19.5685 20.75 18.6783 20.75 17.75V8.25C20.75 7.32174 20.3813 6.4315 19.7249 5.77513C19.0685 5.11875 18.1783 4.75 17.25 4.75Z"
        stroke="var(--color-neutral-500)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// name="drag-handle" — KanbanColumn 헤더 드래그 그립. 2열×3행 세로 배치.
// Image(#212123 고정) 대신 currentColor → 부모 text-icon-gray와 동일 톤.
export function DragHandleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="9.5" cy="7" r="1.15" fill="currentColor" />
      <circle cx="14.5" cy="7" r="1.15" fill="currentColor" />
      <circle cx="9.5" cy="12" r="1.15" fill="currentColor" />
      <circle cx="14.5" cy="12" r="1.15" fill="currentColor" />
      <circle cx="9.5" cy="17" r="1.15" fill="currentColor" />
      <circle cx="14.5" cy="17" r="1.15" fill="currentColor" />
    </svg>
  );
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
// Figma 스펙 24x24. 원본 svg(public/icons/close.svg)가 fill="#212123" 하드코딩돼 있어
// next/image로는 색 override가 불가능했음 → 인라인 svg 전환 + currentColor 적용.
export function CloseIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4.86362 4.86358C5.2151 4.51211 5.78494 4.51211 6.13641 4.86358L12 10.7272L17.8636 4.86358C18.2151 4.51211 18.7849 4.51211 19.1364 4.86358C19.4878 5.21505 19.4878 5.7849 19.1364 6.13637L13.2728 12L19.1364 17.8636C19.4878 18.2151 19.4878 18.7849 19.1364 19.1364C18.7849 19.4879 18.2151 19.4879 17.8636 19.1364L12 13.2728L6.13641 19.1364C5.78494 19.4879 5.2151 19.4879 4.86362 19.1364C4.51215 18.7849 4.51215 18.2151 4.86362 17.8636L10.7272 12L4.86362 6.13637C4.51215 5.7849 4.51215 5.21505 4.86362 4.86358Z"
        fill="currentColor"
      />
    </svg>
  );
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
