import type { LoginEntry, LoginTrigger } from '@/lib/analytics/events';

const LOGIN_CONTEXT_KEY = 'chwihap_login_context';

type LoginContext = { entry: LoginEntry; trigger?: LoginTrigger };

export function saveLoginContext(context: LoginContext): void {
  if (typeof window === 'undefined') return;
  // 저장소를 막은 브라우저에서도 로그인 자체는 계속 진행한다.
  try {
    window.sessionStorage.setItem(LOGIN_CONTEXT_KEY, JSON.stringify(context));
  } catch {
    return;
  }
}

export function consumeLoginContext(): LoginContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(LOGIN_CONTEXT_KEY);
    // 성공·실패 후 이전 로그인 맥락이 다음 시도에 섞이지 않게 먼저 삭제한다.
    window.sessionStorage.removeItem(LOGIN_CONTEXT_KEY);
    if (!raw) return null;
    const context: unknown = JSON.parse(raw);
    if (!context || typeof context !== 'object' || !('entry' in context)) return null;
    if (context.entry !== 'landing_navbar' && context.entry !== 'login_modal') return null;
    const trigger = 'trigger' in context ? context.trigger : undefined;
    if (
      trigger === 'scrap' ||
      trigger === 'notification_bell' ||
      trigger === 'sidebar' ||
      trigger === 'api_401'
    ) {
      return { entry: context.entry, trigger };
    }
    return { entry: context.entry };
  } catch {
    return null;
  }
}
