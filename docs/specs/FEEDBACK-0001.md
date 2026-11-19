---
spec_id: FEEDBACK-0001
revision: 0
---

# FEEDBACK-0001 — 의견 보내기 (사이드바 진입점 + 의견 작성 모달, BE 의존 mock)

## 배경

- 사용자가 오류 제보·기능 개선 제안·서비스 이용 문의를 서비스 안에서 바로 보낼 수 있게 한다. 지금은 의견을 받을 창구가 없다
- 근거 1 — 기능 명세(사용자 전달, 2026-11-19). 요지:
  - 서비스 내 '의견 보내기' 버튼을 누르면 페이지 이동 없이 현재 화면 위에 모달이 뜬다
  - 문의 유형: 오류 제보 / 기능 개선 제안 / 서비스 이용 문의 / 기타. 기본 선택값 없음
  - 문의 내용 필수. 이미지 첨부는 선택이며 PNG, JPG(JPEG) 최대 1장, 10MB 이하. 삭제 아이콘으로 지울 수 있다
  - '서비스 이용 문의'를 골랐을 때만 이메일 입력란이 보이고, 이때 이메일은 필수다. 로그인 사용자의 계정 이메일이 있으면 자동으로 채우고, 사용자가 고칠 수 있다. 계정 이메일이 없거나 비로그인이면 비워 둔다
  - 이메일 형식 검증은 입력창에서 벗어날 때 한다. 틀리면 "올바른 이메일 주소를 입력해 주세요."를 보이고, 고치면 사라진다
  - '제출하기'는 문의 유형 선택 + 문의 내용 입력 + (서비스 이용 문의일 때) 올바른 이메일이 모두 충족될 때만 활성화된다
  - 성공 시 "의견이 정상적으로 접수되었어요." 토스트. 실패 메시지: "PNG, JPG 파일만 첨부할 수 있어요.", "10MB 이하의 이미지만 첨부할 수 있어요.", "이미지 첨부에 실패했어요. 다시 시도해 주세요.", "의견 제출에 실패했어요. 다시 시도해 주세요."(작성 내용 유지)
  - X 버튼이나 모달 밖을 누르면 확인 안내 없이 닫히고, 작성 내용과 첨부 이미지는 저장되지 않는다
  - 로그인 여부와 관계없이 모든 사용자가 제출할 수 있다
- 근거 2 — Figma 시안: 파일 `KtOE0i3Abvhi872dWV1rQs`(스위프 프로젝트 복사본) 페이지 "의견 보내기 초안"(node `40123:58340`)
  - 섹션 "의견 보내기 모달": 기본 / 서비스 이용 문의 작성 완료 / 이메일 형식 오류 / 오류 제보 선택(이메일 칸 없음) 4개 상태와 토스트(성공·실패)
  - 섹션 "의견 보내기 진입 위치": 사이드바 하단, 프로필(로그인) 또는 '회원가입/로그인' 버튼(비로그인) 바로 위에 메뉴 항목 모양의 "의견 보내기"
  - 디자이너 검토 전 초안이다(사용자가 이 시안으로 진행하기로 결정, 2026-11-19)
- 근거 3 — `docs/API_SPEC.md`에는 의견 제출·이미지 업로드 엔드포인트가 없다. 계정 이메일은 로그인 응답(1.1)의 `user.email`이 `useAuthStore`(`src/features/auth/store/authStore.ts`)의 `user.email`로 이미 저장돼 있다
- 지금 코드 (2026-11-19 develop `a3742da` 기준)
  - `src/components/layout/sidebar.tsx`: 로고 → `nav`(NAV_ITEMS 4개, 항목 클래스 `flex h-9 w-full items-center gap-3 rounded-xl border px-5 py-4`, 비활성 `border-transparent text-label-body hover:border-line-secondary hover:bg-neutral-100 hover:text-label-base`) → 하단 `div.flex w-full flex-col items-start px-6 py-5`(로그인 시 `ProfileMenu`, 비로그인 시 '회원가입/로그인' 버튼)
  - 폼 모달 참고 구현: `src/features/kanban/components/AddCardModal.tsx` (오버레이 `fixed inset-0 z-50` + `bg-base-dimmed` 클릭 시 닫기, 컨테이너 `relative flex w-[394px] flex-col gap-7 rounded-[20px] bg-base-white py-7 shadow-spread-small`, 제목 `text-7 font-semibold`, 필드 영역 `px-8 gap-6`, 라벨 `text-3 font-semibold` + `*` `text-3 font-bold text-status-negative`, `INPUT_CLASS`, 에러 `text-1 font-medium text-status-negative`, 하단 `Button variant="primary" size="lg" className="w-full"`)
  - 글자 수 카운터 참고 구현: `src/features/kanban/components/CardDetailDrawer.tsx`의 메모 `textarea`(`maxLength={1000}`, 입력이 있을 때만 `n / 1000` 표시)
  - 재사용할 컴포넌트: `Button`(`src/components/ui/button.tsx`), `Toast`(`src/components/ui/toast.tsx`, `type: 'success' | 'error'`), `AttachedFileItem`(`src/features/documents/components/AttachedFileItem.tsx`), `CloseIcon`·`AttachIcon`·`EditIcon`(`src/components/ui/icons.tsx`), `useEscapeKey`(`src/lib/hooks/useEscapeKey.ts`)

## 범위

**포함**

- 사이드바(`Sidebar`) 하단에 "의견 보내기" 진입 버튼 추가 (로그인·비로그인 모두)
- 의견 보내기 모달 신규: 문의 유형 2×2 선택, 문의 내용, 이미지 1장 첨부·삭제, 서비스 이용 문의 시 이메일(자동 입력·blur 검증), 제출
- 이미지 업로드·의견 제출은 mock 함수로 처리하고, 결과를 토스트로 알린다

**제외**

- 실제 API 연동 (BE 미구현. 엔드포인트·요청 필드가 정해지면 별도 명세로 mock을 교체한다)
- 설정 페이지 사이드바(`src/components/layout/settings-sidebar.tsx`)에는 진입점을 넣지 않는다 (시안에 없음)
- PostHog 이벤트 추적은 넣지 않는다
- 관리자 확인 화면(접수 내역 조회)은 프론트 범위가 아니다
- 이미지 미리보기 썸네일은 만들지 않는다 (시안은 파일 행 `AttachedFileItem` 형태)

## 설계 결정

- BE 의존 — 의견 제출·이미지 업로드 API가 `docs/API_SPEC.md`에 없다. `src/features/feedback/mock/feedbackMock.ts`의 mock 함수로 구현하고, 엔드포인트·필드를 추측해 `apiFetch` 호출을 만들지 않는다. PR 본문 "백엔드 관련" 칸에 "의견 제출·이미지 업로드 API 필요 — BE 담당자 확인 필요"를 적는다
- 새 파일
  - `src/features/feedback/types/feedback.ts`
    - `export type FeedbackCategory = 'bug_report' | 'feature_suggestion' | 'service_inquiry' | 'other';` (프론트 내부 값. API 값이 정해지면 매핑한다)
    - `export const FEEDBACK_CATEGORY_LABELS: Record<FeedbackCategory, string>` = 오류 제보 / 기능 개선 제안 / 서비스 이용 문의 / 기타, 이 순서로 선언한다
    - `export interface FeedbackSubmitPayload { category: FeedbackCategory; content: string; email: string | null; imageFileName: string | null; }`
  - `src/features/feedback/mock/feedbackMock.ts`
    - `export const MOCK_FAIL_KEYWORD = 'mock-fail';` — 실패 경로를 손으로 확인하기 위한 mock 전용 장치임을 주석으로 남긴다
    - `export async function mockUploadFeedbackImage(file: File): Promise<void>` — 600ms 뒤 resolve. `file.name`에 `MOCK_FAIL_KEYWORD`가 들어 있으면 reject
    - `export async function mockSubmitFeedback(payload: FeedbackSubmitPayload): Promise<void>` — 600ms 뒤 resolve. `payload.content`에 `MOCK_FAIL_KEYWORD`가 들어 있으면 reject
  - `src/features/feedback/components/FeedbackModal.tsx`
    - props: `{ onClose: () => void; onShowToast: (type: 'success' | 'error', message: string) => void }`. 열림 여부 prop은 두지 않는다 — 사이드바가 열렸을 때만 렌더링하므로 닫으면 상태가 모두 사라진다(작성 내용·첨부 이미지 미저장 요구사항)
- 모달 레이아웃 (Figma `40123:58340`, 클래스는 `AddCardModal`과 같은 값을 쓴다)
  - 오버레이: `fixed inset-0 z-50 flex items-center justify-center`, 뒤 배경 `absolute inset-0 bg-base-dimmed` 클릭 시 `onClose`. `useEscapeKey(true, onClose)`로 ESC도 닫는다(기존 모달과 동일)
  - 컨테이너: `relative flex w-[394px] flex-col gap-7 rounded-[20px] bg-base-white py-7 shadow-spread-small`
  - 헤더: `px-8`, 제목 "의견 보내기" `text-7 font-semibold text-label-base`, 오른쪽 `CloseIcon size={24}` 버튼(`aria-label="닫기"`)
  - 필드 영역: `flex flex-col gap-6 px-8`, 각 필드는 `flex flex-col gap-3`, 라벨 행은 `flex items-center gap-2`
  - 필수 라벨: `text-3 font-semibold text-label-base` + `*`(`text-3 font-bold text-status-negative`). 선택 라벨 옆 "(선택)"은 `text-3 font-medium text-label-caption`
  - 하단: `px-8` 안에 `Button variant="primary" size="lg" className="w-full"`, 문구 "제출하기"(기능 명세의 버튼 이름)
- 필드
  1. 문의 유형 (필수, 라벨 "문의 유형"): `grid grid-cols-2 gap-3`(8px) 안에 4개 `Button size="md" type="button" className="w-full"`. 선택된 항목은 `variant="outline"`, 나머지는 `variant="secondary"`, `aria-pressed`로 선택 여부를 표시한다. 초기 선택 없음(`null`). 같은 항목을 다시 눌러도 선택은 유지된다
  2. 문의 내용 (필수, 라벨 "내용"): `textarea`, placeholder "의견을 자유롭게 작성해 주세요.", `maxLength={1000}`, 클래스는 `CardDetailDrawer` 메모 `textarea`와 같은 규칙(`h-[156px] w-full resize-none rounded-xl border-2 p-5 text-4 leading-[1.6] text-label-base outline-none placeholder:text-label-placeholder`, 포커스 시 `border-line-primary bg-base-white`, 값 있음 `border-line-secondary bg-neutral-100`, 빈 값 `border-line-secondary bg-base-white`). 입력이 있으면 아래에 `n / 1000` 카운터(메모와 같은 마크업). 공백만 입력한 경우는 미입력으로 본다(`trim()`)
  3. 이미지 (선택, 라벨 "이미지" + "(선택)")
     - 첨부 전: `Button variant="secondary" size="md" type="button"` 안에 `AttachIcon size={16}`과 "이미지 첨부". 누르면 숨긴 `input type="file"`(`accept=".png,.jpg,.jpeg"`)을 연다
     - 고른 파일 검증 순서: 파일 이름을 소문자로 바꿔 `.png`·`.jpg`·`.jpeg`로 끝나지 않으면 error 토스트 "PNG, JPG 파일만 첨부할 수 있어요." → `file.size > 10 * 1024 * 1024`이면 error 토스트 "10MB 이하의 이미지만 첨부할 수 있어요." → 통과하면 `mockUploadFeedbackImage(file)` 호출. 실패하면 error 토스트 "이미지 첨부에 실패했어요. 다시 시도해 주세요."이고 첨부하지 않는다. 업로드 중에는 첨부 버튼과 '제출하기'를 비활성화한다
     - 첨부 후: 첨부 버튼 대신 `AttachedFileItem`(`name`=파일 이름, `size`=바이트, `onDelete`=첨부 해제)을 보여준다. 1장만 허용하므로 첨부 중에는 첨부 버튼을 렌더링하지 않는다. 같은 파일을 지운 뒤 다시 고를 수 있도록 선택 후 `input.value`를 비운다
     - 안내 문구(항상 표시): "PNG, JPG 파일 1장, 10MB 이하로 첨부할 수 있어요." `text-1 font-medium text-label-caption`
  4. 이메일 (필수, '서비스 이용 문의'일 때만 렌더링, 라벨 "답변 받을 이메일")
     - `input type="email"`, 클래스는 `AddCardModal`의 `INPUT_CLASS`와 같은 값, 테두리는 오류 시 `border-status-negative`, 아니면 `border-line-secondary`, placeholder "이메일을 입력해 주세요."
     - 자동 입력: 문의 유형이 '서비스 이용 문의'로 바뀌는 시점에 이메일 값이 빈 문자열이고 `useAuthStore`의 `user?.email`이 있으면 그 값을 넣는다. 그 외에는 비워 둔다. 사용자가 고칠 수 있다. 다른 유형으로 바꿨다가 돌아와도 입력한 값은 유지한다
     - 검증 규칙: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`를 `trim()`한 값에 적용한다
     - 오류 표시: `onBlur`에서 검증해 틀리면 오류 상태로 바꾼다. 오류 상태에서는 입력할 때마다 다시 검증해 맞으면 즉시 오류를 지운다. 오류 상태면 아래에 "올바른 이메일 주소를 입력해 주세요."(`text-1 font-medium text-status-negative`), 아니면 안내 문구 "답변은 입력한 이메일로 보내드려요."(`text-1 font-medium text-label-caption`)를 보인다
- '제출하기' 활성 조건: 문의 유형 선택 && `content.trim()` 비어 있지 않음 && ('서비스 이용 문의'가 아니거나 이메일이 검증 규칙을 통과) && 업로드 중 아님 && 제출 중 아님. 이메일 형식은 blur 전이어도 버튼 활성 판단에 쓴다(명세: 형식이 올바르지 않으면 비활성)
- 제출: `mockSubmitFeedback({ category, content: content.trim(), email: '서비스 이용 문의'면 trim한 이메일 아니면 null, imageFileName: 첨부 파일 이름 또는 null })`
  - 성공: `onShowToast('success', '의견이 정상적으로 접수되었어요.')` 후 `onClose()`
  - 실패: `onShowToast('error', '의견 제출에 실패했어요. 다시 시도해 주세요.')`, 모달은 열어 두고 입력값·첨부 이미지를 그대로 유지한다
- 사이드바 (`src/components/layout/sidebar.tsx`)
  - 하단 영역을 `flex w-full flex-col` 래퍼로 감싸고, 기존 하단 `div`(`px-6 py-5`, 프로필/로그인 버튼) **바로 위**에 `div.w-full px-6` 안의 진입 버튼을 둔다
  - 진입 버튼: `button type="button"`, 클래스는 NAV_ITEMS의 비활성 항목 클래스와 같다(`flex h-9 w-full items-center gap-3 rounded-xl border border-transparent px-5 py-4 text-label-body transition-colors hover:border-line-secondary hover:bg-neutral-100 hover:text-label-base`), 안에 `EditIcon size={16}`(시안의 임시 아이콘)과 `span.flex-1 truncate text-left text-3 font-medium` "의견 보내기"
  - `isAuthenticated`와 관계없이 항상 렌더링한다
  - 상태: `isFeedbackOpen`(boolean), 토스트 상태 `{ type: 'success' | 'error'; message: string } | null`. `{isFeedbackOpen && <FeedbackModal ... />}`로 렌더링하고, 토스트는 사이드바에서 `Toast`로 렌더링한다(모달이 닫힌 뒤에도 성공 토스트가 보여야 하므로)

## 수용 기준

- AC-01 `src/features/feedback/types/feedback.ts`에 `FeedbackCategory`(4개 값), `FEEDBACK_CATEGORY_LABELS`(오류 제보·기능 개선 제안·서비스 이용 문의·기타 순서), `FeedbackSubmitPayload`가 설계 결정대로 정의돼 있다
- AC-02 `src/features/feedback/mock/feedbackMock.ts`에 `MOCK_FAIL_KEYWORD`, `mockUploadFeedbackImage`, `mockSubmitFeedback`이 있고, 두 함수는 `MOCK_FAIL_KEYWORD` 포함 시 reject, 아니면 resolve한다. `src/features/feedback/` 아래에 `apiFetch`·`fetch(` 호출이 없다
- AC-03 `FeedbackModal`의 문의 유형은 `grid-cols-2` 그리드에 4개 버튼으로 렌더링되고, 선택된 항목만 `variant="outline"`이며 초기 선택값은 없다
- AC-04 이메일 입력란은 문의 유형이 '서비스 이용 문의'일 때만 렌더링되고, 그 유형으로 바뀔 때 빈 값이면 `useAuthStore`의 `user?.email`로 채운다
- AC-05 이메일 오류 문구 "올바른 이메일 주소를 입력해 주세요."는 `onBlur` 검증 실패 후에만 나타나고, 오류 상태에서 올바른 값으로 고치면 사라진다
- AC-06 '제출하기' 버튼의 `disabled`는 설계 결정의 활성 조건을 그대로 따른다 (유형 미선택·내용 공백·서비스 이용 문의에서 이메일 형식 불일치·업로드 중·제출 중이면 비활성)
- AC-07 이미지 선택 시 형식 → 용량 → mock 업로드 순으로 검사하고, 각 실패에 기능 명세의 error 토스트 문구 3종을 보낸다. 첨부 성공 시 `AttachedFileItem`이 보이고 첨부 버튼은 렌더링되지 않으며, 삭제하면 다시 첨부 버튼이 보인다
- AC-08 제출 성공 시 success 토스트 "의견이 정상적으로 접수되었어요."를 보내고 모달을 닫는다. 실패 시 error 토스트 "의견 제출에 실패했어요. 다시 시도해 주세요."를 보내고 입력값을 유지한다
- AC-09 `Sidebar`는 하단 프로필/로그인 영역 바로 위에 "의견 보내기" 버튼을 로그인 여부와 관계없이 렌더링하고, `isFeedbackOpen`이 true일 때만 `FeedbackModal`을 렌더링한다
- AC-10 변경 파일은 `src/components/layout/sidebar.tsx`(수정)와 `src/features/feedback/` 아래 새 파일 3개(`types/feedback.ts`, `mock/feedbackMock.ts`, `components/FeedbackModal.tsx`)뿐이다
- AC-11 `npm run typecheck`·`npm run build`·`npm run lint`가 통과한다
- AC-12 [manual] Vercel 프리뷰 또는 로컬 `npm run dev`의 `/jobs`에서 로그인한 상태와 로그아웃한 상태 각각 아래가 모두 맞다
  - 사이드바 하단 프로필(로그인) / '회원가입/로그인' 버튼(비로그인) 바로 위에 "의견 보내기"가 보이고, 누르면 페이지 이동 없이 현재 화면 위에 딤과 모달이 뜬다
  - 처음 열면 문의 유형이 2×2로 같은 폭이며 아무것도 선택되지 않았고 '제출하기'가 비활성이다
  - '서비스 이용 문의'를 누르면 이메일 칸이 나타난다. 로그인 상태면 계정 이메일이 채워져 있고, 비로그인이면 비어 있다. '오류 제보'로 바꾸면 이메일 칸이 사라진다
  - 이메일에 `user@example`을 입력하고 칸 밖을 누르면 빨간 테두리와 "올바른 이메일 주소를 입력해 주세요."가 보이고, `user@example.com`으로 고치면 바로 사라진다
  - `.gif` 등 다른 형식, 10MB를 넘는 PNG, 이름에 `mock-fail`이 들어간 PNG를 각각 고르면 해당 error 토스트가 뜨고 첨부되지 않는다. 정상 PNG/JPG를 고르면 파일 행이 보이고 휴지통 아이콘으로 지울 수 있다
  - 필수 항목을 채우고 '제출하기'를 누르면 모달이 닫히고 "의견이 정상적으로 접수되었어요." 토스트가 뜬다. 내용에 `mock-fail`을 넣고 제출하면 "의견 제출에 실패했어요. 다시 시도해 주세요." 토스트가 뜨고 입력값이 그대로 남는다
  - 작성 중 X, 모달 바깥 딤, ESC로 닫은 뒤 다시 열면 모든 입력과 첨부가 비어 있다
  - 지원 현황(`/kanban`) 등 다른 메뉴에서도 같은 위치에서 같은 모달이 열린다

## 테스트 계획

구현 후 **커밋하기 전에** 아래를 실행하고 명령과 결과를 PR 본문에 남긴다. 변경 파일을 `git add` 한 뒤 실행한다.

```bash
# (AC-01) 각 1줄 이상 나와야 한다
git grep -n "export type FeedbackCategory" -- src/features/feedback/types/feedback.ts
git grep -n "FEEDBACK_CATEGORY_LABELS" -- src/features/feedback/types/feedback.ts
git grep -n "export interface FeedbackSubmitPayload" -- src/features/feedback/types/feedback.ts

# (AC-02) 앞의 3개는 각 1줄 이상, 마지막은 출력이 없어야 한다
git grep -n "MOCK_FAIL_KEYWORD" -- src/features/feedback/mock/feedbackMock.ts
git grep -n "export async function mockUploadFeedbackImage" -- src/features/feedback/mock/feedbackMock.ts
git grep -n "export async function mockSubmitFeedback" -- src/features/feedback/mock/feedbackMock.ts
git grep -nE "apiFetch|fetch\(" -- src/features/feedback/

# (AC-03)~(AC-08) 각 1줄 이상 나와야 한다
git grep -n "grid-cols-2" -- src/features/feedback/components/FeedbackModal.tsx
git grep -n "올바른 이메일 주소를 입력해 주세요." -- src/features/feedback/components/FeedbackModal.tsx
git grep -n "PNG, JPG 파일만 첨부할 수 있어요." -- src/features/feedback/components/FeedbackModal.tsx
git grep -n "10MB 이하의 이미지만 첨부할 수 있어요." -- src/features/feedback/components/FeedbackModal.tsx
git grep -n "이미지 첨부에 실패했어요. 다시 시도해 주세요." -- src/features/feedback/components/FeedbackModal.tsx
git grep -n "의견이 정상적으로 접수되었어요." -- src/features/feedback/components/FeedbackModal.tsx
git grep -n "의견 제출에 실패했어요. 다시 시도해 주세요." -- src/features/feedback/components/FeedbackModal.tsx

# (AC-09) 각 1줄 이상 나와야 한다
git grep -n "의견 보내기" -- src/components/layout/sidebar.tsx
git grep -n "FeedbackModal" -- src/components/layout/sidebar.tsx

# (AC-10) 아래 4줄만 나와야 한다
#   M<탭>src/components/layout/sidebar.tsx
#   A<탭>src/features/feedback/components/FeedbackModal.tsx
#   A<탭>src/features/feedback/mock/feedbackMock.ts
#   A<탭>src/features/feedback/types/feedback.ts
git diff --cached --name-status origin/develop

# (AC-11)
npm run typecheck
npm run build
npm run lint
```

- (AC-03)~(AC-08)의 동작(조건 분기·검증 순서·상태 유지)은 코드를 읽어 설계 결정과 대조한다
- (AC-12) [manual]: PR의 Vercel 프리뷰(또는 로컬 `npm run dev`의 `http://localhost:3000/jobs`)에서 사용자가 확인한다. 10MB 초과 테스트 이미지는 사용자가 준비한다. mock이라 실제 서버로 전송되지 않는다
