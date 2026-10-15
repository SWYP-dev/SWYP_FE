# AI Agent 운영 규칙 (shrimp-rules.md)

> 이 문서는 AI Agent(Coding Agent) 전용 규칙이다. 일반 개발 지식이나 프로젝트 기능 설명은 포함하지 않는다.
> `CLAUDE.md`, `.claude/rules/code-style.md`, `.claude/rules/git-rules.md`가 언어·브랜치·커밋의 원본 규칙이므로 여기서는 반복하지 않고, **코드 구조에서만 판단 가능한 AI 전용 규칙**만 다룬다.

## 1. Next.js 16 / React 19 — 학습 데이터와 다를 수 있음

- 이 저장소는 `next@16.2.10`, `react@19.2.4`를 사용한다. Next.js/React API를 사용하기 전 반드시 `node_modules/next/dist/docs/` 하위 문서(`01-app`, `02-pages`, `03-architecture`, `04-community`)를 확인한다.
- 학습 데이터 지식(예: 구버전 Next.js의 데이터 페칭·라우팅 API)을 그대로 적용하지 말고, deprecation 안내가 있으면 그것을 따른다.

## 2. 3계층 데이터 모델과 ID 혼동 금지

- `job_feed`(공유 원본, `FeedItem.id`) → `job_postings`(사용자 스크랩/등록 시 생성되는 영구 복사본, `jobPostingId`/`postingId`) → 칸반/마감일 뷰(동일 `job_postings` 렌더링) 순서다.
- **금지**: `KanbanCard.postingId`/`KanbanCardDetail.postingId`를 feed id로 취급하거나, feed detail 엔드포인트(`FeedDetail`)를 postingId로 재호출하는 코드 작성.
- `FeedItem.jobPostingId`는 스크랩 전에는 `null`, 스크랩 후(`isScrapped: true`)에만 값이 채워진다 — null 케이스를 항상 처리한다.
- `src/types/api.ts`를 수정할 때, 위 3계층 중 어떤 레이어의 타입인지 주석으로 구분하고 필드명이 레이어 간에 다른 이유(`id` vs `postingId` vs `jobPostingId`)를 함부로 통일하지 않는다.

## 3. API 명세서 vs 실제 응답 불일치 처리

- `docs/API_SPEC.md`와 `src/types/api.ts`가 다를 경우, `src/types/api.ts`에 이미 남겨진 `⚠️ [...]` 주석(예: `deadline: string | null` 관련, `InAppNotificationItem` 필드 개명 등)을 삭제하거나 "정리"하지 말고 유지한다 — 이는 문서-실제 응답 불일치를 추적하는 목적성 주석이다.
- 새로 필드 불일치를 발견하면 동일한 `⚠️ [확인 필요/반영 완료 — 이름, 날짜]` 형식으로 주석을 추가한다. 임의로 명세서 쪽을 신뢰해 타입을 고치지 않는다.
- Swagger 실측이 필요한 경우, `http://13.210.187.59/swagger-ui/index.html`은 raw IP라 `WebFetch`로 접근 불가 — 사용자에게 직접 확인을 요청한다.

## 4. Tailwind 커스텀 스케일 — 임의 값 사용 금지

- `src/styles/tokens.css`는 `build-tailwind-tokens.ts`가 `tokens.json`으로부터 **자동 생성**한 파일이다. `tokens.css`를 직접 수정하지 않는다. 값을 바꿔야 하면 `tokens.json`을 수정한 뒤 `npm run build:tokens`를 실행한다.
- spacing 스케일은 `N × 4px`가 아니다. 실제 매핑(2026-09 기준, `tokens.css` 기준으로 항상 재확인):
  `spacing-1=2px, -2=4px, -3=8px, -4=12px, -5=16px, -6=20px, -7=24px, -8=32px, -9=40px, -10=48px, -11=64px, -12=80px`
- 스케일에 없는 px 값(예: 56px, 36px, 14px)이 필요하면 `gap-N` 같은 임의 클래스명을 쓰지 말고 **arbitrary bracket 표기**(`gap-[56px]`, `px-[36px]`)를 사용한다. Tailwind v4는 스케일 외 숫자 유틸리티를 조용히 무시하므로, 화면에 반영 안 된 스타일이 있으면 이 문제부터 의심한다.
- Figma에서 확인한 패딩/사이즈/갭 값은 근사치로 반올림하지 말고 정확한 px로 반영하거나, 확인이 안 되면 질문한다.

## 5. `public/icons/` SVG — next/image로 색상 변경 불가

- `public/icons/*.svg`는 `stroke`/`fill`이 하드코딩되어 있어 `next/image`로 렌더링하면 색을 override할 수 없다.
- 아이콘 색상을 토큰에 맞춰 바꿔야 하는 경우, `src/components/ui/icons.tsx`(또는 `src/features/notification/components/icons.tsx`) 패턴을 따라 **인라인 SVG + `currentColor` 또는 `var(--color-*)`**로 새로 작성한다. `public/icons/`의 SVG 파일 자체를 수정해 프로젝트 전역에 영향을 주지 않는다.

## 6. 아이콘/타입 분기 렌더링 — 객체 매핑 사용

- 아이콘이나 타입별 분기 렌더링에서 `switch`문을 새로 추가하지 않는다. `Record<Type, ReactNode>` 형태의 객체 매핑을 사용한다 (`.claude/rules/code-style.md` 참조, 이 저장소에서는 `DocumentItem`의 `type: 'FILE' | 'LINK' | 'MEMO'` 유니온 분기 등에 적용 대상).

## 7. 인증/토큰 관련 코드 수정 시 준수 사항

- 토큰은 `src/lib/api/token.ts`가 `localStorage` 키 `chwihap_access_token`/`chwihap_refresh_token`으로 관리한다. 새 코드에서 다른 키 이름이나 저장 방식(sessionStorage, cookie 등)을 임의로 추가하지 않는다.
- `src/lib/api/api-client.ts`의 401 처리 흐름(리프레시 시도 → 실패 시 `clearTokens()` + `clearAuthUserOutsideReact()` + `queryClient.clear()` + `openLoginModalOutsideReact()` + `AuthRequiredError` throw)을 변경할 때는 호출부에서 `err instanceof AuthRequiredError`로 토스트를 건너뛰는 패턴이 깨지지 않는지 확인한다. 일반 `Error`로 되돌리지 않는다.
- `useAuthStore`(`src/features/auth/store/authStore.ts`)는 "화면 표시용 사용자 정보 + 로그인 여부"만 담당하고 accessToken/refreshToken을 저장하지 않는다. 토큰을 이 store에 넣지 않는다.
- React 컴포넌트 트리 밖(인터셉터 등)에서 상태를 조작해야 하면 `clearAuthUserOutsideReact()`/`openLoginModalOutsideReact()` 같은 `...OutsideReact` 네이밍 컨벤션을 따르는 별도 export 함수를 추가한다 (훅을 인터셉터에서 직접 호출하지 않음).
- `feature/auth-*` 브랜치로 격리해서 작업한다 (`.claude/rules/git-rules.md`).

## 8. 문서 첨부(Document) 관련 필드

- `DocumentItem`의 `LINK` 타입 `name` 필드는 사용자가 직접 입력하는 텍스트가 아니라 `AttachmentCategoryDropdown`의 `linkCategory` 드롭다운 선택값이 들어간다. 백엔드가 이 필드 제거를 제안하더라도 프론트에서 임의로 제거하지 않는다 — PM/백엔드 확인 후에만 변경.

## 9. 여러 파일 동시 수정이 필요한 경우

- `tokens.json` 수정 → 반드시 `npm run build:tokens` 실행 → `src/styles/tokens.css` 재생성 확인. 이 순서를 건너뛰고 `tokens.json`만 커밋하지 않는다. (`.github/workflows/build-tokens.yml`은 `chore/design-system` 브랜치 push에서만 자동 빌드하므로 다른 브랜치에서는 로컬에서 직접 빌드해야 한다.)
- 칸반 드래그 카드 마크업(`KanbanCardContent`)을 수정할 때는 실제 카드(`KanbanCard`)와 드래그 중 오버레이(`KanbanBoard`의 `DragOverlay`)가 같은 컴포넌트를 공유하므로, `src/features/kanban/components/KanbanCard.tsx`와 `src/features/kanban/components/KanbanBoard.tsx` 양쪽의 렌더링 결과가 어긋나지 않는지 함께 확인한다.
- `src/features/kanban/components/KanbanBoard.tsx`, `KanbanColumn.tsx`, `src/features/deadlines/components/DeadlineList.tsx`, `src/app/scraps/page.tsx`는 과거 반복적으로 머지 충돌이 발생한 파일이다 — `develop` 병합 전 diff를 꼼꼼히 확인한다.

## 10. 금지 사항 (Prohibited Actions)

- **금지**: `docs/PRD.md`/`docs/API_SPEC.md`/Figma 스펙에 없는 내용을 임의로 구현. 불확실하면 담당자(PM 이세은/디자이너 손진영/백엔드 김동섭·손세영) 확인 요청 메시지를 먼저 작성한다.
- **금지**: PRD 범위 밖 신규 기능을 스코프 변경 승인 없이 구현.
- **금지**: `tokens.css`, `tsconfig.tsbuildinfo`, `.next/` 등 자동 생성 파일을 손으로 직접 편집.
- **금지**: `public/icons/`의 원본 SVG 파일 stroke/fill 하드코딩 값을 직접 고쳐서 전역에 영향 주는 방식으로 색상 문제 해결.
- **금지**: `.env` 계열 파일 커밋 (public 레포이므로 특히 주의).
- **금지**: GitHub `/pull/create` 라우트가 500 에러를 반환한다고 해서 자동으로 로컬 병합(`git merge` + `git push`)을 임의 실행 — 이는 사용자가 명시적으로 우회 방법을 요청했을 때만 수행 가능한 예외 처리이며, 매번 사용자에게 알리고 진행한다.
