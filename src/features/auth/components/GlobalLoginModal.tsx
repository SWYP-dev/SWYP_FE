'use client';

import { LoginModal } from './LoginModal';
import { useLoginModalStore } from '../store/loginModalStore';

// 루트 레이아웃에 한 번만 마운트되는 전역 로그인 모달.
// api-client.ts의 401 처리(비로그인 상태로 보호된 API 호출 시)에서 openLoginModalOutsideReact()로
// 오픈된다. 페이지 이동 없이 현재 화면 위에 오버레이로 뜨는 것이 핵심.
export function GlobalLoginModal() {
  const isOpen = useLoginModalStore((s) => s.isOpen);
  const close = useLoginModalStore((s) => s.close);
  return <LoginModal isOpen={isOpen} onClose={close} />;
}
