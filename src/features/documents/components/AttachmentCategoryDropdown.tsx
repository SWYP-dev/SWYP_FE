'use client';

import { Popover, usePopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, type DropdownMenuItem } from '@/components/ui/dropdown-menu';

const DOCUMENT_CATEGORY_ITEMS: DropdownMenuItem[] = [
  { label: '이력서' },
  { label: '포트폴리오' },
  { label: '개인 채널' },
  { label: '기타' },
];

interface AttachmentCategoryDropdownProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string) => void;
}

/**
 * 미선택 시 "+ 카테고리" 버튼이 트리거, 선택 후에는 선택된 카테고리 뱃지 자체가
 * 트리거로 바뀌어 클릭하면 다시 선택 목록이 뜬다.
 */
export function AttachmentCategoryDropdown({
  selectedCategory,
  onSelectCategory,
}: AttachmentCategoryDropdownProps) {
  const { isOpen, triggerRef, toggle, close } = usePopoverTrigger<HTMLButtonElement>();

  return (
    <>
      <button
        ref={triggerRef}
        onClick={toggle}
        type="button"
        className={
          selectedCategory
            ? 'shrink-0 rounded bg-neutral-50 px-1 py-[1px] text-0 font-medium text-label-description'
            : 'shrink-0 text-1 font-medium text-label-primary'
        }
      >
        {selectedCategory ?? '+ 카테고리'}
      </button>

      <Popover isOpen={isOpen} onClose={close} triggerRef={triggerRef} align="start">
        <DropdownMenu
          items={DOCUMENT_CATEGORY_ITEMS}
          onSelect={(item) => {
            onSelectCategory(item.label);
            close();
          }}
        />
      </Popover>
    </>
  );
}
