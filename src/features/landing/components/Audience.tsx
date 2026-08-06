import Reveal from './Reveal';
import SectionLabel from './SectionLabel';
import { GraduationCap, Briefcase, Repeat } from 'lucide-react';

const groups = [
  {
    icon: GraduationCap,
    t: '첫 취업을 준비하는 분',
    d: '어디서부터 시작해야 할지 막막할 때, 공고 탐색부터 서류 정리까지 순서대로 따라갈 수 있어요.',
  },
  {
    icon: Repeat,
    t: '이직을 준비하는 직장인',
    d: '일과 병행하며 짧은 시간에 확인해야 하는 마감일과 전형 단계를 한눈에 관리할 수 있어요.',
  },
  {
    icon: Briefcase,
    t: '여러 곳에 동시 지원하는 분',
    d: '지원 수가 많아질수록 헷갈리는 서류 버전과 진행 상황을 공고별로 정확히 구분할 수 있어요.',
  },
];

export default function Audience() {
  return (
    <section id="audience" className="relative py-[112px] sm:py-[144px]">
      <div className="mx-auto max-w-[1200px] px-[24px]">
        <Reveal>
          <div className="max-w-[620px]">
            <SectionLabel>사용 대상</SectionLabel>
            <h2 className="mt-[24px] font-heading text-[34px] font-bold leading-[1.24] tracking-[-0.025em] text-[#0F172A] sm:text-[46px]">
              취업과 이직을
              <br />
              준비하는 모든 분에게.
            </h2>
          </div>
        </Reveal>

        <div className="mt-[64px] grid gap-[24px] lg:grid-cols-3">
          {groups.map((g, i) => (
            <Reveal key={g.t} delay={i * 0.1}>
              <div className="h-full rounded-2xl border border-slate-200 bg-white p-[32px] transition-all duration-500 hover:-translate-y-[4px] hover:border-[#4864F1]/40 hover:shadow-[0_30px_60px_-35px_rgba(72,100,241,0.45)]">
                <g.icon className="h-[24px] w-[24px] text-[#4864F1]" />
                <h3 className="mt-[24px] text-[19px] font-bold tracking-[-0.02em] text-[#0F172A]">
                  {g.t}
                </h3>
                <p className="mt-[12px] text-[15.5px] leading-[1.7] text-slate-600">{g.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
