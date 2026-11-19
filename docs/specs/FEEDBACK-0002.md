---
spec_id: FEEDBACK-0002
revision: 1
---

# FEEDBACK-0002 — 의견 보내기 실제 API 연동 (mock 교체·이미지 매직바이트 검사·이메일 규칙 서버 일치)

## 배경

- FEEDBACK-0001(`docs/specs/FEEDBACK-0001.md`, 구현 PR #246)은 API가 없어 mock으로 구현했다. 백엔드가 API를 배포했고 `docs/API_SPEC.md` v1.15(PR #248)에 반영됐다
  - 7.1 `POST /api/v1/feedback`: `multipart/form-data` **필드별 전송**(`type`·`content`·`email`·`image`), 인증 선택(만료 토큰도 401 없이 비로그인 건으로 201 접수), 성공 `201 { feedbackId }`, 에러 `FB001`~`FB009`
  - 7.1 프론트 표시 기준: `FB006`·`FB007`·`FB008`은 응답 `message`를 그대로 표시, 그 외 실패(`FB009` 포함)는 "의견 제출에 실패했어요. 다시 시도해 주세요."
  - 7.1 `email` 검증: 254자 이하, 정규식 `^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$`
  - 7.1 `image`: 확장자와 파일 첫 바이트(매직바이트)를 모두 검사. 11MB를 넘는 요청은 Nginx가 413 HTML을 줄 수 있으므로 프론트 10MB 검사 유지
  - 6.1 `GET /api/v1/users/me`: 응답은 `{ email: string | null }` 하나뿐. 서비스가 부여한 대체 이메일이면 `null`
  - Appendix `FeedbackType`: `BUG_REPORT` / `FEATURE_SUGGESTION` / `SERVICE_INQUIRY` / `ETC`
- 결정 (사용자, 2026-11-19)
  - mock 단계 없이 실제 API로 바로 연동한다
  - 횟수 제한(`FB009`)은 별도 문구 없이 일반 실패 문구로 표시한다 (PM 결정)
  - 이미지 형식 오류는 서버 응답을 기다리지 않고 고르는 시점에 막는다 — 확장자에 더해 매직바이트를 프론트에서도 검사한다 (PM 질문 "입력 당시부터 막는 방법" 반영)
- 지금 코드 (2026-11-19 develop `ab8517c` 기준)
  - `src/features/feedback/components/FeedbackModal.tsx`
    - 9행 `mockSubmitFeedback`·`mockUploadFeedbackImage` import. 이미지 선택 시 확장자 → 10MB 검사 후 `mockUploadFeedbackImage`(91~101행, `isUploading` 상태), 제출 시 `mockSubmitFeedback`(104~126행)
    - 17행 `EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/` — 서버 규칙보다 느슨해 프론트는 통과하고 서버가 `FB005`로 거절할 수 있다
    - 33행 이메일 자동 입력이 `useAuthStore`의 `user?.email`(1.1 로그인 응답)을 쓴다. 6.1에 따르면 이 값이 대체 이메일일 수 있다
    - 문의 유형 값이 프론트 내부 값(`'service_inquiry'` 등)이다
  - `src/features/feedback/types/feedback.ts`: `FeedbackCategory`(소문자 내부 값), `FEEDBACK_CATEGORY_LABELS`, `FeedbackSubmitPayload`
  - `src/features/feedback/mock/feedbackMock.ts`: mock 2개와 `MOCK_FAIL_KEYWORD`
  - `src/features/auth/api/authApi.ts` 32~36행 `fetchCurrentUser()`(6.1 호출, 지금 호출하는 곳 없음), `src/features/auth/type/auth.ts`의 `CurrentUserResponse { id; nickname; profileImage; email }` — 6.1 실제 응답과 다르다
  - `src/types/api.ts` 251행 `UserMe { id; nickname; profileImage; email; storageUsed; storageLimit; createdAt }` — 사용하는 곳이 없고 6.1 실제 응답과 다르다
  - `src/lib/api/api-client.ts`의 `apiFetch`: `FormData`면 `Content-Type`을 붙이지 않는다. 실패 응답은 `ApiClientError(status, code, message)`로 던진다. 401이면 토큰 재발급을 시도하고 실패 시 전역 로그인 모달을 띄운다
  - 참고 패턴: `src/features/documents/api/documentsApi.ts`(`FormData` 업로드), `src/features/documents/api/useDocumentMutations.ts`(`useMutation`), `src/features/kanban/api/useKanbanQuery.ts`(키 객체 + `useQuery` + `enabled`)

## 범위

**포함**

- 의견 제출을 실제 7.1 API로 바꾸고 mock 파일을 지운다
- 이미지 선택 시 매직바이트 검사 추가, 이미지 업로드 mock 제거(이미지는 제출 요청에 함께 보낸다)
- 이메일 검증 규칙을 서버와 같게 바꾼다
- 이메일 자동 입력을 6.1 `GET /users/me`의 `email`로 바꾼다
- 서버 에러 표시 기준(7.1) 적용
- 6.1 응답과 맞지 않는 타입(`CurrentUserResponse`, `UserMe`) 정리

**제외**

- 모달 레이아웃·문구·사이드바 진입점은 바꾸지 않는다 (FEEDBACK-0001 그대로)
- `authStore`의 `user.email`(로그인 응답 저장값)과 사이드바 프로필 표시는 바꾸지 않는다
- 토큰이 만료된 로그인 사용자의 제출을 토큰 재발급 후 보내도록 하는 처리는 하지 않는다 (서버가 비로그인 건으로 정상 접수하므로 기능상 실패가 없다)
- PostHog 이벤트 추적은 넣지 않는다

## 설계 결정

- BE 의존: 없음 (`docs/API_SPEC.md` v1.15 7.1·6.1 배포 완료)
- 타입 — `src/features/feedback/types/feedback.ts`를 다음으로 바꾼다
  - `export type FeedbackType = 'BUG_REPORT' | 'FEATURE_SUGGESTION' | 'SERVICE_INQUIRY' | 'ETC';` (Appendix `FeedbackType`). `FeedbackCategory`는 지운다
  - `export const FEEDBACK_TYPE_LABELS: Record<FeedbackType, string>` = 오류 제보 / 기능 개선 제안 / 서비스 이용 문의 / 기타, 이 순서로 선언한다. `FEEDBACK_CATEGORY_LABELS`는 지운다
  - `export interface FeedbackCreateRequest { type: FeedbackType; content: string; email: string | null; image: File | null; }`
  - `export interface FeedbackCreateResponse { feedbackId: number; }` (7.1 Response 201)
  - `FeedbackSubmitPayload`는 지운다
- API — 새 파일 `src/features/feedback/api/feedbackApi.ts`
  - 주석 `// 7.1 의견 제출 (POST /api/v1/feedback)` 아래 `export function submitFeedback(request: FeedbackCreateRequest): Promise<FeedbackCreateResponse>`
  - `FormData`에 `type`, `content`를 append하고, `email`이 `null`이 아니면 `email`, `image`가 `null`이 아니면 `image`를 append한다. `request` JSON 파트로 묶지 않는다(7.1)
  - `apiFetch<FeedbackCreateResponse>('/api/v1/feedback', { method: 'POST', body: formData })`
- 제출 훅 — 새 파일 `src/features/feedback/api/useFeedbackMutations.ts`
  - 주석 `// POST /api/v1/feedback — 의견 제출` 아래 `export function useSubmitFeedbackMutation()`이 `useMutation({ mutationFn: submitFeedback })`을 반환한다. 무효화할 쿼리는 없다
- 내 이메일 조회 훅 — 새 파일 `src/features/auth/hooks/useCurrentUserQuery.ts`
  - `export const userKeys = { me: () => ['users', 'me'] as const };`
  - 주석 `// GET /api/v1/users/me — 내 정보 조회(계정 이메일)` 아래 `export function useCurrentUserQuery(enabled: boolean)`이 `useQuery({ queryKey: userKeys.me(), queryFn: fetchCurrentUser, enabled })`를 반환한다
- 6.1 타입 정리
  - `src/features/auth/type/auth.ts`의 `CurrentUserResponse`를 `{ email: string | null }`로 바꾸고, 주석을 "6.1 내 정보 조회 응답 — 실제 응답은 email 하나, 대체 이메일이면 null"로 고친다
  - `src/features/auth/api/authApi.ts`의 `fetchCurrentUser` 위 주석 중 "1.1 응답엔 email이 없어서, 로그인 직후 이 API로 이메일을 보완한다."를 "의견 보내기 '서비스 이용 문의'의 이메일 자동 입력에 쓴다."로 바꾼다. 함수 본문은 그대로 둔다
  - `src/types/api.ts`의 `UserMe` 인터페이스(사용처 없음)를 지운다. 바로 위 `// 6. 사용자 (User)` 구분 주석 블록도 함께 지운다
- `FeedbackModal.tsx` 변경
  - mock import와 `isUploading` 상태, `mockUploadFeedbackImage` 호출을 지운다. `useAuthStore`의 `user?.email` 대신 아래 이메일 규칙을 쓴다
  - 문의 유형 값과 라벨은 `FeedbackType`·`FEEDBACK_TYPE_LABELS`로 바꾼다. `needsEmail = type === 'SERVICE_INQUIRY'`
  - **이메일 검증 규칙**: `const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;` `const EMAIL_MAX_LENGTH = 254;` 유효 조건은 `trim()`한 값이 254자 이하이고 정규식에 맞는 것. blur 시 표시·수정 시 해제 동작은 FEEDBACK-0001과 같다
  - **이메일 자동 입력**
    - 로그인 여부는 `useAuthStore`의 `isAuthenticated`로 판단한다
    - `useCurrentUserQuery(isAuthenticated && type === 'SERVICE_INQUIRY')`로 조회한다 ('서비스 이용 문의'를 처음 고를 때 조회가 시작되고, 그 뒤에는 캐시를 쓴다)
    - 이메일 입력 상태는 `emailInput: string | null`로 둔다. `null`은 "사용자가 아직 입력하지 않음"이다. 화면에 쓰는 값은 `const email = emailInput ?? currentUser?.email ?? '';`로 계산한다. 입력란 `onChange`에서 `setEmailInput(값)`을 한다 — 자동 입력값을 사용자가 고칠 수 있고, 조회가 늦게 끝나도 사용자가 이미 입력했으면 덮어쓰지 않는다. `useEffect`로 상태를 복사하지 않는다
    - 조회가 실패하거나 `email`이 `null`이거나 비로그인이면 빈 값으로 둔다. 조회 실패 시 토스트를 띄우지 않는다
  - **이미지 선택 검사** (고를 때, 이 순서로)
    1. 소문자 파일 이름이 `.png`·`.jpg`·`.jpeg`로 끝나지 않으면 error 토스트 "PNG, JPG 파일만 첨부할 수 있어요."
    2. 매직바이트: `await file.slice(0, 8).arrayBuffer()`로 앞 8바이트를 읽어 PNG(`89 50 4E 47 0D 0A 1A 0A`) 또는 JPEG(앞 3바이트 `FF D8 FF`)가 아니면 같은 error 토스트 "PNG, JPG 파일만 첨부할 수 있어요.". 읽기에 실패하면 error 토스트 "이미지 첨부에 실패했어요. 다시 시도해 주세요."
    3. `file.size > 10 * 1024 * 1024`이면 error 토스트 "10MB 이하의 이미지만 첨부할 수 있어요."
    4. 통과하면 첨부한다(업로드하지 않음). 매직바이트 판별은 `FeedbackModal.tsx` 안의 순수 함수(예: `hasImageSignature(bytes: Uint8Array): boolean`)로 둔다. 검사 중(`isCheckingImage`)에는 첨부 버튼과 '제출하기'를 비활성화한다
    5. 확장자는 맞지만 매직바이트가 다른 파일(확장자만 바꾼 WebP·HEIC·GIF 등)을 막는 이유를 한국어 주석으로 남긴다 (서버도 매직바이트로 `FB006` 거절)
  - **제출**: `useSubmitFeedbackMutation()`의 `mutateAsync({ type, content: content.trim(), email: needsEmail ? email.trim() : null, image })`
    - 성공: success 토스트 "의견이 정상적으로 접수되었어요." 후 모달을 닫는다 (기존과 같음)
    - 실패: `err instanceof ApiClientError`이고 `err.code`가 `FEEDBACK_IMAGE_ERROR_CODES`에 있으면 error 토스트로 `err.message`를 그대로 보여주고, 그 외 모든 실패(다른 코드·`FB009`·네트워크 오류·JSON이 아닌 응답)는 error 토스트 "의견 제출에 실패했어요. 다시 시도해 주세요."를 보여준다. 모달은 열어 두고 입력값·첨부 이미지를 유지한다
    - `const FEEDBACK_IMAGE_ERROR_CODES = new Set(['FB006', 'FB007', 'FB008', 'FEEDBACK_IMAGE_UNSUPPORTED_TYPE', 'FEEDBACK_IMAGE_SIZE_EXCEEDED', 'FEEDBACK_IMAGE_UPLOAD_FAILED']);` — 7.1 에러 표에 번호(`FB006`)와 이름(`FEEDBACK_IMAGE_…`)이 함께 적혀 있고 응답 `code`에 어느 쪽이 오는지 문서에 명시돼 있지 않아 둘 다 받는다. 이유를 한국어 주석으로 남긴다
    - 모달이 닫힌 뒤 응답이 와도 상태를 바꾸지 않는 기존 `isClosed` 처리는 유지한다
  - '제출하기' 활성 조건: 문의 유형 선택 && `content.trim()` 비어 있지 않음 && ('서비스 이용 문의'가 아니거나 이메일 유효) && 이미지 검사 중 아님 && 제출 중(`mutation.isPending`) 아님
- 삭제: `src/features/feedback/mock/feedbackMock.ts` (폴더째)

## 수용 기준

- AC-01 `src/features/feedback/types/feedback.ts`에 `FeedbackType`(4개 대문자 값), `FEEDBACK_TYPE_LABELS`, `FeedbackCreateRequest`, `FeedbackCreateResponse`가 있고 `src/` 아래에 `FeedbackCategory`·`FEEDBACK_CATEGORY_LABELS`·`FeedbackSubmitPayload` 문자열이 없다 (`docs/specs/`의 기존 명세는 변경 금지 경로라 검사 범위에서 제외)
- AC-02 `src/features/feedback/api/feedbackApi.ts`의 `submitFeedback`이 `FormData`에 `type`·`content`와 (값이 있을 때) `email`·`image`를 개별 필드로 넣어 `apiFetch`로 `POST /api/v1/feedback`을 호출하고, `request` 파트를 만들지 않는다
- AC-03 `src/features/feedback/api/useFeedbackMutations.ts`에 `useSubmitFeedbackMutation`이, `src/features/auth/hooks/useCurrentUserQuery.ts`에 `userKeys`와 `useCurrentUserQuery(enabled)`가 설계 결정대로 있다
- AC-04 `src/features/feedback/mock/`이 없고, `src/` 아래에 `mockSubmitFeedback`·`mockUploadFeedbackImage`·`MOCK_FAIL_KEYWORD` 문자열이 없다 (`docs/specs/`의 기존 명세는 변경 금지 경로라 검사 범위에서 제외)
- AC-05 `FeedbackModal.tsx`의 이메일 검증이 `^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$` 정규식과 254자 제한을 쓴다
- AC-06 `FeedbackModal.tsx`의 이메일 자동 입력은 `useCurrentUserQuery`의 `email`을 쓰고(`useAuthStore`의 `user?.email`을 쓰지 않음), `emailInput ?? currentUser?.email ?? ''` 방식으로 계산하며, 자동 입력을 위한 `useEffect`가 없다
- AC-07 이미지 선택 시 확장자 → 매직바이트(PNG 8바이트·JPEG 3바이트) → 10MB 순으로 검사하고, 통과한 파일은 업로드 없이 첨부 상태가 된다
- AC-08 제출 실패 시 `ApiClientError`의 `code`가 이미지 에러 코드 6개 중 하나면 `err.message`를, 그 외에는 "의견 제출에 실패했어요. 다시 시도해 주세요."를 error 토스트로 보내고 입력값을 유지한다
- AC-09 `CurrentUserResponse`가 `{ email: string | null }`이고, `src/types/api.ts`에 `UserMe`가 없다
- AC-10 변경 파일은 아래 9개뿐이다 — 수정 `src/features/feedback/components/FeedbackModal.tsx`, `src/features/feedback/types/feedback.ts`, `src/features/auth/type/auth.ts`, `src/features/auth/api/authApi.ts`, `src/types/api.ts` / 추가 `src/features/feedback/api/feedbackApi.ts`, `src/features/feedback/api/useFeedbackMutations.ts`, `src/features/auth/hooks/useCurrentUserQuery.ts` / 삭제 `src/features/feedback/mock/feedbackMock.ts`
- AC-11 `npm run typecheck`·`npm run build`·`npm run lint`가 통과한다
- AC-12 [manual] Vercel 프리뷰 또는 로컬 `npm run dev`의 `/jobs`에서 사이드바 "의견 보내기"로 모달을 열어 아래가 모두 맞다 (실제 운영 API로 접수되므로 내용 앞에 `[테스트]`를 붙인다. 10분에 5회 제한이 있다)
  - 로그인 상태에서 '서비스 이용 문의'를 고르면 계정 이메일이 채워진다(계정에 실제 이메일이 없으면 빈 칸). 비로그인이면 빈 칸이다
  - 이메일에 `user@example`이나 `a@b.c`를 입력하고 칸 밖을 누르면 "올바른 이메일 주소를 입력해 주세요."가 보이고 '제출하기'가 비활성이다
  - `.gif`를 `.png`로 이름만 바꾼 파일을 고르면 "PNG, JPG 파일만 첨부할 수 있어요." 토스트가 뜨고 첨부되지 않는다. 정상 PNG·JPG는 첨부되고 지울 수 있다. 10MB를 넘는 PNG는 "10MB 이하의 이미지만 첨부할 수 있어요."
  - 로그인·비로그인 각각 이미지 없이 1건, 이미지 포함 1건을 제출하면 "의견이 정상적으로 접수되었어요." 토스트가 뜨고 모달이 닫힌다. 브라우저 개발자 도구 Network에서 `POST /api/v1/feedback` 응답이 201이고 요청 본문에 `type`·`content`(·`email`·`image`)가 개별 필드로 들어 있다
  - 횟수 제한: 제한은 로그인 시 계정(userId)별, 비로그인 시 IP별로 따로 집계된다. **같은 계정 하나**(또는 **같은 비로그인 IP 하나**)에서 10분 안에 5건이 접수된 뒤 6번째로 제출하면, Network의 `POST /api/v1/feedback` 응답이 429이고 "의견 제출에 실패했어요. 다시 시도해 주세요." 토스트가 뜨며 모달이 열린 채 입력값·첨부 이미지가 남는다. 위 항목에서 같은 계정·IP로 이미 접수한 건수도 5건에 포함된다
  - 제출한 테스트 의견은 백엔드 담당자에게 정리를 요청한다

## 테스트 계획

구현 후 **커밋하기 전에** 아래를 실행하고 명령과 결과를 PR 본문에 남긴다. 변경 파일을 `git add`(삭제는 `git rm`) 한 뒤 실행한다.

```bash
# (AC-01) 앞의 4개는 각 1줄 이상, 마지막은 출력이 없어야 한다 (검사 범위는 src/)
git grep -n "export type FeedbackType" -- src/features/feedback/types/feedback.ts
git grep -n "FEEDBACK_TYPE_LABELS" -- src/features/feedback/types/feedback.ts
git grep -n "export interface FeedbackCreateRequest" -- src/features/feedback/types/feedback.ts
git grep -n "export interface FeedbackCreateResponse" -- src/features/feedback/types/feedback.ts
git grep -nE "FeedbackCategory|FEEDBACK_CATEGORY_LABELS|FeedbackSubmitPayload" -- src

# (AC-02) 각 1줄 이상 나와야 한다 / 마지막은 출력이 없어야 한다
git grep -n "/api/v1/feedback" -- src/features/feedback/api/feedbackApi.ts
git grep -n "new FormData" -- src/features/feedback/api/feedbackApi.ts
git grep -n "append('request'" -- src/features/feedback/api/feedbackApi.ts

# (AC-03) 각 1줄 이상 나와야 한다
git grep -n "export function useSubmitFeedbackMutation" -- src/features/feedback/api/useFeedbackMutations.ts
git grep -n "export function useCurrentUserQuery" -- src/features/auth/hooks/useCurrentUserQuery.ts

# (AC-04) 출력이 없어야 한다 (문자열 검사 범위는 src/)
git ls-files src/features/feedback/mock
git grep -nE "mockSubmitFeedback|mockUploadFeedbackImage|MOCK_FAIL_KEYWORD" -- src

# (AC-05) 1줄 이상 / (AC-06) 첫 줄은 1줄 이상, 둘째 줄은 출력이 없어야 한다
git grep -n "A-Za-z0-9._%+-" -- src/features/feedback/components/FeedbackModal.tsx
git grep -n "useCurrentUserQuery" -- src/features/feedback/components/FeedbackModal.tsx
git grep -n "user?.email" -- src/features/feedback/components/FeedbackModal.tsx

# (AC-08) 각 1줄 이상 나와야 한다
git grep -n "FEEDBACK_IMAGE_ERROR_CODES" -- src/features/feedback/components/FeedbackModal.tsx
git grep -n "ApiClientError" -- src/features/feedback/components/FeedbackModal.tsx

# (AC-09) 첫 줄은 1줄 이상, 둘째 줄은 출력이 없어야 한다
git grep -n "email: string | null" -- src/features/auth/type/auth.ts
git grep -n "interface UserMe" -- src/types/api.ts

# (AC-10) 아래 9줄만 나와야 한다 (순서 무관)
#   M src/features/auth/api/authApi.ts
#   A src/features/auth/hooks/useCurrentUserQuery.ts
#   M src/features/auth/type/auth.ts
#   A src/features/feedback/api/feedbackApi.ts
#   A src/features/feedback/api/useFeedbackMutations.ts
#   M src/features/feedback/components/FeedbackModal.tsx
#   D src/features/feedback/mock/feedbackMock.ts
#   M src/features/feedback/types/feedback.ts
#   M src/types/api.ts
git diff --cached --name-status origin/develop

# (AC-11)
npm run typecheck
npm run build
npm run lint
```

- (AC-06)~(AC-08)의 동작(자동 입력 계산·검사 순서·에러 분기)은 코드를 읽어 설계 결정과 대조한다
- (AC-12) [manual]: PR의 Vercel 프리뷰(또는 로컬 `npm run dev`의 `http://localhost:3000/jobs`)에서 사용자가 확인한다. 운영 API에 실제로 접수되므로 테스트 건수를 최소로 하고, 확장자만 바꾼 GIF와 10MB 초과 PNG는 사용자가 준비한다
