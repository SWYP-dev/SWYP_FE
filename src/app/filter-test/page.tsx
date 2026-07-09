'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Menu } from '@/components/ui/menu';
import { Slider } from '@/components/ui/slider';

const REGIONS = [
  { label: '서울', value: 'seoul' },
  { label: '부산', value: 'busan' },
  { label: '대구', value: 'daegu' },
];

export default function FilterTestPage() {
  const [checked, setChecked] = useState(false);
  const [selected, setSelected] = useState<string[]>(['busan']);
  const [range, setRange] = useState<[number, number]>([0, 15]);

  return (
    <div className="flex flex-col gap-8 p-8">
      <Checkbox checked={checked} onChange={setChecked} label="체크박스 테스트" />
      <Menu
        type="checkbox"
        items={REGIONS}
        selectedValues={selected}
        onToggle={(v) =>
          setSelected((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]))
        }
      />
      <Slider
        minValue={range[0]}
        maxValue={range[1]}
        onChange={(min, max) => setRange([min, max])}
      />
    </div>
  );
}
