import Image from 'next/image';

// Figma MainLogo (node 136:23341) — CardThumbnail 썸네일 없음/로드 실패 시 플레이스홀더.
// 실제 썸네일과 동일하게 fill + object-cover로 박스 비율에 맞게 꽉 채움.
export function CardThumbnailPlaceholder() {
  return (
    <Image
      src="/logo/main-logo.svg"
      alt=""
      fill
      className="rounded-lg object-cover"
    />
  );
}
