# code-style.md

이 저장소에서 코드를 작성할 때 따르는 컨벤션입니다. 실제 코드(`src/`)에서 읽은 관행을 기준으로 합니다.

## 언어

- **변수명/함수명/컴포넌트명**: 영어
- **코드 주석**: 한국어. "무엇을"보다 "왜"를 적는다 (QA 반영으로 바꾼 코드는 이유를 남긴다. 예: `src/lib/api/api-client.ts`의 `AuthRequiredError`)
- **커밋 메시지**: 한국어 (`.claude/rules/git-rules.md` 참조)

## 포맷

- Prettier(`.prettierrc`): 들여쓰기 2칸, 작은따옴표, 세미콜론, `printWidth` 100, `trailingComma: es5`
- 확인: `npm run format:check`

## 폴더 구조

| 위치                                           | 내용                                                                                                          |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `src/app/`                                     | 라우트(`page.tsx`, `layout.tsx`). 여러 폴더에 `page.tsx`가 있는 것은 App Router 컨벤션                        |
| `src/features/<기능>/api/`                     | API 호출 함수 `<기능>Api.ts`, React Query 훅 `use<기능>Query.ts`·`use<기능>Mutations.ts`                      |
| `src/features/<기능>/components/`              | 기능 전용 컴포넌트                                                                                            |
| `src/features/<기능>/store/`                   | Zustand 스토어                                                                                                |
| `src/features/<기능>/types/`                   | 기능 타입 (`types/<이름>.ts` 또는 `types.ts`). 새로 만들 때는 `types/`를 쓴다 (`auth/type/`는 예외로 남은 것) |
| `src/features/<기능>/utils/`, `data/`, `mock/` | 순수 함수, 정적 데이터, 목데이터                                                                              |
| `src/components/ui/`                           | 기능 공용 UI (`button`, `modal`, `dropdown-menu` 등)                                                          |
| `src/components/layout/`                       | 헤더·사이드바                                                                                                 |
| `src/lib/api/`                                 | `apiFetch`(공통 요청·토큰 재발급), `query-client`, 토큰 저장소                                                |
| `src/lib/hooks/`, `src/lib/utils/`             | 기능 공용 훅·유틸                                                                                             |
| `src/types/`                                   | 공통 타입 (`ApiResponse` 등)                                                                                  |

## 파일·네이밍

- 기능 컴포넌트: PascalCase 파일명 (`KanbanBoard.tsx`)
- 공용 UI·레이아웃: kebab-case 파일명 (`dropdown-menu.tsx`), 컴포넌트 이름은 PascalCase
- 훅: `useXxx.ts`, 스토어: `useXxxStore`, 유틸·API: camelCase 파일명
- 상수 매핑: UPPER_SNAKE_CASE (`VARIANT_CLASS`, `JOB_CATEGORY_LABELS`)
- id 값에 `&` 등 특수문자를 쓰지 않는다 (라우팅/쿼리 파싱 이슈 방지)

## 컴포넌트·데이터 패턴

- 인증 토큰이 localStorage에 있어서 사용자 데이터는 **클라이언트에서 React Query로** 조회한다. 그래서 데이터 페이지(`jobs`, `kanban`, `deadlines`, `scraps`, `settings`)는 `'use client'`다
- 정적 페이지(`privacy`, `terms`)처럼 상태·브라우저 API가 필요 없는 곳은 Server Component로 둔다. `'use client'`는 필요할 때만 붙인다
- 상태 구분: 서버 상태는 React Query, 페이지를 넘어 유지할 클라이언트 상태는 Zustand, 컴포넌트 안 UI 상태는 `useState`
- API 호출은 `src/lib/api/api-client.ts`의 `apiFetch`를 거친다 (401 → 토큰 재발급 → 로그인 모달 처리가 여기 있다). 컴포넌트에서 `fetch`를 직접 부르지 않는다
- 쿼리 키는 기능별 키 객체로 만든다 (`kanbanKeys.board()`, `kanbanKeys.cardDetail(id)`). 무효화도 이 객체를 쓴다
- API 훅 위에는 대응하는 엔드포인트를 주석으로 적는다 (`// GET /api/v1/kanban — 보드 전체 조회`)

## 중복 제거

- 여러 기능에서 반복되는 UI는 `src/components/ui/`로 옮긴다 (예: `job-card`, `modal`)
- 같은 로직을 여러 곳에 복붙하지 않는다. 기능 공용이면 `src/lib/`, 기능 내부면 해당 feature의 `utils/`

## 타입별 분기 렌더링

- 타입별 클래스·아이콘·라벨 분기는 `switch`문 대신 **`Record` 객체 매핑**을 쓴다 (`src/components/ui/button.tsx`, `badge.tsx` 참고)

```ts
const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: '...',
  secondary: '...',
};
```

## 스타일

- Tailwind CSS v4 + 디자인 토큰(`src/styles/tokens.css`, `tokens.json`에서 생성). `tokens.css`는 직접 고치지 않는다
- spacing은 닫힌 스케일이다. 토큰에 없는 값(`gap-14`, `px-9` 등)은 조용히 무시되므로 `gap-[56px]`처럼 대괄호로 쓴다. 토큰 실제 px 값은 `tokens.css`에서 확인한다
- 색상을 바꿔야 하는 아이콘은 인라인 SVG + `currentColor`로 만든다 (`public/icons/`의 SVG는 색이 고정되어 있다)
- 레이어: 모달은 `z-[60]`, Popover·DropdownMenu는 `z-50`이다. 모달 안에 드롭다운을 띄울 때 z-index 충돌에 주의한다
- Figma 값(패딩·크기·간격)은 근사하지 않고 그대로 쓴다

## 메모이제이션

- React Compiler는 **켜져 있지 않다** (`next.config.ts`). `memo`·`useMemo`·`useCallback`은 실제로 필요한 곳(무거운 계산, 참조 안정성이 필요한 의존성)에만 쓴다

## 타입

- TypeScript strict mode. `any`를 쓰지 않는다
- API 응답 타입은 `docs/API_SPEC.md`와 일치시킨다. 명세에 없는 필드를 추측해서 넣지 않는다

## 보안

- `.env*` 파일은 커밋하지 않는다 (Public 레포)
- 브라우저에 노출되는 `NEXT_PUBLIC_*` 값과 서버 전용 시크릿을 구분한다. `NEXT_PUBLIC_*`에는 비밀값을 넣지 않는다
