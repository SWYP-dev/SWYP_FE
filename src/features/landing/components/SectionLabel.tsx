import type { ReactNode } from 'react';

interface SectionLabelProps {
  children: ReactNode;
}

export default function SectionLabel({ children }: SectionLabelProps) {
  return (
    <div className="inline-flex items-center gap-[8px] text-[13px] font-semibold tracking-tight text-[#4864F1]">
      <span className="h-[6px] w-[6px] rounded-full bg-[#4864F1]" />
      {children}
    </div>
  );
}
