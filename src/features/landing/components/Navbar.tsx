'use client';

import { useEffect, useState } from 'react';
import { useLoginModalStore } from '@/features/auth/store/loginModalStore';
import { ChwihapWordmark } from '@/features/notification/components/icons';

const links = [
  { label: '문제점', href: '#problem' },
  { label: '해결 방식', href: '#solution' },
  { label: '핵심 기능', href: '#features' },
  { label: '사용 대상', href: '#audience' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  // root layout의 GlobalLoginModal을 그대로 재사용한다.
  const openLoginModal = useLoginModalStore((s) => s.open);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-white/75 backdrop-blur-xl border-b border-slate-200/70' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-[68px] max-w-[1200px] items-center justify-between px-[24px]">
        <a href="#hero" className="flex items-center gap-[8px] py-[8px]" aria-label="취합 홈">
          <ChwihapWordmark className="h-[20px] w-[110px]" />
        </a>

        <div className="hidden items-center gap-[36px] md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[15px] font-medium text-slate-600 transition-colors hover:text-[#0F172A]"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Figma Header(node 1888:158554)의 우측 버튼 2종.
            이 파일의 나머지는 arbitrary px를 쓰지만, 이 버튼들은 Figma가 디자인 시스템
            변수(--service/400, --line/secondary, --label/primary, --spacing/4)를 직접
            참조하므로 토큰 클래스를 사용한다. px-4=12px, text-3=14px.
            h-[38px]: 로그인 버튼만 1px border가 있어 자연 높이가 39px/37px로 어긋남
            (Button lg가 h-10으로 고정한 것과 동일한 이유) → border-box 기준으로 고정. */}
        <div className="flex items-center gap-[12px]">
          <button
            type="button"
            onClick={openLoginModal}
            className="inline-flex h-[38px] items-center justify-center gap-[2px] rounded-lg border border-line-secondary bg-base-white px-4 text-3 font-medium leading-[1.5] text-label-primary transition-colors hover:bg-fill-primary-light"
          >
            회원가입/로그인
          </button>
          <a
            href="#cta"
            className="inline-flex h-[38px] items-center justify-center gap-[2px] rounded-lg bg-fill-primary px-4 text-3 font-semibold leading-[1.5] text-base-white transition-colors hover:bg-action-primary-hover"
          >
            무료로 시작하기
          </a>
        </div>
      </nav>
    </header>
  );
}
