import { Search, Bookmark } from 'lucide-react';

const jobs = [
  {
    icon: 'N',
    t: '서버 개발자 채용',
    c: '네이버 · 경기 성남시',
    added: false,
  },
  {
    icon: 'K',
    t: 'iOS 엔지니어',
    c: '카카오 · 경기 성남시',
    added: true,
  },
];

export default function Solution1Demo() {
  return (
    <div className="overflow-hidden rounded-[14px] border border-[#E5E7EB] bg-white shadow-[0_40px_90px_-50px_rgba(15,23,42,0.28)]">
      {/* search */}
      <div className="border-b border-[#F0F0F0] p-[16px]">
        <div className="flex items-center gap-[12px] rounded-xl bg-[#F7F7F8] px-[16px] py-[14px]">
          <Search className="h-[16px] w-[16px] text-[#9CA3AF]" />
          <span className="flex-1 text-[14px] text-[#9CA3AF]">
            플랫폼 구분 없이 직무, 키워드 검색...
          </span>
          <button className="rounded-md border border-[#E5E7EB] bg-white px-[10px] py-[4px] text-[12px] font-medium text-[#6B7280]">
            Enter
          </button>
        </div>
      </div>

      {/* list */}
      <div className="space-y-[10px] p-[16px]">
        {jobs.map((j) => (
          <div
            key={j.t}
            className={`flex items-center gap-[14px] rounded-xl border bg-white p-[14px] ${
              j.added ? 'border-[#4864F1]' : 'border-[#E5E7EB]'
            }`}
          >
            <div className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-xl bg-[#F3F4F6] text-[16px] font-bold text-[#6B7280]">
              {j.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-bold tracking-tight text-[#1A1A1A]">{j.t}</p>
              <p className="mt-[2px] text-[12.5px] text-[#9CA3AF]">{j.c}</p>
            </div>
            {j.added ? (
              <span className="rounded-lg border border-[#A0B0F5] bg-white px-[12px] py-[6px] text-[12px] font-semibold text-[#4864F1]">
                내 보드에 추가됨
              </span>
            ) : (
              <Bookmark className="h-[20px] w-[20px] text-[#D1D5DB]" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
