import { Checkbox } from './checkbox';

interface MenuItemData {
  label: string;
  value: string;
}

interface MenuProps {
  type?: 'default' | 'checkbox';
  items: MenuItemData[];
  selectedValues: string[];
  onToggle: (value: string) => void;
}

// Figma Menu 컴포넌트(node 31:207) 스펙 반영. 스크롤 가능한 옵션 리스트.
export function Menu({ type = 'default', items, selectedValues, onToggle }: MenuProps) {
  return (
    <div className="flex h-[304px] w-[300px] flex-col items-start overflow-y-auto px-1 py-[6px]">
      {items.map((item) => {
        const isSelected = selectedValues.includes(item.value);

        if (type === 'checkbox') {
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onToggle(item.value)}
              className={`flex h-10 w-full items-center gap-2 rounded-sm px-4 py-3 text-left ${
                isSelected ? 'bg-fill-primary-light' : 'bg-base-white'
              }`}
            >
              <Checkbox checked={isSelected} onChange={() => onToggle(item.value)} />
              <span className="flex-1 truncate text-3 font-medium text-label-base">
                {item.label}
              </span>
            </button>
          );
        }

        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onToggle(item.value)}
            className={`flex h-10 w-full items-center gap-2 rounded-sm px-4 py-3 text-left ${
              isSelected ? 'bg-fill-primary-light' : 'bg-base-white'
            }`}
          >
            <span
              className={`flex-1 truncate text-3 ${
                isSelected ? 'font-bold text-label-primary' : 'font-medium text-label-base'
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
