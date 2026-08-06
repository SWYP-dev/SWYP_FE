import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-slate-200 bg-white pt-[80px]">
      <div className="relative mx-auto max-w-[1200px] px-[24px]">
        <div className="relative flex items-end justify-center border-t border-slate-100 py-[32px]">
          <p className="text-[13.5px] text-slate-400">© 2026 취합(Chwihap). All rights reserved.</p>
        </div>

        {/* 장식용 워터마크 — alt=""로 스크린리더에서 제외.
            원본 비율(113:20)을 유지해야 글자가 늘어나지 않는다. */}
        <div className="pointer-events-none flex justify-center pb-[8px] opacity-[0.05]">
          <Image
            src="/logo/chwihap-logo.svg"
            alt=""
            width={520}
            height={92}
            className="h-[53px] w-[300px] sm:h-[92px] sm:w-[520px]"
          />
        </div>
      </div>
    </footer>
  );
}
