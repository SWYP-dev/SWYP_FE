// 카카오 로그인 인가 코드 요청 URL 생성.
// 필요한 환경변수 (.env.local):
//   NEXT_PUBLIC_KAKAO_CLIENT_ID    - 카카오 개발자 콘솔 "앱 키 > REST API 키"
//   NEXT_PUBLIC_KAKAO_REDIRECT_URI - "카카오 로그인 > Redirect URI"에 등록한 값과 100% 동일해야 함
export function getKakaoAuthorizeUrl(): string {
  const clientId = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    // 도메인/키 미확정 상태에서 버튼을 눌렀을 때 "반응 없음"으로 헷갈리지 않도록 명확히 로그.
    console.error(
      '[kakaoOAuth] NEXT_PUBLIC_KAKAO_CLIENT_ID / NEXT_PUBLIC_KAKAO_REDIRECT_URI 환경변수가 설정되지 않았습니다.'
    );
  }

  const params = new URLSearchParams({
    client_id: clientId ?? '',
    redirect_uri: redirectUri ?? '',
    response_type: 'code',
  });

  return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
}
