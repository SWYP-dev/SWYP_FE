import Reveal from './Reveal';

export default function CTA() {
  return (
    <section id="cta" className="relative overflow-hidden bg-[#4864F1] py-[96px] sm:py-[128px]">
      <div className="pointer-events-none absolute inset-0 opacity-[0.14] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="relative mx-auto max-w-[860px] px-[24px] text-center">
        <Reveal>
          <h2 className="font-heading text-[34px] font-bold leading-[1.24] tracking-[-0.03em] text-white sm:text-[52px]">
            취업 준비에만 집중하세요.
          </h2>
          <p className="mx-auto mt-[24px] max-w-[540px] text-[17px] leading-[1.7] text-white/85">
            공고 탐색부터 서류와 일정, 전형 관리 등 취합이 취업 준비의 나머지를 정리해 드릴게요.
          </p>
          <div className="mt-[40px] flex flex-col items-center justify-center gap-[12px] sm:flex-row"></div>
        </Reveal>
      </div>
    </section>
  );
}
