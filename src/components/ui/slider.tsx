'use client';

const CAREER_LABELS = [
  '신입',
  '1년',
  '2년',
  '3년',
  '4년',
  '5년',
  '6년',
  '7년',
  '8년',
  '9년',
  '10년',
  '11년',
  '12년',
  '13년',
  '14년',
  '15년 이상',
];
const MAX_STEP = CAREER_LABELS.length - 1;

interface SliderProps {
  minValue: number;
  maxValue: number;
  onChange: (min: number, max: number) => void;
}

// Figma Slider 컴포넌트(node 31:454) 스펙 반영. 경력 범위(신입~15년 이상) 선택용.
export function Slider({ minValue, maxValue, onChange }: SliderProps) {
  const isFullRange = minValue === 0 && maxValue === MAX_STEP;
  const label = isFullRange
    ? '경력 전체'
    : `${CAREER_LABELS[minValue]} - ${CAREER_LABELS[maxValue]}`;

  const leftPercent = (minValue / MAX_STEP) * 100;
  const rightPercent = (maxValue / MAX_STEP) * 100;

  return (
    <div className="flex w-[392px] flex-col items-center gap-2 px-7 pb-5">
      <p className="text-8 font-semibold leading-[1.4] text-neutral-900">{label}</p>

      <div className="relative flex w-full items-center justify-center py-[18px]">
        <div className="relative h-[6px] w-full rounded-sm bg-neutral-300">
          <div
            className="absolute h-[6px] rounded-max bg-fill-primary"
            style={{ left: `${leftPercent}%`, right: `${100 - rightPercent}%` }}
          />
        </div>

        <input
          type="range"
          min={0}
          max={MAX_STEP}
          value={minValue}
          onChange={(e) => onChange(Math.min(Number(e.target.value), maxValue), maxValue)}
          className="range-thumb absolute w-full appearance-none bg-transparent"
        />
        <input
          type="range"
          min={0}
          max={MAX_STEP}
          value={maxValue}
          onChange={(e) => onChange(minValue, Math.max(Number(e.target.value), minValue))}
          className="range-thumb absolute w-full appearance-none bg-transparent"
        />
      </div>
    </div>
  );
}

export { CAREER_LABELS, MAX_STEP };
