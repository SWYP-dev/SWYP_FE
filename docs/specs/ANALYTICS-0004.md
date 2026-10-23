---
spec_id: ANALYTICS-0004
revision: 0
---

# ANALYTICS-0004 — PostHog 탐색 보조·마감일 이벤트: 검색, 필터·초기화·정렬, 지원 현황 이동 토스트, 딥링크·마감일 변경

## 배경

- PostHog 이벤트 설계 문서 `docs/analytics/posthog-events.md` 7장의 네 번째 스펙(P1)이다. 범위는 3.2의 `feed_searched`·`feed_filter_applied`·`feed_filter_reset`·`feed_sort_changed`, 3.3의 `toast_kanban_link_clicked`, **3.5 전체**(`deadline_deeplink_opened`, `kanban_card_deadline_changed`)다. ANALYTICS-0001~0003(PR #222·#224·#226)이 머지되어 있다
- 지금 코드 (2026-10-23 develop `057915e` 기준)
  - `src/app/jobs/page.tsx`
    - 검색: `<Header onSearch={setKeyword} />`. `Header`(`src/components/layout/header.tsx`)는 폼 제출 시 입력값을 **trim하지 않고** 그대로 `onSearch`에 넘긴다. 피드 쿼리는 `keyword: keyword || undefined`, 화면 표시 기준은 `isSearching = keyword.trim().length > 0`이다
    - `useFeedQuery`(`src/features/feed/api/useFeedQuery.ts`)는 `useQuery({ queryKey: ['feed', params] })`이고 `placeholderData`가 없다. 즉 쿼리 키가 바뀐 렌더의 `data`는 새 키의 캐시 값이거나 `undefined`다. 응답 타입은 `PageResponse`로 `totalElements`가 있다
    - 필터: `JobCategoryFilterButton`·`RegionFilterButton`(`onApply: (value: SelectionValue | null) => void`), `CareerFilterChip`(`onApply: (tags: CareerTagId[]) => void`)에 각 setter를 그대로 넘긴다. `DeadlineSoonFilterButton`은 `onToggle={setDeadlineSoon}`
    - 실제 쿼리 값은 `buildJobCategoryParam`·`buildRegionParam`·`buildCareerParam`(모두 콤마 구분 문자열 또는 `undefined`)과 `deadlineSoon`이다. `job_scrapped.has_active_filter`가 같은 기준을 쓴다 (ANALYTICS-0002)
    - 초기화: `resetFilters()`를 툴바 "초기화" 버튼(`FilterTriggerButton`)과 결과 없음 화면(`EmptyJobPosting`의 "필터 초기화", 검색 중이 아닐 때만 노출) 두 곳에서 부른다
    - 정렬: "최신순"·"마감일순" 버튼이 `setSort('LATEST')`·`setSort('DEADLINE')`를 부른다
    - 토스트: `Toast`의 `onAction={() => router.push('/kanban')}`, 버튼은 "지원 현황에 추가되었어요." 성공 토스트에서만 보인다(`hasButton`)
  - `src/app/scraps/page.tsx`: 같은 필터 4종이 같은 방식으로 연결되어 있고(`isDeadlineSoon`·`setIsDeadlineSoon`), 같은 형태의 토스트 `onAction`이 있다. 검색·초기화가 없고 정렬은 동작하지 않는 고정 텍스트다
  - `src/features/deadlines/components/DeadlineList.tsx`
    - 딥링크: 렌더 중 블록(`if (!hasAppliedCardIdParam && data)`)이 `cardId` 쿼리를 읽어, 카드가 있으면 `setViewingCardId`와 `setDeeplinkOpenedCardId`를 부른다. `useEffect`가 `deeplinkOpenedCardId`를 보고 `hasTrackedDeeplinkRef`로 한 번만 `kanban_card_opened(email_deeplink)`를 보낸다 (ANALYTICS-0003). 카드를 못 찾으면 아무것도 기록하지 않는다
    - `handleConfirmEditCard`: `formData.deadline`은 `EditDeadlineCardModal`이 만든 `YYYY-MM-DD` 문자열 또는 `null`(상시채용)이다. 수정 전 값은 `entry.card.deadline`(모달은 `split('-')`로 연·월·일을 읽는다)이다. 지금은 `updateStageDeadlineMutation.mutateAsync`에 마감일을 **항상** 보내고, 단계가 바뀐 경우에만 `kanban_card_stage_changed`를 보낸다

## 범위

**포함**

- 이벤트 7종 추가: `feed_searched`, `feed_filter_applied`, `feed_filter_reset`, `feed_sort_changed`, `toast_kanban_link_clicked`, `deadline_deeplink_opened`, `kanban_card_deadline_changed`
- 필터 이벤트 속성을 피드·스크랩에서 같은 기준으로 만드는 헬퍼 추가

**제외**

- 알림·설정 이벤트(설계 문서 3.6·3.7)는 ANALYTICS-0005, Feature Flag는 ANALYTICS-0006에서 한다
- 스크랩 페이지의 정렬(동작하지 않는 고정 텍스트)과 검색·초기화(없음)는 계측하지 않는다
- 필터 적용 시 페이지를 첫 페이지로 돌리지 않는 등 기존 필터·검색·정렬·토스트·딥링크 동작은 바꾸지 않는다. `Header`, 필터 컴포넌트(`src/features/feed/components/`), `src/components/ui/` 파일은 바꾸지 않는다
- 기존 `job_scrapped.has_active_filter` 계산은 그대로 둔다
- 이벤트 이름·속성 설계(설계 문서 3.2·3.3·3.5)는 바꾸지 않는다. 설계를 바꿔야 한다고 판단되면 구현하지 말고 보고한다
- 새 패키지 추가·버전 변경은 하지 않는다. `package.json`·`package-lock.json`, `src/lib/posthog.ts`는 바뀌지 않는다
- 정책 경로(`.github/`, `.claude/`, `.codex/`, `.agents/`, `docs/ai/`, `docs/workflow/`, `scripts/ai/`, `AGENTS.md`, `CLAUDE.md`)와 `docs/specs/`, 설계 문서 `docs/analytics/posthog-events.md`는 바꾸지 않는다

## 설계 결정

공통 원칙 (설계 문서 2.5): 서버 응답이 필요한 이벤트(`feed_searched`, `kanban_card_deadline_changed`)는 **응답·성공 후**에 보내고, 나머지는 사용자가 적용·클릭한 시점에 보낸다. 모든 호출은 `import { track } from '@/lib/posthog'`의 `track()`만 거친다. **렌더 중에 `track`을 호출하지 않는다.** 자유 텍스트는 검색어(`feed_searched.keyword`)만 허용한다 (설계 문서 2.5).

### 1. 이벤트 타입 맵 — `src/lib/analytics/events.ts`

기존 타입·맵 항목은 그대로 두고 아래를 추가한다. 맵 키·속성 이름은 설계 문서와 일치시킨다.

- 공용 타입 export: `FilterPage = 'jobs' | 'scraps'`
- `AnalyticsEventMap` 추가

| 이벤트                         | 속성                                                                                                                                                                                                                                       |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `feed_searched`                | `{ keyword: string; result_count: number }`                                                                                                                                                                                                |
| `feed_filter_applied`          | `{ page: FilterPage; filter_type: 'job_category' \| 'region' \| 'career'; filter_value: string[]; active_filter_count: number } \| { page: FilterPage; filter_type: 'deadline_soon'; filter_value: boolean; active_filter_count: number }` |
| `feed_filter_reset`            | `{ source: 'toolbar' \| 'empty_state' }`                                                                                                                                                                                                   |
| `feed_sort_changed`            | `{ sort: 'LATEST' \| 'DEADLINE' }`                                                                                                                                                                                                         |
| `toast_kanban_link_clicked`    | `{ source: 'feed' \| 'scraps_page' }`                                                                                                                                                                                                      |
| `deadline_deeplink_opened`     | `{ card_found: boolean }`                                                                                                                                                                                                                  |
| `kanban_card_deadline_changed` | `{ set_always_hiring: boolean }`                                                                                                                                                                                                           |

- `any`를 쓰지 않는다

### 2. 필터 이벤트 헬퍼 — 새 파일 `src/features/feed/utils/filterAnalytics.ts`

피드·스크랩 두 페이지가 같은 계산을 하므로 한 곳에 둔다.

- `FeedFilterState = { jobCategoryValue: SelectionValue | null; regionValue: SelectionValue | null; careerTags: CareerTagId[]; deadlineSoon: boolean }` 타입을 export한다
- `countActiveFilters(state: FeedFilterState): number` — 실제 쿼리에 들어가는 필터 종류 수(0~4). `buildJobCategoryParam(state.jobCategoryValue) !== undefined`, `buildRegionParam(state.regionValue) !== undefined`, `buildCareerParam(state.careerTags) !== undefined`, `state.deadlineSoon`이 참인 개수다 (`job_scrapped.has_active_filter`와 같은 기준)
- `buildFilterAppliedProperties(page: FilterPage, filterType, next: FeedFilterState): AnalyticsEventMap['feed_filter_applied']` — 적용 **후** 상태 `next`로 속성을 만든다
  - `filter_value`
    - `job_category`: `buildJobCategoryParam(next.jobCategoryValue)`를 `,`로 나눈 배열, 값이 없으면 `[]`
    - `region`: `buildRegionParam(next.regionValue)`를 `,`로 나눈 배열, 값이 없으면 `[]` ("전국"은 `[]`)
    - `career`: `next.careerTags` 그대로 (`EXPERIENCED` | `NEW` | `BOTH` | `FOREIGN` — 설계 문서 3.2)
    - `deadline_soon`: `next.deadlineSoon`
  - `active_filter_count`: `countActiveFilters(next)`
  - 시그니처의 세부(오버로드, 인자 묶음 방식)는 구현자가 정하되, 위 결과 형태와 `any` 금지를 지킨다

### 3. 필터 적용 — `jobs/page.tsx`, `scraps/page.tsx`

- 각 페이지에서 필터 컴포넌트의 `onApply`·`onToggle`에 setter를 바로 넘기던 것을 핸들러로 감싼다. 핸들러는 기존 setter를 그대로 부르고, 같은 호출에서 `track('feed_filter_applied', buildFilterAppliedProperties(page, filterType, next))`를 보낸다. `next`는 바뀐 필터는 새 값, 나머지는 현재 상태로 만든다
  - `page`: `jobs/page.tsx`는 `'jobs'`, `scraps/page.tsx`는 `'scraps'`
  - `JobCategoryFilterButton` → `'job_category'`, `RegionFilterButton` → `'region'`, `CareerFilterChip` → `'career'`, `DeadlineSoonFilterButton` → `'deadline_soon'`
- 필터 컴포넌트가 `onApply`를 부를 때마다(값이 같아도, 해제여도) 보낸다. 컴포넌트가 `onApply`를 부르지 않는 경우(바꾸지 않고 닫기)는 보내지 않는다
- 초기화(`resetFilters`)로 필터가 비워질 때는 `feed_filter_applied`를 보내지 않는다 (4절의 `feed_filter_reset`만)

### 4. 필터 초기화·정렬 — `jobs/page.tsx`

- `resetFilters`가 `source: 'toolbar' | 'empty_state'` 인자를 받아 기존 초기화 처리와 함께 `track('feed_filter_reset', { source })`를 보낸다. 툴바 "초기화" 버튼은 `'toolbar'`, `EmptyJobPosting`의 `onAction`은 `'empty_state'`로 부른다. 필터가 이미 비어 있어도 보낸다
- 정렬 버튼: 누른 값이 현재 `sort`와 다를 때만 `track('feed_sort_changed', { sort: <누른 값> })`을 보내고 기존대로 `setSort`를 부른다

### 5. 검색 — `feed_searched`, `jobs/page.tsx`

- `Header`의 `onSearch`에 `setKeyword` 대신 `handleSearch(nextKeyword)`를 넘긴다. 기존대로 `setKeyword(nextKeyword)`를 부른다
- `nextKeyword.trim()`이 비어 있으면(검색 해제) 보내지 않는다. `nextKeyword`가 현재 `keyword`와 같으면(같은 검색어 재제출 — 쿼리 키가 같아 새 응답이 없다) 보내지 않는다
- 그 밖의 경우 "응답을 기다리는 검색어"로 `nextKeyword`를 `useRef`에 기록한다 (렌더에 쓰지 않는 값). 이전 대기 값은 덮어쓴다
- `useEffect`(의존성 `data`, `keyword`, `isError`)에서 대기 값이 현재 `keyword`와 같을 때
  - `data`가 있으면 `track('feed_searched', { keyword: keyword.trim(), result_count: data.totalElements })`를 보내고 대기 값을 비운다
  - `isError`면 보내지 않고 대기 값을 비운다
  - ref는 effect·이벤트 핸들러 안에서만 읽고 쓴다 (`react-hooks/refs`). effect 안에서 `setState`를 부르지 않는다 (`react-hooks/set-state-in-effect`)
- 이렇게 하면 검색어 하나당 그 검색어의 **첫 응답**에서 한 번만 가고, 이후 페이지 이동·필터 변경으로 새 응답이 와도 다시 가지 않는다 (설계 문서 3.2). 위와 같은 결과(제출 1회당 첫 응답에서 1번, 렌더 중 `track` 없음, lint 통과)를 내는 다른 방식이면 구현자가 정해도 된다

### 6. 지원 현황 이동 토스트 — `jobs/page.tsx`, `scraps/page.tsx`

- `Toast`의 `onAction`에서 `router.push('/kanban')` **전에** `track('toast_kanban_link_clicked', { source })`를 보낸다. `jobs/page.tsx`는 `'feed'`, `scraps/page.tsx`는 `'scraps_page'`
- 토스트 노출 조건(`hasButton`)과 이동 동작은 바꾸지 않는다

### 7. 딥링크 — `deadline_deeplink_opened`, `DeadlineList.tsx`

- 딥링크 처리 블록이 `cardId` 쿼리를 적용할 때(쿼리가 있을 때만), 카드를 찾았는지 여부를 상태로 기록한다. 카드를 못 찾은 경우(숫자가 아니거나 내 카드에 없음)도 `card_found: false`로 기록한다. `cardId` 쿼리가 없으면 아무것도 보내지 않는다
- 기존 `kanban_card_opened(email_deeplink)` 전송과 같은 방식(렌더 중에는 상태만 기록, `useEffect`에서 전송, `useRef`로 진입 1회당 1번)으로 `track('deadline_deeplink_opened', { card_found })`를 보낸다. 개발 모드 StrictMode에서도 1번이다
- 카드를 찾은 경우 `deadline_deeplink_opened(card_found: true)`를 먼저 보내고 이어서 기존 `kanban_card_opened(email_deeplink)`를 보낸다. 두 이벤트를 한 effect에서 보내도록 기존 상태(`deeplinkOpenedCardId`)·ref(`hasTrackedDeeplinkRef`)를 고쳐 써도 된다. `kanban_card_opened(email_deeplink)`가 카드를 찾았을 때만, 1번 가는 기존 동작은 유지한다
- 딥링크로 드로어를 여는 동작(`setViewingCardId`)은 바꾸지 않는다

### 8. 마감일 변경 — `kanban_card_deadline_changed`, `DeadlineList.tsx` `handleConfirmEditCard`

- 마감일이 실제로 바뀐 경우에만, `updateStageDeadlineMutation.mutateAsync`가 성공한 뒤 `track('kanban_card_deadline_changed', { set_always_hiring: formData.deadline === null })`을 보낸다
- "바뀜" 판단: 수정 전 값 `entry.card.deadline`을 앞 10자(`YYYY-MM-DD`)로 맞춘 값(`null`은 `null`)과 `formData.deadline`이 다르면 바뀐 것이다. 속성·판단은 `await` 전에 만들어 둔다
- 같은 저장에서 단계도 바꿨다면 기존 `kanban_card_stage_changed`와 함께 두 이벤트가 모두 간다. 순서는 `kanban_card_stage_changed` 다음 `kanban_card_deadline_changed`다. 실패(catch)에서는 어느 이벤트도 보내지 않는다
- API 요청 본문(마감일을 항상 보내는 것)은 바꾸지 않는다

### 공통

- 바꾼 부분에는 왜 그렇게 했는지 한국어 주석을 짧게 남긴다 (`.claude/rules/code-style.md`)
- BE 의존: 없음. 사용하는 API는 기존 호출 그대로다 (`docs/API_SPEC.md` 2.1 피드 조회, 2.5 스크랩 목록, 3.13 지원 마감일 카드 수정). 새 엔드포인트·필드를 추가하지 않는다

## 수용 기준

- AC-01 `src/lib/analytics/events.ts`가 `FilterPage`를 export하고, `AnalyticsEventMap`에 이 스펙 설계 결정 1절의 7개 이벤트가 같은 속성 형태로 정의되어 있다. 기존 항목은 바뀌지 않았고 `any`가 없다
- AC-02 `src/features/feed/utils/filterAnalytics.ts`가 `FeedFilterState`, `countActiveFilters`, `buildFilterAppliedProperties`를 export한다. `filter_value`는 직군·지역이면 `build*Param` 결과를 `,`로 나눈 배열(없으면 `[]`), 경력이면 `careerTags`, 마감 임박이면 boolean이고, `active_filter_count`는 `build*Param`·`deadlineSoon` 기준 활성 필터 수다
- AC-03 `jobs/page.tsx`와 `scraps/page.tsx`는 필터 4종의 `onApply`·`onToggle` 핸들러에서 기존 setter와 함께 `feed_filter_applied`를 각각 `page: 'jobs'`·`'scraps'`와 알맞은 `filter_type`으로 보내고, 속성은 적용 후 상태로 만든다. `resetFilters`에서는 `feed_filter_applied`를 보내지 않는다
- AC-04 `jobs/page.tsx`의 `resetFilters`는 `source` 인자를 받아 `feed_filter_reset`을 보내고, 툴바 "초기화"는 `'toolbar'`, 결과 없음 화면의 "필터 초기화"는 `'empty_state'`로 부른다. 정렬 버튼은 현재 `sort`와 다른 값을 누를 때만 `feed_sort_changed`를 보낸다
- AC-05 `jobs/page.tsx`는 `Header`의 `onSearch`에 검색 핸들러를 넘기고, trim 후 빈 검색어와 현재 `keyword`와 같은 검색어는 대기 처리하지 않는다. 대기 검색어는 `useRef`에 두고, `useEffect`에서 대기 값이 현재 `keyword`와 같고 `data`가 있을 때 `feed_searched`(`keyword`는 trim한 값, `result_count`는 `data.totalElements`)를 1번 보낸 뒤 비운다. `isError`면 보내지 않고 비운다. 렌더 중 `track` 호출과 effect 안 `setState`가 없다
- AC-06 `jobs/page.tsx`·`scraps/page.tsx`의 `Toast` `onAction`은 `router.push('/kanban')` 전에 `toast_kanban_link_clicked`를 각각 `source: 'feed'`·`'scraps_page'`로 보내고, `hasButton` 조건은 그대로다
- AC-07 `DeadlineList.tsx`는 `cardId` 쿼리가 있을 때만 `deadline_deeplink_opened`(`card_found`)를 진입 1회당 1번 보내고, 카드를 찾은 경우 그 뒤에 `kanban_card_opened`(`email_deeplink`)를 1번 보낸다. 두 이벤트 모두 렌더 중이 아니라 effect에서 보내고 ref로 중복을 막는다. 딥링크로 드로어가 열리는 동작은 그대로다
- AC-08 `DeadlineList.tsx` `handleConfirmEditCard`는 `entry.card.deadline`의 앞 10자(`null`은 `null`)와 `formData.deadline`이 다르고 저장이 성공했을 때만 `kanban_card_deadline_changed`(`set_always_hiring: formData.deadline === null`)를 보낸다. 단계도 바뀌었으면 `kanban_card_stage_changed` 다음에 보내고, 실패 시에는 보내지 않는다. 요청 본문은 바뀌지 않는다
- AC-09 변경 파일은 아래 5개뿐이다: `src/lib/analytics/events.ts`, `src/features/feed/utils/filterAnalytics.ts`(추가), `src/app/jobs/page.tsx`, `src/app/scraps/page.tsx`, `src/features/deadlines/components/DeadlineList.tsx`. `package.json`·`package-lock.json`·`src/lib/posthog.ts`·`src/components/`·`src/features/feed/components/`는 바뀌지 않는다
- AC-10 `npm run typecheck`·`npm run build`·`npm run lint`가 통과한다
- AC-11 [manual] `NEXT_PUBLIC_POSTHOG_KEY`·`NEXT_PUBLIC_POSTHOG_HOST`가 설정된 Vercel 프리뷰 또는 로컬 `npm run dev`에서 `posthog.debug()`를 켜거나 PostHog Activity 탭을 보며 아래가 모두 맞다
  - `/jobs`에서 검색어를 제출하면 결과가 뜬 뒤 `feed_searched`가 `keyword`·`result_count`(화면 결과 수와 일치)와 함께 1번 오고, 이어서 페이지를 넘기거나 필터를 바꿔도 다시 오지 않는다. 없는 검색어는 `result_count: 0`이다. 검색어를 지우고 제출하면 오지 않는다
  - `/jobs`에서 직군·직무를 골라 적용하면 `feed_filter_applied`(`page: jobs`, `filter_type: job_category`, 선택값 배열, `active_filter_count`)가 1번, 지역·경력·마감 임박도 각 `filter_type`으로 온다. 마감 임박을 끄면 `filter_value: false`가 온다. `/scraps`에서도 같은 조작으로 `page: scraps`가 온다
  - 툴바 "초기화"는 `feed_filter_reset`(`toolbar`), 결과가 없는 필터 조합에서 "필터 초기화"는 `empty_state`가 오고, 이때 `feed_filter_applied`는 오지 않는다
  - "마감일순"을 누르면 `feed_sort_changed`(`DEADLINE`)가 오고, 이미 선택된 정렬을 다시 누르면 오지 않는다
  - 피드·스크랩에서 지원 현황 추가 후 토스트의 "지원 현황 이동"을 누르면 각각 `toast_kanban_link_clicked`(`feed`·`scraps_page`)가 오고 `/kanban`으로 이동한다
  - `/deadlines?cardId=<내 카드 id>`로 진입하면 `deadline_deeplink_opened`(`card_found: true`)와 `kanban_card_opened`(`email_deeplink`)가 각각 **1번**(개발 모드에서도) 오고 드로어가 열린다. `/deadlines?cardId=999999999`는 `card_found: false`만 오고 드로어는 열리지 않는다. `/deadlines`(쿼리 없음)는 둘 다 오지 않는다
  - `/deadlines` 수정 모달에서 마감일만 바꿔 저장하면 `kanban_card_deadline_changed`(`set_always_hiring: false`)만, "상시 채용"으로 바꾸면 `true`가 온다. 단계만 바꾸면 `kanban_card_stage_changed`만, 아무것도 바꾸지 않고 저장하면 둘 다 오지 않는다

## 테스트 계획

구현 후 **커밋하기 전에** 아래를 실행하고 명령과 결과를 PR 본문에 남긴다.

```bash
# 아래는 수정 후, 커밋하기 전에 실행한다 (새 파일은 git add 후에 git grep에 잡힌다)

# (AC-01) FilterPage와 이벤트 7개 이름이 모두 나와야 한다
git grep -n "FilterPage\|feed_searched\|feed_filter_applied\|feed_filter_reset\|feed_sort_changed\|toast_kanban_link_clicked\|deadline_deeplink_opened\|kanban_card_deadline_changed" -- src/lib/analytics/events.ts

# (AC-01, AC-02) 출력이 없어야 한다
git grep -n "\bany\b" -- src/lib/analytics/events.ts src/features/feed/utils/filterAnalytics.ts

# (AC-02) 헬퍼 3개가 export되고 build*Param을 쓴다
git grep -n "export\|buildJobCategoryParam\|buildRegionParam\|buildCareerParam" -- src/features/feed/utils/filterAnalytics.ts

# (AC-03~AC-06) 호출 위치가 나와야 한다
git grep -n "track(\|resetFilters\|onSearch\|onApply\|onToggle\|onAction" -- src/app/jobs/page.tsx src/app/scraps/page.tsx

# (AC-05) 검색 대기 ref와 effect 위치를 눈으로 확인한다
git grep -n "useRef\|useEffect\|feed_searched\|totalElements" -- src/app/jobs/page.tsx

# (AC-07, AC-08) 딥링크·마감일 이벤트 위치를 눈으로 확인한다
git grep -n "useEffect\|useRef\|deadline_deeplink_opened\|email_deeplink\|kanban_card_deadline_changed\|kanban_card_stage_changed\|slice(0, 10)" -- src/features/deadlines/components/DeadlineList.tsx

# (AC-09) 출력이 없어야 한다
git diff --cached --name-only origin/develop -- src/lib/posthog.ts src/components src/features/feed/components package.json package-lock.json

# (AC-09) A 1줄(filterAnalytics.ts)과 M 4줄(위 목록)만 나와야 한다
git diff --cached --name-status origin/develop
git status --short

# (AC-10)
npm run typecheck
npm run build
npm run lint
```

- (AC-01) 속성 타입은 코드로 확인한다. 확인용으로 `feed_filter_applied`에 `filter_type: 'deadline_soon'`과 배열 `filter_value`를 함께 넣은 호출을 임시로 추가해 `npm run typecheck`가 실패하는지 봐도 되지만, 그 임시 코드는 커밋하지 않는다
- (AC-05, AC-07) `track(`이 렌더 본문(컴포넌트 함수 최상위의 `if` 블록 등)이 아니라 이벤트 핸들러·`useEffect` 안에만 있는지 diff로 확인한다
- (AC-08) `entry.card.deadline`의 실제 형식이 `YYYY-MM-DD`로 시작하지 않으면(예: 다른 날짜 형식) 구현하지 말고 보고한다
- (AC-11) [manual]: 사용자가 확인한다. Vercel 프리뷰에서 확인하려면 Preview 환경변수가 `NEXT_PUBLIC_POSTHOG_KEY`·`NEXT_PUBLIC_POSTHOG_HOST` 이름으로 등록돼 있고 그 뒤에 배포된 프리뷰여야 한다. 그렇지 않으면 로컬 `npm run dev`(`.env.local`에 두 키 설정)에서 확인한다. 딥링크 카드 id는 `/kanban`에서 카드를 연 뒤 네트워크 탭의 `GET /api/v1/kanban/cards/{cardId}` 요청으로 확인할 수 있다. 검색·필터는 비로그인 상태에서도 확인할 수 있다
