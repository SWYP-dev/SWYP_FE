'use client';

import { motion } from 'framer-motion';
import Reveal from './Reveal';
import SectionLabel from './SectionLabel';

// 취준생이 실제로 마주하는 화면을 그대로 옮긴 카드들. rot/x는 흩어진 느낌을 주는 값.
const scattered = [
  {
    t: '자기소개서_최종_최최종_v3.docx',
    s: '어느 공고에 냈는지 기억나지 않아요.',
    rot: '-6deg',
    x: '0px',
  },
  {
    t: '탭 12개',
    s: '사람인 · 잡코리아 · 원티드 · 링크드인',
    rot: '3deg',
    x: '26px',
  },
  {
    t: '지원현황.xlsx',
    s: "노션에도 있고, 카톡 '나에게 보내기'에도 있어요.",
    rot: '-2deg',
    x: '10px',
  },
  { t: '오늘 23:59 마감', s: '알림은 오지 않았다', rot: '5deg', x: '34px' },
];

export default function Problem() {
  return (
    <section
      id="problem"
      className="relative border-t border-slate-100 bg-[#F8FAFC] py-[112px] sm:py-[144px]"
    >
      <div className="mx-auto grid max-w-[1200px] items-center gap-[64px] px-[24px] lg:grid-cols-2 lg:gap-[96px]">
        <Reveal>
          <div className="relative mx-auto w-full max-w-[440px]">
            {scattered.map((c, i) => (
              <motion.div
                key={c.t}
                initial={{ opacity: 0, y: 30, rotate: 0 }}
                whileInView={{ opacity: 1, y: 0, rotate: c.rot }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                style={{ marginLeft: c.x }}
                className="mb-[16px] rounded-2xl border border-slate-200 bg-white p-[20px] shadow-[0_18px_40px_-24px_rgba(15,23,42,0.35)]"
              >
                <p className="text-[15px] font-semibold text-[#0F172A]">{c.t}</p>
                <p className="mt-[4px] text-[13.5px] text-slate-500">{c.s}</p>
              </motion.div>
            ))}
          </div>
        </Reveal>

        <div>
          <Reveal>
            <SectionLabel>문제점</SectionLabel>
            <h2 className="mt-[24px] font-heading text-[34px] font-bold leading-[1.24] tracking-[-0.025em] text-[#0F172A] sm:text-[46px]">
              공고 따로 서류 따로, <br /> 찾기 번거롭지 않으신가요?
            </h2>
            <p className="mt-[24px] max-w-[520px] text-[17px] leading-[1.7] text-slate-600">
              취업 준비에 필요한 것들이 흩어져 있으니, 찾는 것부터가 일이에요.
            </p>
          </Reveal>

          <div className="mt-[40px] divide-y divide-slate-200 border-t border-slate-200">
            {[
              '공고는 사람인, 잡코리아, 원티드에,',
              '일정은 노션, 서류는 구글 드라이브, 메모는 카톡에,',
              '지난달에 낸 자기소개서가 어느 버전이었는지 기억나지도 않고,',
              '채용 공고 마감은 까먹고 있다 지나고 나서야 알게 되었어요.',
            ].map((t, i) => (
              <Reveal key={t} delay={i * 0.08}>
                <div className="flex gap-[16px] py-[16px]">
                  <span className="mt-[2px] font-mono text-[13px] font-semibold text-[#4864F1]">
                    0{i + 1}
                  </span>
                  <p className="text-[16px] leading-[1.6] text-slate-700">{t}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
