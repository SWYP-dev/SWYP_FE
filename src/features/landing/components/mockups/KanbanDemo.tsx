'use client';

import { motion } from 'framer-motion';
import { GripVertical, CalendarClock, FileText } from 'lucide-react';

const columns = [
  {
    name: '지원 전',
    dot: '#C4C4C4',
    cards: [
      { c: '토스(Toss)', t: '웹 프론트엔드 엔지니어', d: 'D-6' },
      { c: '당근마켓', t: '프론트엔드 개발자', d: 'D-9' },
    ],
  },
  {
    name: '면접',
    dot: '#4864F1',
    cards: [{ c: '네이버', t: '서버 개발자 채용', d: 'D-12', file: '이력서_v2.pdf' }],
  },
  { name: '최종 결과', dot: '#72D283', cards: [] },
];

interface CardProps {
  /** 기업명 */
  c: string;
  /** 공고명 */
  t: string;
  /** D-day 표기 */
  d: string;
  /** 첨부 서류명. 없으면 마감일 표기로 대체된다. */
  file?: string;
}

function Card({ c, t, d, file }: CardProps) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-[14px] shadow-[0_4px_12px_-8px_rgba(15,23,42,0.2)]">
      <p className="text-[11.5px] text-[#9CA3AF]">
        {c} · 마감 {d}
      </p>
      <p className="mt-[4px] text-[13px] font-semibold leading-snug text-[#1A1A1A]">{t}</p>
      {file ? (
        <span className="mt-[8px] inline-flex items-center gap-[4px] rounded-md bg-[#4864F1]/10 px-[8px] py-[2px] text-[10px] font-medium text-[#4864F1]">
          <FileText className="h-[10px] w-[10px]" /> {file}
        </span>
      ) : (
        <p className="mt-[8px] flex items-center gap-[4px] text-[10.5px] text-[#9CA3AF]">
          <CalendarClock className="h-[10px] w-[10px]" /> {d}
        </p>
      )}
    </div>
  );
}

export default function KanbanDemo() {
  return (
    <div className="rounded-[14px] border border-[#E5E7EB] bg-white p-[16px] shadow-[0_40px_90px_-50px_rgba(15,23,42,0.28)] sm:p-[20px]">
      <div className="grid gap-[12px] sm:grid-cols-3">
        {columns.map((col, ci) => (
          <div key={col.name} className="rounded-xl bg-[#FAFAFA] p-[10px]">
            <div className="mb-[12px] flex items-center gap-[6px] px-[4px]">
              <GripVertical className="h-[14px] w-[14px] text-[#D1D5DB]" />
              <span className="h-[8px] w-[8px] rounded-full" style={{ background: col.dot }} />
              <span className="text-[12.5px] font-semibold text-[#1A1A1A]">{col.name}</span>
              <span className="flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[#E5E7EB] px-[4px] text-[10px] font-semibold text-[#6B7280]">
                {col.cards.length + (ci === 1 ? 1 : 0)}
              </span>
            </div>
            <div className="space-y-[10px]">
              {col.cards.map((c) => (
                <Card key={c.t} {...c} />
              ))}
              {ci === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: -120, x: -60, rotate: -4, scale: 1.03 }}
                  whileInView={{ opacity: 1, y: 0, x: 0, rotate: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 1.1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-xl border-2 border-[#4864F1]/50 bg-white p-[14px] shadow-[0_16px_40px_-18px_rgba(72,100,241,0.5)]"
                >
                  <p className="text-[11px] font-semibold text-[#4864F1]">면접 단계로 이동됨</p>
                  <p className="mt-[4px] text-[13px] font-semibold leading-snug text-[#1A1A1A]">
                    카카오 iOS 엔지니어
                  </p>
                </motion.div>
              )}
              {col.cards.length === 0 && ci !== 1 && (
                <div className="flex h-[80px] items-center justify-center rounded-lg border border-dashed border-[#E5E7EB] text-[11px] text-[#9CA3AF]">
                  카드를 이곳으로 드래그
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
