'use client';

import Image from 'next/image';
import { CloseIcon } from '@/components/ui/icons';
import { getKakaoAuthorizeUrl } from '../utils/kakaoOAuth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Figma "로그인 화면"(node 111:23076) 내 Modal(node 111:23089) 스펙 그대로 반영.
// https://www.figma.com/design/ar1tLubNIUVwLhU09duB9n/...?node-id=111-23089
//
// ⚠️ 수정 이력 2건:
// 1) 처음엔 공용 Modal(w-[566px] 고정폭) 재사용 + whitespace-nowrap 누락 → 제목 줄바꿈 버그
// 2) 위 수정 후에도 간격이 좁았던 진짜 원인: 이 프로젝트의 spacing 토큰은 1~8단계
//    (2/4/8/12/16/20/24/32px)까지만 정의돼 있어서, 그 범위를 벗어나는 숫자 클래스
//    (gap-14, px-9 등)는 존재하지 않는 클래스로 조용히 무시되고 간격이 0이 됨.
//    → Figma 스펙 그대로 전부 대괄호(arbitrary value)로 명시해서 스케일 범위 문제를 원천 차단.
export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  if (!isOpen) return null;

  function handleKakaoLogin() {
    window.location.href = getKakaoAuthorizeUrl();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-base-dimmed">
      <div className="flex flex-col items-start gap-[20px] overflow-hidden rounded-[20px] bg-base-white py-[24px] shadow-spread-small">
        {/* ModalHeader */}
        <div className="flex w-full items-center justify-end px-[32px]">
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex size-6 items-center justify-center text-label-base"
          >
            <CloseIcon size={24} />
          </button>
        </div>

        {/* contentSlot — gap-[56px], px-[36px] : Figma 실측값 그대로 (기본 스케일 범위 밖) */}
        <div className="flex flex-col items-center justify-center gap-[56px] px-[36px]">
          <div className="flex flex-col items-center gap-[12px]">
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
  return <Image src="/icons/kakao-fill.svg" alt="" width={18} height={18} />;
}
