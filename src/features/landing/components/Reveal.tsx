'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface RevealProps {
  children: ReactNode;
  /** 여러 요소를 순차 등장시킬 때 쓰는 지연(초). */
  delay?: number;
  /** 등장 시작 시점의 Y 오프셋(px). */
  y?: number;
  className?: string;
}

export default function Reveal({ children, delay = 0, y = 24, className = '' }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
