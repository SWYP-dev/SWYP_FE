interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2.5 6L5 8.5L9.5 3.5"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Figma Checkbox 컴포넌트(node 31:97) 스펙 반영.
export function Checkbox({ checked, onChange, label }: CheckboxProps) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2">
      <span
        className={`flex size-[18px] shrink-0 items-center justify-center rounded-sm border transition-colors ${
          checked
            ? 'border-transparent bg-fill-primary hover:bg-action-primary-hover'
            : 'border-neutral-500 hover:border-line-primary'
        }`}
      >
        {checked && <CheckIcon />}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      {label && <span className="text-3 text-label-base">{label}</span>}
    </label>
  );
}
