import { NextResponse } from 'next/server';

/**
 * 로그인 없는 테스트 계정 세션 발급 프록시 (POST /api/test-session).
 *
 * 백엔드의 POST /api/v1/auth/test-session을 브라우저가 직접 부르지 않고 여기를 거친다.
 * X-Test-Session-Secret을 클라이언트에서 붙이려면 NEXT_PUBLIC_ 환경변수를 써야 하는데,
 * 그러면 값이 JS 번들에 그대로 박혀 DevTools에서 읽힌다 — 누구나 테스트 계정을
 * 무제한 생성할 수 있게 된다. 서버에서만 읽히는 TEST_SESSION_SECRET을 여기서 붙인다.
 *
 * 운영 빌드에서 이 기능을 끄려면 TEST_SESSION_SECRET을 설정하지 않으면 된다.
 */
export async function POST() {
  const secret = process.env.TEST_SESSION_SECRET;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  // 환경변수가 없으면 백엔드를 부르지 않고 즉시 차단한다.
  // 백엔드의 403(A007)과 같은 형태로 응답해 호출부가 분기를 따로 두지 않아도 되게 한다.
  if (!secret) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        code: 'A007',
        message: '테스트 세션 발급이 허용되지 않습니다.',
      },
      { status: 403 }
    );
  }

  const res = await fetch(`${baseUrl}/api/v1/auth/test-session`, {
    method: 'POST',
    headers: { 'X-Test-Session-Secret': secret },
    // 테스트 계정은 호출마다 새로 발급되어야 하므로 캐시를 타면 안 된다
    cache: 'no-store',
  });

  // 백엔드 응답(success/data/code/message)을 상태 코드까지 그대로 통과시킨다
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}
