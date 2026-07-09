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
  onSelectCategory: (category: string) => void;
}

/**
 * 칸반 카드 상세(3.4)의 서류 첨부 탭에서 파일 카테고리를 선택하는 드롭다운.
 * TODO: 트리거는 AttachmentItem의 실제 버튼 스펙 확인 후 교체 필요 (지금은 임시 button).
 */
export function AttachmentCategoryDropdown({ onSelectCategory }: AttachmentCategoryDropdownProps) {
  const { isOpen, triggerRef, toggle, close } = usePopoverTrigger<HTMLButtonElement>();

  return (
    <>
      <button ref={triggerRef} onClick={toggle} type="button">
        카테고리 선택
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
