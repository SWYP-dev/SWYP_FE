// 화면 진입이 "앱을 처음 연 것"인지 "서비스 안에서 이동해 온 것"인지 구분한다.
// 문서를 처음 불러온 URL은 클라이언트 이동 후에도 바뀌지 않으므로 Navigation Timing 값을 기준으로 쓴다.
// 로그인 콜백은 카카오에서 돌아와 문서를 새로 불러온 뒤 클라이언트 이동으로 화면에 들어오므로 첫 진입으로 본다.
const SESSION_START_PATHS = ['/auth/kakao/callback'];

// 문서 하나에서 첫 진입은 한 번뿐이다. 모듈 변수라 새로고침하면 초기화된다.
let hasConsumedFirstEntry = false;

function getInitialDocumentPath(): string | null {
  if (typeof window === 'undefined') return null;
  const [entry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
  if (!entry) return null;
  try {
    return new URL(entry.name).pathname;
  } catch {
    return null;
  }
}

/**
 * 현재 화면(pathname)이 이 문서에서 처음 표시된 앱 화면이면 'session_start', 아니면 'internal_nav'.
 * 화면 표시 이벤트를 보낼 때 한 번만 호출한다.
 */
export function consumeEntryType(pathname: string): 'session_start' | 'internal_nav' {
  if (hasConsumedFirstEntry) return 'internal_nav';
  hasConsumedFirstEntry = true;
  const initialPath = getInitialDocumentPath();
  if (initialPath === null) return 'internal_nav';
  return initialPath === pathname || SESSION_START_PATHS.includes(initialPath)
    ? 'session_start'
    : 'internal_nav';
}
