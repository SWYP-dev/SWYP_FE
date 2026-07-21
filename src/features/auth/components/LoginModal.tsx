'use client';

import { Modal } from '@/components/ui/modal';
import { getKakaoAuthorizeUrl } from '../utils/kakaoOAuth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Figma "로그인 화면"(node 111:23076) 내 Modal(node 111:23089) 스펙 반영.
// 공용 Modal의 ModalFooter(버튼 2개 레이아웃)는 이 시안과 안 맞아서 끄고,
// contentSlot에 카카오 버튼 1개만 직접 채움. 오버레이(base/dimmed)는 Drawer와
// 동일하게 이 컴포넌트에서 직접 감싼다.
export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  if (!isOpen) return null;

  function handleKakaoLogin() {
    window.location.href = getKakaoAuthorizeUrl();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-base-dimmed">
      <Modal hasModalFooter={false} onClose={onClose}>
        <div className="flex w-[380px] flex-col items-center gap-14 px-9">
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-8 font-bold leading-[1.4] text-label-base">
              여기저기 흩어진 취업 정보를 한곳에서, 취합
            </p>
            <p className="w-[248px] text-5 font-medium leading-[1.5] text-label-body">
              공고 탐색부터 서류·일정·전형 관리까지, 취업 준비의 모든 과정을 한곳에서
            </p>
          </div>

          <button
            type="button"
            onClick={handleKakaoLogin}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#fee404] px-3 py-3"
          >
            <KakaoIcon />
            <span className="text-3 font-semibold leading-[1.5] text-label-base">
              카카오 계정으로 계속하기
            </span>
          </button>
        </div>
      </Modal>
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
