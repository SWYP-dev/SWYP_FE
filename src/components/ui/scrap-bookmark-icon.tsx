// CardThumbnail 스크랩 버튼 — bookmark.svg / bookmark-fill.svg 기준, 색상 #9E9EA1.
export function ScrapBookmarkIcon({ filled, size = 20 }: { filled: boolean; size?: number }) {
  if (filled) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M5.77778 3C4.61748 3 4 3.85449 4 4.56134V19.335C4 20.5826 5.74104 21.4647 7.18341 20.7358L11.859 18.3725C11.9005 18.3503 11.9496 18.3384 12 18.3384C12.0504 18.3384 12.0995 18.3503 12.141 18.3725L16.8166 20.7358C18.259 21.4647 20 20.5835 20 19.335V4.56134C20 3.85449 19.3825 3 18.2222 3H5.77778Z"
          fill="#9E9EA1"
        />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6.59513 20.1038C5.79037 20.5007 4.75 20.0405 4.75 19.2889V4.61348C4.75 4.13682 5.156 3.75 5.65625 3.75H18.3438C18.844 3.75 19.25 4.13682 19.25 4.61348V19.2889C19.25 20.0405 18.2096 20.5007 17.4049 20.1047L12.6368 17.7563C12.4476 17.662 12.2263 17.6118 12 17.6118C11.7737 17.6118 11.5524 17.662 11.3632 17.7563L6.59513 20.1038Z"
        stroke="#9E9EA1"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
