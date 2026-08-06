import type { ReactNode } from 'react';
import Reveal from './Reveal';
import SectionLabel from './SectionLabel';
import KanbanDemo from './mockups/KanbanDemo';
import JobSearchDemo from './mockups/JobSearchDemo';
import DocumentDemo from './mockups/DocumentDemo';
import DeadlineDemo from './mockups/DeadlineDemo';

interface BlockProps {
  /** 좌측에 0N 형태로 노출되는 순번. */
  index: number;
  title: string;
  desc: string;
  /** 우측(reverse면 좌측)에 들어가는 목업. */
  children: ReactNode;
  /** true면 텍스트와 목업의 좌우를 뒤집는다. */
  reverse?: boolean;
}

function Block({ index, title, desc, children, reverse }: BlockProps) {
  return (
    <div className="grid items-center gap-[48px] lg:grid-cols-2 lg:gap-[80px]">
      <Reveal className={reverse ? 'lg:order-2' : ''}>
        <span className="font-mono text-[13px] font-semibold text-[#4864F1]">0{index}</span>
        <h3 className="mt-[16px] font-heading text-[28px] font-bold leading-[1.3] tracking-[-0.025em] text-[#0F172A] sm:text-[36px]">
          {title}
        </h3>
        <p className="mt-[20px] max-w-[500px] text-[17px] leading-[1.7] text-slate-600">{desc}</p>
      </Reveal>
      <Reveal delay={0.12} className={reverse ? 'lg:order-1' : ''}>
        {children}
      </Reveal>
    </div>
  );
}

export default function Solution() {
  return (
    <section id="solution" className="relative py-[112px] sm:py-[144px]">
      <div className="mx-auto max-w-[1200px] px-[24px]">
        <Reveal>
          <div className="max-w-[640px]">
            <SectionLabel>해결 방식</SectionLabel>
            <h2 className="mt-[24px] font-heading text-[34px] font-bold leading-[1.24] tracking-[-0.025em] text-[#0F172A] sm:text-[46px]">
              취업 준비의 모든 단계를
              <br />
              취합에서 해결해보세요.
            </h2>
            <p className="mt-[24px] max-w-[520px] text-[17px] leading-[1.7] text-slate-600">
              원하는 공고 탐색부터 서류 작성, 일정 관리까지 필요한 모든 과정을 제공해요.
            </p>
          </div>
        </Reveal>

        <div className="mt-[80px] space-y-[112px] sm:mt-[96px] sm:space-y-[144px]">
          <Block
            index={1}
            title="한 화면에서 공고 찾기"
            desc="채용 플랫폼들을 오갈 필요 없이 흩어진 공고를 한 화면에 모아드릴게요. 직무·지역·경력으로 걸러내고, 마음에 드는 공고는 버튼 하나로 마감일까지 함께 담깁니다."
          >
            <JobSearchDemo />
          </Block>

          <Block
            index={2}
            reverse
            title="어느 공고에 뭘 냈는지 한눈에"
            desc="지원한 공고마다 자소서와 포트폴리오 등 필요한 문서를 추가해두세요. 자소서_최종_v3이 어디에 낸 파일인지 다시 뒤질 일이 없어요."
          >
            <DocumentDemo />
          </Block>

          <Block
            index={3}
            title="마감 일정은 취합이 챙길게요"
            desc="공고를 등록 하는 순간 기업명과 마감일이 일정에 추가되요. 오늘 마감인 공고는 D-Day로 맨 위에 뜨고, 마감이 다가오면 메일로 미리 알려드릴게요."
          >
            <DeadlineDemo />
          </Block>

          <Block
            index={4}
            reverse
            title="끌어다 놓으면 끝"
            desc="지원 전, 면접, 최종 결과 — 진행 단계에 맞춰 카드를 옮기기만 하면 돼요. 처음 세팅할 것도 없고, 전형 단계는 회사마다 다르게 바꿔 쓸 수 있어요."
          >
            <KanbanDemo />
          </Block>
        </div>
      </div>
    </section>
  );
}
