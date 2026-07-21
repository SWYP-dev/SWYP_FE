'use client';

import { CloseIcon } from '@/components/ui/icons';
import { getKakaoAuthorizeUrl } from '../utils/kakaoOAuth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  if (!isOpen) return null;

  function handleKakaoLogin() {
    window.location.href = getKakaoAuthorizeUrl();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-base-dimmed">
      <div className="flex flex-col items-start gap-5 overflow-hidden rounded-[20px] bg-base-white py-7 shadow-spread-small">
        {/* ModalHeader */}
        <div className="flex w-full items-center justify-end px-8">
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex size-6 items-center justify-center text-label-base"
          >
            <CloseIcon size={24} />
          </button>
        </div>

        {/* contentSlot */}
        <div className="flex flex-col items-center justify-center gap-14 px-9">
          <div className="flex flex-col items-center gap-3">
            {/* whitespace-nowrap 필수 — 이게 빠지면 어색하게 줄바꿈됨 */}
            <p className="whitespace-nowrap text-8 font-bold leading-[1.4] text-black">
              여기저기 흩어진 취업 정보를 한곳에서, 취합
            </p>
            <p className="w-[248px] text-center text-5 font-medium leading-[1.5] text-label-body">
              공고 탐색부터 서류·일정·전형 관리까지, 취업 준비의 모든 과정을 한곳에서
            </p>
          </div>

          <button
            type="button"
            onClick={handleKakaoLogin}
            className="flex w-[380px] items-center justify-center gap-2 rounded-lg bg-[#fee404] px-3 py-3"
          >
            <KakaoIcon />
            <span className="text-3 font-semibold leading-[1.5] text-label-base">
              카카오 계정으로 계속하기
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function KakaoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M9 2C4.86 2 1.5 4.69 1.5 8.01c0 2.13 1.4 4 3.5 5.07l-.71 2.6a.38.38 0 0 0 .58.42l3.1-2.06c.35.03.7.05 1.03.05 4.14 0 7.5-2.69 7.5-6.01S13.14 2 9 2z"
        fill="#212123"
      />
    </svg>
  );
}
