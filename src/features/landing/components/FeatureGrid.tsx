import Reveal from './Reveal';
import SectionLabel from './SectionLabel';
import { LayoutGrid, FolderOpen, CalendarCheck, Move, Bookmark, Bell } from 'lucide-react';

const items = [
  {
    icon: LayoutGrid,
    t: '공고 자동 수집',
    d: '여러 채용 플랫폼의 공고를 취합이 모아서 제공해요. 사이트 이동 없이 한 번에 비교하고 탐색해보세요.',
  },
  {
    icon: FolderOpen,
    t: '공고별 서류 보관',
    d: '지원한 공고 카드 안에 제출 서류를 함께 모아둬요. 어떤 버전을 냈는지 헷갈릴 일이 없어요.',
  },
  {
    icon: CalendarCheck,
    t: '마감일 자동 등록',
    d: '공고를 등록하면 기업명과 지원 마감일을 자동 인식해 즉시 일정에 반영해요.',
  },
  {
    icon: Move,
    t: '드래그 전형 관리',
    d: '초기 세팅 없이 드래그 앤 드롭만으로 지원 현황과 전형 단계를 직관적으로 관리해요.',
  },
  {
    icon: Bookmark,
    t: '지원 현황에 추가',
    d: '버튼 한 번으로 지원 현황과 마감일에 공고를 함께 등록해요.',
  },
  {
    icon: Bell,
    t: '마감 임박 알림',
    d: '마감이 다가오면 서비스 알림은 물론 이메일로도 알려줘요.',
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="relative border-y border-slate-100 bg-[#F8FAFC] py-[112px] sm:py-[144px]"
    >
      <div className="mx-auto max-w-[1200px] px-[24px]">
        <Reveal>
          <div className="max-w-[620px]">
            <SectionLabel>핵심 기능 요약</SectionLabel>
            <h2 className="mt-[24px] font-heading text-[34px] font-bold leading-[1.24] tracking-[-0.025em] text-[#0F172A] sm:text-[46px]">
              취업 준비에 필요한건
              <br />
              취합에 다 있어요.
            </h2>
            <p className="mt-[24px] text-[17px] leading-[1.7] text-slate-600">
              앞서 확인한 문제를 각각 해결하는 기능으로 설계했어요.
            </p>
          </div>
        </Reveal>

        <div className="mt-[64px] grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <Reveal key={it.t} delay={(i % 3) * 0.08}>
              <div className="group h-full bg-white p-[32px] transition-colors hover:bg-[#4864F1]/[0.035]">
                <span className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-xl bg-[#4864F1]/10 text-[#4864F1] transition-transform duration-500 group-hover:-translate-y-[4px]">
                  <it.icon className="h-[20px] w-[20px]" />
                </span>
                <h3 className="mt-[24px] text-[18px] font-bold tracking-[-0.02em] text-[#0F172A]">
                  {it.t}
                </h3>
                <p className="mt-[10px] text-[15.5px] leading-[1.65] text-slate-600">{it.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
