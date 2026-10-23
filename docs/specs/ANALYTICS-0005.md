---
spec_id: ANALYTICS-0005
revision: 0
---

# ANALYTICS-0005 — PostHog 알림·설정 이벤트: 이메일 알림 토글, 로그아웃·탈퇴, 알림 벨·알림함

## 배경

- PostHog 이벤트 설계 문서 `docs/analytics/posthog-events.md` 7장의 다섯 번째 스펙(P2)이다. 범위는 **3.6·3.7 전체**다. ANALYTICS-0001~0004(PR #222·#224·#226·#228)가 머지되어 있다
- 지금 코드 (2026-10-23 develop `87aa575` 기준)
  - `src/features/auth/hooks/useAuthMutations.ts`
    - `useLogoutMutation`: `onSettled`(API 성공·실패와 무관)에서 `clearTokens` → `clearUser` → `resetAnalytics()` → `queryClient.clear()` → `router.push('/')`. 호출부는 `ProfileMenu.tsx`와 `src/components/layout/settings-sidebar.tsx` 두 곳이다
    - `useDeleteAccountMutation`: `onSuccess`에서 `clearTokens` → `clearUser` → `resetAnalytics()` → `queryClient.clear()` → `router.push('/')`. 호출부는 `src/app/settings/page.tsx`
    - `resetAnalytics()`(`src/lib/posthog.ts`)가 `posthog.reset()`을 부른다. reset 뒤에 보낸 이벤트는 사용자와 연결되지 않는다 (설계 문서 2.2)
  - `src/app/settings/notifications/page.tsx`: 이메일 알림 `ToggleSwitch`의 `onChange(next)`가 `updateMutation.mutate({ emailEnabled: next, inAppEnabled, remindDays })`를 부른다(API 5.2). 성공·실패 콜백이 없다. 카카오톡 토글은 `disabled`다
  - `src/features/notification/components/NotificationBell.tsx` `handleClick`: 비로그인이면 `login_prompt_shown(notification_bell)`(ANALYTICS-0002) 후 로그인 모달, 로그인 상태면 `!isOpen && hasUnread`일 때 모두 읽음 처리 후 `toggle()`. `unreadCount`는 `useNotificationInbox()`의 `data?.unreadCount`다. 같은 버튼이 열기·닫기를 모두 한다
  - `src/features/notification/components/NotificationModal.tsx`
    - `handleDelete(id)` → `deleteMutation.mutate(id)`, `handleDeleteAll()` → `items.length === 0`이면 return, 아니면 `deleteAllMutation.mutate()`. 두 mutation 모두 `onSuccess`가 훅 안에만 있다(`useNotificationMutations.ts`, 쿼리 무효화)
    - `items`는 불러온 페이지를 모두 펼친 `InAppNotificationItem[]`이고, 각 항목에 `reason: 'DEADLINE_REMINDER' | 'JOB_FEED_CHANGED'`(`InAppNotificationReason`, `src/types/api.ts`)가 있다
    - 빈 알림함의 "공고 둘러보기" 버튼이 `router.push('/jobs')`를 부른다
  - 알림 단건·전체 삭제 API(코드 주석상 5.6·5.7, 2026-08-04 백엔드 공유)는 `notificationApi.ts`에 이미 연동돼 있지만 `docs/API_SPEC.md`에는 아직 섹션이 없다. 이 스펙은 기존 호출을 그대로 쓰고 새 API를 추가하지 않는다

## 범위

**포함**

- 이벤트 7종 추가: `notification_setting_changed`, `logged_out`, `account_deleted`, `notification_bell_opened`, `notification_deleted`, `notification_all_cleared`, `notification_empty_cta_clicked`

**제외**

- Feature Flag와 `test_session_login_completed`는 ANALYTICS-0006에서 한다
- 카카오톡 리마인드 토글(비활성, API 없음)과 알림 항목 클릭(클릭할 수 없음)은 계측하지 않는다 (설계 문서 3.6·3.7)
- 비로그인 상태의 벨 클릭은 기존 `login_prompt_shown(notification_bell)`만 보내고 `notification_bell_opened`는 보내지 않는다
- 기존 로그아웃·탈퇴·알림 설정·알림 삭제·벨 동작은 바꾸지 않는다. `src/features/notification/api/`, `src/lib/posthog.ts`는 바꾸지 않는다
- 이벤트 이름·속성 설계(설계 문서 3.6·3.7)는 바꾸지 않는다. 설계를 바꿔야 한다고 판단되면 구현하지 말고 보고한다
- 새 패키지 추가·버전 변경은 하지 않는다. `package.json`·`package-lock.json`은 바뀌지 않는다
- 정책 경로(`.github/`, `.claude/`, `.codex/`, `.agents/`, `docs/ai/`, `docs/workflow/`, `scripts/ai/`, `AGENTS.md`, `CLAUDE.md`)와 `docs/specs/`, 설계 문서 `docs/analytics/posthog-events.md`는 바꾸지 않는다

## 설계 결정

공통 원칙 (설계 문서 2.5): 서버 반영이 필요한 행동은 **성공 응답 후**에 보내고, 클릭만으로 일어나는 행동(벨 열기, 빈 알림함 버튼)은 그 시점에 보낸다. 모든 호출은 `import { track } from '@/lib/posthog'`의 `track()`만 거친다. 알림 제목·설명 같은 텍스트와 알림 id는 속성에 넣지 않는다.

### 1. 이벤트 타입 맵 — `src/lib/analytics/events.ts`

기존 타입·맵 항목은 그대로 두고 아래를 추가한다. 맵 키·속성 이름은 설계 문서 3.6·3.7과 일치시킨다 (`InAppNotificationReason`은 `@/types/api`의 타입).

| 이벤트                           | 속성                                     |
| -------------------------------- | ---------------------------------------- |
| `notification_setting_changed`   | `{ channel: 'email'; enabled: boolean }` |
| `logged_out`                     | `Record<string, never>`                  |
| `account_deleted`                | `Record<string, never>`                  |
| `notification_bell_opened`       | `{ unread_count: number }`               |
| `notification_deleted`           | `{ reason: InAppNotificationReason }`    |
| `notification_all_cleared`       | `{ item_count: number }`                 |
| `notification_empty_cta_clicked` | `Record<string, never>`                  |

- 속성이 없는 이벤트는 `track('logged_out')`처럼 속성 없이 호출한다 (`src/lib/posthog.ts`의 `track` 시그니처 그대로)
- `any`를 쓰지 않는다

### 2. 로그아웃·탈퇴 — `useAuthMutations.ts`

- 설계 문서 3.6대로 이 두 이벤트는 mutation 훅에서 보낸다. 호출부가 두 곳(로그아웃)이고, `resetAnalytics()`보다 **먼저** 보내야 사용자와 연결되므로 reset을 부르는 훅 안이 순서를 보장하기 가장 쉽다. 두 훅은 "되돌리기"에서 재사용되지 않아 중복 집계 문제가 없다
- `useLogoutMutation` `onSettled`: `resetAnalytics()` 바로 앞에서 `track('logged_out')`. API 실패여도 클라이언트 로그아웃은 항상 일어나므로 `onSettled`에서 그대로 보낸다
- `useDeleteAccountMutation` `onSuccess`: `resetAnalytics()` 바로 앞에서 `track('account_deleted')`. 실패 시에는 보내지 않는다
- 그 밖의 순서(토큰 삭제, 사용자 정리, 캐시 정리, 이동)는 바꾸지 않는다

### 3. 이메일 알림 토글 — `settings/notifications/page.tsx`

- 이메일 `ToggleSwitch`의 `onChange(next)`에서 부르는 `updateMutation.mutate(...)`에 두 번째 인자로 `{ onSuccess: () => track('notification_setting_changed', { channel: 'email', enabled: next }) }`를 넘긴다. 실패 시에는 보내지 않는다
- 요청 본문과 스위치 표시 로직은 바꾸지 않는다. 카카오톡 토글은 계측하지 않는다

### 4. 알림 벨 — `NotificationBell.tsx`

- `handleClick`의 로그인 분기에서 알림함을 **여는** 경우(`!isOpen`)에만, `toggle()` 전에 `track('notification_bell_opened', { unread_count: data?.unreadCount ?? 0 })`를 보낸다. 모두 읽음 처리(`markAllReadMutation.mutate()`)보다 앞에서 값을 읽어 연 시점의 안 읽은 개수를 보낸다
- 닫는 경우(`isOpen`)와 비로그인 분기에서는 보내지 않는다. 팝오버 바깥 클릭으로 닫히는 경로(`Popover`의 `onClose`)도 계측하지 않는다

### 5. 알림함 — `NotificationModal.tsx`

- `notification_deleted`: `handleDelete(id)`에서 클릭 시점의 `items`에서 `id`가 같은 항목을 찾아 `reason`을 정해 두고, `deleteMutation.mutate(id, { onSuccess })`의 `onSuccess`에서 `track('notification_deleted', { reason })`을 보낸다. 항목을 못 찾으면 이벤트는 보내지 않고 삭제는 기존대로 진행한다
- `notification_all_cleared`: `handleDeleteAll()`에서 기존 `items.length === 0` return 뒤, 클릭 시점의 `items.length`를 정해 두고 `deleteAllMutation.mutate(undefined, { onSuccess })`의 `onSuccess`에서 `track('notification_all_cleared', { item_count })`을 보낸다. `item_count`는 화면에 불러온 개수다(설계 문서 3.7: "불러온 개수")
- 훅(`useNotificationMutations.ts`)에 있는 기존 `onSuccess`(쿼리 무효화)는 그대로 실행된다. 호출부 `mutate`의 두 번째 인자로 넘긴 콜백은 훅의 `onSuccess` 뒤에 추가로 실행된다 (TanStack Query 동작)
- `notification_empty_cta_clicked`: 빈 알림함 "공고 둘러보기" 버튼의 `onClick`에서 `router.push('/jobs')` **전에** `track('notification_empty_cta_clicked')`

### 공통

- 바꾼 부분에는 왜 그렇게 했는지 한국어 주석을 짧게 남긴다 (`.claude/rules/code-style.md`)
- BE 의존: 없음. 사용하는 API는 모두 기존 호출 그대로다 (`docs/API_SPEC.md` 1.3 로그아웃, 5.2 알림 설정 수정, 5.4 인앱 알림 목록, 5.8 모두 읽음, 6.2 회원 탈퇴, 그리고 문서에 섹션이 없는 기존 연동 알림 삭제 5.6·5.7). 새 엔드포인트·필드를 추가하지 않는다

## 수용 기준

- AC-01 `src/lib/analytics/events.ts`의 `AnalyticsEventMap`에 이 스펙 설계 결정 1절의 7개 이벤트가 같은 속성 형태로 정의되어 있고, `notification_deleted.reason`은 `@/types/api`의 `InAppNotificationReason`이다. 기존 항목은 바뀌지 않았고 `any`가 없다
- AC-02 `useLogoutMutation`의 `onSettled`는 `resetAnalytics()` 앞에서 `logged_out`을, `useDeleteAccountMutation`의 `onSuccess`는 `resetAnalytics()` 앞에서 `account_deleted`를 보낸다. 두 훅의 그 밖의 처리 순서는 그대로다
- AC-03 `settings/notifications/page.tsx`는 이메일 토글의 `updateMutation.mutate` 성공 콜백에서만 `notification_setting_changed`(`channel: 'email'`, `enabled: next`)를 보내고, 요청 본문과 카카오톡 토글은 그대로다
- AC-04 `NotificationBell.tsx`는 로그인 상태에서 알림함을 여는 경우(`!isOpen`)에만 `toggle()` 전에 `notification_bell_opened`(`unread_count: data?.unreadCount ?? 0`)를 보내고, 닫을 때와 비로그인 분기에서는 보내지 않는다
- AC-05 `NotificationModal.tsx`는 단건 삭제 성공 시 클릭 시점 항목의 `reason`으로 `notification_deleted`를, 모두 삭제 성공 시 클릭 시점 `items.length`로 `notification_all_cleared`를 보낸다. 두 이벤트 모두 호출부 `mutate`의 `onSuccess`에서 보내고 실패 시에는 보내지 않는다
- AC-06 빈 알림함 "공고 둘러보기" 버튼은 `router.push('/jobs')` 전에 `notification_empty_cta_clicked`를 보낸다
- AC-07 변경 파일은 아래 5개뿐이다: `src/lib/analytics/events.ts`, `src/features/auth/hooks/useAuthMutations.ts`, `src/app/settings/notifications/page.tsx`, `src/features/notification/components/NotificationBell.tsx`, `src/features/notification/components/NotificationModal.tsx`. `package.json`·`package-lock.json`·`src/lib/posthog.ts`·`src/features/notification/api/`는 바뀌지 않는다
- AC-08 `npm run typecheck`·`npm run build`·`npm run lint`가 통과한다
- AC-09 [manual] `NEXT_PUBLIC_POSTHOG_KEY`·`NEXT_PUBLIC_POSTHOG_HOST`가 설정된 Vercel 프리뷰 또는 로컬 `npm run dev`에서 로그인한 뒤 `posthog.debug()`를 켜거나 PostHog Activity 탭을 보며 아래가 모두 맞다
  - `/settings/notifications`에서 이메일 알림을 끄면 `notification_setting_changed`(`enabled: false`), 다시 켜면 `true`가 1번씩 온다
  - 헤더 알림 벨을 눌러 알림함을 열면 `notification_bell_opened`가 열 때의 `unread_count`와 함께 1번 오고, 같은 벨을 눌러 닫으면 오지 않는다. 로그아웃 상태에서 벨을 누르면 `login_prompt_shown`만 온다
  - 알림 하나를 삭제하면 `notification_deleted`가 그 알림의 `reason`과 함께, "모두 삭제"를 누르면 `notification_all_cleared`가 화면에 있던 개수와 함께 온다. 알림이 없을 때 "공고 둘러보기"를 누르면 `notification_empty_cta_clicked`가 오고 `/jobs`로 이동한다
  - 프로필 메뉴 또는 설정 사이드바에서 로그아웃하면 `logged_out`이 오고, PostHog에서 그 이벤트가 로그아웃 전 사용자(person)에 연결되어 있다. 이후 이벤트는 익명이다
  - 회원 탈퇴를 완료하면 `account_deleted`가 탈퇴한 사용자에 연결되어 온다 (테스트 계정이나 지워도 되는 계정으로 확인한다)

## 테스트 계획

구현 후 **커밋하기 전에** 아래를 실행하고 명령과 결과를 PR 본문에 남긴다.

```bash
# 아래는 수정 후, 커밋하기 전에 실행한다

# (AC-01) 이벤트 7개 이름과 InAppNotificationReason이 나와야 한다
git grep -n "InAppNotificationReason\|notification_setting_changed\|logged_out\|account_deleted\|notification_bell_opened\|notification_deleted\|notification_all_cleared\|notification_empty_cta_clicked" -- src/lib/analytics/events.ts

# (AC-01) 출력이 없어야 한다
git grep -n "\bany\b" -- src/lib/analytics/events.ts

# (AC-02) track이 resetAnalytics 바로 앞 줄에 있는지 줄 번호로 확인한다
git grep -n "track(\|resetAnalytics()" -- src/features/auth/hooks/useAuthMutations.ts

# (AC-03~AC-06) 호출 위치가 나와야 한다
git grep -n "track(\|mutate(\|toggle()\|router.push" -- src/app/settings/notifications/page.tsx src/features/notification/components/NotificationBell.tsx src/features/notification/components/NotificationModal.tsx

# (AC-07) 출력이 없어야 한다
git diff --cached --name-only origin/develop -- src/lib/posthog.ts src/features/notification/api package.json package-lock.json

# (AC-07) M 5줄(위 목록)만 나와야 한다
git diff --cached --name-status origin/develop
git status --short

# (AC-08)
npm run typecheck
npm run build
npm run lint
```

- (AC-01) 속성 타입은 코드로 확인한다. 확인용으로 `notification_deleted`에 맵에 없는 `reason` 값을 넣은 호출을 임시로 추가해 `npm run typecheck`가 실패하는지 봐도 되지만, 그 임시 코드는 커밋하지 않는다
- (AC-04, AC-05) `notification_bell_opened`가 `!isOpen` 조건 안에서 `toggle()`보다 앞에 있고, 삭제 이벤트가 `mutate`의 두 번째 인자 `onSuccess` 안에 있는지 diff로 확인한다
- (AC-09) [manual]: 사용자가 확인한다. Vercel 프리뷰에서 확인하려면 Preview 환경변수가 `NEXT_PUBLIC_POSTHOG_KEY`·`NEXT_PUBLIC_POSTHOG_HOST` 이름으로 등록돼 있고 그 뒤에 배포된 프리뷰여야 한다. 그렇지 않으면 로컬 `npm run dev`(`.env.local`에 두 키 설정)에서 확인한다. 알림이 없으면 알림함 삭제 항목은 확인할 수 없으니 "확인 못함"으로 남긴다. 회원 탈퇴는 되돌릴 수 없으므로 실사용 계정으로 확인하지 않는다
