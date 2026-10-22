@AGENTS.md

# SWYP 프로젝트 가이드

## 📌 주요 프로젝트 문서 (참조하면서 활용)

작업 중 세부 비즈니스 로직이나 명세가 필요한 경우 아래 문서를 찾아 읽고 참고하세요:

- **PRD 문서**: `docs/PRD.md`
- **API 명세서**: `docs/API_SPEC.md`
- **Claude·Codex 협업 설계**: `docs/workflow/claude-codex-plan.md`
- **단위 명세**: `docs/specs/<SPEC_ID>.md` (템플릿 `docs/ai/spec-template.md`)

## 🛠️ 개발 및 코드 규칙

- **Framework**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4
- **패키지 매니저**: `npm`
- **구조**: 단일 앱(루트 `src/`). 백엔드는 별도 레포(`https://api.chwihap.com`)이며 이 레포에는 없다
- **명령어**: `npm run dev`, `npm run build`, `npm run typecheck`, `npm run lint`, `npm run format:check`
- **CI 필수 체크**: `pr-gate` (typecheck·build 포함). lint는 기존 오류 정리 전까지 현황 표시만 한다 (`docs/workflow/claude-codex-plan.md` 진행 표)
- **쓰지 않는 라이브러리**: 이 프로젝트는 shadcn/ui·zod·react-hook-form을 쓰지 않는다. 명세에 명시된 경우에만 도입한다 (글로벌 CLAUDE.md의 기술 스택 목록보다 이 줄이 우선한다)

## 🎨 코딩 컨벤션

- 상세 규칙은 `.claude/rules/code-style.md`
- 컴포넌트는 `src/features/` 아래 기능 단위 모듈 구조를 따릅니다.
- 타입 정의는 `src/types/` 또는 해당 feature 폴더 내 `types/`를 사용합니다.
- 코드는 한국어 주석을 선호합니다.

## 언어 커뮤니케이션 규칙

- **기본 응답**: 한국어
- **코드 주석**: 한국어
- **커밋 메시지**: 한국어
- **문서화**: 한국어
- **변수명/함수명**: 영어 (코드 표준 준수)

## 팀 구성

- PM: 이세은
- 디자이너: 손진영
- 프론트엔드 : 한태영 (본인)
- 백엔드: 김동섭, 손세영

이 FE 레포에 PR을 올리고 머지하는 사람은 태영 단독이다. 승인 필수·CODEOWNERS는 쓰지 않는다.

## Git 브랜치 전략

- main → develop → 작업 브랜치. 상세는 `.claude/rules/git-rules.md`
- `develop`은 기본 브랜치이며 ruleset으로 보호된다: 직접 push·강제 push 금지, PR 필수, `pr-gate` 필수, 머지 전 최신화(Update branch) 필수
- `spec/`·`impl/`은 Claude·Codex 파이프라인 예약 접두사다. 일반 작업은 `feature/`·`fix/`·`design/`·`docs/`·`chore/` 등을 쓴다
- PR 머지는 태영만 한다. develop → main 병합도 태영 단독 진행

## 🤖 Claude·Codex 협업 흐름

**Claude가 명세를 만들고, 사용자가 머지하면, Codex가 판정·구현해 PR을 올리고, CI와 Claude 리뷰를 통과한 PR을 사용자가 머지한다.** 전체 설계는 `docs/workflow/claude-codex-plan.md`.

| 단계 | 주체                           | 내용                                                                                                        |
| ---- | ------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| 1    | Claude (`/design-pr`)          | 단위 명세 `docs/specs/<SPEC_ID>.md` 작성 → `spec/<SPEC_ID>-r<N>` 브랜치 → 사용자 확인 후 커밋·push·spec PR  |
| 2    | 사용자                         | 명세 PR 검토·머지                                                                                           |
| 3    | Actions (`spec-merged-notify`) | 머지된 spec PR에 Codex용 프롬프트 코멘트 게시                                                               |
| 4    | 사용자 → Codex                 | 프롬프트 붙여넣기 → 판정 → `impl/<SPEC_ID>-spec-<PR번호>`에서 구현·테스트·커밋 → `create-impl-pr`로 PR 생성 |
| 5    | Actions (`pr-validation`)      | `classify` → `ci` + Claude 명세 대조 리뷰 → `pr-gate`                                                       |
| 6    | 사용자                         | `pr-gate`·`[manual]` 기준 확인 후 머지                                                                      |

### Claude의 규칙

- **작업 위치**: 파이프라인 작업(`/design-pr`)은 Claude 전용 워크트리 `C:\Users\PC\worktrees\swyp-claude`에서만 한다. Codex·사용자와 공유하는 OneDrive 체크아웃에서는 파일 수정·브랜치 전환·커밋을 하지 않는다
- **Claude는 구현하지 않는다**: `impl/` 브랜치 작업, 명세 범위의 코드 수정은 Codex 몫이다. 파이프라인 밖의 일반 작업(QA·디자인 수정 등)은 기존처럼 사용자가 요청할 때 일반 브랜치에서 한다
- **명세는 근거가 있는 내용만**: API 명세서·PRD·Figma에 없는 필드·엔드포인트·값을 명세에 적지 않는다. 불확실하면 사용자에게 먼저 묻는다
- **BE 의존 기능**: API가 아직 없거나 바뀔 예정이면 명세에 "BE 의존"을 명시하고, 수용 기준은 mock 기준으로 쓴다. 그렇지 않으면 Codex 판정이 `needs_spec_revision`으로 반복된다
- **수용 기준**: `AC-xx` 형식, 사람이 확인할 기준은 `[manual]`. 확인 방법은 "Vercel 프리뷰 또는 로컬 `npm run dev`"처럼 쓴다. 빌드·타입 검사는 CI 기준 한 줄로 쓴다 (`docs/ai/spec-template.md`)
- **보완 요청**: Codex의 `[명세 보완 요청 — <ID> r<N>]`을 받으면 `/design-pr`로 revision을 +1 한다. revision은 최대 2
- **정책 경로**(`.github/`, `.claude/`, `.codex/`, `.agents/`, `docs/ai/`, `docs/workflow/`, `scripts/ai/`, 모든 `AGENTS.md`·`CLAUDE.md`)는 spec/·impl/ PR에서 바꿀 수 없다. 일반 브랜치 PR로 따로 올린다
- **머지는 항상 사용자가 직접 한다.** PR 생성은 `/design-pr`의 spec PR에 한해 Claude가 하고, 그 외 PR은 사용자(`/git:push` 요청 포함)나 `create-impl-pr`(사용자 승인)이 연다. `develop`·`main`에 push하지 않는다

## Key learnings & principles

- 추측 금지: API 명세서·PRD·Figma 스펙에 없는 내용은 임의 구현하지 않고 사용자에게 먼저 질문. 불확실한 사항은 세영님/동섭님(백엔드), 진영님(디자인), 세은님(PM)에게 확인 요청 메시지 초안 작성.
- API 명세서 vs. 실제 Swagger 응답 불일치: 명세 텍스트를 기준으로 하되, 실제 동작이 다를 경우 반드시 플래그 처리. Swagger 라이브 테스트로 실제 동작 확인하는 방식 선호.
- Figma 스펙 정밀 준수: 임의 근사치 사용 금지. Figma에서 확인된 값(패딩, 사이즈, 갭 등)을 정확히 반영. 확인 안 되는 항목은 질문.
- Tailwind CSS v4 커스텀 스케일: 프로젝트가 커스텀 스케일(2/4/8/12/16/20/24/32px 등)을 사용하므로, 스케일 외 값(예: gap-14, px-9, size-3.5)은 조용히 무시됨 → arbitrary bracket 표기(gap-[56px], px-[36px]) 필수.
  SVG 색상: public/icons/의 SVG는 hardcoded stroke/fill → next/image로 색상 override 불가 → 인라인 SVG + currentColor 패턴 사용.
- 3계층 데이터 모델: job_feed(공유 원본) → job_postings(스크랩/등록 시 사용자 복사본) → 칸반/마감일 뷰(동일 job_postings 렌더링). 사용자 편집이 공개 데이터를 덮어쓰지 않도록 주의; 반대로 배치 동기화가 사용자 수정값을 덮어쓸 위험도 있음.
- KanbanCard.postingId: job_postings 영구 복사본 ID (feed ID 아님) → feed detail 엔드포인트 재사용 불가.
- 문서 첨부 name 필드: 사용자가 직접 입력하는 것이 아니라 linkCategory 드롭다운 선택값이 들어감 → 백엔드가 필드 제거를 제안해도 제거 불가.
- 스코프 변경 원칙: PRD 외 신규 기능 제안은 세은님(PM)에게 스코프 변경 여부 먼저 확인 후 진행.
- GitHub PR 500 에러: /pull/create 라우트가 500을 반환하면 `gh pr create --base develop`으로 생성한다. `develop` 직접 push는 ruleset으로 막히므로 로컬 머지 + push 우회는 쓰지 않는다. 반복 충돌 파일 4종: src/app/scraps/page.tsx, src/features/deadlines/components/DeadlineList.tsx, src/features/kanban/components/KanbanBoard.tsx, src/features/kanban/components/KanbanColumn.tsx.
- vim 우회: git commit 중 vim 열릴 경우 git commit -m "message" 직접 사용.
- DropdownMenu z-index: Popover z-50 < 모달 z-[60] 충돌 → 클릭이 모달을 닫아버리는 버그 주의.

## 코드 결과물 제공 방식:

새 폴더 트리 전체 출력 금지
기존 프로젝트 구조 대비 파일 추가/수정/삭제 내역을 명시적으로 구분해서 안내
파일은 한 번에 하나씩 완성된 전체 내용으로 제공 (부분 스니펫 금지)
수정 전 항상 develop 브랜치 코드 기준으로 작업; 필요한 파일·코드가 없으면 추측하지 말고 어떤 파일이 필요한지 먼저 질문

## 환경:

Windows PowerShell. grep 사용 불가 → Select-String 사용. head 사용 불가 → Get-Content {file} | Select-Object -Index ({start}..{end}).
`scripts/ai/*.mjs`는 Node 스크립트라 PowerShell·Git Bash 어디서든 `node scripts/ai/<이름>.mjs`로 실행한다.

## 로컬 토큰 키: chwihap_access_token, chwihap_refresh_token

## Tools & resources

- GitHub: SWYP-dev/SWYP_FE (Public, org Free). 기본 브랜치 `develop`. PR base는 항상 `develop`
- GitHub 라벨: `spec`(명세 PR), `impl`(구현 PR), `risk-high`(Claude 리뷰를 Opus로. 붙인 뒤 리뷰는 수동 재실행)
- Secrets: `CLAUDE_CODE_OAUTH_TOKEN` (Claude 리뷰용. 값은 사용자가 직접 등록하고 채팅·파일에 쓰지 않는다)
- Vercel: 프로젝트명 swyp-fe, Hobby plan. 환경변수: NEXT_PUBLIC_API_BASE_URL, NEXT_PUBLIC_KAKAO_CLIENT_ID, NEXT_PUBLIC_KAKAO_REDIRECT_URI
- 백엔드 API: https://api.chwihap.com (AWS, IP: 13.210.187.59), Swagger: http://13.210.187.59/swagger-ui/index.html (raw IP라 web_fetch 접근 불가)
- DNS (Gabia): A레코드 @ → Vercel, api → 백엔드 IP; CNAME www → Vercel DNS. Gabia CNAME 값에 trailing period(.) 필수.
- Figma MCP: Figma:get_design_context, Figma:get_metadata
- 에디터: Cursor (VS Code fork), Windows PowerShell. Codex는 Cursor의 Codex 패널에서 로컬 실행

## 관련 파일

- **.claude/rules/code-style.md**: 코드 스타일 규칙
- **.claude/rules/git-rules.md**: Git 브랜치/커밋/PR 규칙 (예약 접두사·정책 경로 포함)
- **.claude/rules/qa-rules.md**: QA 작업 워크플로우 (AS-IS/TO-BE 처리 및 검증)
- **.claude/commands/design-pr.md**: 명세 작성 → spec PR (`/design-pr`)
- **docs/qa/QA_LIST.md**: QA 리스트 (우선순위/AS-IS·TO-BE/상태 관리)
