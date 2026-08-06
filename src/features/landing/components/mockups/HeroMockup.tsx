import { CalendarClock } from 'lucide-react';
import {
  BriefcaseNavIcon,
  BookmarkNavIcon,
  KanbanNavIcon,
  CalendarNavIcon,
} from '@/components/layout/sidebar-nav-icons';
import { ChwihapWordmark } from '@/features/notification/components/icons';

// 실제 서비스 Sidebar(src/components/layout/sidebar.tsx)의 NAV_ITEMS와 동일한 구성.
// 아이콘도 서비스가 쓰는 컴포넌트를 그대로 재사용한다.
const navItems = [
  { label: '통합 공고 탐색', icon: BriefcaseNavIcon },
  { label: '스크랩', icon: BookmarkNavIcon },
  // 우측 패널이 칸반 보드이므로 '지원 현황'이 활성 상태
  { label: '지원 현황', icon: KanbanNavIcon, active: true },
  { label: '지원 마감일', icon: CalendarNavIcon },
];

const columns = [
  {
    name: '지원 전',
    dot: '#C4C4C4',
    count: 2,
    cards: [
      { c: '토스(Toss)', t: '웹 프론트엔드 엔지니어', d: '10.25 마감' },
      { c: '당근마켓', t: '소프트웨어 엔지니어 (Frontend)', d: '10.28 마감' },
    ],
  },
  {
    name: '면접',
    dot: '#4864F1',
    count: 1,
    active: true,
    cards: [{ c: '당근마켓', t: '프론트엔드 개발자', d: '10.30 마감' }],
  },
  {
    name: '최종 결과',
    dot: '#72D283',
    count: 0,
    empty: true,
  },
];

export default function HeroMockup() {
  return (
    <div className="flex h-[460px] overflow-hidden rounded-[14px] border border-[#E5E7EB] bg-white shadow-[0_50px_120px_-40px_rgba(15,23,42,0.28)] sm:h-[500px]">
      {/* sidebar */}
      <aside className="hidden w-[190px] shrink-0 flex-col border-r border-[#F0F0F0] bg-[#FAFAFA] px-[12px] py-[20px] sm:flex">
        {/* 실제 사이드바와 동일하게 상단은 워드마크(그룹 라벨 없음) */}
        <div className="px-[8px] pb-[4px]">
          <ChwihapWordmark className="h-[16px] w-[88px]" />
        </div>
        <nav className="mt-[12px] space-y-[4px]">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={`flex items-center gap-[10px] rounded-lg px-[10px] py-[8px] text-[13px] ${
                  item.active
                    ? 'bg-[#4864F1]/10 font-semibold text-[#4864F1]'
                    : 'text-[#6B7280] hover:bg-[#F3F4F6]'
                }`}
              >
                <Icon className="h-[16px] w-[16px] shrink-0" />
                {item.label}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* board */}
      <div className="flex-1 overflow-hidden bg-white">
        <div className="grid h-full grid-cols-3 gap-[12px] p-[16px]">
          {columns.map((col) => (
            <div key={col.name} className="flex flex-col rounded-xl bg-[#FAFAFA] p-[10px]">
              <div className="mb-[10px] flex items-center gap-[6px] px-[4px]">
                <span className="h-[8px] w-[8px] rounded-full" style={{ background: col.dot }} />
                <span className="text-[12.5px] font-semibold text-[#1A1A1A]">{col.name}</span>
                <span className="flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[#E5E7EB] px-[4px] text-[10px] font-semibold text-[#6B7280]">
                  {col.count}
                </span>
              </div>
              <div className="space-y-[8px] overflow-hidden">
                {col.cards?.map((c) => (
                  <div
                    key={c.t}
                    className={`rounded-lg border bg-white p-[12px] ${
                      col.active ? 'border-[#4864F1]' : 'border-[#E5E7EB]'
                    }`}
                  >
                    <p className="text-[11px] text-[#9CA3AF]">{c.c}</p>
                    <p className="mt-[2px] text-[12.5px] font-semibold leading-snug text-[#1A1A1A]">
                      {c.t}
                    </p>
                    <p className="mt-[8px] flex items-center gap-[4px] text-[10.5px] text-[#9CA3AF]">
                      <CalendarClock className="h-[10px] w-[10px]" /> {c.d}
                    </p>
                  </div>
                ))}
                {col.empty && (
                  <div className="flex h-[88px] items-center justify-center rounded-lg border border-dashed border-[#E5E7EB] text-[11px] text-[#9CA3AF]">
                    카드를 이곳으로 드래그
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
