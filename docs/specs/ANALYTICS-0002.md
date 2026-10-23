---
spec_id: ANALYTICS-0002
revision: 0
---

# ANALYTICS-0002 — PostHog 핵심 퍼널 이벤트: 랜딩 CTA, 로그인 단계, 스크랩, 지원 현황 등록, 원본 공고 클릭

## 배경

- PostHog 이벤트 설계 문서 `docs/analytics/posthog-events.md` 7장의 두 번째 스펙(P0)이다. ANALYTICS-0001(PR #222)이 `track()` 래퍼, 이벤트 타입 맵(`src/lib/analytics/events.ts`), identify·reset, `$pageview`, `landing_viewed`를 머지했다. 이 스펙은 그 위에 퍼널 이벤트를 추가한다. 퍼널·대시보드는 이 스펙이 머지된 뒤 만든다 (설계 문서 6장)
- 지금 코드 (2026-10-22 develop `619d739` 기준)
  - `src/lib/analytics/events.ts`의 `AnalyticsEventMap`에는 `landing_viewed`, `kakao_login_completed`(`{ is_new_user }`)만 있다
  - 로그인 모달 `LoginModal`은 세 곳에서 쓴다: `GlobalLoginModal`(루트 레이아웃, `useLoginModalStore`로 열림), `Sidebar`와 `NotificationBell`(각자 로컬 `useState`로 열림). 전역 모달은 `jobs/page.tsx`의 스크랩 가드와 `api-client.ts`의 401 처리가 `openLoginModalOutsideReact()`로 연다. 지금은 어떤 행동 때문에 열렸는지 알 수 없다
  - `LoginModal`의 "카카오 계정으로 계속하기"와 랜딩 `KakaoLoginButton`("회원가입/로그인")은 `window.location.href = getKakaoAuthorizeUrl()`로 카카오 인가 페이지로 나간다. 외부 페이지로 나가므로 시작 맥락이 사라진다
  - `src/app/auth/kakao/callback/page.tsx`: `error` 쿼리가 있으면 `/?loginError=kakao_denied`, 로그인 mutation이 실패하면 `/?loginError=1`로 이동한다. 이 페이지는 `error` 분기에 중복 방지가 없어(`hasRequested`는 `code` 분기만 막는다) 개발 모드 StrictMode에서 effect가 두 번 실행된다
  - `Navbar`("회원가입/로그인" `KakaoLoginButton`, "무료로 시작하기" `Link`)와 `Hero`("무료로 시작하기" `Link`)에는 계측이 없다. `Navbar`는 `variant`가 `'landing'`·`'default'`이고 `'default'`는 `/privacy`·`/terms`에서 쓴다
  - `src/app/jobs/page.tsx` `handleToggleScrap`·`handleAddToKanban`, `src/app/scraps/page.tsx` `handleRemoveScrap`·`handleAddToKanban`, `src/features/kanban/components/KanbanBoard.tsx`의 `AddCardModal`(`mode="add"`) `onConfirm`에는 계측이 없다
  - 원본 공고 링크는 `src/components/ui/job-card.tsx`(피드·스크랩 공용), `src/features/kanban/components/KanbanCard.tsx`의 `KanbanCardContent`, `src/features/kanban/components/CardDetailDrawer.tsx`에 있다. `KanbanCard`는 `KanbanColumn`에서만 쓰고, 지원 마감일 화면은 드로어만 쓴다

## 범위

**포함**

- 이벤트 9종 추가: `landing_cta_clicked`, `login_prompt_shown`, `kakao_login_started`, `kakao_login_failed`, `job_scrapped`, `scrap_removed`, `kanban_card_added`, `kanban_card_add_duplicated`, `original_posting_clicked`
- 기존 `kakao_login_completed`에 `entry`·`trigger` 속성 추가
- 로그인 모달의 트리거 구분(`LoginTrigger`)과, 카카오 인가 페이지로 나가기 전 시작 맥락을 sessionStorage로 완료 이벤트에 넘기는 기능

**제외**

- `landing_cta_clicked`의 `cta_type: 'test_start'`와 테스트 세션 CTA는 ANALYTICS-0006에서 한다. 이번 타입에는 `'start_free' | 'signup_login'`만 둔다
- `feed_searched`, `feed_filter_applied`, `feed_filter_reset`, `feed_sort_changed`, `toast_kanban_link_clicked`는 ANALYTICS-0004에서 한다
- 칸반 관리 이벤트(설계 문서 3.4 전체)는 ANALYTICS-0003, 알림·설정은 ANALYTICS-0005에서 한다
- 로그인 후 비로그인 중 하려던 행동을 이어주는 동작 변경, 카카오 로그인 후 이동 경로 변경은 하지 않는다 (설계 문서 1장: 데이터로 먼저 확인)
- 카드 삭제 "되돌리기"(`handleUndoDeleteCard` 등)와 칸반의 `createDirectCard` 재사용 부분은 계측하지 않는다
- 새 패키지 추가·버전 변경은 하지 않는다. `package.json`·`package-lock.json`은 바뀌지 않는다
- 정책 경로(`.github/`, `.claude/`, `.codex/`, `.agents/`, `docs/ai/`, `docs/workflow/`, `scripts/ai/`, `AGENTS.md`, `CLAUDE.md`)와 `docs/specs/`는 바꾸지 않는다. 설계 문서 `docs/analytics/posthog-events.md`도 이 구현 PR에서 고치지 않는다 (이벤트 설계를 바꿔야 한다고 판단되면 구현하지 말고 보고한다)

## 설계 결정

공통 원칙 (설계 문서 2.5): 서버 반영이 필요한 행동은 **성공 응답 후**에 보내고, 클릭만으로 보내는 이벤트(`landing_cta_clicked`, `kakao_login_started`, `original_posting_clicked`)는 클릭 시점에 보낸다. 이벤트는 mutation 훅이 아니라 **화면 핸들러**에서 보낸다. 모든 호출은 `src/lib/posthog.ts`의 `track()`만 거친다. 검색어·메모·회사명·URL 같은 자유 텍스트는 속성에 넣지 않는다.

### 1. 이벤트 타입 맵 — `src/lib/analytics/events.ts`

기존 `AccountType`, `landing_viewed`, `kakao_login_completed`, `AnalyticsEventName`은 유지하고 아래를 추가·변경한다. 맵 키·속성 이름은 설계 문서 3.0~3.3과 일치시킨다.

- 공용 타입 export
  - `LoginTrigger = 'scrap' | 'notification_bell' | 'sidebar' | 'api_401'`
  - `LoginEntry = 'landing_navbar' | 'login_modal'`
  - `CardAddSource = 'feed_direct' | 'feed_scrapped' | 'scraps_page' | 'manual'`
- `AnalyticsEventMap` 추가·변경 (`Platform`은 `@/types/api`의 타입)

| 이벤트                       | 속성                                                                                                                                                                                                       |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `landing_cta_clicked`        | `{ cta_type: 'start_free' \| 'signup_login'; cta_location: 'navbar' \| 'hero' }`                                                                                                                           |
| `login_prompt_shown`         | `{ trigger: LoginTrigger }`                                                                                                                                                                                |
| `kakao_login_started`        | `{ entry: 'landing_navbar' } \| { entry: 'login_modal'; trigger: LoginTrigger }`                                                                                                                           |
| `kakao_login_completed`      | `{ is_new_user: boolean; entry?: LoginEntry; trigger?: LoginTrigger }` (기존 `is_new_user`는 그대로)                                                                                                       |
| `kakao_login_failed`         | `{ reason: 'kakao_denied' \| 'server_error' }`                                                                                                                                                             |
| `job_scrapped`               | `{ feed_id: number; platform: Platform; job_category: string \| null; career: string; has_active_filter: boolean; is_searching: boolean }`                                                                 |
| `scrap_removed`              | `{ source: 'feed' \| 'scraps_page' }`                                                                                                                                                                      |
| `kanban_card_added`          | `{ source: 'feed_direct' \| 'feed_scrapped' \| 'scraps_page'; platform: Platform \| null; job_category: string \| null } \| { source: 'manual'; target_stage_type: 'default' \| 'custom' }`                 |
| `kanban_card_add_duplicated` | `{ source: CardAddSource }`                                                                                                                                                                                |
| `original_posting_clicked`   | `{ source: 'feed' \| 'scraps'; platform: Platform \| null } \| { source: 'kanban_card' \| 'card_drawer' }`                                                                                                 |

- `track()`의 시그니처(속성 필수·선택 처리)는 `src/lib/posthog.ts` 그대로 쓴다. 이 파일은 바꾸지 않는다. 속성이 유니온인 이벤트도 `track('kanban_card_added', { source: 'manual', target_stage_type: 'custom' })`처럼 호출했을 때 타입이 맞아야 한다
- `any`를 쓰지 않는다

### 2. 로그인 모달 트리거 — `loginModalStore.ts`, `LoginModal.tsx`, `GlobalLoginModal.tsx`, `sidebar.tsx`, `NotificationBell.tsx`, `api-client.ts`, `jobs/page.tsx`

- `useLoginModalStore`에 `trigger: LoginTrigger` 상태를 추가한다 (초기값 `'api_401'`). `open`은 `open(trigger: LoginTrigger)`로 바꾼다
  - 이미 열려 있으면(`isOpen === true`) 아무것도 하지 않는다. 한 화면에서 401 응답이 여러 건 동시에 와도 `login_prompt_shown`이 한 번만 가고 `trigger`도 처음 값이 유지되게 하기 위함이다
  - 닫혀 있다가 열릴 때 `track('login_prompt_shown', { trigger })`를 보내고 `set({ isOpen: true, trigger })` 한다
  - `openLoginModalOutsideReact(trigger: LoginTrigger)`가 인자를 받아 `open(trigger)`에 넘긴다
- 호출부
  - `api-client.ts`의 401 처리: `openLoginModalOutsideReact('api_401')`
  - `jobs/page.tsx` `handleToggleScrap`의 비로그인 가드: `openLoginModalOutsideReact('scrap')`
  - `GlobalLoginModal`: 스토어의 `trigger`를 읽어 `<LoginModal trigger={trigger} .../>`로 넘긴다
- `Sidebar`: "회원가입/로그인" 버튼 클릭 핸들러에서 `setIsLoginModalOpen(true)`와 함께 `track('login_prompt_shown', { trigger: 'sidebar' })`를 보낸다. `<LoginModal trigger="sidebar" />`
- `NotificationBell`: 비로그인 `handleClick` 분기에서 `setIsLoginModalOpen(true)`와 함께 `track('login_prompt_shown', { trigger: 'notification_bell' })`를 보낸다. `<LoginModal trigger="notification_bell" />`
- `LoginModal`은 `trigger: LoginTrigger` prop을 필수로 받는다. 모달이 열릴 때의 `login_prompt_shown`은 **위 호출 지점**(스토어 `open`, 사이드바·알림 벨 핸들러)에서만 보내고 `LoginModal` 안에서는 보내지 않는다. effect로 보내면 `react-hooks/exhaustive-deps` 규칙을 어기지 않으면서 한 번만 보내기가 까다롭기 때문이다
- `trigger: 'api_401'`은 토큰 재발급 실패(세션 만료)로 열린 경우도 포함한다. 비로그인 이벤트와 만료 이벤트를 구분하지 않는다 (설계 문서 3.1: 어느 화면에서 났는지는 `$pathname`으로 본다)

### 3. 카카오 로그인 시작 맥락 — 새 파일 `src/features/auth/utils/loginContext.ts`

- sessionStorage 키 `chwihap_login_context`에 JSON `{ entry: LoginEntry; trigger?: LoginTrigger }`를 저장한다
- export
  - `saveLoginContext(context: { entry: LoginEntry; trigger?: LoginTrigger }): void` — 저장. 이전 값은 덮어쓴다
  - `consumeLoginContext(): { entry: LoginEntry; trigger?: LoginTrigger } | null` — 읽고 **바로 삭제**한다. 값이 없거나 JSON이 깨졌거나 `entry`가 `LoginEntry`가 아니면 `null`. `trigger`가 `LoginTrigger`가 아니면 버리고 `entry`만 돌려준다
- 두 함수 모두 sessionStorage 접근이 예외를 던져도(사생활 보호 모드 등) 앱이 깨지지 않도록 `try/catch`로 감싸고, 실패하면 저장은 건너뛰고 읽기는 `null`을 돌려준다
- 서버 환경에서 불려도 안전해야 한다 (`typeof window === 'undefined'`면 저장은 건너뛰고 읽기는 `null`)

### 4. `kakao_login_started` — `LoginModal.tsx`, `KakaoLoginButton.tsx`

- `LoginModal` `handleKakaoLogin`: `track('kakao_login_started', { entry: 'login_modal', trigger })` → `saveLoginContext({ entry: 'login_modal', trigger })` → `window.location.href = getKakaoAuthorizeUrl()`
- `KakaoLoginButton`: 클릭 시 `onClick?.()`(아래 5절의 CTA 이벤트용 선택 prop, 이동보다 먼저 호출)을 부르고, `track('kakao_login_started', { entry: 'landing_navbar' })` → `saveLoginContext({ entry: 'landing_navbar' })` → 기존 `window.location.href = getKakaoAuthorizeUrl()`
- 페이지를 떠나기 직전에 보내므로 이벤트가 유실될 수 있다. posthog-js의 종료 시 전송에 맡기고 별도 지연(`setTimeout` 등)을 넣지 않는다. 유실 여부는 [manual] 기준으로 확인한다

### 5. 랜딩 CTA — `Navbar.tsx`, `Hero.tsx`, `KakaoLoginButton.tsx`

- `KakaoLoginButton`에 `onClick?: () => void` 선택 prop을 추가한다 (4절)
- `Navbar`
  - "회원가입/로그인": `variant === 'landing'`일 때만 `onClick`으로 `track('landing_cta_clicked', { cta_type: 'signup_login', cta_location: 'navbar' })`를 보낸다. `variant === 'default'`(`/privacy`·`/terms`)에서는 `landing_cta_clicked`를 보내지 않는다. 단 `kakao_login_started`는 두 variant 모두에서 4절대로 간다 (`$pathname`으로 구분)
  - "무료로 시작하기" `Link`(`variant === 'landing'`에서만 렌더링됨): `onClick`으로 `track('landing_cta_clicked', { cta_type: 'start_free', cta_location: 'navbar' })`. `href="/jobs"`와 이동 동작은 바꾸지 않는다
- `Hero`: "무료로 시작하기" `Link`의 `onClick`으로 `track('landing_cta_clicked', { cta_type: 'start_free', cta_location: 'hero' })`. 이동 동작은 바꾸지 않는다

### 6. `kakao_login_completed`의 `entry`·`trigger`, `kakao_login_failed` — `useAuthMutations.ts`, `auth/kakao/callback/page.tsx`

- `useKakaoLoginMutation` onSuccess: `consumeLoginContext()`로 맥락을 읽어 `track('kakao_login_completed', { is_new_user: data.isNewUser, ...(context ?? {}) })`처럼 `entry`·`trigger`를 **있을 때만** 넣는다 (`undefined` 값을 속성으로 보내지 않는다). `identifyUser`가 `track`보다 먼저인 현재 순서를 유지한다. 그 밖의 처리는 바꾸지 않는다
- 콜백 페이지 `CallbackHandler`
  - `kakaoError` 분기: `track('kakao_login_failed', { reason: 'kakao_denied' })`를 보낸 뒤 기존대로 `router.replace('/?loginError=kakao_denied')`. 개발 모드 StrictMode에서 두 번 가지 않게 `useRef`로 보낸 여부를 기록한다 (렌더 중에 ref를 읽지 않는다 — `react-hooks/refs` 규칙). 기존 `hasRequested` ref를 재사용하거나 별도 ref를 쓰는 방식은 구현자가 정한다
  - `loginMutation.mutate`의 `onError`: `track('kakao_login_failed', { reason: 'server_error' })`를 보낸 뒤 기존대로 `router.replace('/?loginError=1')`
  - 두 실패 분기 모두 시작 맥락을 정리하기 위해 `consumeLoginContext()`를 호출해 버린다 (반환값은 쓰지 않는다)
  - `code`도 `error`도 없이 진입한 경우(`!code`)는 이벤트를 보내지 않고 기존 동작을 유지한다
  - 성공 분기 `onSuccess: () => router.replace('/kanban')`는 바꾸지 않는다

### 7. 스크랩 — `jobs/page.tsx`, `scraps/page.tsx`

- `job_scrapped` (`jobs/page.tsx` `handleToggleScrap`)
  - 스크랩을 **추가**하는 경우(`!currentlyScrapped`)에만, `postScrap(feedId)`가 성공한 뒤에 보낸다. 해제·실패·비로그인 가드·`AuthRequiredError`에서는 보내지 않는다
  - 속성값은 `await` 전에, 클릭 시점의 `data?.items`에서 `id === feedId`인 항목과 필터·검색 상태로 만들어 둔다. 응답을 기다리는 동안 페이지·필터가 바뀌어도 클릭 시점 값이 나가게 하기 위함이다. 항목을 찾지 못하면 이벤트를 보내지 않는다
  - `feed_id`: `feedId`, `platform`: `item.platform`, `job_category`: `item.jobCategory ?? null`(응답이 null일 수 있다 — 설계 문서 3.2), `career`: `item.career`
  - `has_active_filter`: 실제 쿼리에 들어가는 필터가 하나라도 있으면 true — `buildJobCategoryParam(jobCategoryValue) !== undefined || buildRegionParam(regionValue) !== undefined || buildCareerParam(careerTags) !== undefined || deadlineSoon`
  - `is_searching`: 기존 `isSearching`(`keyword.trim().length > 0`)과 같은 기준
- `scrap_removed`
  - `jobs/page.tsx` `handleToggleScrap`의 해제 분기: `deleteScrap(jobPostingId)`가 성공한 뒤 `track('scrap_removed', { source: 'feed' })`
  - `scraps/page.tsx` `handleRemoveScrap`: `deleteScrap(jobPostingId)`가 성공한 뒤 `track('scrap_removed', { source: 'scraps_page' })`. 실패(catch)에서는 보내지 않는다

### 8. 지원 현황 등록 — `jobs/page.tsx`, `scraps/page.tsx`, `KanbanBoard.tsx`

- `kanban_card_added`
  - `jobs/page.tsx` `handleAddToKanban`: 등록 API가 성공한 뒤 보낸다. `source`는 호출한 API 분기로 정한다 — 기존 코드의 `jobPostingIdMap[feedId]`가 있어 `registerKanbanCard`(3.2)를 부르면 `'feed_scrapped'`, 없어 `registerKanbanCardDirect`(2.6)를 부르면 `'feed_direct'`. 스크랩을 해제해도 `jobPostingIdMap`에 값이 남는 기존 동작은 이번에 고치지 않는다. `platform`: 클릭 시점 `data?.items`에서 찾은 항목의 `platform`, `job_category`: `item.jobCategory ?? null`. 항목을 못 찾으면 `platform: null, job_category: null`로 보내고 이벤트는 유지한다
  - `scraps/page.tsx` `handleAddToKanban`: `registerKanbanCard`가 성공한 뒤 `source: 'scraps_page'`. `platform`·`job_category`는 클릭 시점 `data?.items`에서 `jobPostingId`가 같은 `ScrapItem`의 `platform ?? null`, `jobCategory ?? null`(`ScrapItem`에서 선택 필드다). 항목을 못 찾으면 둘 다 `null`
  - `KanbanBoard.tsx` `AddCardModal`(`mode="add"`) `onConfirm`: `createDirectCardMutation.mutateAsync`가 성공한 직후(이후 `moveCardMutation` 호출보다 앞) `track('kanban_card_added', { source: 'manual', target_stage_type })`. `target_stage_type`은 `data.stageId`와 같은 `id`의 `stages` 항목이 `isDefault`면 `'default'`, 아니면(항목이 없을 때 포함) `'custom'`
  - `handleUndoDeleteCard` 등 "되돌리기"가 쓰는 `createDirectCard` 호출(`KanbanBoard.tsx`의 `createDirectCardMutation.mutate(` 부분)에서는 보내지 않는다
- `kanban_card_add_duplicated`: 위 세 곳의 catch에서 `ApiClientError`의 `code`가 `'K003'` 또는 `'DUPLICATE_KANBAN_CARD'`일 때, 기존 처리(토스트·필드 에러 매핑)보다 **앞서** `track('kanban_card_add_duplicated', { source })`를 보낸다. `source`는 해당 경로의 `kanban_card_added`와 같은 값이다. `AuthRequiredError`·그 밖의 오류에서는 보내지 않는다
  - `KanbanBoard`의 수정 모달(`mode="edit"`)과 카드 삭제·이동 등에서는 보내지 않는다

### 9. 원본 공고 클릭 — `job-card.tsx`, `ScrapCard.tsx`, `KanbanCard.tsx`, `CardDetailDrawer.tsx`, `jobs/page.tsx`, `scraps/page.tsx`

- `JobCard`에 `onOriginalLinkClick?: () => void` 선택 prop을 추가해 "원본 공고 이동" `<a>`의 `onClick`에 연결한다. `originalUrl`이 없어 비활성 버튼이 렌더링되는 경우에는 호출되지 않는다. 링크의 `href`·`target`·`rel`은 바꾸지 않는다
- 피드: `jobs/page.tsx`가 `JobCard`에 `onOriginalLinkClick={() => track('original_posting_clicked', { source: 'feed', platform: job.platform })}`을 넘긴다
- 스크랩: `ScrapCard`에 `onOriginalLinkClick?: (jobPostingId: number) => void` 선택 prop을 추가해 `JobCard`에 `() => onOriginalLinkClick?.(data.jobPostingId)`로 넘긴다. `scraps/page.tsx`가 `jobPostingId`로 `data?.items`에서 `ScrapItem`을 찾아 `track('original_posting_clicked', { source: 'scraps', platform: item?.platform ?? null })`을 보낸다
- 칸반 카드: `KanbanCard.tsx`의 모듈 함수 `handleOriginalLinkClick`이 기존 `event.stopPropagation()`을 유지한 채 `track('original_posting_clicked', { source: 'kanban_card' })`도 호출한다 (카드 클릭으로 드로어가 열리는 동작을 막는 기존 전파 중단은 그대로)
- 드로어: `CardDetailDrawer.tsx`의 "원본 공고 이동" `<a href={detail.originalUrl}>`에 `onClick`으로 `track('original_posting_clicked', { source: 'card_drawer' })`를 추가한다. 칸반·지원 마감일 양쪽 화면의 드로어가 같은 컴포넌트라 `source`는 `'card_drawer'`로 같다 (화면은 `$pathname`으로 구분)
- 클릭(`click`) 이벤트 기준이다. 마우스 가운데 버튼 클릭(`auxclick`)은 집계하지 않는다

### 공통

- 바꾼 부분에는 왜 그렇게 했는지 한국어 주석을 짧게 남긴다 (`.claude/rules/code-style.md`)
- 기능 내부 이벤트 호출은 각 파일에서 `import { track } from '@/lib/posthog'`로 한다
- BE 의존: 없음. 사용하는 API는 모두 기존 호출 그대로다 (2.6, 3.2, 3.10, 2.3·2.4, 1.1). 새 엔드포인트·필드를 추가하지 않는다. `ScrapItem`의 `platform`·`jobCategory`는 `docs/API_SPEC.md` 2.5(v1.13)에 있고 타입에서는 선택 필드다

## 수용 기준

- AC-01 `src/lib/analytics/events.ts`가 `LoginTrigger`(`'scrap' | 'notification_bell' | 'sidebar' | 'api_401'`), `LoginEntry`(`'landing_navbar' | 'login_modal'`), `CardAddSource`를 export하고, `AnalyticsEventMap`에 `landing_cta_clicked`, `login_prompt_shown`, `kakao_login_started`, `kakao_login_failed`, `job_scrapped`, `scrap_removed`, `kanban_card_added`, `kanban_card_add_duplicated`, `original_posting_clicked`가 이 스펙 설계 결정 1절의 속성 형태로 정의되어 있다. `kakao_login_completed`에는 선택 속성 `entry`·`trigger`가 추가되어 있다
- AC-02 `landing_cta_clicked`의 `cta_type`에 `'test_start'`가 없고, `src/lib/analytics/events.ts`와 `src/features/auth/utils/loginContext.ts`에 `any`가 없다. `src/lib/posthog.ts`는 바뀌지 않는다
- AC-03 `useLoginModalStore`는 `trigger` 상태와 `open(trigger)`를 가지고, 이미 열려 있으면 `open`이 아무것도 하지 않으며, 닫혀 있다가 열릴 때만 `track('login_prompt_shown', { trigger })`를 보낸다. `openLoginModalOutsideReact`는 `LoginTrigger` 인자를 받는다
- AC-04 `api-client.ts`의 401 처리는 `openLoginModalOutsideReact('api_401')`, `jobs/page.tsx`의 스크랩 가드는 `openLoginModalOutsideReact('scrap')`을 호출한다. `Sidebar`와 `NotificationBell`은 로그인 모달을 여는 핸들러에서 각각 `trigger: 'sidebar'`·`'notification_bell'`로 `login_prompt_shown`을 보내고, `LoginModal`에 같은 값을 `trigger` prop으로 넘긴다. `GlobalLoginModal`은 스토어의 `trigger`를 `LoginModal`에 넘긴다. `LoginModal` 자체는 `login_prompt_shown`을 보내지 않는다
- AC-05 `src/features/auth/utils/loginContext.ts`가 `saveLoginContext`와 `consumeLoginContext`를 export하고, sessionStorage 키 `chwihap_login_context`를 쓴다. `consumeLoginContext`는 읽은 뒤 값을 삭제하고, 값이 없거나 깨졌거나 `entry`가 올바르지 않으면 `null`을 돌려준다. 두 함수 모두 sessionStorage 예외를 `try/catch`로 처리한다
- AC-06 `LoginModal`의 카카오 버튼은 `kakao_login_started`(`entry: 'login_modal'`, `trigger` 포함)를 보내고 `saveLoginContext`를 호출한 뒤 `window.location.href`를 바꾼다. `KakaoLoginButton`은 `onClick?.()`을 부르고 `kakao_login_started`(`entry: 'landing_navbar'`)를 보내고 `saveLoginContext`를 호출한 뒤 `window.location.href`를 바꾼다. 두 곳 모두 이벤트·저장이 이동보다 먼저다
- AC-07 `Navbar`는 `variant === 'landing'`일 때 "회원가입/로그인"에서 `landing_cta_clicked`(`signup_login`, `navbar`), "무료로 시작하기"에서 `landing_cta_clicked`(`start_free`, `navbar`)를 보내고, `variant === 'default'`에서는 `landing_cta_clicked`를 보내지 않는다. `Hero`의 "무료로 시작하기"는 `landing_cta_clicked`(`start_free`, `hero`)를 보낸다. 세 곳 모두 이동 동작(`href="/jobs"`, 카카오 이동)은 그대로다
- AC-08 `useKakaoLoginMutation` onSuccess는 `consumeLoginContext()`로 읽은 `entry`·`trigger`를 있을 때만 `kakao_login_completed`에 넣고(없는 값은 `undefined`로도 넣지 않는다), `identifyUser`는 여전히 `track`보다 먼저 호출한다
- AC-09 `auth/kakao/callback/page.tsx`는 `error` 쿼리 분기에서 `kakao_login_failed`(`reason: 'kakao_denied'`)를, `loginMutation.mutate`의 `onError`에서 `kakao_login_failed`(`reason: 'server_error'`)를 보낸다. `error` 분기는 ref로 중복 전송을 막고 그 ref를 렌더 중에 읽지 않는다. 두 실패 분기에서 `consumeLoginContext()`를 호출하고, `onSuccess`의 `router.replace('/kanban')`와 `!code` 분기 동작은 그대로다
- AC-10 `jobs/page.tsx` `handleToggleScrap`은 스크랩 추가 성공 시에만 `job_scrapped`를 보내고(`feed_id`, `platform`, `job_category`(`?? null`), `career`, `has_active_filter`, `is_searching`), 속성값을 `await` 전에 만든다. `has_active_filter`는 `buildJobCategoryParam`·`buildRegionParam`·`buildCareerParam` 결과와 `deadlineSoon`으로 계산한다. 해제 성공 시에는 `scrap_removed`(`source: 'feed'`)를 보낸다. 비로그인 가드·실패 경로에서는 어느 이벤트도 보내지 않는다
- AC-11 `scraps/page.tsx` `handleRemoveScrap`은 `deleteScrap` 성공 뒤에만 `scrap_removed`(`source: 'scraps_page'`)를 보내고 catch에서는 보내지 않는다
- AC-12 `jobs/page.tsx` `handleAddToKanban`은 성공 시 `kanban_card_added`를 보내고 `source`가 `registerKanbanCard` 분기면 `'feed_scrapped'`, `registerKanbanCardDirect` 분기면 `'feed_direct'`이다. `scraps/page.tsx` `handleAddToKanban`은 성공 시 `source: 'scraps_page'`로 보낸다. 두 곳 모두 `platform`·`job_category`를 클릭 시점의 항목에서 가져오고 항목이 없으면 `null`이다
- AC-13 `KanbanBoard.tsx`의 `AddCardModal`(`mode="add"`) `onConfirm`은 `createDirectCardMutation.mutateAsync` 성공 직후 `moveCardMutation` 호출보다 앞에서 `kanban_card_added`(`source: 'manual'`, `target_stage_type`)를 보낸다. `target_stage_type`은 `data.stageId`에 해당하는 `stages` 항목의 `isDefault`로 정한다. `handleUndoDeleteCard`가 쓰는 `createDirectCardMutation.mutate(` 호출부와 수정 모달(`mode="edit"`)에는 `track` 호출이 없다
- AC-14 `jobs/page.tsx`·`scraps/page.tsx`·`KanbanBoard.tsx`의 등록 실패 처리는 `code`가 `'K003'` 또는 `'DUPLICATE_KANBAN_CARD'`일 때 기존 처리보다 앞서 `kanban_card_add_duplicated`를 해당 경로의 `source`로 보낸다. `AuthRequiredError`와 그 밖의 오류에서는 보내지 않는다
- AC-15 `JobCard`는 `onOriginalLinkClick?: () => void` prop을 "원본 공고 이동" `<a>`의 `onClick`에 연결하고, `ScrapCard`는 `onOriginalLinkClick?: (jobPostingId: number) => void` prop을 `JobCard`로 전달한다. `jobs/page.tsx`는 `original_posting_clicked`(`source: 'feed'`, `platform`)를, `scraps/page.tsx`는 `source: 'scraps'`와 `platform ?? null`로 보낸다
- AC-16 `KanbanCard.tsx`의 `handleOriginalLinkClick`은 `event.stopPropagation()`을 유지하고 `original_posting_clicked`(`source: 'kanban_card'`)를 보낸다. `CardDetailDrawer.tsx`의 "원본 공고 이동" 링크는 `onClick`으로 `original_posting_clicked`(`source: 'card_drawer'`)를 보낸다
- AC-17 변경 파일은 설계 결정에서 언급한 아래 20개뿐이고(`src/lib/analytics/events.ts`, `src/features/auth/utils/loginContext.ts`(추가), `src/features/auth/store/loginModalStore.ts`, `src/features/auth/components/LoginModal.tsx`, `src/features/auth/components/GlobalLoginModal.tsx`, `src/components/layout/sidebar.tsx`, `src/features/notification/components/NotificationBell.tsx`, `src/lib/api/api-client.ts`, `src/features/auth/hooks/useAuthMutations.ts`, `src/app/auth/kakao/callback/page.tsx`, `src/features/landing/components/KakaoLoginButton.tsx`, `src/features/landing/components/Navbar.tsx`, `src/features/landing/components/Hero.tsx`, `src/app/jobs/page.tsx`, `src/app/scraps/page.tsx`, `src/components/ui/job-card.tsx`, `src/features/scraps/components/ScrapCard.tsx`, `src/features/kanban/components/KanbanBoard.tsx`, `src/features/kanban/components/KanbanCard.tsx`, `src/features/kanban/components/CardDetailDrawer.tsx`), `package.json`·`package-lock.json`·`src/lib/posthog.ts`는 바뀌지 않는다
- AC-18 `npm run typecheck`·`npm run build`·`npm run lint`가 통과한다
- AC-19 [manual] `NEXT_PUBLIC_POSTHOG_KEY`·`NEXT_PUBLIC_POSTHOG_HOST`가 설정된 Vercel 프리뷰 또는 로컬 `npm run dev`에서 `posthog.debug()`를 켜거나 PostHog Activity 탭을 보며 아래가 모두 맞다 (비로그인 확인은 로그아웃 상태 또는 시크릿 창에서)
  - 랜딩(`/`)에서 Navbar "무료로 시작하기"를 누르면 `landing_cta_clicked`(`start_free`, `navbar`)가 1번, Hero "무료로 시작하기"는 (`start_free`, `hero`)가 1번 온다. Navbar "회원가입/로그인"은 `landing_cta_clicked`(`signup_login`, `navbar`) 뒤에 `kakao_login_started`(`entry: landing_navbar`)가 온다
  - `/privacy`의 Navbar "회원가입/로그인"은 `kakao_login_started`만 오고 `landing_cta_clicked`는 오지 않는다
  - 비로그인으로 `/jobs`에서 스크랩 아이콘을 누르면 `login_prompt_shown`(`trigger: scrap`)이 1번, 사이드바 "회원가입/로그인"은 `sidebar`, 헤더 알림 벨은 `notification_bell`, "지원 현황 추가"는 `api_401`이 1번 온다. 모달을 닫지 않고 같은 트리거를 반복해도 이벤트가 추가로 오지 않는다
  - 모달의 "카카오 계정으로 계속하기"를 누르면 `kakao_login_started`(`entry: login_modal`, 해당 `trigger`)가 오고, 카카오 로그인을 마치면 `kakao_login_completed`에 `entry`·`trigger`가 시작할 때와 같은 값으로 붙는다. 랜딩 Navbar로 시작하면 `entry: landing_navbar`만 붙는다. 카카오 인가 직전의 `kakao_login_started`가 PostHog에 실제로 도착한다
  - 카카오 동의 화면에서 취소하면 `kakao_login_failed`(`kakao_denied`)가 **1번**(개발 모드에서도) 온다
  - 로그인 후 `/jobs`에서 스크랩하면 `job_scrapped`가 `feed_id`·`platform`·`job_category`·`career`·`has_active_filter`·`is_searching`과 함께 1번 오고, 필터를 걸고 스크랩하면 `has_active_filter: true`, 검색한 뒤 스크랩하면 `is_searching: true`다. 해제하면 `scrap_removed`(`source: feed`)가, `/scraps`에서 해제하면 `scraps_page`가 온다
  - `/jobs`에서 스크랩하지 않은 공고의 "지원 현황 추가"는 `kanban_card_added`(`feed_direct`), 스크랩한 공고는 `feed_scrapped`, `/scraps`에서는 `scraps_page`가 온다. 같은 공고를 다시 등록하려 하면(새로고침 후) `kanban_card_add_duplicated`가 온다. `/kanban`의 "공고 직접 추가"는 `manual`과 `target_stage_type`이 온다. 카드 삭제 후 "되돌리기"는 `kanban_card_added`를 보내지 않는다
  - `/jobs`·`/scraps`의 "원본 공고 이동", 칸반 카드의 "원본 공고 이동", 카드 상세 드로어(`/kanban`·`/deadlines`)의 "원본 공고 이동"을 누르면 각각 `source`가 `feed`·`scraps`·`kanban_card`·`card_drawer`인 `original_posting_clicked`가 1번 오고, 칸반 카드의 링크를 눌러도 드로어가 열리지 않는다(기존 동작)

## 테스트 계획

구현 후 **커밋하기 전에** 아래를 실행하고 명령과 결과를 PR 본문에 남긴다.

```bash
# 아래는 수정 후, 커밋하기 전에 실행한다 (새 파일은 git add 후에 git grep에 잡힌다)

# (AC-01) 새 이벤트 9개와 공용 타입 3개 이름이 모두 나와야 한다
git grep -n "LoginTrigger\|LoginEntry\|CardAddSource\|landing_cta_clicked\|login_prompt_shown\|kakao_login_started\|kakao_login_failed\|job_scrapped\|scrap_removed\|kanban_card_added\|kanban_card_add_duplicated\|original_posting_clicked" -- src/lib/analytics/events.ts

# (AC-02) 세 명령 모두 출력이 없어야 한다
git grep -n "test_start" -- src
git grep -n "\bany\b" -- src/lib/analytics/events.ts src/features/auth/utils/loginContext.ts
git diff --cached --name-only origin/develop -- src/lib/posthog.ts package.json package-lock.json

# (AC-03, AC-04) trigger 상태와 open(trigger)가 나오고, 호출부 4곳에서 login_prompt_shown 또는 트리거 인자가 나와야 한다
git grep -n "trigger\|login_prompt_shown" -- src/features/auth/store/loginModalStore.ts src/features/auth/components/GlobalLoginModal.tsx src/components/layout/sidebar.tsx src/features/notification/components/NotificationBell.tsx
git grep -n "openLoginModalOutsideReact(" -- src
# LoginModal 안에는 login_prompt_shown이 없어야 한다 (출력 없음)
git grep -n "login_prompt_shown" -- src/features/auth/components/LoginModal.tsx

# (AC-05) 함수 2개와 키 이름이 나와야 한다
git grep -n "saveLoginContext\|consumeLoginContext\|chwihap_login_context\|try\b" -- src/features/auth/utils/loginContext.ts

# (AC-06, AC-07) 이벤트 호출이 나와야 한다
git grep -n "kakao_login_started\|saveLoginContext" -- src/features/auth/components/LoginModal.tsx src/features/landing/components/KakaoLoginButton.tsx
git grep -n "landing_cta_clicked" -- src/features/landing/components/Navbar.tsx src/features/landing/components/Hero.tsx

# (AC-08, AC-09) consumeLoginContext와 kakao_login_failed가 나와야 한다
git grep -n "consumeLoginContext\|kakao_login_completed" -- src/features/auth/hooks/useAuthMutations.ts
git grep -n "kakao_login_failed\|consumeLoginContext\|useRef" -- src/app/auth/kakao/callback/page.tsx

# (AC-10~AC-14) 호출 위치가 나와야 한다
git grep -n "job_scrapped\|scrap_removed\|kanban_card_added\|kanban_card_add_duplicated" -- src/app/jobs/page.tsx src/app/scraps/page.tsx src/features/kanban/components/KanbanBoard.tsx

# (AC-13) 되돌리기용 createDirectCardMutation.mutate( 호출 주변에 track이 없어야 한다 — mutate( 줄과 위치를 눈으로 대조한다
git grep -n "createDirectCardMutation.mutate(\|createDirectCardMutation.mutateAsync(\|track(" -- src/features/kanban/components/KanbanBoard.tsx

# (AC-15, AC-16) onOriginalLinkClick와 original_posting_clicked가 나와야 한다
git grep -n "onOriginalLinkClick" -- src/components/ui/job-card.tsx src/features/scraps/components/ScrapCard.tsx
git grep -n "original_posting_clicked" -- src

# (AC-17) A 1줄(loginContext.ts)과 M 19줄(위 목록)만 나와야 한다
git diff --cached --name-status origin/develop
git status --short

# (AC-18)
npm run typecheck
npm run build
npm run lint
```

- (AC-01, AC-02) 속성 타입은 코드로 확인한다. 확인용으로 맵에 없는 속성이나 `kanban_card_added`에서 `source: 'manual'`에 `platform`을 넣은 호출 등을 임시로 넣어 `npm run typecheck`가 실패하는지 봐도 되지만, 그 임시 코드는 커밋하지 않는다
- (AC-13) `track(` 호출이 `onConfirm`(mode="add") 안의 `createDirectCardMutation.mutateAsync` 성공 직후에만 있고, `handleUndoDeleteCard`의 `createDirectCardMutation.mutate(` 근처에는 없는지 출력으로 확인한다
- (AC-19) [manual]: 사용자가 확인한다. Vercel 프리뷰에서 확인하려면 Preview 환경변수가 `NEXT_PUBLIC_POSTHOG_KEY`·`NEXT_PUBLIC_POSTHOG_HOST` 이름으로 등록돼 있고 그 뒤에 배포된 프리뷰여야 한다. 그렇지 않으면 로컬 `npm run dev`(`.env.local`에 두 키 설정)에서 확인한다. 카카오 로그인·동의 취소는 실제 카카오 계정이 필요하다. `kakao_login_started`가 도착하지 않으면 구현 변경 없이 보고한다 (이벤트 전송 방식 변경은 새 revision에서 정한다)
