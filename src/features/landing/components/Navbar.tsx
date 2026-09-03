'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChwihapWordmark } from '@/features/notification/components/icons';
import { useTestSessionMutation } from '@/features/auth/hooks/useAuthMutations';
import { ButtonSpinnerIcon } from '@/components/ui/spinner';
import KakaoLoginButton from './KakaoLoginButton';

const links = [
  { label: '문제점', href: '#problem' },
  { label: '해결 방식', href: '#solution' },
  { label: '핵심 기능', href: '#features' },
  { label: '사용 대상', href: '#audience' },
];

interface NavbarProps {
  /**
   * 'landing': 랜딩 기본형. 섹션 앵커 메뉴와 '테스트 시작하기' CTA를 모두 노출한다.
   * 'default': 로고와 '회원가입/로그인'만 남긴다. 랜딩 섹션 앵커(#problem 등)가 없는
   *            법률 문서 페이지(/privacy, /terms)에서 쓴다.
   */
  variant?: 'landing' | 'default';
}

export default function Navbar({ variant = 'landing' }: NavbarProps) {
  const isDefault = variant === 'default';
  const [scrolled, setScrolled] = useState(false);
  const testSession = useTestSessionMutation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    // border-line-secondary를 분기 밖에 고정해 둔 이유:
    // Tailwind v4 preflight는 `border: 0 solid`라 색을 지정하지 않으면 border-color가
    // currentColor(전역 color 지정이 없어 검정)로 남는다. 분기 한쪽에만 색을 두면
    // transition-all이 스크롤 임계값(12px) 근처에서 border-color를 검정 ↔ 회색으로
    // 보간해 검정 선이 스친다. 색은 항상 같게 두고 굵기와 배경만 바뀌게 한다.
    <header
      className={`fixed inset-x-0 top-0 z-50 border-line-secondary transition-all duration-500 ${
        scrolled
          ? 'border-b bg-white/75 backdrop-blur-xl'
          : // 약관·처리방침 페이지는 배경이 흰색이라 최상단에서도 경계선이 있어야 헤더가 구분된다
            `${isDefault ? 'border-b' : 'border-b-0'} bg-transparent`
      }`}
    >
      <nav className="mx-auto flex h-[68px] max-w-[1200px] items-center justify-between px-[24px]">
        {/* 랜딩에서는 같은 페이지의 히어로로 스크롤하지만, 법률 문서 페이지에는
            #hero가 없으므로 홈으로 이동시킨다. */}
        {isDefault ? (
          <Link href="/" className="flex items-center gap-[8px] py-[8px]" aria-label="취합 홈">
            <ChwihapWordmark className="h-[20px] w-[110px]" />
          </Link>
        ) : (
          <a href="#hero" className="flex items-center gap-[8px] py-[8px]" aria-label="취합 홈">
            <ChwihapWordmark className="h-[20px] w-[110px]" />
          </a>
        )}

        {isDefault ? null : (
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
        )}

        {/* Figma Header(node 1888:158554)의 우측 버튼 2종.
            이 파일의 나머지는 arbitrary px를 쓰지만, 이 버튼들은 Figma가 디자인 시스템
            변수(--service/400, --line/secondary, --label/primary, --spacing/4)를 직접
            참조하므로 토큰 클래스를 사용한다. px-4=12px, text-3=14px.
            h-[38px]: 로그인 버튼만 1px border가 있어 자연 높이가 39px/37px로 어긋남
            (Button lg가 h-10으로 고정한 것과 동일한 이유) → border-box 기준으로 고정. */}
        <div className="flex items-center gap-[12px]">
          <KakaoLoginButton className="inline-flex h-[38px] items-center justify-center gap-[2px] rounded-lg border border-line-secondary bg-base-white px-4 text-3 font-medium leading-[1.5] text-label-primary transition-colors hover:bg-fill-primary-light">
            회원가입/로그인
          </KakaoLoginButton>
          {isDefault ? null : (
            // 카카오 로그인 없이 테스트 계정 세션을 발급받아 바로 서비스로 진입시킨다
            <button
              type="button"
              onClick={() => testSession.mutate()}
              disabled={testSession.isPending}
              className="inline-flex h-[38px] items-center justify-center gap-[2px] rounded-lg bg-fill-primary px-4 text-3 font-semibold leading-[1.5] text-base-white transition-colors hover:bg-action-primary-hover disabled:bg-action-primary-disabled"
            >
              {testSession.isPending && <ButtonSpinnerIcon />}
              {testSession.isPending ? '준비 중' : '테스트 시작하기'}
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
