import type { NextPage } from "next";
import Image from "next/image";

/* ──────────────────────────────────────────────
   토큰 매핑 기준 (src/styles/tokens.css — Tailwind v4 @theme)
   - spacing: 1=2px 2=4px 3=8px 4=12px 5=16px 6=20px
              7=24px 8=32px 9=40px 10=48px 11=64px 12=80px
   - --spacing: initial 상태이므로 스케일 밖 값(7px, 18px, 35px 등)은
     반드시 arbitrary([Npx])로 표기
   - 타이포: text-N에 행간 내장 (leading-* 불필요)
   ────────────────────────────────────────────── */

const NAV_ITEMS = [
  { icon: "/icons/search.svg", label: "통합 공고 탐색", active: true },
  { icon: "/icons/bookmark.svg", label: "즐겨찾기", active: false },
  { icon: "/icons/kanban.svg", label: "지원 현황 관리", active: false },
  { icon: "/icons/calendar.svg", label: "일정 관리", active: false },
];

const FILTERS = ["플랫폼", "직무", "지역", "경력"];

// TODO: API 연동 전 임시 데이터
const JOBS = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  company: "와탭랩스",
  title: "Java/Spring Boot 백엔드 개발자 채용",
  deadline: "~07.02(수)",
  meta: "부산 부산진구 • 경력 3-10년",
  thumbnail: "/images/job-thumbnail.png",
}));

const NavItem = ({
  icon,
  label,
  active,
}: {
  icon: string;
  label: string;
  active?: boolean;
}) => (
  <div
    className={`h-9 rounded-xl flex items-center py-4 px-5 gap-3 ${
      active
        ? "bg-base-gray border border-line-secondary text-label-base"
        : "text-label-body"
    }`}
  >
    <Image src={icon} alt="" width={16} height={16} className="shrink-0" />
    <div className="flex-1 font-medium truncate">{label}</div>
  </div>
);

const FilterChip = ({
  label,
  hasDropdown = true,
}: {
  label: string;
  hasDropdown?: boolean;
}) => (
  <div
    className={`rounded-lg bg-base-white inset-ring inset-ring-line-secondary flex items-center justify-center py-3 ${
      hasDropdown ? "pl-4 pr-[7px]" : "px-4"
    }`}
  >
    <div className="flex items-center justify-center gap-1 min-h-5">
      <div className="font-medium">{label}</div>
      {hasDropdown && (
        <Image
          src="/icons/chevron-down.svg"
          alt=""
          width={16}
          height={16}
          className="shrink-0"
        />
      )}
    </div>
  </div>
);

const JobCard = ({ job }: { job: (typeof JOBS)[number] }) => (
  <div className="flex-1 flex flex-col items-start gap-4">
    <div
      className="self-stretch h-[160px] rounded-xl overflow-hidden shrink-0 flex flex-col p-4 bg-cover bg-no-repeat bg-top"
      style={{ backgroundImage: `url(${job.thumbnail})` }}
    >
      <div className="self-stretch flex items-center justify-between gap-6">
        <div className="h-6 w-[35px]" />
        <Image
          src="/icons/star.svg"
          alt="즐겨찾기 추가"
          width={20}
          height={20}
          className="shrink-0"
        />
      </div>
    </div>
    <div className="self-stretch flex flex-col items-start gap-4">
      <div className="self-stretch flex flex-col items-start gap-1">
        <div className="self-stretch text-3 font-medium text-label-body">
          {job.company}
        </div>
        <div className="self-stretch text-6 font-semibold text-label-base line-clamp-2">
          {job.title}
        </div>
      </div>
      <div className="self-stretch flex flex-col items-start gap-2 text-1 font-medium text-label-description">
        <div className="self-stretch">{job.deadline}</div>
        <div className="self-stretch">{job.meta}</div>
      </div>
    </div>
  </div>
);

const Component1: NextPage = () => {
  return (
    <div className="w-full min-h-[64rem] relative bg-base-white overflow-hidden flex items-start text-left text-label-base font-pretendard">
      {/* ── Left Navigation ── */}
      <aside className="self-stretch w-[256px] bg-base-white border-r border-line-secondary flex flex-col justify-between">
        <div className="flex flex-col">
          <div className="h-12 flex flex-col justify-center py-3 px-7">
            <b className="text-8">CHWIHAP</b>
          </div>
          <nav className="px-5 text-3">
            <div className="flex flex-col gap-2">
              {NAV_ITEMS.map((item) => (
                <NavItem key={item.label} {...item} />
              ))}
            </div>
          </nav>
        </div>
        {/* Profile */}
        <div className="p-5 text-3">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-max bg-base-gray border border-line-secondary overflow-hidden shrink-0 flex items-center justify-center">
              <Image
                src="/images/avatar.png"
                alt="프로필 이미지"
                width={32}
                height={32}
                className="rounded-max object-cover"
              />
            </div>
            <div className="flex-1 flex flex-col min-w-0">
              <div className="font-semibold truncate">손진영</div>
              <div className="text-1 text-label-body truncate">
                sonjinyoung9849@gmail.com
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="self-stretch flex-1 flex flex-col text-3">
        {/* Search */}
        <header className="bg-base-white flex flex-col items-end justify-center py-6 px-11">
          <div className="w-[255px] rounded-max bg-base-white border border-line-secondary overflow-hidden flex items-center py-2 px-6">
            <div className="flex-1 flex items-center justify-between min-h-7">
              <div className="flex-1 text-1 text-label-placeholder">
                텍스트를 입력해 주세요.
              </div>
              <Image
                src="/icons/search.svg"
                alt="검색"
                width={18}
                height={18}
                className="shrink-0"
              />
            </div>
          </div>
        </header>

        {/* Filter & Sort */}
        <div className="flex items-center justify-between pt-11 px-11 pb-5 gap-6 text-center">
          <div className="flex items-center gap-3">
            {FILTERS.map((label) => (
              <FilterChip key={label} label={label} />
            ))}
            <FilterChip label="마감일 임박" hasDropdown={false} />
          </div>
          <div className="flex items-start gap-2 text-label-body">
            <div className="font-semibold text-label-base">최신순</div>
            <div className="text-1">•</div>
            <div>마감일순</div>
          </div>
        </div>

        {/* Job Grid */}
        <div className="flex-1 bg-surface-card grid grid-cols-4 content-start py-7 px-11 gap-x-5 gap-y-11 text-label-body">
          {JOBS.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Component1;
