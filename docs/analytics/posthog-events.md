# PostHog 이벤트 설계

> 최종 수정: 2026-10-22 · 작성: 한태영
> 이 문서는 PostHog 계측 스펙(`docs/specs/ANALYTICS-*.md`)이 참조하는 기준 문서다. 이벤트 이름·속성을 바꿀 때는 이 문서를 먼저 고친다.

## 0. 범위와 역할 구분

- **PostHog**: 개발 관점의 퍼널·코호트·실험(Feature Flag) 전용. 이 문서가 다룬다
- **GA4(GTM)**: PM 관점 지표. `src/lib/gtm.ts`의 `pushDataLayerEvent`로 따로 보낸다. 두 도구의 이벤트를 섞지 않는다
  - 현재 GA4 이벤트: `stage_name_edit_trigger`(전형 단계 이름 수정 진입). 같은 행동을 PostHog에 중복 계측하지 않는다
- 계측 대상은 이 저장소(프론트엔드)에서 관측 가능한 행동만이다. 이메일 발송·배치 동기화 등 서버 이벤트는 다루지 않는다

## 1. 전체 퍼널

실제 화면 흐름(2026-10-22 develop 기준) 그대로 적는다. 퍼널은 한 줄이 아니라 **비로그인 탐색 경로**와 **바로 로그인 경로** 두 갈래다.

```text
0. 랜딩 (/)
   ├─ "무료로 시작하기" (Navbar·Hero) ──→ 비로그인 상태로 /jobs 진입
   └─ "회원가입/로그인" (Navbar) ───────→ 카카오 인가 페이지로 바로 이동

[비로그인 탐색 경로]
2. 통합 공고 탐색 (/jobs) — 비로그인으로 탐색 가능
   └─ 스크랩 / 지원 현황 추가 / 알림 벨 / 사이드바 로그인 버튼
        → 로그인 모달 노출 → 카카오 인가 페이지

1. 카카오 로그인 완료 → 항상 /kanban으로 이동
   (비로그인 중 하려던 행동은 이어지지 않는다 — 개선하지 않고 데이터로 먼저 확인하기로 함)

[로그인 이후]
2. 통합 공고 탐색 (/jobs): 검색·필터·정렬, 스크랩, 원본 공고 이동, 지원 현황 추가(스크랩 없이 바로 등록)
3. 스크랩 (/scraps): 필터, 스크랩 해제, 지원 현황 추가(스크랩 → 칸반)
4. 지원 현황 (/kanban): 카드 직접 추가, 카드 이동, 전형 단계 관리, 카드 상세 드로어(메모·파일·URL 일괄 저장)
5. 지원 마감일 (/deadlines): 카드 상세, 마감일·전형 단계 수정, 이메일 알림 딥링크(?cardId=) 진입
6. 설정 (/settings, /settings/notifications): 프로필, 회원 탈퇴, 이메일 알림 토글
공통: 헤더 알림 벨 (인앱 알림함)
```

핵심 전환 구간은 세 개다.

| 구간                         | 측정 방법                                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------------ |
| 유입 → 로그인                | `landing_cta_clicked` → (`login_prompt_shown`) → `kakao_login_started` → `kakao_login_completed` |
| 탐색 → 스크랩                | `$pageview`(/jobs) → `job_scrapped`                                                              |
| 스크랩·탐색 → 관리 도구 사용 | `kanban_card_added` → `kanban_card_opened` / `card_detail_saved` / `kanban_card_stage_changed`   |

## 2. 공통 규칙

### 2.1 이름

- 이벤트 이름: `snake_case`, `<대상>_<과거형 동사>` (예: `job_scrapped`, `kanban_card_added`)
- 속성 이름: `snake_case`. 속성값의 enum은 API 값 그대로(`SARAMIN`, `BACKEND`) 또는 소문자 snake_case(`feed_direct`)
- 기존 `kakao_login_completed`의 `isNewUser`는 `is_new_user`로 바꾼다 (ANALYTICS-0001)

### 2.2 사용자 식별

현재 `person_profiles: 'identified_only'`인데 `identify()` 호출이 없어 모든 이벤트가 익명으로 쌓인다. 아래를 먼저 적용한다 (ANALYTICS-0001).

| 시점                                      | 처리                                                                       |
| ----------------------------------------- | -------------------------------------------------------------------------- |
| 카카오 로그인 성공, 테스트 세션 발급 성공 | `identify(String(user.id))`, 사용자 속성 `account_type: 'kakao' \| 'test'` |
| 앱 시작 시 이미 로그인 상태               | 위와 동일하게 `identify` 1회 (배포 전부터 로그인돼 있던 사용자 대응)       |
| 로그아웃, 회원 탈퇴                       | 관련 이벤트를 보낸 **뒤** `posthog.reset()`                                |

- `account_type`은 슈퍼 속성(`register`)으로도 등록해 이후 모든 이벤트에 붙인다. **`account_type`이 없는 이벤트 = 비로그인 이벤트**로 본다
- 테스트 세션은 호출마다 새 계정이 발급되므로(`src/app/api/test-session/route.ts`) 사용자 단위 식별에 문제가 없다
- 대시보드·퍼널은 기본적으로 `account_type = kakao`로 거른다

### 2.3 환경 구분

- 슈퍼 속성 `app_env`를 등록한다: `production` / `preview` / `development`
- 값의 출처(Vercel 시스템 환경변수 노출 여부)는 ANALYTICS-0001 명세 작성 시 확인한다
- 대시보드는 `app_env = production`만 본다

### 2.4 페이지뷰

- `capture_pageview: 'history_change'`로 `$pageview`를 자동 수집한다. App Router의 클라이언트 이동도 잡히고 `$pageleave`(체류 시간·이탈)도 함께 켜진다
- `autocapture: false`는 유지한다. 클릭 자동 수집을 끈 목적(대시보드 정리)은 `$pageview` 한 종류로는 깨지지 않는다
- 페이지 진입 단계는 `$pageview` + `$pathname` 조건으로 본다. 별도의 `feed_viewed`·`deadline_page_viewed`·`account_setting_viewed`는 만들지 않는다
- 주의할 페이지뷰

| 경로                   | 문제                                                    | 처리                                                     |
| ---------------------- | ------------------------------------------------------- | -------------------------------------------------------- |
| `/`                    | 로그인 사용자도 리다이렉트 직전에 `/` 페이지뷰가 찍힌다 | 랜딩 지표는 `$pageview`가 아니라 `landing_viewed`로 본다 |
| `/auth/kakao/callback` | 스피너만 보이는 경유 페이지                             | 분석에서 제외                                            |

- 모든 이벤트에는 PostHog가 `$current_url`·`$pathname`·`$referrer`를 자동으로 붙인다. 그래서 `page_path` 같은 속성은 따로 두지 않는다

### 2.5 계측 위치

- 이벤트는 **mutation 훅이 아니라 화면 핸들러의 성공 콜백**에서 보낸다. 칸반의 "되돌리기"가 `createDirectCard`·`createStage`·`moveCard`를 재사용하므로, 훅에서 보내면 되돌리기가 추가·이동으로 중복 집계된다
- 서버 반영이 필요한 행동은 **성공 응답 후**에 보낸다. 클릭만으로 보내는 이벤트는 이름에 `_clicked`를 붙인다
- 이벤트 이름·속성은 `src/lib/analytics/events.ts`(가칭)의 타입 맵으로 정의하고 `track()` 래퍼만 거쳐 보낸다. 오타 이벤트가 타입 검사에서 걸리게 하기 위함이다
- 검색어 외에 사용자가 입력한 자유 텍스트(메모 내용, 회사명, 커스텀 단계 이름, URL)는 속성으로 보내지 않는다

## 3. 단계별 이벤트

표의 "위치"는 2026-10-22 develop 기준 계측 지점이다. 구현 스펙에서 바뀔 수 있다.

### 3.0 랜딩

| 이벤트                | 트리거                                 | 속성                                                                                             | 위치                                     | 근거                                                                                                                                                    |
| --------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `landing_viewed`      | 비로그인 상태로 랜딩 콘텐츠가 렌더링됨 | - (유입 경로·UTM은 자동 속성 `$referrer`·`$current_url` 사용)                                    | `LandingAuthRedirect` children 렌더 시점 | 로그인 사용자의 리다이렉트 페이지뷰를 빼고 실제 랜딩 노출만 센다                                                                                        |
| `landing_cta_clicked` | 랜딩 CTA 클릭                          | `cta_type`: `start_free` \| `signup_login` \| `test_start`<br>`cta_location`: `navbar` \| `hero` | `Navbar`, `Hero`, `KakaoLoginButton`     | "무료로 시작하기"(비로그인 탐색)와 "회원가입/로그인"(바로 로그인) 경로의 이후 행동 차이를 비교한다. `test_start`는 Feature Flag(5장)가 켜졌을 때만 발생 |

- 현재 하단 `CtaSection`에는 버튼이 없다. `cta_location`은 `navbar`·`hero`뿐이다

### 3.1 로그인

| 이벤트                         | 트리거                         | 속성                                                                                                    | 위치                                                                                     | 근거                                                                                                                     |
| ------------------------------ | ------------------------------ | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `login_prompt_shown`           | 로그인 모달 노출               | `trigger`: `scrap` \| `notification_bell` \| `sidebar` \| `api_401`                                     | `jobs/page.tsx`의 스크랩 가드, `NotificationBell`, `Sidebar`, `api-client.ts`의 401 처리 | 비로그인 탐색이 가입으로 이어지는지 보는 핵심 지점. 어떤 행동이 가입을 유도하는지 비교한다                               |
| `kakao_login_started`          | 카카오 인가 페이지로 이동 직전 | `entry`: `landing_navbar` \| `login_modal`<br>`trigger`: 위 `login_prompt_shown.trigger` (모달 경유 시) | `KakaoLoginButton`, `LoginModal`                                                         | 외부 페이지로 나가면 시작 맥락이 사라지므로 이동 직전에 기록하고, 같은 값을 sessionStorage에 저장해 완료 이벤트에 넘긴다 |
| `kakao_login_completed`        | `POST /api/v1/auth/kakao` 성공 | `is_new_user`(서버 응답값), `entry`, `trigger`                                                          | `useKakaoLoginMutation` onSuccess (기존 계측 수정)                                       | 신규/기존 사용자 구분과 진입 경로별 가입 전환                                                                            |
| `kakao_login_failed`           | 콜백에서 실패 처리             | `reason`: `kakao_denied` \| `server_error`                                                              | `auth/kakao/callback/page.tsx`                                                           | 동의 거부와 서버 오류를 구분해 로그인 단계 이탈 원인을 본다                                                              |
| `test_session_login_completed` | 테스트 세션 발급 성공          | -                                                                                                       | `useTestSessionMutation` onSuccess                                                       | Feature Flag로 열린 체험 경로의 이후 행동을 실사용자와 분리해서 본다                                                     |

- `trigger: api_401`은 비로그인 상태에서 보호된 API를 부른 경우다. 피드의 "지원 현황 추가"가 여기에 해당한다(스크랩만 사전 가드가 있음). 어느 화면에서 났는지는 `$pathname`으로 구분한다
- 로그인 후에는 항상 `/kanban`으로 이동한다. 비로그인 중 하려던 행동이 끊기는지는 `login_prompt_shown(trigger=scrap)` → `kakao_login_completed` → 첫 `job_scrapped`까지의 퍼널로 확인한다

### 3.2 통합 공고 탐색 (/jobs)

| 이벤트                     | 트리거                                      | 속성                                                                                                                                                                        | 위치                                                                                                                   | 근거                                                                                                          |
| -------------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `feed_searched`            | 검색어 제출 후 **그 검색어의 첫 응답 수신** | `keyword`, `result_count`(응답 `totalElements`)                                                                                                                             | `jobs/page.tsx` (Header `onSearch`)                                                                                    | `result_count = 0` 비율로 공고 커버리지 부족을 확인한다. 페이지 이동 시에는 다시 보내지 않는다                |
| `feed_filter_applied`      | 필터 적용(드롭다운 "적용", 마감 임박 토글)  | `page`: `jobs` \| `scraps`<br>`filter_type`: `job_category` \| `region` \| `career` \| `deadline_soon`<br>`filter_value`: 문자열 배열 또는 boolean<br>`active_filter_count` | `JobCategoryFilterButton`·`RegionFilterButton`·`CareerFilterChip`의 `onApply`, `DeadlineSoonFilterButton`의 `onToggle` | 실제로 쓰이는 필터를 확인해 필터 노출 순서를 개편하는 근거로 쓴다. 해제(빈 배열·false)도 같은 이벤트로 남긴다 |
| `feed_filter_reset`        | 필터 초기화                                 | `source`: `toolbar` \| `empty_state`                                                                                                                                        | `jobs/page.tsx` `resetFilters` 호출부                                                                                  | 결과 없음 화면에서 초기화하는 빈도 = 필터 조합이 너무 좁은 정도                                               |
| `feed_sort_changed`        | 정렬 변경                                   | `sort`: `LATEST` \| `DEADLINE`                                                                                                                                              | `jobs/page.tsx`                                                                                                        | 마감일순 수요 확인                                                                                            |
| `job_scrapped`             | 스크랩 성공                                 | `feed_id`, `platform`, `job_category`, `career`, `has_active_filter`, `is_searching`                                                                                        | `jobs/page.tsx` `handleToggleScrap`                                                                                    | 필터·검색을 거친 스크랩이 이후 칸반 등록률이 더 높은지 비교한다                                               |
| `scrap_removed`            | 스크랩 해제 성공                            | `source`: `feed` \| `scraps_page`                                                                                                                                           | `jobs/page.tsx`, `scraps/page.tsx`                                                                                     | 스크랩 후 정리 행동                                                                                           |
| `original_posting_clicked` | "원본 공고 이동" 등 원본 링크 클릭          | `source`: `feed` \| `scraps` \| `kanban_card` \| `card_drawer`<br>`platform`(피드·스크랩만)                                                                                 | `JobCard`(클릭 콜백 prop 추가 필요), `KanbanCard`, `CardDetailDrawer`                                                  | 서비스 밖으로 나가는 빈도와 플랫폼별 차이                                                                     |

- `jobCategory`는 null일 수 있다(피드 응답). 속성값은 null 그대로 보낸다
- `career` 필터 값: `EXPERIENCED` \| `NEW` \| `BOTH` \| `FOREIGN`

### 3.3 지원 현황 추가 (피드·스크랩·칸반 공통)

지원 현황 추가 경로는 네 가지다. 이벤트 하나로 합치고 `source`로 구분한다.

| 이벤트                       | 트리거                                   | 속성                                                                                                                                                                       | 위치                                                                                                               | 근거                                                                                                  |
| ---------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `kanban_card_added`          | 칸반 카드 등록 성공                      | `source`: `feed_direct` \| `feed_scrapped` \| `scraps_page` \| `manual`<br>`platform`, `job_category`(manual 제외)<br>`target_stage_type`: `default` \| `custom`(manual만) | `jobs/page.tsx` `handleAddToKanban`, `scraps/page.tsx` `handleAddToKanban`, `KanbanBoard` AddCardModal `onConfirm` | **3→4 전환의 핵심 이벤트**. 스크랩을 거친 등록과 바로 등록의 비중으로 스크랩 기능의 필요성을 검증한다 |
| `kanban_card_add_duplicated` | 이미 등록된 공고 응답(K003)              | `source`                                                                                                                                                                   | 위와 동일                                                                                                          | 중복 클릭 빈도. HT-001("지원 완료" 표시) 효과 확인                                                    |
| `toast_kanban_link_clicked`  | 추가 성공 토스트의 "지원 현황 이동" 클릭 | `source`: `feed` \| `scraps_page`                                                                                                                                          | `jobs/page.tsx`, `scraps/page.tsx` Toast `onAction`                                                                | 등록 직후 관리 화면으로 바로 넘어가는 비율                                                            |

`source` 정의:

| 값              | 의미                                      | API |
| --------------- | ----------------------------------------- | --- |
| `feed_direct`   | 피드에서 스크랩하지 않은 공고를 바로 등록 | 2.6 |
| `feed_scrapped` | 피드에서 이미 스크랩된 공고를 등록        | 3.2 |
| `scraps_page`   | 스크랩 페이지에서 등록                    | 3.2 |
| `manual`        | 칸반의 "공고 직접 추가" 모달              | 3.1 |

- 카드 삭제 후 "되돌리기"는 내부적으로 3.1을 호출하지만 `kanban_card_added`로 세지 않는다

### 3.4 지원 현황 (/kanban)

| 이벤트                        | 트리거                                          | 속성                                                                                                                                                                                                                                                               | 위치                                                                                    | 근거                                                                                                                        |
| ----------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `kanban_card_opened`          | 카드 상세 드로어 열림                           | `source`: `kanban` \| `deadlines` \| `email_deeplink`                                                                                                                                                                                                              | `KanbanBoard`, `DeadlineList`                                                           | 등록에 그치지 않고 상세까지 들어가는 관리 행동 도달률                                                                       |
| `card_detail_saved`           | 드로어 "저장" 성공                              | `memo_changed`(bool)<br>`files_added`, `links_added`, `link_categories_changed`, `documents_deleted`(개수)<br>`link_categories_added`: `RESUME` \| `PORTFOLIO` \| `PERSONAL_CHANNEL` \| `OTHER` 배열<br>`source`: `kanban` \| `deadlines`                          | `CardDetailDrawer` `handleSave`                                                         | 메모·파일·URL은 저장 버튼 한 번에 일괄 반영되므로 이벤트 하나에 변경 내역을 담는다. "관리 도구로 실제로 쓰는가"의 핵심 지표 |
| `card_detail_save_failed`     | 저장 실패                                       | `error_code`: `STORAGE_LIMIT_EXCEEDED` \| `unknown`                                                                                                                                                                                                                | `CardDetailDrawer` `handleSave` catch                                                   | 용량 제한(100MB)에 걸리는 빈도                                                                                              |
| `card_detail_discarded`       | 저장 안 한 변경이 있는 상태에서 닫기 확인       | -                                                                                                                                                                                                                                                                  | `CardDetailDrawer` UnsavedChangesModal `onConfirm`                                      | 일괄 저장 UX가 입력 유실로 이어지는 정도                                                                                    |
| `kanban_card_stage_changed`   | 카드의 전형 단계 변경 성공 (출발 ≠ 도착일 때만) | `method`: `drag` \| `deadline_edit_modal`<br>`from_stage_type`, `to_stage_type`: `default` \| `custom`<br>`from_stage_name`, `to_stage_name`: 기본 단계면 이름(`지원 전`·`면접`·`최종 결과`), 커스텀이면 `custom`<br>`from_position`, `to_position`, `stage_count` | `KanbanBoard` `handleDragStart`/`handleDragEnd`, `DeadlineList` `handleConfirmEditCard` | 카드가 전형 진행에 따라 실제로 움직이는지, 등록 후 방치되는지 확인                                                          |
| `kanban_card_deleted`         | 카드 삭제 성공                                  | `source`: `kanban` \| `deadlines`                                                                                                                                                                                                                                  | `KanbanBoard`, `DeadlineList` `handleConfirmDeleteCard`                                 | 이탈·정리 신호                                                                                                              |
| `kanban_card_delete_undone`   | 삭제 토스트 "되돌리기" 성공                     | -                                                                                                                                                                                                                                                                  | `KanbanBoard` `handleUndoDeleteCard`                                                    | 실수 삭제 빈도                                                                                                              |
| `kanban_stage_added`          | 전형 단계 추가 성공                             | `stage_count_after`(1~10)                                                                                                                                                                                                                                          | `KanbanBoard` `handleConfirmDraft`                                                      | 기본 단계로 충분한지, 얼마나 세분화하는지                                                                                   |
| `kanban_stage_add_blocked`    | 10개 제한으로 추가 불가                         | `reason`: `limit_reached`                                                                                                                                                                                                                                          | `KanbanBoard` `handleAddStageClick`, K001 응답                                          | 상한에 닿는 사용자 확인                                                                                                     |
| `kanban_stage_reordered`      | 전형 단계 순서 변경 성공                        | `stage_type`, `from_position`, `to_position`, `stage_count`                                                                                                                                                                                                        | `KanbanBoard` `handleDragEnd` (stage 분기)                                              | 기본 단계 순서가 사용자 흐름과 맞는지. `지원 전`은 첫 자리 고정이라 제외된다                                                |
| `kanban_stage_deleted`        | 전형 단계 삭제 성공                             | `stage_count_after`                                                                                                                                                                                                                                                | `KanbanBoard` DeleteStageModal `onConfirm`                                              | 추가한 단계를 다시 지우는 빈도                                                                                              |
| `kanban_stage_delete_blocked` | 카드가 남은 단계 삭제 시도                      | `card_count`                                                                                                                                                                                                                                                       | `DeleteStageModal`(hasCards 분기 노출 시)                                               | 카드가 있으면 삭제를 막는 정책이 걸리는 빈도                                                                                |
| `kanban_stage_delete_undone`  | 단계 삭제 "되돌리기" 성공                       | -                                                                                                                                                                                                                                                                  | `KanbanBoard` `handleUndoDeleteStage`                                                   | 실수 삭제 빈도                                                                                                              |

- 단계 ID(`stageId`)는 사용자마다 따로 발급되는 숫자라 사용자 간 집계에 쓸 수 없다. 그래서 단계 유형·기본 단계 이름·위치로 보낸다
- `handleDragOver`가 드래그 중에 카드를 미리 옮겨 두므로, 출발 단계는 `handleDragStart`에서 저장해 둔다. 같은 단계 안 순서 변경은 세지 않는다
- 기본 단계 이름 변경은 서버가 막고(K023), 커스텀 단계 이름 변경은 GA4 `stage_name_edit_trigger`로 이미 계측 중이라 PostHog에서는 다루지 않는다

### 3.5 지원 마감일 (/deadlines)

| 이벤트                         | 트리거                              | 속성                                     | 위치                                   | 근거                                                                                                                             |
| ------------------------------ | ----------------------------------- | ---------------------------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `deadline_deeplink_opened`     | `?cardId=`로 진입해 딥링크를 처리함 | `card_found`(bool)                       | `DeadlineList` 딥링크 처리 블록        | 이메일 알림의 "카드 보기" 링크가 실제 재방문을 만드는지. 드로어가 열리면 `kanban_card_opened(source=email_deeplink)`도 함께 발생 |
| `kanban_card_deadline_changed` | 수정 모달에서 마감일 변경 성공      | `set_always_hiring`(bool, 마감일을 비움) | `DeadlineList` `handleConfirmEditCard` | 마감일 직접 관리 빈도                                                                                                            |

- 진입 자체는 `$pageview`(`/deadlines`)로 본다
- 같은 모달에서 전형 단계를 바꾸면 `kanban_card_stage_changed(method=deadline_edit_modal)`로 남긴다

### 3.6 설정

| 이벤트                         | 트리거                     | 속성                          | 위치                                  | 근거                                                                  |
| ------------------------------ | -------------------------- | ----------------------------- | ------------------------------------- | --------------------------------------------------------------------- |
| `notification_setting_changed` | 이메일 알림 토글 저장 성공 | `channel`: `email`, `enabled` | `settings/notifications/page.tsx`     | 알림 기능 관심도. 카카오톡 토글은 비활성(API 없음)이라 제외           |
| `logged_out`                   | 로그아웃                   | -                             | `useLogoutMutation` (reset 전)        | 세션 종료 지점                                                        |
| `account_deleted`              | 회원 탈퇴 성공             | -                             | `useDeleteAccountMutation` (reset 전) | 이탈 신호. reset 후에 보내면 사용자와 연결되지 않으므로 순서를 지킨다 |

- 설정 화면 진입은 `$pageview`(`/settings`, `/settings/notifications`)로 본다

### 3.7 공통 — 헤더 알림 벨

| 이벤트                           | 트리거                                       | 속성                                                | 위치                                  | 근거                                                 |
| -------------------------------- | -------------------------------------------- | --------------------------------------------------- | ------------------------------------- | ---------------------------------------------------- |
| `notification_bell_opened`       | 로그인 상태에서 알림함을 열 때(닫을 때 제외) | `unread_count`                                      | `NotificationBell` `handleClick`      | 알림함 사용 빈도와 어느 화면에서 여는지(`$pathname`) |
| `notification_deleted`           | 알림 단건 삭제                               | `reason`: `DEADLINE_REMINDER` \| `JOB_FEED_CHANGED` | `NotificationModal` `handleDelete`    | 알림 종류별 정리 행동                                |
| `notification_all_cleared`       | "모두 삭제"                                  | `item_count`(불러온 개수)                           | `NotificationModal` `handleDeleteAll` | 단건·일괄 삭제 선호 비교                             |
| `notification_empty_cta_clicked` | 빈 알림함의 "공고 둘러보기" 클릭             | -                                                   | `NotificationModal`                   | 빈 상태 안내가 탐색으로 이어지는지                   |

- 비로그인 상태에서 벨을 누르면 `login_prompt_shown(trigger=notification_bell)`만 보낸다
- 알림 항목은 클릭할 수 없어(삭제 버튼만 있음) 항목 클릭 이벤트는 두지 않는다

## 4. 초안 대비 변경 내역

| 초안                                                                          | 변경                                                                   | 이유                                                                                         |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `landing_viewed.referrer`                                                     | 속성 삭제                                                              | `$referrer`·UTM이 자동으로 붙는다                                                            |
| `landing_cta_clicked.cta_type: signup_login \| test_start`                    | `start_free` 추가, `cta_location` 추가                                 | 현재 CTA는 "무료로 시작하기"(비로그인 탐색, `f76efd9`에서 복구)이고 Navbar·Hero 두 곳에 있다 |
| `kakao_login_completed.isNewUser`                                             | `is_new_user`로 변경, `entry`·`trigger` 추가                           | 속성 표기 통일, 진입 경로별 가입 전환                                                        |
| 1→2 순서(로그인 → 피드)                                                       | 비로그인 탐색 경로 추가                                                | 로그인 후 `/kanban`으로 이동하고, 피드는 비로그인으로 볼 수 있다                             |
| (없음)                                                                        | `login_prompt_shown`, `kakao_login_started`, `kakao_login_failed` 추가 | 비로그인 탐색 → 가입 전환과 로그인 이탈 원인 측정                                            |
| `feed_viewed`, `deadline_page_viewed`, `account_setting_viewed`               | 삭제 → `$pageview`                                                     | 페이지뷰 자동 수집으로 대체                                                                  |
| `feed_original_link_clicked`                                                  | `original_posting_clicked`로 변경, `source` 추가                       | 원본 링크는 피드·스크랩·칸반 카드·드로어에 모두 있다                                         |
| `kanban_add_from_feed`                                                        | `kanban_card_added`(source 4종)로 통합                                 | 스크랩 페이지 등록(3→4 핵심 전환)과 칸반 직접 추가가 빠져 있었다                             |
| 3단계 "스크랩"에 필터 포함                                                    | 필터는 피드·스크랩 공통(`page` 속성)                                   | 필터와 스크랩 버튼은 피드 화면에 있다                                                        |
| `job_scrapped.from_filter`                                                    | `has_active_filter`, `is_searching`                                    | 의미를 이름에 드러냄, 검색 경유 여부 추가                                                    |
| `kanban_memo_added`, `kanban_file_attached`, `kanban_url_attached`            | `card_detail_saved` 하나로 통합                                        | 드로어 변경은 "저장" 한 번에 일괄 반영된다                                                   |
| `kanban_card_stage_moved`(`from_stage_id`, `to_stage_id`, `is_default_stage`) | `kanban_card_stage_changed`(유형·기본 단계 이름·위치, `method`)        | 단계 ID는 사용자마다 달라 집계 불가. 마감일 페이지에서도 단계를 바꿀 수 있다                 |
| `kanban_stage_reordered.stage_id`                                             | `stage_type`으로 변경                                                  | 위와 같은 이유                                                                               |
| `kanban_stage_deleted.had_cards`, `moved_card_count`                          | 삭제, `kanban_stage_delete_blocked` 추가                               | 카드가 남은 단계는 삭제 자체가 막혀 있다                                                     |
| `account_setting_viewed`                                                      | 삭제, `account_deleted`·`logged_out` 추가                              | 진입은 `$pageview`. 탈퇴는 이탈 신호                                                         |
| `notification_toggle_changed.notification_type`                               | `notification_setting_changed.channel`(email만)                        | 작동하는 토글은 이메일 하나뿐                                                                |
| `notification_bell_opened.page_path` 등 `page_path` 속성                      | 삭제                                                                   | `$pathname`이 자동으로 붙는다                                                                |
| `notification_item_clicked`                                                   | 삭제                                                                   | 알림 항목은 클릭할 수 없다. 재방문은 이메일 딥링크(`deadline_deeplink_opened`)로 본다        |
| `notification_deleted.delete_type` 등                                         | `reason`(알림 종류)·`item_count`로 변경                                | 단건·전체는 이벤트 이름으로 이미 구분된다                                                    |

## 5. Feature Flag

| Flag Key                   | 대상     | 동작                                                                                                                             | 목적                                                                                                                                                                          |
| -------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `test-session-login-entry` | 랜딩 CTA | 켜지면 Navbar·Hero의 "무료로 시작하기" 자리에 "테스트 시작하기"(테스트 세션 발급 후 `/jobs` 이동)를 보여준다. 꺼지면 현재와 같다 | 카카오 로그인 없이 체험하는 경로를 팀 내부·QA에 먼저 노출하고, 점진 배포 절차를 실제로 운영해 본다. 결과의 통계적 유의성보다 "실험 인프라를 구축·운영했다"는 것 자체가 산출물 |

- "테스트 시작하기" UI는 `f76efd9`에서 되돌리기 전 구현(Hero·Navbar)을 그대로 쓴다. 디자이너 부재로 새 Figma 시안은 기다리지 않는다
- 플래그가 켜져도 서버 쪽 `TEST_SESSION_SECRET`이 없으면 403(A007)이 난다. 운영 환경변수 설정이 선행되어야 한다
- 랜딩 방문자는 익명이라 "팀 내부만" 같은 사용자 속성 타겟팅이 어렵다. 타겟팅 방식은 해당 스펙(ANALYTICS-0006)에서 정한다

## 6. QA 검증 계획

1. 스펙 하나가 구현될 때마다 Vercel 프리뷰 또는 로컬 `npm run dev`에서 `posthog.debug()`를 켜고, PostHog Activity 탭의 실시간 이벤트로 확인한다
2. 팀원이 각자 1장 퍼널을 1회씩 직접 통과하며 "의도한 이벤트가 정확한 속성과 함께 1회 발생했는지"를 체크리스트(이 문서 3장 표)로 기록한다
3. 중복 발생(되돌리기·StrictMode·재렌더), 누락, 속성 오류를 찾아 수정하고 건수를 기록한다 (`QA 세션 N회, 오탐/누락 이벤트 O건 수정`)
4. 퍼널·대시보드는 P0 스펙(ANALYTICS-0002)이 머지된 뒤 만든다

## 7. 구현 스펙 분할

Claude·Codex 파이프라인으로 진행한다. 명세 하나 = 구현 PR 하나, 직렬 진행.

| SPEC_ID        | 범위                                                                                                                                                                                                                 | 우선순위 |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| ANALYTICS-0001 | 기반: `track()` 래퍼와 이벤트 타입 맵, identify·reset, `account_type`·`app_env` 슈퍼 속성, `$pageview` 자동 수집, `kakao_login_completed` 속성명 변경, `landing_viewed`                                              | P0       |
| ANALYTICS-0002 | 핵심 퍼널: `landing_cta_clicked`, `login_prompt_shown`, `kakao_login_started`·`failed`, 로그인 완료 `entry`·`trigger`, `job_scrapped`, `scrap_removed`, `kanban_card_added`·`duplicated`, `original_posting_clicked` | P0       |
| ANALYTICS-0003 | 칸반 관리: 3.4 전체                                                                                                                                                                                                  | P1       |
| ANALYTICS-0004 | 탐색 보조·마감일: `feed_searched`, 필터·초기화·정렬, `toast_kanban_link_clicked`, 3.5 전체                                                                                                                           | P1       |
| ANALYTICS-0005 | 알림·설정: 3.6, 3.7 전체                                                                                                                                                                                             | P2       |
| ANALYTICS-0006 | Feature Flag `test-session-login-entry`, `test_session_login_completed`                                                                                                                                              | P2       |
