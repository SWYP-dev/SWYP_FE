---
spec_id: ANALYTICS-0006
revision: 0
---

# ANALYTICS-0006 — PostHog Feature Flag `test-session-login-entry`: 랜딩 "테스트 시작하기" CTA와 테스트 세션 로그인 이벤트

## 배경

- PostHog 이벤트 설계 문서 `docs/analytics/posthog-events.md` 7장의 마지막 스펙(P2)이다. 범위는 5장 Feature Flag `test-session-login-entry`와 3.1의 `test_session_login_completed`, 3.0 `landing_cta_clicked.cta_type`의 `test_start`다. ANALYTICS-0001~0005(PR #222·#224·#226·#228·#232)가 머지되어 있다
- 목적 (설계 문서 5장): 카카오 로그인 없이 체험하는 경로를 팀 내부·QA에 먼저 노출하고, 점진 배포 절차를 실제로 운영해 본다. 통계적 유의성보다 실험 인프라를 구축·운영했다는 것 자체가 산출물이다
- 지금 코드 (2026-10-23 develop `843af47` 기준)
  - `src/lib/posthog.ts`: `initPostHog()`가 `posthog.init(...)` 후 `posthog.register({ app_env })`를 한다. `app_env`는 `NEXT_PUBLIC_VERCEL_ENV` 기준 `production` | `preview` | `development`. `resetAnalytics()`는 `posthog.reset()` 뒤 `app_env`를 다시 `register`한다. Feature Flag를 읽는 코드는 없다. `person_profiles: 'identified_only'`라 익명 방문자에게는 사람 속성이 없다
  - `register`한 슈퍼 속성은 이벤트 속성이라 플래그 조건(사람 속성)으로 쓸 수 없다. 익명 방문자를 환경별로 타겟팅하려면 `posthog.setPersonPropertiesForFlags(properties, reloadFeatureFlags?)`(posthog-js 1.428.1)로 플래그 평가용 속성을 넘겨야 한다
  - posthog-js의 `isFeatureEnabled(key)`는 `boolean | undefined`(플래그 로드 전 `undefined`)를 돌려주고, `onFeatureFlags(callback)`은 구독 해제 함수를 돌려준다. `src/providers/posthog-provider.tsx`는 자체 Provider이고 `posthog-js/react`의 Provider·훅은 쓰지 않는다
  - `src/features/auth/hooks/useAuthMutations.ts` `useTestSessionMutation`: `onSuccess`에서 토큰 저장 → `setUser` → `identifyUser(data.user.id, 'test')` → `queryClient.invalidateQueries()` → `router.replace('/jobs')`. `onError`가 없다. 지금 이 훅을 쓰는 곳은 없다
  - 테스트 세션 발급은 같은 오리진의 `src/app/api/test-session/route.ts`(서버 전용 `TEST_SESSION_SECRET`을 붙여 백엔드 `POST /api/v1/auth/test-session` 호출)를 거친다. secret이 없으면 403(`A007`)을 돌려준다. 이 API는 `docs/API_SPEC.md`에 섹션이 없는 기존 연동이다. 사용자 확인(2026-10-23): Vercel Preview·Production 모두 `TEST_SESSION_SECRET`이 등록되어 있다
  - 랜딩 CTA: `src/features/landing/components/Navbar.tsx`(`variant === 'landing'`일 때만 "무료로 시작하기" `Link`)와 `Hero.tsx`("무료로 시작하기" `Link`)가 `/jobs`로 이동하며 `landing_cta_clicked`(`start_free`)를 보낸다 (ANALYTICS-0002). `landing_cta_clicked.cta_type` 타입은 `'start_free' | 'signup_login'`이다
  - "테스트 시작하기" UI는 커밋 `f76efd9`에서 되돌리기 전 구현이 있다: `useTestSessionMutation()`을 부르는 `<button>`, `testSession.isPending`이면 `ButtonSpinnerIcon`(`@/components/ui/spinner`)과 "준비 중" 문구, `disabled:bg-action-primary-disabled`. 클래스는 지금 각 "무료로 시작하기" `Link`와 같다
  - PostHog 프로젝트에 `test-session-login-entry` 플래그는 아직 없다 (2026-10-23 확인)

## 범위

**포함**

- 플래그 평가용 속성 `app_env` 전달, 플래그 값을 읽는 훅 추가
- 플래그가 켜지면 Navbar(`landing`)·Hero의 "무료로 시작하기" 자리에 "테스트 시작하기"(테스트 세션 발급 후 `/jobs`) 노출
- `landing_cta_clicked.cta_type`에 `'test_start'` 추가, `test_session_login_completed` 이벤트 추가
- 테스트 세션 발급 실패 시 `/jobs`로 이동 (사용자 결정 2026-10-23)

**제외**

- PostHog에서 플래그를 만들고 롤아웃 조건을 정하는 일은 코드 범위가 아니다. 사용자가 PostHog 화면에서 한다 (AC의 [manual] 참고)
- 플래그가 꺼져 있을 때의 랜딩 화면·동작, `variant === 'default'`(`/privacy`·`/terms`) Navbar, "회원가입/로그인" 버튼은 바꾸지 않는다
- 테스트 세션 발급 실패를 따로 집계하는 이벤트는 만들지 않는다 (설계 문서에 없음)
- `src/app/api/test-session/route.ts`, `src/features/auth/api/authApi.ts`, 테스트 세션 서버 동작은 바꾸지 않는다
- 이벤트 이름·속성 설계(설계 문서 3.0·3.1·5장)는 바꾸지 않는다. 설계를 바꿔야 한다고 판단되면 구현하지 말고 보고한다
- 새 패키지 추가·버전 변경은 하지 않는다. `package.json`·`package-lock.json`은 바뀌지 않는다. `posthog-js/react`를 새로 쓰지 않는다
- 정책 경로(`.github/`, `.claude/`, `.codex/`, `.agents/`, `docs/ai/`, `docs/workflow/`, `scripts/ai/`, `AGENTS.md`, `CLAUDE.md`)와 `docs/specs/`, 설계 문서 `docs/analytics/posthog-events.md`는 바꾸지 않는다

## 설계 결정

공통 원칙 (설계 문서 2.5): 클릭 이벤트는 클릭 시점에, 서버 응답이 필요한 이벤트는 성공 후에 보낸다. 모든 이벤트는 `src/lib/posthog.ts`의 `track()`만 거치고, 플래그도 이 파일의 함수만 거쳐 읽는다 (컴포넌트에서 `posthog-js`를 직접 import하지 않는다).

### 1. 이벤트 타입 맵 — `src/lib/analytics/events.ts`

- `landing_cta_clicked.cta_type`을 `'start_free' | 'signup_login' | 'test_start'`로 바꾼다. `cta_location`(`'navbar' | 'hero'`)은 그대로다
- `AnalyticsEventMap`에 `test_session_login_completed: Record<string, never>`를 추가한다
- 그 밖의 항목은 바꾸지 않는다. `any`를 쓰지 않는다

### 2. 플래그 키 — 새 파일 `src/lib/analytics/featureFlags.ts`

- `FEATURE_FLAGS = { testSessionLoginEntry: 'test-session-login-entry' } as const`와 `FeatureFlagKey = (typeof FEATURE_FLAGS)[keyof typeof FEATURE_FLAGS]` 타입을 export한다. 플래그 키 문자열은 이 파일에만 둔다

### 3. 플래그 읽기 — `src/lib/posthog.ts`

- 플래그 평가용 속성: `initPostHog()`에서 `register` 직후, `resetAnalytics()`에서 `register` 직후 `posthog.setPersonPropertiesForFlags({ app_env: getAppEnv() })`를 부른다. reset이 플래그 평가용 속성도 지우므로 다시 넣는다. PostHog 플래그 조건에서 사람 속성 `app_env`로 환경별 타겟팅을 하기 위함이다
- export 함수 2개 추가 (둘 다 먼저 `initPostHog()`를 부르고, 초기화되지 않았으면(키 없음·서버) 안전한 기본값을 돌려준다)
  - `isFeatureFlagEnabled(key: FeatureFlagKey): boolean` — `posthog.isFeatureEnabled(key) === true`. 로드 전(`undefined`)·미초기화는 `false`. 노출 집계를 위해 `send_event` 옵션은 기본값(전송)을 쓴다
  - `subscribeFeatureFlags(callback: () => void): () => void` — `posthog.onFeatureFlags`로 구독하고 그 해제 함수를 돌려준다. 미초기화면 아무것도 하지 않는 함수를 돌려준다
- 기존 `track`·`identifyUser`·`resetAnalytics`의 동작은 위 한 줄 추가 외에 바꾸지 않는다

### 4. 플래그 훅 — 새 파일 `src/lib/hooks/useFeatureFlagEnabled.ts`

- `useFeatureFlagEnabled(key: FeatureFlagKey): boolean`을 export한다. `useSyncExternalStore(subscribeFeatureFlags, () => isFeatureFlagEnabled(key), () => false)`로 만든다
  - 서버 렌더·하이드레이션과 플래그 로드 전에는 `false`라서, 처음에는 지금과 같은 "무료로 시작하기"가 보이고 플래그가 켜진 방문자에게만 로드 후 "테스트 시작하기"로 바뀐다
  - `useEffect` 안에서 `setState`를 부르지 않는다 (`react-hooks/set-state-in-effect`)

### 5. 랜딩 CTA — `Navbar.tsx`, `Hero.tsx`

- 두 컴포넌트에서 `useFeatureFlagEnabled(FEATURE_FLAGS.testSessionLoginEntry)`가 `true`면 "무료로 시작하기" `Link` 대신 "테스트 시작하기" 버튼을 렌더링한다. `false`면 지금과 같다
- "테스트 시작하기" 버튼은 `f76efd9`에서 되돌리기 전 구현을 그대로 쓴다 (설계 문서 5장: 새 시안을 기다리지 않음)
  - `<button type="button">`, 클래스는 같은 자리의 지금 "무료로 시작하기" `Link` 클래스에 `disabled:bg-action-primary-disabled`를 더한 것
  - `const testSession = useTestSessionMutation()`, `disabled={testSession.isPending}`, 진행 중이면 `<ButtonSpinnerIcon />`과 "준비 중", 아니면 "테스트 시작하기"
  - `onClick`: `track('landing_cta_clicked', { cta_type: 'test_start', cta_location })` → `testSession.mutate()`. `cta_location`은 Navbar `'navbar'`, Hero `'hero'`
- Navbar는 지금처럼 `variant === 'landing'`일 때만 이 자리를 렌더링한다. `default` variant는 바뀌지 않는다
- 플래그가 켜져도 "회원가입/로그인" 버튼과 그 계측은 그대로다

### 6. 테스트 세션 발급 — `useAuthMutations.ts` `useTestSessionMutation`

- `onSuccess`: `identifyUser(data.user.id, 'test')` 바로 다음 줄에 `track('test_session_login_completed')`를 보낸다. 식별 뒤에 보내야 테스트 사용자에 연결된다. 그 밖의 처리 순서는 그대로다
- `onError` 추가: `router.replace('/jobs')`로 이동한다. 버튼이 두 곳이라 성공 시 이동처럼 실패 처리도 훅 안에 둔다. 랜딩 CTA가 실패로 막다른 길이 되지 않게 비로그인 탐색(`/jobs`)으로 보낸다. 토큰·사용자 상태는 건드리지 않는다
  - 403(`A007`)을 포함한 모든 실패에서 같다. 실패 이유 안내 문구는 두지 않는다

### 공통

- 바꾼 부분에는 왜 그렇게 했는지 한국어 주석을 짧게 남긴다 (`.claude/rules/code-style.md`)
- BE 의존: 없음. 기존 테스트 세션 발급 연동(`/api/test-session` → `POST /api/v1/auth/test-session`, `docs/API_SPEC.md`에 섹션 없음)을 그대로 쓴다. 새 엔드포인트·필드를 추가하지 않는다

## 수용 기준

- AC-01 `src/lib/analytics/events.ts`의 `landing_cta_clicked.cta_type`이 `'start_free' | 'signup_login' | 'test_start'`이고 `AnalyticsEventMap`에 `test_session_login_completed: Record<string, never>`가 있다. 그 밖의 항목은 바뀌지 않았고 `any`가 없다
- AC-02 `src/lib/analytics/featureFlags.ts`가 `FEATURE_FLAGS`(`testSessionLoginEntry: 'test-session-login-entry'`)와 `FeatureFlagKey`를 export하고, 문자열 `'test-session-login-entry'`는 `src/` 안에서 이 파일에만 있다
- AC-03 `src/lib/posthog.ts`는 `initPostHog()`와 `resetAnalytics()`의 `register` 직후 `setPersonPropertiesForFlags({ app_env: getAppEnv() })`를 부르고, `isFeatureFlagEnabled`(로드 전·미초기화면 `false`)와 `subscribeFeatureFlags`(미초기화면 빈 해제 함수)를 export한다
- AC-04 `src/lib/hooks/useFeatureFlagEnabled.ts`가 `useSyncExternalStore`로 `useFeatureFlagEnabled(key)`를 구현하고, 서버 스냅샷은 `false`다. `src/` 안에서 `posthog-js`를 직접 import하는 파일은 `src/lib/posthog.ts`뿐이다
- AC-05 `Navbar.tsx`(`variant === 'landing'`)와 `Hero.tsx`는 플래그가 켜지면 "무료로 시작하기" 대신 "테스트 시작하기" 버튼을 렌더링하고, 클릭 시 `landing_cta_clicked`(`cta_type: 'test_start'`, 각각 `cta_location: 'navbar'`·`'hero'`)를 보낸 뒤 `useTestSessionMutation().mutate()`를 부른다. 진행 중에는 비활성화되고 스피너와 "준비 중"을 보여준다. 플래그가 꺼져 있으면 기존 "무료로 시작하기" `Link`와 계측이 그대로다
- AC-06 `useTestSessionMutation`은 `onSuccess`에서 `identifyUser(..., 'test')` 다음에 `test_session_login_completed`를 보내고, `onError`에서 `router.replace('/jobs')`로 이동한다. 그 밖의 성공 처리 순서는 그대로다
- AC-07 변경 파일은 아래 7개뿐이다: `src/lib/analytics/events.ts`, `src/lib/analytics/featureFlags.ts`(추가), `src/lib/posthog.ts`, `src/lib/hooks/useFeatureFlagEnabled.ts`(추가), `src/features/auth/hooks/useAuthMutations.ts`, `src/features/landing/components/Navbar.tsx`, `src/features/landing/components/Hero.tsx`. `package.json`·`package-lock.json`·`src/app/api/test-session/route.ts`·`src/features/auth/api/authApi.ts`는 바뀌지 않는다
- AC-08 `npm run typecheck`·`npm run build`·`npm run lint`가 통과한다
- AC-09 [manual] 사용자가 PostHog에 Boolean 플래그 `test-session-login-entry`를 만들고 release condition을 사람 속성 `app_env` = `preview`, 100%로 둔 뒤, `NEXT_PUBLIC_POSTHOG_KEY`·`NEXT_PUBLIC_POSTHOG_HOST`가 설정된 Vercel 프리뷰에서 로그아웃 상태(또는 시크릿 창)로 확인한다
  - 랜딩(`/`)의 Navbar·Hero에 "테스트 시작하기"가 보인다 (처음 잠깐 "무료로 시작하기"였다가 바뀌어도 된다). `/privacy`의 Navbar는 그대로 "회원가입/로그인"만 있다
  - Hero의 "테스트 시작하기"를 누르면 "준비 중"으로 바뀐 뒤 로그인된 상태로 `/jobs`에 들어간다. PostHog에 `landing_cta_clicked`(`test_start`, `hero`), `test_session_login_completed`가 오고, 뒤의 이벤트에 `account_type: test`가 붙는다. Navbar 버튼은 `cta_location: navbar`다
  - 플래그 조건을 `app_env` = `production`으로만 바꾸거나 플래그를 끄면, 프리뷰 랜딩은 기존 "무료로 시작하기"로 돌아온다 (새로고침 후)
  - `.env.local`에 `TEST_SESSION_SECRET`을 두지 않은 로컬 `npm run dev`에서 PostHog 툴바나 조건으로 플래그를 켜고 "테스트 시작하기"를 누르면 403 후 비로그인 상태로 `/jobs`로 이동한다

## 테스트 계획

구현 후 **커밋하기 전에** 아래를 실행하고 명령과 결과를 PR 본문에 남긴다.

```bash
# 아래는 수정 후, 커밋하기 전에 실행한다 (새 파일은 git add 후에 git grep에 잡힌다)

# (AC-01) test_start와 새 이벤트가 나와야 한다
git grep -n "test_start\|test_session_login_completed" -- src

# (AC-01) 출력이 없어야 한다
git grep -n "\bany\b" -- src/lib/analytics/events.ts src/lib/analytics/featureFlags.ts src/lib/posthog.ts src/lib/hooks/useFeatureFlagEnabled.ts

# (AC-02) featureFlags.ts 한 줄만 나와야 한다
git grep -n "test-session-login-entry" -- src

# (AC-03) 두 번의 setPersonPropertiesForFlags와 export 함수 2개가 나와야 한다
git grep -n "setPersonPropertiesForFlags\|export function isFeatureFlagEnabled\|export function subscribeFeatureFlags" -- src/lib/posthog.ts

# (AC-04) useSyncExternalStore가 나오고, posthog-js import는 src/lib/posthog.ts 한 줄만 나와야 한다
git grep -n "useSyncExternalStore" -- src/lib/hooks/useFeatureFlagEnabled.ts
git grep -n "from 'posthog-js" -- src

# (AC-05, AC-06) 호출 위치가 나와야 한다
git grep -n "useFeatureFlagEnabled\|useTestSessionMutation\|test_start\|ButtonSpinnerIcon\|준비 중" -- src/features/landing/components/Navbar.tsx src/features/landing/components/Hero.tsx
git grep -n "identifyUser(data.user.id, 'test')\|test_session_login_completed\|onError\|router.replace('/jobs')" -- src/features/auth/hooks/useAuthMutations.ts

# (AC-07) 출력이 없어야 한다
git diff --cached --name-only origin/develop -- package.json package-lock.json src/app/api/test-session/route.ts src/features/auth/api/authApi.ts

# (AC-07) A 2줄(featureFlags.ts, useFeatureFlagEnabled.ts)과 M 5줄(위 목록)만 나와야 한다
git diff --cached --name-status origin/develop
git status --short

# (AC-08)
npm run typecheck
npm run build
npm run lint
```

- (AC-05) 플래그 `false`일 때의 JSX가 지금 develop의 "무료로 시작하기" `Link`·계측과 같은지 diff로 확인한다
- (AC-09) [manual]: 사용자가 확인한다. PostHog 플래그 생성·조건 변경은 사용자가 PostHog 화면에서 한다. Vercel 프리뷰는 Preview 환경변수에 `NEXT_PUBLIC_POSTHOG_KEY`·`NEXT_PUBLIC_POSTHOG_HOST`·`TEST_SESSION_SECRET`이 있고 그 뒤에 배포된 것이어야 한다. 플래그 평가용 속성은 PostHog 화면의 플래그 조건에서 사람 속성 `app_env`로 고른다(목록에 없으면 직접 입력). 테스트 세션은 누를 때마다 새 계정이 생기므로 확인 횟수를 최소로 한다
