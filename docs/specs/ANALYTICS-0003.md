---
spec_id: ANALYTICS-0003
revision: 0
---

# ANALYTICS-0003 — PostHog 칸반 관리 이벤트: 카드 상세·저장, 카드 단계 이동·삭제, 전형 단계 관리

## 배경

- PostHog 이벤트 설계 문서 `docs/analytics/posthog-events.md` 7장의 세 번째 스펙(P1)이다. 범위는 설계 문서 **3.4 전체**다. ANALYTICS-0001(PR #222)이 `track()`·이벤트 타입 맵을, ANALYTICS-0002(PR #224)가 퍼널 이벤트(`kanban_card_added` 등)를 머지했다. 이 스펙은 "스크랩·탐색 → 관리 도구 사용" 구간(설계 문서 1장)의 나머지 이벤트를 추가한다
- 지금 코드 (2026-10-23 develop `ce14c90` 기준)
  - `src/lib/analytics/events.ts`의 `AnalyticsEventMap`에는 3.4 이벤트가 하나도 없다
  - `src/features/kanban/components/KanbanBoard.tsx`
    - 카드 클릭은 `KanbanColumn`의 `onCardClick={(cardId) => setViewingCardId(cardId)}`로 드로어를 연다
    - 카드 드래그: `handleDragStart`는 드래그 중인 카드(`active.data.current.card`)만 저장한다. `handleDragOver`가 드래그 중에 카드를 다른 단계로 미리 옮겨 두므로, `handleDragEnd`에서는 출발 단계를 알 수 없다. `handleDragEnd`의 카드 분기는 `moveCardMutation.mutate`에 `onError`만 있다
    - 단계 순서 변경: `handleDragEnd`의 stage 분기가 `updateStageMutation.mutate({ stageId: fromStageId, position: newPosition }, { onError })`를 부른다. `onSuccess`가 없다
    - 단계 추가: `handleAddStageClick`(10개 이상이면 토스트 후 return), `handleConfirmDraft`(`createStageMutation.mutate`의 `onSuccess`·`onError`, `onError`에 K001 분기)
    - 단계 삭제: `KanbanColumn`의 `onDeleteStage`가 대상 단계를 찾아 `setDeletingStage(target)`로 `DeleteStageModal`을 연다. 모달은 `stage.cards.length > 0`이면 "삭제할 수 없어요" 안내와 "확인"(닫기) 버튼만 보여주고, 아니면 `onConfirm`으로 `deleteStageMutation.mutate`를 부른다. 성공 토스트의 "되돌리기"는 `handleUndoDeleteStage`
    - 카드 삭제: `handleConfirmDeleteCard`(`deleteCardMutation.mutate`의 `onSuccess`), 성공 토스트의 "되돌리기"는 `handleUndoDeleteCard`(`createDirectCardMutation.mutate`의 `onSuccess`)
    - `AddCardModal`(`mode="add"`)의 `kanban_card_added.target_stage_type`은 `stages`의 `isDefault`만으로 정한다 (ANALYTICS-0002)
  - `src/features/kanban/components/KanbanColumn.tsx`는 모듈 상수 `DEFAULT_STAGE_NAMES = ['지원 전', '면접', '최종 결과']`를 두고 `stage.isDefault || DEFAULT_STAGE_NAMES.includes(stage.name)`로 기본 단계를 판정한다. 주석에 "백엔드는 현재 '지원 전'만 `isDefault: true`로 내려준다"고 적혀 있다 (`docs/API_SPEC.md` 3장 예시는 세 단계 모두 `isDefault: true`). 즉 `isDefault`만으로는 `면접`·`최종 결과`가 커스텀으로 집계될 수 있다
  - `src/features/kanban/components/CardDetailDrawer.tsx`
    - `handleSave`가 `createdFiles`·`createdLinks`·`updatedLinkCategories`·`deletedIds`·`memoChanged`로 payload를 만들어 `saveCardDetail.mutateAsync(payload)`를 부른다. catch에서 `STORAGE_LIMIT_EXCEEDED`를 구분한다
    - 저장하지 않은 변경이 있으면 닫기 시 `UnsavedChangesModal`을 띄우고, `onConfirm`에서 `onClose()`한다
    - 이 드로어는 `KanbanBoard`와 `src/features/deadlines/components/DeadlineList.tsx` 두 곳에서 쓴다. 어느 화면에서 열렸는지 받는 prop이 없다
  - `DeadlineList.tsx`
    - 카드 클릭은 `DeadlineGroup`의 `onCardClick={(cardId) => setViewingCardId(cardId)}`
    - 이메일 알림 딥링크(`?cardId=`)는 **렌더 중** 블록(`if (!hasAppliedCardIdParam && data)`)에서 `setViewingCardId`를 부른다
    - `handleConfirmEditCard`: `updateStageDeadlineMutation.mutateAsync`에 `formData.stageId !== entry.stageId`일 때만 `stageId`를 넣는다. `entry.stageId`가 수정 전 단계다
    - `handleConfirmDeleteCard`: `deleteCardMutation.mutate`의 `onSuccess`. 이 화면에는 카드 삭제 "되돌리기"가 없다
  - `useUpdateStage`의 변수 타입은 `{ stageId: number; name?: string; position?: number }`다 (`src/features/kanban/api/useKanbanMutations.ts`)

## 범위

**포함**

- 이벤트 13종 추가 (설계 문서 3.4): `kanban_card_opened`, `card_detail_saved`, `card_detail_save_failed`, `card_detail_discarded`, `kanban_card_stage_changed`, `kanban_card_deleted`, `kanban_card_delete_undone`, `kanban_stage_added`, `kanban_stage_add_blocked`, `kanban_stage_reordered`, `kanban_stage_deleted`, `kanban_stage_delete_blocked`, `kanban_stage_delete_undone`
- 단계 유형·기본 단계 이름 판정 헬퍼 추가와, `KanbanColumn`·`kanban_card_added.target_stage_type`이 같은 판정을 쓰도록 맞추기
- `CardDetailDrawer`에 어느 화면에서 열렸는지 받는 `source` prop 추가

**제외**

- 설계 문서 3.5의 `deadline_deeplink_opened`, `kanban_card_deadline_changed`는 ANALYTICS-0004에서 한다. 이번에는 딥링크로 드로어가 열릴 때의 `kanban_card_opened(source=email_deeplink)`만 보낸다
- 커스텀 단계 이름 변경(GA4 `stage_name_edit_trigger`로 이미 계측 중)과 기본 단계 이름 변경은 PostHog에서 다루지 않는다 (설계 문서 3.4 주석). `KanbanColumn`의 `pushDataLayerEvent` 호출은 바꾸지 않는다
- 카드 수정 모달(`mode="edit"`) 저장, 같은 단계 안 카드 순서 변경, "되돌리기"가 내부에서 부르는 단계 생성·카드 이동은 계측하지 않는다
- 이벤트 이름·속성 설계(설계 문서 3.4 표)는 바꾸지 않는다. 위치(어느 핸들러에서 보내는지)만 이 스펙이 정한다. 설계를 바꿔야 한다고 판단되면 구현하지 말고 보고한다
- 기존 동작(드래그·저장·삭제·되돌리기·딥링크·토스트)은 바꾸지 않는다
- 새 패키지 추가·버전 변경은 하지 않는다. `package.json`·`package-lock.json`, `src/lib/posthog.ts`, `src/features/kanban/api/` 아래 파일은 바뀌지 않는다
- 정책 경로(`.github/`, `.claude/`, `.codex/`, `.agents/`, `docs/ai/`, `docs/workflow/`, `scripts/ai/`, `AGENTS.md`, `CLAUDE.md`)와 `docs/specs/`, 설계 문서 `docs/analytics/posthog-events.md`는 바꾸지 않는다

## 설계 결정

공통 원칙 (설계 문서 2.5): 서버 반영이 필요한 행동은 **성공 응답 후**에 보내고, 클릭만으로 일어나는 행동(드로어 열기, 차단 안내 노출, 저장 안 함 확인)은 그 시점에 보낸다. 이벤트는 mutation 훅(`src/features/kanban/api/`)이 아니라 **화면 핸들러**에서 보낸다 — "되돌리기"가 `createDirectCard`·`createStage`·`moveCard`를 재사용하므로 훅에서 보내면 중복 집계된다. 모든 호출은 `import { track } from '@/lib/posthog'`의 `track()`만 거친다. 메모 내용·회사명·커스텀 단계 이름·URL 같은 자유 텍스트와 `stageId`·`cardId`는 속성에 넣지 않는다.

### 1. 이벤트 타입 맵 — `src/lib/analytics/events.ts`

기존 타입·맵 항목은 그대로 두고 아래를 추가한다. 맵 키·속성 이름은 설계 문서 3.4와 일치시킨다.

- 공용 타입 export
  - `DefaultStageName = '지원 전' | '면접' | '최종 결과'`
  - `StageType = 'default' | 'custom'`
  - `CardDetailSource = 'kanban' | 'deadlines'`
  - `LinkCategory = 'RESUME' | 'PORTFOLIO' | 'PERSONAL_CHANNEL' | 'OTHER'`
- `AnalyticsEventMap` 추가

| 이벤트                        | 속성                                                                                                                                                                                                                                                             |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kanban_card_opened`          | `{ source: 'kanban' \| 'deadlines' \| 'email_deeplink' }`                                                                                                                                                                                                        |
| `card_detail_saved`           | `{ memo_changed: boolean; files_added: number; links_added: number; link_categories_changed: number; documents_deleted: number; link_categories_added: LinkCategory[]; source: CardDetailSource }`                                                               |
| `card_detail_save_failed`     | `{ error_code: 'STORAGE_LIMIT_EXCEEDED' \| 'unknown' }`                                                                                                                                                                                                          |
| `card_detail_discarded`       | `Record<string, never>`                                                                                                                                                                                                                                          |
| `kanban_card_stage_changed`   | `{ method: 'drag' \| 'deadline_edit_modal'; from_stage_type: StageType; to_stage_type: StageType; from_stage_name: DefaultStageName \| 'custom'; to_stage_name: DefaultStageName \| 'custom'; from_position: number; to_position: number; stage_count: number }` |
| `kanban_card_deleted`         | `{ source: CardDetailSource }`                                                                                                                                                                                                                                   |
| `kanban_card_delete_undone`   | `Record<string, never>`                                                                                                                                                                                                                                          |
| `kanban_stage_added`          | `{ stage_count_after: number }`                                                                                                                                                                                                                                  |
| `kanban_stage_add_blocked`    | `{ reason: 'limit_reached' }`                                                                                                                                                                                                                                    |
| `kanban_stage_reordered`      | `{ stage_type: StageType; from_position: number; to_position: number; stage_count: number }`                                                                                                                                                                     |
| `kanban_stage_deleted`        | `{ stage_count_after: number }`                                                                                                                                                                                                                                  |
| `kanban_stage_delete_blocked` | `{ card_count: number }`                                                                                                                                                                                                                                         |
| `kanban_stage_delete_undone`  | `Record<string, never>`                                                                                                                                                                                                                                          |

- 속성이 없는 이벤트는 기존 `landing_viewed`와 같이 `Record<string, never>`로 두고 `track('card_detail_discarded')`처럼 속성 없이 호출한다 (`src/lib/posthog.ts`의 `track` 시그니처 그대로)
- `any`를 쓰지 않는다

### 2. 단계 판정 헬퍼 — 새 파일 `src/features/kanban/utils/stageAnalytics.ts`

- `DEFAULT_STAGE_NAMES`(값 `['지원 전', '면접', '최종 결과']`)를 이 파일로 옮겨 export한다
- `getStageType(stage: Pick<KanbanStage, 'isDefault' | 'name'>): StageType` — `stage.isDefault`가 true이거나 `stage.name`이 `DEFAULT_STAGE_NAMES`에 있으면 `'default'`, 아니면 `'custom'`. `KanbanColumn`의 기존 `isLocked` 판정과 같은 기준이다 (백엔드가 `면접`·`최종 결과`를 `isDefault: false`로 내려줘도 기본 단계로 집계하기 위함)
- `getStageAnalyticsName(stage: Pick<KanbanStage, 'name'>): DefaultStageName | 'custom'` — `stage.name`이 `DEFAULT_STAGE_NAMES`에 있으면 그 이름, 아니면 `'custom'` (커스텀 단계 이름은 자유 텍스트라 보내지 않는다)
- `KanbanColumn.tsx`는 자체 `DEFAULT_STAGE_NAMES` 정의를 지우고 이 파일에서 import한다. `isLocked`의 판정 결과·동작은 바꾸지 않는다 (`getStageType(stage) === 'default'`로 바꿔도 되고 상수만 import해도 된다)
- `KanbanBoard.tsx` `AddCardModal`(`mode="add"`) `onConfirm`의 `target_stage_type`도 `data.stageId`에 해당하는 `stages` 항목에 `getStageType`을 적용해 정한다. 항목을 못 찾으면 기존처럼 `'custom'`이다. 이벤트를 보내는 위치·조건은 바꾸지 않는다

### 3. 카드 상세 드로어 열기 — `kanban_card_opened`

- `KanbanBoard`: `onCardClick` 핸들러에서 `cardId !== viewingCardId`일 때만 `track('kanban_card_opened', { source: 'kanban' })`을 보내고, 기존대로 `setViewingCardId(cardId)`. 이미 열린 카드를 다시 눌렀을 때 중복 집계하지 않기 위함이다
- `DeadlineList`: `DeadlineGroup`의 `onCardClick` 핸들러에서 같은 조건으로 `source: 'deadlines'`
- `DeadlineList` 딥링크: 딥링크로 드로어를 열었을 때(`entries`에 해당 카드가 있어 `setViewingCardId(cardId)`를 부른 경우만) `source: 'email_deeplink'`로 **1번** 보낸다
  - 딥링크 처리는 렌더 중에 일어나므로 **렌더 중에 `track`을 호출하지 않는다.** 렌더 중 블록에서는 상태만 기록하고(예: `deeplinkOpenedCardId` 상태를 함께 set), 그 상태를 의존성으로 하는 `useEffect`에서 `track`을 부른다
  - 개발 모드 StrictMode의 effect 재실행으로 두 번 가지 않도록 effect 안에서 `useRef`로 보낸 여부를 기록한다 (ref는 effect 안에서만 읽고 쓴다 — `react-hooks/refs` 규칙)
  - 위와 같은 결과(렌더 중 `track` 없음, 진입 1회당 1번, lint 통과)를 내는 다른 방식이면 구현자가 정해도 된다
  - 카드를 못 찾은 경우는 이번에 보내지 않는다 (`deadline_deeplink_opened(card_found=false)`는 ANALYTICS-0004)

### 4. 드로어 저장·실패·저장 안 함 — `CardDetailDrawer.tsx`, `KanbanBoard.tsx`, `DeadlineList.tsx`

- `CardDetailDrawerProps`에 필수 prop `source: CardDetailSource`를 추가한다. `KanbanBoard`는 `source="kanban"`, `DeadlineList`는 `source="deadlines"`를 넘긴다
- `card_detail_saved` (`handleSave`): 속성은 `await` 전에, payload를 만드는 것과 같은 값으로 만들어 둔다. `saveCardDetail.mutateAsync(payload)`가 성공한 뒤 보낸다
  - `memo_changed`: `memoChanged`
  - `files_added`: `createdFiles.length`, `links_added`: `createdLinks.length`, `link_categories_changed`: `updatedLinkCategories.length`, `documents_deleted`: `deletedIds.length`
  - `link_categories_added`: `createdLinks`의 `category`를 처음 나온 순서대로 **중복 없이** 모은 배열. `LinkCategory`(= `URL_CATEGORIES`의 `value`)가 아닌 값은 뺀다. 새 링크가 없으면 `[]`
  - `source`: prop `source`
- `card_detail_save_failed` (`handleSave` catch): 기존 처리와 함께 `ApiClientError`이고 `code === 'STORAGE_LIMIT_EXCEEDED'`면 `error_code: 'STORAGE_LIMIT_EXCEEDED'`, 그 밖의 모든 오류는 `'unknown'`으로 보낸다
- `card_detail_discarded`: `UnsavedChangesModal`의 `onConfirm`에서 `onClose()` 전에 보낸다. `onCancel`, 변경 없이 닫기, 카드 삭제로 드로어가 닫히는 경우에는 보내지 않는다

### 5. 카드 단계 변경 — `kanban_card_stage_changed`

- 단계 정보는 2절 헬퍼로 만든다: `from_stage_type`/`to_stage_type` = `getStageType`, `from_stage_name`/`to_stage_name` = `getStageAnalyticsName`, `from_position`/`to_position` = 출발·도착 **단계**의 `position`, `stage_count` = 그 시점 단계 개수
- 출발 단계와 도착 단계가 같으면 보내지 않는다 (같은 단계 안 순서 변경은 세지 않는다)
- 드래그 (`method: 'drag'`, `KanbanBoard`)
  - `handleDragStart`에서 카드 드래그일 때 출발 단계 id(`active.data.current.stageId`)를 `useRef`로 저장한다. 렌더에 쓰지 않는 값이라 상태로 두지 않는다. `handleDragEnd`·`onDragCancel`에서 비운다
  - `handleDragEnd` 카드 분기: 저장한 출발 단계 id와 `currentStageId`(도착)가 다르면, `moveCardMutation.mutate`에 `onSuccess`를 추가해 그 안에서 보낸다. 출발·도착 단계 정보와 `stage_count`는 `mutate` 호출 전에 `stages`에서 찾아 만들어 둔다. 둘 중 하나라도 못 찾으면 보내지 않는다. 기존 `onError` 처리는 그대로다
  - `over`가 없어 되돌리는 경우(`!over`)와 단계(컬럼) 드래그 분기에서는 보내지 않는다
- 지원 마감일 수정 모달 (`method: 'deadline_edit_modal'`, `DeadlineList` `handleConfirmEditCard`)
  - `formData.stageId !== entry.stageId`일 때만, `updateStageDeadlineMutation.mutateAsync`가 성공한 뒤 보낸다
  - 출발 단계 = `data.stages`에서 `id === entry.stageId`, 도착 단계 = `id === formData.stageId`, `stage_count` = `data.stages.length`. 속성은 `await` 전에 만들어 둔다. 둘 중 하나라도 못 찾으면 보내지 않는다
  - 마감일만 바꾼 경우는 이번에 보내지 않는다 (`kanban_card_deadline_changed`는 ANALYTICS-0004)

### 6. 카드 삭제·되돌리기

- `kanban_card_deleted`: `KanbanBoard` `handleConfirmDeleteCard`의 `onSuccess`에서 `source: 'kanban'`, `DeadlineList` `handleConfirmDeleteCard`의 `onSuccess`에서 `source: 'deadlines'`. 드로어 안 삭제 버튼으로 시작한 삭제도 같은 핸들러를 거치므로 화면 기준 `source`를 그대로 쓴다
- `kanban_card_delete_undone`: `KanbanBoard` `handleUndoDeleteCard`의 `createDirectCardMutation.mutate` `onSuccess` 첫머리에서 보낸다 (이후 단계 이동 성공 여부와 무관). `onError`에서는 보내지 않는다. 이 경로는 `kanban_card_added`·`kanban_card_stage_changed`를 보내지 않는다

### 7. 전형 단계 관리 — `KanbanBoard.tsx`

- `kanban_stage_added`: `handleConfirmDraft`의 `onSuccess`에서 `stage_count_after: stages.length + 1` (`stages`는 추가 전 목록)
- `kanban_stage_add_blocked` (`reason: 'limit_reached'`)
  - `handleAddStageClick`에서 `stages.length >= MAX_STAGES`라 토스트를 띄우고 return하는 분기
  - `handleConfirmDraft`의 `onError`에서 `ApiClientError`이고 `code === 'K001'`인 분기
  - 이름 검증 오류(K005~K009) 등 그 밖의 실패에서는 보내지 않는다
- `kanban_stage_reordered`: `handleDragEnd` stage 분기의 `updateStageMutation.mutate`에 `onSuccess`를 추가해 보낸다. `stage_type` = 옮긴 단계(`fromStage`)에 `getStageType`, `from_position` = 옮기기 전 `fromStage.position`, `to_position` = 요청에 보낸 `position`(`newPosition`), `stage_count` = `stages.length`. 값은 `mutate` 호출 전에 만들어 둔다. 기존 `onError` 처리와 `'지원 전'` 고정 가드는 그대로다
- `kanban_stage_deleted`: `DeleteStageModal` `onConfirm`의 `deleteStageMutation.mutate` `onSuccess`에서 `stage_count_after: stages.length - 1`
- `kanban_stage_delete_blocked`: `KanbanColumn`의 `onDeleteStage` 핸들러(`KanbanBoard`)에서 대상 단계의 `cards.length > 0`이면 `track('kanban_stage_delete_blocked', { card_count: target.cards.length })`을 보내고 기존대로 `setDeletingStage(target)`. 모달이 같은 `stage.cards`로 차단 안내 분기를 고르므로 "차단 안내가 뜬 시점"과 같다. `DeleteStageModal.tsx`는 바꾸지 않는다 (모달 렌더·effect에서 보내면 중복 방지가 까다롭기 때문)
- `kanban_stage_delete_undone`: `handleUndoDeleteStage`의 `try` 블록이 모두 성공한 뒤(catch로 return하지 않은 경우) 보낸다. 실패 시에는 보내지 않는다

### 공통

- 바꾼 부분에는 왜 그렇게 했는지 한국어 주석을 짧게 남긴다 (`.claude/rules/code-style.md`)
- BE 의존: 없음. 사용하는 API는 모두 기존 호출 그대로다 (`docs/API_SPEC.md` 3.3 카드 단계 이동, 3.6 카드 삭제, 3.7~3.9 단계 추가·수정·삭제, 3.10 카드 직접 등록, 3.13 지원 마감일 카드 수정, 4장 서류). 새 엔드포인트·필드를 추가하지 않는다

## 수용 기준

- AC-01 `src/lib/analytics/events.ts`가 `DefaultStageName`, `StageType`, `CardDetailSource`, `LinkCategory`를 export하고, `AnalyticsEventMap`에 이 스펙 설계 결정 1절의 13개 이벤트가 같은 속성 형태로 정의되어 있다. 기존 항목은 바뀌지 않았고 `any`가 없다
- AC-02 `src/features/kanban/utils/stageAnalytics.ts`가 `DEFAULT_STAGE_NAMES`, `getStageType`, `getStageAnalyticsName`을 export하고 2절 기준(`isDefault` 또는 기본 이름이면 `'default'`, 기본 이름이 아니면 이름 대신 `'custom'`)으로 동작한다. `KanbanColumn.tsx`에는 `DEFAULT_STAGE_NAMES` 정의가 없고 이 파일에서 가져다 쓰며, `isLocked` 판정과 `pushDataLayerEvent('stage_name_edit_trigger', ...)` 호출은 그대로다
- AC-03 `KanbanBoard`의 `AddCardModal`(`mode="add"`) `onConfirm`은 `target_stage_type`을 `getStageType`으로 정하고, 이벤트를 보내는 위치·조건은 ANALYTICS-0002와 같다
- AC-04 `KanbanBoard`와 `DeadlineList`의 카드 클릭 핸들러는 `cardId !== viewingCardId`일 때만 `kanban_card_opened`(각각 `source: 'kanban'`·`'deadlines'`)를 보낸다. `DeadlineList`는 딥링크로 드로어를 연 경우에만 `source: 'email_deeplink'`를 보내고, 렌더 중에는 `track`을 호출하지 않으며 `useRef`(또는 같은 효과의 방법)로 진입 1회당 1번만 보낸다
- AC-05 `CardDetailDrawer`는 필수 prop `source: CardDetailSource`를 받고, `KanbanBoard`는 `'kanban'`, `DeadlineList`는 `'deadlines'`를 넘긴다
- AC-06 `CardDetailDrawer` `handleSave`는 `saveCardDetail.mutateAsync` 성공 뒤 `card_detail_saved`를 보내고, 속성은 `await` 전에 `memoChanged`·`createdFiles`·`createdLinks`·`updatedLinkCategories`·`deletedIds`로 만든다. `link_categories_added`는 `createdLinks`의 카테고리를 중복 없이 모은 `LinkCategory[]`다. catch에서는 `card_detail_save_failed`를 `STORAGE_LIMIT_EXCEEDED` 또는 `unknown`으로 보낸다
- AC-07 `UnsavedChangesModal`의 `onConfirm`에서만 `card_detail_discarded`를 보내고, `onCancel`과 그 밖의 닫기 경로에서는 보내지 않는다
- AC-08 `KanbanBoard`는 `handleDragStart`에서 카드의 출발 단계 id를 `useRef`에 저장하고, `handleDragEnd` 카드 분기에서 출발 ≠ 도착일 때 `moveCardMutation.mutate`의 `onSuccess`에서 `kanban_card_stage_changed`(`method: 'drag'`)를 보낸다. 단계 유형·이름은 `getStageType`·`getStageAnalyticsName`, 위치는 단계의 `position`, `stage_count`는 단계 개수다. 같은 단계 안 이동, `!over`, 단계 드래그 분기, 실패 시에는 보내지 않는다
- AC-09 `DeadlineList` `handleConfirmEditCard`는 `formData.stageId !== entry.stageId`이고 `updateStageDeadlineMutation.mutateAsync`가 성공했을 때만 `kanban_card_stage_changed`(`method: 'deadline_edit_modal'`)를 `data.stages` 기준 속성으로 보낸다. 마감일만 바꾼 경우와 실패 시에는 보내지 않는다
- AC-10 `kanban_card_deleted`는 `KanbanBoard`·`DeadlineList`의 `handleConfirmDeleteCard` `onSuccess`에서 각각 `source: 'kanban'`·`'deadlines'`로 보낸다. `kanban_card_delete_undone`은 `handleUndoDeleteCard`의 `createDirectCardMutation.mutate` `onSuccess`에서만 보내고, 이 경로에는 `kanban_card_added`가 없다
- AC-11 `KanbanBoard`는 `handleConfirmDraft` 성공 시 `kanban_stage_added`(`stage_count_after`)를, `handleAddStageClick`의 10개 제한 분기와 `handleConfirmDraft`의 K001 분기에서 `kanban_stage_add_blocked`(`reason: 'limit_reached'`)를 보낸다. 이름 검증 오류에서는 보내지 않는다
- AC-12 `KanbanBoard` `handleDragEnd` stage 분기는 `updateStageMutation.mutate` 성공 시 `kanban_stage_reordered`(`stage_type`, `from_position`, `to_position`(요청한 `position`), `stage_count`)를 보내고, `onError` 처리와 `'지원 전'` 가드는 그대로다
- AC-13 단계 삭제 성공 시 `kanban_stage_deleted`(`stage_count_after`)를, 카드가 남은 단계의 삭제를 시도하면 `onDeleteStage` 핸들러에서 `kanban_stage_delete_blocked`(`card_count`)를, `handleUndoDeleteStage`가 모두 성공하면 `kanban_stage_delete_undone`을 보낸다. `DeleteStageModal.tsx`는 바뀌지 않는다
- AC-14 13개 이벤트 모두 `src/features/kanban/api/` 아래 mutation 훅이 아니라 화면 핸들러에서 보내고, 속성에 `stageId`·`cardId`·단계 이름(기본 이름 제외)·메모·URL이 들어가지 않는다
- AC-15 변경 파일은 아래 6개뿐이다: `src/lib/analytics/events.ts`, `src/features/kanban/utils/stageAnalytics.ts`(추가), `src/features/kanban/components/KanbanColumn.tsx`, `src/features/kanban/components/KanbanBoard.tsx`, `src/features/kanban/components/CardDetailDrawer.tsx`, `src/features/deadlines/components/DeadlineList.tsx`. `package.json`·`package-lock.json`·`src/lib/posthog.ts`·`src/features/kanban/api/`는 바뀌지 않는다
- AC-16 `npm run typecheck`·`npm run build`·`npm run lint`가 통과한다
- AC-17 [manual] `NEXT_PUBLIC_POSTHOG_KEY`·`NEXT_PUBLIC_POSTHOG_HOST`가 설정된 Vercel 프리뷰 또는 로컬 `npm run dev`에서 로그인한 뒤 `posthog.debug()`를 켜거나 PostHog Activity 탭을 보며 아래가 모두 맞다
  - `/kanban`에서 카드를 누르면 `kanban_card_opened`(`kanban`)가 1번, `/deadlines`에서는 `deadlines`가 1번 온다. `/deadlines?cardId=<내 카드 id>`로 진입하면 드로어가 열리고 `email_deeplink`가 **1번**(개발 모드에서도) 온다
  - 드로어에서 메모를 고치고 링크 2개(같은 카테고리 1쌍 포함)를 등록해 저장하면 `card_detail_saved`가 `memo_changed: true`, `links_added: 2`, 중복 없는 `link_categories_added`, 화면에 맞는 `source`와 함께 1번 온다. 저장하지 않고 닫아 "나가기"를 고르면 `card_detail_discarded`, "계속 작성"을 고르면 아무것도 오지 않는다
  - 카드를 다른 단계로 드래그하면 `kanban_card_stage_changed`(`drag`)가 출발·도착 단계의 유형·이름(커스텀은 `custom`)·위치와 함께 1번 오고, 같은 단계 안에서 순서만 바꾸면 오지 않는다. `/deadlines` 수정 모달에서 전형 단계를 바꿔 저장하면 `deadline_edit_modal`이 오고, 마감일만 바꾸면 오지 않는다. `면접`·`최종 결과` 단계는 `default`로 온다
  - 카드를 삭제하면 `kanban_card_deleted`(화면별 `source`), 칸반에서 "되돌리기"를 누르면 `kanban_card_delete_undone`만 오고 `kanban_card_added`·`kanban_card_stage_changed`는 오지 않는다
  - 단계를 추가하면 `kanban_stage_added`(`stage_count_after`), 10개인 상태에서 "단계 추가"를 누르면 `kanban_stage_add_blocked`, 단계 순서를 바꾸면 `kanban_stage_reordered`, 카드가 있는 단계의 삭제를 누르면 `kanban_stage_delete_blocked`(`card_count`), 빈 단계를 삭제하면 `kanban_stage_deleted`, 그 "되돌리기"는 `kanban_stage_delete_undone`이 오고 `kanban_stage_added`는 오지 않는다
  - 기존 동작(드래그 결과, 저장 토스트, 삭제·되돌리기, 딥링크 드로어 열림, 커스텀 단계 이름 변경의 GA4 이벤트)은 이전과 같다

## 테스트 계획

구현 후 **커밋하기 전에** 아래를 실행하고 명령과 결과를 PR 본문에 남긴다.

```bash
# 아래는 수정 후, 커밋하기 전에 실행한다 (새 파일은 git add 후에 git grep에 잡힌다)

# (AC-01) 새 공용 타입 4개와 이벤트 13개 이름이 모두 나와야 한다
git grep -n "DefaultStageName\|StageType\|CardDetailSource\|LinkCategory\|kanban_card_opened\|card_detail_saved\|card_detail_save_failed\|card_detail_discarded\|kanban_card_stage_changed\|kanban_card_deleted\|kanban_card_delete_undone\|kanban_stage_added\|kanban_stage_add_blocked\|kanban_stage_reordered\|kanban_stage_deleted\|kanban_stage_delete_blocked\|kanban_stage_delete_undone" -- src/lib/analytics/events.ts

# (AC-01) 출력이 없어야 한다
git grep -n "\bany\b" -- src/lib/analytics/events.ts src/features/kanban/utils/stageAnalytics.ts

# (AC-02) 정의는 stageAnalytics.ts에만 있고 KanbanColumn은 import한다. GA4 호출이 그대로 나와야 한다
git grep -n "DEFAULT_STAGE_NAMES\|getStageType\|getStageAnalyticsName" -- src
git grep -n "stage_name_edit_trigger" -- src/features/kanban/components/KanbanColumn.tsx

# (AC-03~AC-13) 호출 위치가 나와야 한다
git grep -n "track(" -- src/features/kanban/components/KanbanBoard.tsx src/features/kanban/components/CardDetailDrawer.tsx src/features/deadlines/components/DeadlineList.tsx

# (AC-04) 딥링크 전송이 effect 안에 있는지 위치를 눈으로 확인한다
git grep -n "useEffect\|useRef\|email_deeplink\|hasAppliedCardIdParam" -- src/features/deadlines/components/DeadlineList.tsx

# (AC-05) 두 사용처 모두 source prop을 넘겨야 한다
git grep -n -A6 "<CardDetailDrawer" -- src

# (AC-10) handleUndoDeleteCard 안에는 kanban_card_delete_undone만 있어야 한다 — 줄 번호를 대조한다
git grep -n "function handleUndoDeleteCard\|function handleConfirmDeleteCard\|kanban_card_delete_undone\|kanban_card_added" -- src/features/kanban/components/KanbanBoard.tsx

# (AC-13, AC-14, AC-15) 출력이 없어야 한다
git grep -n "track(" -- src/features/kanban/api src/features/kanban/components/DeleteStageModal.tsx src/features/kanban/components/KanbanColumn.tsx
git diff --cached --name-only origin/develop -- src/lib/posthog.ts src/features/kanban/api package.json package-lock.json

# (AC-15) A 1줄(stageAnalytics.ts)과 M 5줄(위 목록)만 나와야 한다
git diff --cached --name-status origin/develop
git status --short

# (AC-16)
npm run typecheck
npm run build
npm run lint
```

- (AC-01) 속성 타입은 코드로 확인한다. 확인용으로 맵에 없는 속성을 넣거나 `card_detail_discarded`에 속성을 넣은 호출을 임시로 추가해 `npm run typecheck`가 실패하는지 봐도 되지만, 그 임시 코드는 커밋하지 않는다
- (AC-08, AC-12) `track(` 출력 줄이 `moveCardMutation.mutate`·`updateStageMutation.mutate`의 `onSuccess` 안에 있고, 카드 분기에는 출발 ≠ 도착 조건이 있는지 diff로 확인한다
- (AC-17) [manual]: 사용자가 확인한다. Vercel 프리뷰에서 확인하려면 Preview 환경변수가 `NEXT_PUBLIC_POSTHOG_KEY`·`NEXT_PUBLIC_POSTHOG_HOST` 이름으로 등록돼 있고 그 뒤에 배포된 프리뷰여야 한다. 그렇지 않으면 로컬 `npm run dev`(`.env.local`에 두 키 설정)에서 확인한다. 딥링크 카드 id는 `/kanban`에서 카드를 연 뒤 네트워크 탭의 `GET /api/v1/kanban/cards/{cardId}` 요청으로 확인할 수 있다. 10개 제한 확인은 단계를 10개까지 추가해야 한다
