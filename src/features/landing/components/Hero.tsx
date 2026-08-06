'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import HeroMockup from './mockups/HeroMockup';

// custom={i}로 넘긴 순번만큼 등장이 지연된다.
const rise: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    // as const: 배열이 number[]로 넓어지면 framer-motion의 cubic-bezier 튜플과 안 맞음
    transition: { duration: 0.85, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setTilt({
      x: ((e.clientX - r.left) / r.width - 0.5) * 10,
      y: ((e.clientY - r.top) / r.height - 0.5) * -8,
    });
  };

  return (
    <section id="hero" className="relative overflow-hidden pt-[132px] pb-[96px] sm:pb-[128px]">
      <div className="pointer-events-none absolute inset-0 grid-canvas fade-edges" />
      <div className="pointer-events-none absolute -top-[160px] left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[#4864F1]/10 blur-[130px]" />

      <div className="relative mx-auto max-w-[1200px] px-[24px]">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div variants={rise} custom={0} initial="hidden" animate="show">
            <span className="inline-flex items-center gap-[8px] rounded-full border border-[#4864F1]/20 bg-[#EFF6FF] px-[12px] py-[4px] text-[12px] font-medium text-[#4864F1]">
              {/* flex item이라 블록화되어 w/h가 적용됨 (inline span이면 무시됨) */}
              <span className="h-[6px] w-[6px] shrink-0 rounded-full bg-[#4864F1] animate-pulse" />
              올인원 취업 준비 관리 서비스
            </span>
          </motion.div>

          <div className="mt-[28px] overflow-hidden">
            <motion.h1
              variants={rise}
              custom={1}
              initial="hidden"
              animate="show"
              className="font-heading text-[34px] font-bold leading-[1.18] tracking-[-0.03em] text-[#0F172A] sm:text-[58px] lg:text-[76px]"
            >
              흩어진 취업 준비를
              <br />
              <span className="text-[#4864F1]">한곳에 취합하세요.</span>
            </motion.h1>
          </div>

          <motion.p
            variants={rise}
            custom={2}
            initial="hidden"
            animate="show"
            className="mx-auto mt-[28px] max-w-[620px] text-[17px] leading-[1.65] text-slate-600"
          >
            공고 탐색부터 지원 및 서류, 일정 관리까지,
            <br />
            취업 준비의 모든 과정을 하나의 흐름으로 관리해보세요.
          </motion.p>

          <motion.div
            variants={rise}
            custom={3}
            initial="hidden"
            animate="show"
            className="mt-[40px] flex flex-col items-center justify-center gap-[12px] sm:flex-row"
          >
            {/* 크기는 디자인 시스템 Button lg 규격(h48/px28/py12/text16/radius12).
                색상만 토큰을 쓰고 치수는 이 파일 컨벤션대로 arbitrary px로 표기. */}
            <Link
              href="/jobs"
              className="inline-flex h-[48px] items-center justify-center gap-[2px] rounded-[12px] bg-fill-primary px-[28px] py-[12px] text-[16px] font-semibold leading-[1.5] text-base-white transition-colors hover:bg-action-primary-hover"
            >
              무료로 시작하기
            </Link>
          </motion.div>
        </div>

        <motion.div
          ref={ref}
          onMouseMove={onMove}
          onMouseLeave={() => setTilt({ x: 0, y: 0 })}
          initial={{ opacity: 0, y: 60, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto mt-[64px] max-w-[1080px] [perspective:1600px] sm:mt-[80px]"
        >
          <motion.div
            animate={{ rotateY: tilt.x, rotateX: tilt.y }}
            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            className="overflow-hidden rounded-[20px] border border-slate-200/80 bg-white shadow-[0_50px_120px_-40px_rgba(15,23,42,0.35)]"
          >
            <div className="flex items-center gap-[6px] border-b border-slate-100 bg-slate-50/80 px-[16px] py-[12px]">
              <span className="h-[10px] w-[10px] rounded-full bg-slate-200" />
              <span className="h-[10px] w-[10px] rounded-full bg-slate-200" />
              <span className="h-[10px] w-[10px] rounded-full bg-slate-200" />
            </div>
            <HeroMockup />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
