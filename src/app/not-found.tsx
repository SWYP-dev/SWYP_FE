'use client';

import { useRouter } from 'next/navigation';

function NotFoundIllustration() {
  return (
    <svg
      width="153.772"
      height="61.0312"
      viewBox="0 0 153.772 61.0312"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M105.62 49.7109V39.9492L130.722 0.820312H146.226V39.7852H153.772V49.7109H146.226V60.2109H134.495V49.7109H105.62ZM118.089 39.7852H134.659V14.3555H134.085L118.089 39.293V39.7852Z"
        fill="#E5E5FF"
      />
      <path
        d="M76.7222 61.0312C61.8335 61.0312 52.8511 49.957 52.8511 30.5156C52.8511 11.1152 61.9155 0 76.7222 0C91.5288 0 100.593 11.1152 100.593 30.5156C100.593 50.0391 91.5698 61.0312 76.7222 61.0312ZM65.4839 30.5156C65.4019 44.2148 69.8315 50.8594 76.7222 50.8594C83.6128 50.8594 88.0015 44.2148 87.9604 30.5156C88.0015 16.9395 83.5718 10.1309 76.7222 10.0898C69.8726 10.1309 65.4839 16.9395 65.4839 30.5156Z"
        fill="#E5E5FF"
      />
      <path
        d="M0 49.7109V39.9492L25.1016 0.820312H40.6055V39.7852H48.1523V49.7109H40.6055V60.2109H28.875V49.7109H0ZM12.4688 39.7852H29.0391V14.3555H28.4648L12.4688 39.293V39.7852Z"
        fill="#E5E5FF"
      />
    </svg>
  );
}

// Figma "404 페이지"(node 226:28836) 스펙 반영.
export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-5 overflow-y-auto bg-base-white px-[80px] py-7">
      <div className="flex flex-col items-center gap-9">
        <NotFoundIllustration />
        <div className="flex w-full flex-col items-center gap-2 text-center">
          <p className="text-9 font-semibold leading-[1.4] text-label-base">
            페이지를 찾을 수 없어요
          </p>
          <div className="text-5 leading-[1.6] text-label-body">
            <p>페이지의 주소가 잘못되었거나, 존재하지 않아요.</p>
            <p>아래 버튼을 눌러주세요.</p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center justify-center gap-1 rounded-lg border border-line-secondary bg-base-white px-6 py-4 text-5 font-medium text-label-base"
      >
        이전 페이지로 이동
      </button>
    </div>
  );
}
