import { Image } from './Image';

const LOGO =
  'https://media.base44.com/images/public/user_6a72fa227953379597529bf6/2f804dfe0_769aad58c_logo.png';

const sitemap = [
  {
    title: '서비스',
    links: [
      { label: '문제점', href: '#problem' },
      { label: '해결 방식', href: '#solution' },
      { label: '핵심 기능', href: '#features' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-slate-200 bg-white pt-[80px]">
      <div className="relative mx-auto max-w-[1200px] px-[24px]">
        <div className="relative flex items-end justify-center border-t border-slate-100 py-[32px]">
          <p className="text-[13.5px] text-slate-400">© 2026 취합(Chwihap). All rights reserved.</p>
        </div>

        <div className="pointer-events-none flex justify-center pb-[8px] opacity-[0.05]">
          <Image
            src={LOGO}
            fittingType="fit"
            className="h-[64px] w-[300px] sm:h-[112px] sm:w-[520px]"
            alt=""
          />
        </div>
      </div>
    </footer>
  );
}
