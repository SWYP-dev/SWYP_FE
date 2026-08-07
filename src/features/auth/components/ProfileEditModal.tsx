'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CloseIcon } from '@/components/ui/icons';
import { useEscapeKey } from '@/lib/hooks/useEscapeKey';
import type { AuthUser } from '../type/auth';

interface ProfileEditModalProps {
  isOpen: boolean;
  user: AuthUser;
  onClose: () => void;
}

function CameraIcon() {
  return (
    <svg width="16" height="14" viewBox="0 0 13.3333 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.66642 3.35101C4.93168 3.35101 3.52539 4.7513 3.52539 6.47865C3.52539 8.206 4.93168 9.60629 6.66642 9.60629C8.40116 9.60629 9.80744 8.206 9.80744 6.47865C9.80744 4.7513 8.40116 3.35101 6.66642 3.35101ZM4.67924 6.47865C4.67924 5.38584 5.56893 4.49994 6.66642 4.49994C7.76391 4.49994 8.6536 5.38584 8.6536 6.47865C8.6536 7.57146 7.76391 8.45736 6.66642 8.45736C5.56893 8.45736 4.67924 7.57146 4.67924 6.47865Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.80714 3.23739e-05C5.51066 -0.000226486 5.26058 -0.000444869 5.02139 0.0636414C4.81114 0.119972 4.61247 0.21264 4.43442 0.337423C4.23187 0.479387 4.07196 0.670838 3.88238 0.897816L3.03135 1.91495L2.60552 1.91495C2.26586 1.91494 1.97664 1.91493 1.73918 1.93425C1.48972 1.95454 1.24703 1.99899 1.01502 2.1167C0.665231 2.29417 0.380844 2.57734 0.202618 2.92564C0.0844038 3.15666 0.0397667 3.39832 0.0193848 3.64671C-1.51607e-05 3.88315 -8.03616e-06 4.17112 3.46844e-07 4.50931V9.40559C-8.03616e-06 9.74378 -1.51619e-05 10.0318 0.0193848 10.2682C0.0397667 10.5166 0.0844038 10.7583 0.202618 10.9893C0.380844 11.3376 0.665231 11.6208 1.01502 11.7982C1.24703 11.916 1.48972 11.9604 1.73918 11.9807C1.97663 12 2.26583 12 2.60548 12H10.7278C11.0675 12 11.3567 12 11.5942 11.9807C11.8436 11.9604 12.0863 11.916 12.3183 11.7982C12.6681 11.6208 12.9525 11.3376 13.1307 10.9893C13.2489 10.7583 13.2936 10.5166 13.314 10.2682C13.3334 10.0318 13.3333 9.74383 13.3333 9.40563V4.50936C13.3333 4.17116 13.3334 3.88315 13.314 3.64671C13.2936 3.39832 13.2489 3.15666 13.1307 2.92564C12.9525 2.57734 12.6681 2.29417 12.3183 2.1167C12.0863 1.99899 11.8436 1.95454 11.5942 1.93425C11.3567 1.91493 11.0675 1.91494 10.7278 1.91495L10.3025 1.91495L9.45088 0.89745C9.2613 0.670563 9.10139 0.479185 8.89886 0.33728C8.72084 0.212548 8.5222 0.119919 8.312 0.0636137C8.07285 -0.000444601 7.82284 -0.000226372 7.52642 3.24119e-05L5.80714 3.23739e-05ZM5.3815 1.15979C5.4308 1.1511 5.48883 1.14904 5.74465 1.14904H7.58894C7.8447 1.14904 7.90271 1.1511 7.95201 1.15979C8.07436 1.18135 8.18881 1.23472 8.28378 1.3145C8.32204 1.34664 8.36077 1.38969 8.52452 1.58532L9.45467 2.69653L9.46232 2.70572C9.4896 2.73861 9.54099 2.80056 9.60382 2.85334C9.72469 2.95487 9.87035 3.0228 10.0261 3.05024C10.107 3.06451 10.1877 3.06415 10.2306 3.06396L10.2425 3.06392H10.9616C11.4837 3.06392 11.608 3.07101 11.6923 3.09829C11.9069 3.16774 12.0752 3.33532 12.145 3.54908C12.1724 3.63303 12.1795 3.75675 12.1795 4.27668V9.63835C12.1795 10.1583 12.1724 10.282 12.145 10.366C12.0752 10.5797 11.9069 10.7473 11.6923 10.8167C11.608 10.844 11.4837 10.8511 10.9616 10.8511H2.37182C1.84966 10.8511 1.72541 10.844 1.6411 10.8167C1.42643 10.7473 1.25813 10.5797 1.18838 10.366C1.16099 10.282 1.15387 10.1583 1.15387 9.63835V4.27668C1.15387 3.75675 1.16099 3.63303 1.18838 3.54908C1.25813 3.33532 1.42643 3.16774 1.6411 3.09829C1.72541 3.07101 1.84966 3.06392 2.37182 3.06392H3.09142L3.10341 3.06396C3.14625 3.06415 3.22696 3.06451 3.30793 3.05024C3.46368 3.02278 3.60938 2.95482 3.73026 2.85325C3.7931 2.80044 3.84449 2.73846 3.87177 2.70557L3.87941 2.69638L4.80892 1.5855C4.97267 1.38979 5.0114 1.34672 5.04967 1.31457C5.14465 1.23476 5.25912 1.18136 5.3815 1.15979Z"
        fill="currentColor"
      />
    </svg>
  );
}

// 2~10자, 한글/영문/숫자만 허용 (Figma "입력 오류" 상태(node 226:28966) 기준).
function validateNickname(value: string): string | undefined {
  if (!/^[가-힣a-zA-Z0-9]{2,10}$/.test(value)) {
    return '2~10자의 한글, 영문, 숫자만 사용 가능해요.';
  }
  return undefined;
}

// Figma "설정 - 계정(프로필 모달 등장)"(node 226:28927) / "(입력 오류)"(node 226:28966) 스펙 반영.
// ⚠️ 백엔드에 닉네임/프로필 이미지 수정 API가 없음(6.1 GET /users/me만 존재) — 세영님
// 확인 후 API 추가되면 onConfirm에 실제 mutation 연결 필요. 지금은 UI만 완성하고
// 확인 버튼은 항상 비활성화 상태로 둠.
export function ProfileEditModal({ isOpen, user, onClose }: ProfileEditModalProps) {
  const [nickname, setNickname] = useState(user.nickname);
  const [isTouched, setIsTouched] = useState(false);

  useEscapeKey(isOpen, onClose);

  if (!isOpen) return null;

  const error = isTouched ? validateNickname(nickname) : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-base-dimmed" onClick={onClose} aria-hidden="true" />
      <div className="relative flex w-[394px] flex-col items-start gap-5 overflow-hidden rounded-[20px] bg-base-white py-6 shadow-spread-small">
        <div className="flex w-full items-center justify-between px-8">
          <p className="text-7 font-semibold text-label-base">프로필 수정</p>
          <button type="button" onClick={onClose} aria-label="닫기" className="text-label-base">
            <CloseIcon size={24} />
          </button>
        </div>

        <div className="flex w-full flex-col items-center gap-[10px] px-8">
          <div className="relative flex flex-col items-center gap-[10px]">
            <div className="flex size-[84px] shrink-0 items-center justify-center overflow-hidden rounded-max border border-line-secondary bg-neutral-100">
              {user.profileImage ? (
                <Image
                  src={user.profileImage}
                  alt=""
                  width={84}
                  height={84}
                  className="size-full rounded-max object-cover"
                />
              ) : (
                <Image src="/icons/person-fill.svg" alt="" width={40} height={40} />
              )}
            </div>
            <button
              type="button"
              aria-label="프로필 이미지 변경"
              disabled
              className="absolute right-0 top-[calc(50%+28px)] flex size-7 -translate-y-1/2 cursor-not-allowed items-center justify-center rounded-max border border-line-secondary bg-neutral-50 text-icon-gray"
            >
              <CameraIcon />
            </button>
          </div>

          <div className="flex w-full flex-col items-start gap-3">
            <div className="flex items-start gap-1 text-3">
              <p className="font-semibold text-label-base">닉네임</p>
              <p className="font-medium text-status-negative">*</p>
            </div>
            <input
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setIsTouched(true);
              }}
              className={`h-10 box-border w-full rounded-xl border px-5 text-5 font-medium text-label-base outline-none ${
                error ? 'border-status-negative' : 'border-line-secondary'
              }`}
            />
            {error && <p className="w-full text-1 text-status-negative">{error}</p>}
          </div>
        </div>

        <div className="flex w-full items-center gap-4 px-8">
          <button
            type="button"
            disabled
            className="flex h-10 flex-1 cursor-not-allowed items-center justify-center rounded-xl bg-action-primary-disabled text-5 font-semibold text-base-white"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
