'use client';

import type { ReactNode } from 'react';
import { getKakaoAuthorizeUrl } from '@/features/auth/utils/kakaoOAuth';

interface KakaoLoginButtonProps {
  className?: string;
  children: ReactNode;
}

/**
 * 랜딩의 로그인 진입 버튼.
 * 로그인 수단이 카카오 하나뿐이라 GlobalLoginModal을 거치지 않고 인가 페이지로 바로 보낸다.
 * 스타일은 호출부가 className으로 주입한다(파랑 배경 섹션 / 흰 배경 헤더 등).
 */
export default function KakaoLoginButton({ className, children }: KakaoLoginButtonProps) {
  return (
    <button
      type="button"
      onClick={() => {
        window.location.href = getKakaoAuthorizeUrl();
      }}
      className={className}
    >
      {children}
    </button>
  );
}
