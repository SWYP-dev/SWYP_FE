---
spec_id: ANALYTICS-0001
revision: 0
---

# ANALYTICS-0001 — PostHog 계측 기반: 타입 있는 track, 사용자 식별, 공통 속성, 페이지뷰 자동 수집

## 배경

- PostHog 이벤트 설계 문서 `docs/analytics/posthog-events.md`(PR #220) 7장의 첫 번째 스펙이다. 이후 스펙(ANALYTICS-0002~0006)이 모두 이 기반 위에 이벤트를 추가한다
- 지금 코드 (2026-10-22 develop `364beb6` 기준)
  - `src/lib/posthog.ts`: `initPostHog()`가 `autocapture: false`, `capture_pageview: false`, `person_profiles: 'identified_only'`로 초기화한다. 이벤트는 문자열 이름을 받는 `capturePostHogEvent(event: string, properties)`로 보낸다. 주석이 저장소에 없는 `PostHog_이벤트_설계_문서.md`를 가리킨다
  - `src/providers/posthog-provider.tsx`: 마운트 effect에서 `initPostHog()`만 호출한다
  - `src/features/auth/hooks/useAuthMutations.ts`: `useKakaoLoginMutation`의 onSuccess에서 `capturePostHogEvent('kakao_login_completed', { isNewUser })`를 보낸다. 그 외 PostHog 호출은 없다
- 문제
  - **`identify()` 호출이 없다.** `identified_only` 설정이라 사용자 프로필이 생기지 않고, 모든 이벤트가 익명으로 쌓인다 (설계 문서 2.2)
  - 실사용자·테스트 계정, 운영·프리뷰·로컬 데이터를 구분할 속성이 없다 (설계 문서 2.2, 2.3)
  - 페이지 진입을 수집하지 않는다. 설계 문서 2.4에서 `$pageview` 자동 수집으로 정했다
  - 이벤트 이름이 문자열이라 오타가 타입 검사에서 걸리지 않는다 (설계 문서 2.5)
  - 자식 컴포넌트의 effect는 부모(`PostHogProvider`)의 effect보다 먼저 실행된다. 랜딩처럼 첫 렌더에서 이벤트를 보내면 초기화 전에 호출될 수 있다
- 환경변수 (2026-10-22 확인)
  - 코드는 `NEXT_PUBLIC_POSTHOG_KEY`·`NEXT_PUBLIC_POSTHOG_HOST`를 읽는데, Vercel에는 `POSTHOG_KEY`·`POSTHOG_HOST`(접두사 없음)로 등록되어 있다. 접두사가 없는 변수는 브라우저 번들에 들어가지 않으므로 **Vercel 운영·프리뷰에서는 PostHog가 초기화되지 않는다**. 최근 60일 PostHog 이벤트의 `$host`는 `localhost:3000`뿐이다
  - Vercel 변수 이름 변경은 코드 밖 작업이라 사용자가 한다. 코드는 `NEXT_PUBLIC_` 이름을 그대로 쓴다 (브라우저에서 읽어야 하므로 접두사가 필요하다)

## 범위

**포함**

- 이벤트 이름·속성 타입 맵과 타입 있는 `track()` 래퍼. 기존 `capturePostHogEvent` 제거
- 사용자 식별(`identifyUser`)과 초기화(`resetAnalytics`) 헬퍼, 로그인·테스트 세션·앱 시작·로그아웃·회원 탈퇴 시점 연결
- 슈퍼 속성 `account_type`, `app_env`
- `$pageview` 자동 수집 (`capture_pageview: 'history_change'`)
- `kakao_login_completed` 속성명 `isNewUser` → `is_new_user`
- `landing_viewed` 이벤트
- `src/lib/posthog.ts` 주석의 문서 경로 수정

**제외**

- 설계 문서 3장의 나머지 이벤트(랜딩 CTA, 로그인 유도·시작·실패, `entry`·`trigger` 속성, 스크랩, 칸반 등)는 ANALYTICS-0002 이후 스펙에서 한다
- `logged_out`·`account_deleted` 이벤트 전송은 ANALYTICS-0005에서 한다. 이번에는 reset만 연결한다
- `test_session_login_completed` 이벤트는 ANALYTICS-0006에서 한다. 이번에는 테스트 세션 성공 시 식별만 한다
- 토큰 재발급 실패로 로그인이 풀리는 경우(`src/lib/api/api-client.ts`의 `clearTokens`·`clearAuthUserOutsideReact`)에는 reset하지 않는다. 사용자가 명시적으로 로그아웃한 것이 아니고, 다시 로그인하면 `identifyUser`가 새 사용자로 바꾼다
- PostHog 대시보드·퍼널 설정, Vercel 환경변수 설정(위 이름 변경 포함)은 코드 밖 작업이라 하지 않는다. 환경변수 이름은 코드에서 바꾸지 않는다
- 패키지 추가·버전 변경은 하지 않는다 (`posthog-js` `^1.428.1` 그대로)

## 설계 결정

- **이벤트 타입 맵** — 새 파일 `src/lib/analytics/events.ts`
  - `export type AccountType = 'kakao' | 'test';`
  - `export interface AnalyticsEventMap`: 키가 이벤트 이름, 값이 속성 타입. 이번 스펙에서는 아래 두 개만 정의한다. 이후 스펙이 여기에 이벤트를 추가한다
    - `landing_viewed`: 속성 없음 (`Record<string, never>`)
    - `kakao_login_completed`: `{ is_new_user: boolean }`
  - `export type AnalyticsEventName = keyof AnalyticsEventMap;`
  - 파일 위쪽에 "이벤트 이름·속성은 `docs/analytics/posthog-events.md`와 일치시킨다"는 한국어 주석을 둔다
- **`src/lib/posthog.ts`**
  - `initPostHog()`
    - 옵션을 `autocapture: false`, `capture_pageview: 'history_change'`, `person_profiles: 'identified_only'`로 바꾼다. `capture_pageleave`는 지정하지 않는다 (기본값 `'if_capture_pageview'`라 페이지뷰를 켜면 함께 켜진다)
    - `posthog.init` 직후 `posthog.register({ app_env: getAppEnv() })`를 호출한다
    - 키가 없거나 서버 환경이면 지금처럼 아무것도 하지 않는다. 여러 번 불려도 한 번만 초기화되는 동작(`isInitialized`)은 유지한다
  - `getAppEnv()`: 모듈 내부 함수. `process.env.NEXT_PUBLIC_VERCEL_ENV`가 `'production'`·`'preview'`·`'development'` 중 하나면 그 값을, 아니면 `'development'`를 반환한다. 반환 타입은 `'production' | 'preview' | 'development'`. `process.env.NEXT_PUBLIC_VERCEL_ENV`는 빌드 시 문자열로 치환되도록 이 형태 그대로 참조한다
  - `track<E extends AnalyticsEventName>(...)`: `capturePostHogEvent`를 대체한다
    - 속성 타입이 `Record<string, never>`인 이벤트는 `track('landing_viewed')`처럼 속성 없이, 그 외 이벤트는 `track('kakao_login_completed', { is_new_user: true })`처럼 속성을 **필수로** 받는다. 맵에 없는 이벤트 이름이나 맞지 않는 속성은 타입 오류가 나야 한다 (rest 파라미터 튜플 조건부 타입 등 방식은 구현자가 정한다. `any`는 쓰지 않는다)
    - 맨 앞에서 `initPostHog()`를 호출하고, 초기화되지 않았으면(키 없음·서버) 아무것도 하지 않고 return한다. 자식 컴포넌트의 effect가 Provider보다 먼저 실행돼도 이벤트가 유실되지 않게 하기 위함이다
  - `identifyUser(userId: number, accountType?: AccountType)`
    - 맨 앞에서 `initPostHog()`를 호출하고, 초기화되지 않았으면 return한다
    - `posthog.identify(String(userId), accountType ? { account_type: accountType } : undefined)`
    - `accountType`이 있으면 `posthog.register({ account_type: accountType })`도 호출한다. 앱 시작 시처럼 `accountType` 없이 부르면 register하지 않는다 (이전에 등록된 값은 PostHog 저장소에 남아 있다)
  - `resetAnalytics()`
    - 맨 앞에서 `initPostHog()`를 호출하고, 초기화되지 않았으면 return한다
    - `posthog.reset()` 후 `posthog.register({ app_env: getAppEnv() })`를 다시 호출한다. reset이 슈퍼 속성을 모두 지우기 때문이다
  - `capturePostHogEvent`는 삭제한다
  - 파일 위 주석의 `PostHog_이벤트_설계_문서.md`를 `docs/analytics/posthog-events.md`로 고치고, `capture_pageview`를 켠 이유(설계 문서 2.4)를 반영해 주석 내용을 맞춘다. GA4와 도구를 나누는 기존 설명은 유지한다
- **`src/providers/posthog-provider.tsx`**
  - 기존 초기화 effect는 유지한다
  - `useAuthStore`의 `hasHydrated`·`user`를 구독해, `hasHydrated`가 true이고 `user`가 있으면 `identifyUser(user.id)`를 호출하는 effect를 추가한다 (의존성 `[hasHydrated, user?.id]`). 배포 전부터 로그인돼 있던 사용자를 식별하기 위함이다. 같은 id로 다시 identify해도 PostHog에서는 아무 일도 일어나지 않는다
- **`src/features/auth/hooks/useAuthMutations.ts`**
  - `useKakaoLoginMutation` onSuccess: `setUser(data.user)` 다음에 `identifyUser(data.user.id, 'kakao')`, 그다음 `track('kakao_login_completed', { is_new_user: data.isNewUser })`. identify를 먼저 해야 이벤트가 사용자에게 붙는다. 기존 주석은 새 이름에 맞게 고친다
  - `useTestSessionMutation` onSuccess: `setUser(data.user)` 다음에 `identifyUser(data.user.id, 'test')`. 이동(`router.replace('/jobs')`)보다 앞에 둔다
  - `useLogoutMutation` onSettled, `useDeleteAccountMutation` onSuccess: `clearUser()` 다음, 페이지 이동 전에 `resetAnalytics()`를 호출한다
  - 그 밖의 처리(토큰 저장, 쿼리 무효화, 이동 경로)는 바꾸지 않는다
- **`src/features/landing/components/LandingAuthRedirect.tsx`**
  - `hasHydrated`가 true이고 `isAuthenticated`가 false일 때(= 랜딩 콘텐츠를 실제로 렌더링할 때) `track('landing_viewed')`를 보내는 effect를 추가한다
  - 마운트당 한 번만 보내도록 `useRef(false)`로 보낸 여부를 기록한다. 개발 모드 StrictMode의 effect 재실행으로 두 번 가지 않게 하기 위함이다. ref는 렌더 중에 읽지 않는다 (`react-hooks/refs` lint 규칙)
  - 기존 리다이렉트 effect와 렌더 분기는 바꾸지 않는다
- 바꾼 부분에는 왜 바꿨는지 한국어 주석을 짧게 남긴다 (`.claude/rules/code-style.md`)
- BE 의존: 없음. `isNewUser`·`user.id`는 `docs/API_SPEC.md` 1.1 응답에 있고, 테스트 세션 응답의 `user.id`는 `src/features/auth/type/auth.ts`의 `TestSessionResponse`에 있다

## 수용 기준

- AC-01 `src/lib/analytics/events.ts`가 있고 `AccountType`(`'kakao' | 'test'`), `AnalyticsEventMap`(`landing_viewed`: 속성 없음, `kakao_login_completed`: `{ is_new_user: boolean }`), `AnalyticsEventName`을 export한다
- AC-02 `src/lib/posthog.ts`가 `track`, `identifyUser`, `resetAnalytics`, `initPostHog`를 export하고, `capturePostHogEvent`는 `src/` 어디에도 없다
- AC-03 `track`은 이벤트 이름을 `AnalyticsEventName`으로 제한하고, 속성이 있는 이벤트는 속성 인자를 필수로 받으며, 속성이 없는 이벤트는 이름만으로 호출할 수 있다. 시그니처와 구현에 `any`가 없다
- AC-04 `initPostHog`의 `posthog.init` 옵션이 `autocapture: false`, `capture_pageview: 'history_change'`, `person_profiles: 'identified_only'`이고, init 직후 `app_env`를 `register`한다
- AC-05 `getAppEnv`는 `process.env.NEXT_PUBLIC_VERCEL_ENV`가 `production`·`preview`·`development`면 그 값을, 그 외(미설정 포함)면 `development`를 반환한다
- AC-06 `track`·`identifyUser`·`resetAnalytics`는 각각 먼저 `initPostHog()`를 호출하고, 초기화되지 않았으면 PostHog API를 부르지 않고 return한다
- AC-07 `identifyUser`는 `String(userId)`로 `posthog.identify`를 호출하고, `accountType`이 주어졌을 때만 `account_type`을 사용자 속성과 슈퍼 속성으로 등록한다. `resetAnalytics`는 `posthog.reset()` 뒤에 `app_env`를 다시 `register`한다
- AC-08 `useKakaoLoginMutation` onSuccess는 `identifyUser(data.user.id, 'kakao')`를 `track('kakao_login_completed', { is_new_user: data.isNewUser })`보다 먼저 호출한다. `isNewUser`라는 속성 키는 더 이상 이벤트에 쓰이지 않는다
- AC-09 `useTestSessionMutation` onSuccess는 `router.replace('/jobs')`보다 먼저 `identifyUser(data.user.id, 'test')`를 호출한다
- AC-10 `useLogoutMutation` onSettled와 `useDeleteAccountMutation` onSuccess는 `router.push('/')`보다 먼저 `resetAnalytics()`를 호출한다
- AC-11 `PostHogProvider`는 `hasHydrated`가 true이고 `user`가 있을 때 `identifyUser(user.id)`를 accountType 없이 호출하는 effect를 가진다
- AC-12 `LandingAuthRedirect`는 `hasHydrated && !isAuthenticated`일 때 마운트당 한 번만 `track('landing_viewed')`를 호출하고, 보낸 여부를 기록하는 ref를 렌더 중에 읽지 않는다. 기존 리다이렉트 effect와 렌더 분기는 그대로다
- AC-13 `src/lib/posthog.ts`에 `PostHog_이벤트_설계_문서`라는 문자열이 없고, `docs/analytics/posthog-events.md`를 가리키는 주석이 있다
- AC-14 변경 파일은 `src/lib/analytics/events.ts`(추가), `src/lib/posthog.ts`, `src/providers/posthog-provider.tsx`, `src/features/auth/hooks/useAuthMutations.ts`, `src/features/landing/components/LandingAuthRedirect.tsx` 다섯 개뿐이고, `package.json`·`package-lock.json`은 바뀌지 않는다
- AC-15 `npm run typecheck`·`npm run build`·`npm run lint`가 통과한다
- AC-16 [manual] `NEXT_PUBLIC_POSTHOG_KEY`·`NEXT_PUBLIC_POSTHOG_HOST`가 설정된 Vercel 프리뷰 또는 로컬 `npm run dev`에서 브라우저 콘솔로 `posthog.debug()`를 켜거나 PostHog Activity 탭을 보며 아래가 모두 맞다
  - 로그아웃 상태로 `/`에 들어가면 `landing_viewed`가 **1번** 오고, `$pageview`(`$pathname` = `/`)도 온다. 두 이벤트 모두 `app_env`가 있다(로컬 `development`, 프리뷰 `preview`)
  - 랜딩에서 "무료로 시작하기"로 `/jobs`에 가면 새로고침 없이도 `$pageview`(`$pathname` = `/jobs`)가 온다
  - 카카오 로그인을 마치면 `kakao_login_completed`가 `is_new_user` 속성과 함께 오고, PostHog Persons에 distinct ID가 사용자 id 문자열이고 `account_type`이 `kakao`인 사람이 보인다. 이후 `/kanban`의 `$pageview`에 `account_type: kakao`가 붙는다
  - 로그인 상태로 새로고침해도 이후 이벤트가 같은 사람으로 이어진다
  - 로그아웃 후 랜딩의 `landing_viewed`는 익명 distinct ID로 오고, `app_env`는 있고 `account_type`은 없다
  - 로그인 상태로 `/`에 들어가면(리다이렉트) `landing_viewed`가 오지 않는다

## 테스트 계획

구현 후 **커밋하기 전에** 아래를 실행하고 명령과 결과를 PR 본문에 남긴다.

```bash
# 아래는 수정 후, 커밋하기 전에 실행한다 (새 파일은 git add 후에 git grep에 잡힌다)

# (AC-01) AccountType, AnalyticsEventMap, AnalyticsEventName, landing_viewed, kakao_login_completed가 모두 나와야 한다
git grep -n "export type AccountType\|export interface AnalyticsEventMap\|export type AnalyticsEventName\|landing_viewed\|kakao_login_completed" -- src/lib/analytics/events.ts

# (AC-02) 출력이 없어야 한다
git grep -n "capturePostHogEvent" -- src

# (AC-02, AC-03) export된 함수 4개가 나와야 하고, 두 번째 명령은 출력이 없어야 한다
git grep -n "export function \(initPostHog\|track\|identifyUser\|resetAnalytics\)" -- src/lib/posthog.ts
git grep -n "\bany\b" -- src/lib/posthog.ts src/lib/analytics/events.ts

# (AC-04, AC-05) history_change, NEXT_PUBLIC_VERCEL_ENV, app_env가 나와야 한다
git grep -n "history_change\|NEXT_PUBLIC_VERCEL_ENV\|app_env" -- src/lib/posthog.ts

# (AC-08~AC-10) import 줄 외에 identifyUser 호출 2곳, resetAnalytics 호출 2곳, is_new_user 1곳이 나와야 하고, 두 번째 명령은 출력이 없어야 한다
git grep -n "identifyUser\|resetAnalytics\|is_new_user" -- src/features/auth/hooks/useAuthMutations.ts
git grep -n "isNewUser: data" -- src

# (AC-11) identifyUser가 나와야 한다
git grep -n "identifyUser" -- src/providers/posthog-provider.tsx

# (AC-12) track('landing_viewed')와 useRef가 나와야 한다
git grep -n "landing_viewed\|useRef" -- src/features/landing/components/LandingAuthRedirect.tsx

# (AC-13) 첫 번째는 출력이 없어야 하고, 두 번째는 1줄 이상이어야 한다
git grep -n "PostHog_이벤트_설계_문서" -- src/lib/posthog.ts
git grep -n "docs/analytics/posthog-events.md" -- src/lib/posthog.ts

# (AC-14) A src/lib/analytics/events.ts 1줄과 M 4줄(위 4개 파일)만 나와야 한다
git diff --cached --name-status origin/develop

# (AC-15)
npm run typecheck
npm run build
npm run lint
```

- (AC-03) 타입 제한은 코드로 확인한다. 확인용으로 맵에 없는 이벤트 이름이나 속성 누락 호출을 임시로 넣어 `npm run typecheck`가 실패하는지 봐도 되지만, 그 임시 코드는 커밋하지 않는다
- (AC-16) [manual]: 사용자가 확인한다. Vercel 프리뷰에서 확인하려면 Vercel의 Preview 환경변수가 `NEXT_PUBLIC_POSTHOG_KEY`·`NEXT_PUBLIC_POSTHOG_HOST` 이름으로 등록돼 있고 그 뒤에 배포된 프리뷰여야 한다. 그렇지 않으면 로컬 `npm run dev`(`.env.local`에 두 키 설정)에서 확인하고, 그 경우 `app_env: preview` 확인은 머지 후 프리뷰 배포에서 따로 본다. 카카오 로그인은 실제 카카오 계정이 필요하다
