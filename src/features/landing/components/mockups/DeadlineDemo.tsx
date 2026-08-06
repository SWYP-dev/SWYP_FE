'use client';

import { motion } from 'framer-motion';
import { Pencil, Trash2, CalendarClock } from 'lucide-react';

const today = [{ c: '당근마켓', t: '프론트엔드 개발자', d: '~ 10.28 (화)', tag: '지원 전' }];

const ongoing = [
  { c: '토스(Toss)', t: '웹 프론트엔드 엔지니어', d: '상시채용', tag: '지원 전' },
  { c: '네이버', t: '서버 개발자 채용', d: '상시채용', tag: '면접' },
  { c: '카카오', t: 'iOS 엔지니어', d: '상시채용', tag: '최종 결과' },
];

interface RowProps {
  /** 기업명 */
  c: string;
  /** 공고명 */
  t: string;
  /** 마감일 표기 */
  d: string;
  /** 전형 단계 태그 */
  tag: string;
  delay: number;
}

function Row({ c, t, d, tag, delay }: RowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-xl border border-[#E5E7EB] bg-white p-[16px] pl-[20px]"
    >
      <span className="absolute left-0 top-[12px] bottom-[12px] w-[3px] rounded-full bg-[#4864F1]" />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] text-[#9CA3AF]">{c}</p>
          <p className="mt-[4px] text-[14px] font-bold tracking-tight text-[#1A1A1A]">{t}</p>
          <p className="mt-[6px] flex items-center gap-[4px] text-[12px] text-[#6B7280]">
            <CalendarClock className="h-[12px] w-[12px]" /> {d}
          </p>
        </div>
        <div className="flex gap-[8px] text-[#D1D5DB]">
          <Pencil className="h-[14px] w-[14px]" />
          <Trash2 className="h-[14px] w-[14px]" />
        </div>
      </div>
      <span className="mt-[12px] inline-block rounded-md bg-[#F3F4F6] px-[8px] py-[2px] text-[11px] font-medium text-[#6B7280]">
        {tag}
      </span>
    </motion.div>
  );
}

export default function Solution3Demo() {
  return (
    <div className="overflow-hidden rounded-[14px] border border-[#E5E7EB] bg-white shadow-[0_40px_90px_-50px_rgba(15,23,42,0.28)]">
      <div className="border-b border-[#F0F0F0] px-[20px] py-[16px]">
        <p className="text-[14px] font-bold tracking-tight text-[#1A1A1A]">지원 마감일</p>
      </div>
      <div className="space-y-[20px] p-[20px]">
        <div>
          <p className="mb-[12px] text-[12px] font-bold text-[#4864F1]">오늘 D-Day</p>
          <div className="space-y-[10px]">
            {today.map((r) => (
              <Row key={r.c} {...r} delay={0.1} />
            ))}
          </div>
        </div>
        <div>
          <p className="mb-[12px] text-[12px] font-bold text-[#6B7280]">상시채용</p>
          <div className="space-y-[10px]">
            {ongoing.map((r, i) => (
              <Row key={r.c} {...r} delay={0.18 + i * 0.1} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
