<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# SWYP(취합) 프론트엔드 — Codex 작업 규칙

> 위 Next.js 블록은 `next dev`가 다시 써 넣는 영역이므로 수정하지 않는다. 이 아래가 프로젝트 규칙이다.
> 이 파일은 Codex용 진입점이다. Claude Code는 `CLAUDE.md`(이 파일을 불러온다)를 읽는다. 두 파일의 규칙은 같아야 하므로 규칙을 바꿀 때는 양쪽을 함께 고친다.

이 레포는 채용 공고 통합 관리 서비스 "취합"의 **프론트엔드만** 담는다. 백엔드는 별도 레포(`https://api.chwihap.com`)이며 이 레포에서 바꿀 수 없다.

## 역할 분담

- **설계는 Claude Code, 구현은 Codex**가 담당한다. 연결 흐름 전체는 `docs/workflow/claude-codex-plan.md`
- Codex는 단위 명세(`docs/specs/<SPEC_ID>.md`)에 적힌 범위·설계 결정·수용 기준(`AC-xx`)을 그대로 구현한다. 명세와 다르게 구현해야 할 이유가 생기면 **임의로 결정하지 말고 멈추고 보고**한다. 명세 보완은 Claude가 새 revision으로 한다
- 명세에 없는 기능·API·추상화는 만들지 않는다 (과설계 금지)
- 이 프로젝트는 shadcn/ui·zod·react-hook-form을 쓰지 않는다. 명세에 명시된 경우에만 도입한다. 그 밖의 새 패키지도 명세에 없으면 추가하지 않는다
- **바꾸지 않는 경로**: `docs/specs/`(명세), 정책 경로 `.github/` `.claude/` `.codex/` `.agents/` `docs/ai/` `docs/workflow/` `scripts/ai/`, 모든 폴더의 `AGENTS.md`·`CLAUDE.md`. 구현 PR에 섞이면 CI(`pr-gate`)가 실패한다. 바꿔야 한다면 보고만 한다

## 작업 흐름 (명세 하나 = 구현 PR 하나, 항상 직렬)

1. Claude가 `spec/` PR로 명세를 올리고, 사용자가 머지한다. Actions가 그 PR에 **Codex용 프롬프트 코멘트**를 게시한다
2. 사용자가 프롬프트를 패널에 붙여넣으면, **프롬프트의 순서대로** 진행한다: 준비 점검 → 판정 JSON 출력 → (`ready`면) `impl/<SPEC_ID>-spec-<명세 PR 번호>` 브랜치에서 구현 → 테스트 계획 실행 → 커밋 → `node scripts/ai/create-impl-pr.mjs`로 **PR 생성까지**
3. 판정이 `needs_spec_revision`이면 구현하지 않고 Claude용 보완 요청문을 출력하고 끝낸다 (revision 2면 `needs_human`). `needs_human`이면 근거만 출력하고 끝낸다
4. 명세의 **`[manual]` 수용 기준**에 오면 멈추고, 사용자에게 무엇을 어떻게 확인하면 되는지(로컬 `npm run dev`의 어느 화면에서 무엇을, 또는 PR의 Vercel 프리뷰) 적어 확인을 요청한다. 확인을 받은 뒤 진행한다
5. PR을 만든 뒤에는 멈춘다. CI·Claude 명세 대조 리뷰·`pr-gate` 결과 확인과 **머지는 사용자가 한다**
6. `pr-gate`가 실패해 사용자가 수정을 지시하면, **지시된 항목만** 같은 브랜치에 **추가 커밋**으로 고치고(amend·force push 금지) 테스트를 다시 실행한 뒤 `create-impl-pr`을 다시 실행한다 (push + PR 본문 갱신)
7. 이전 구현 PR이 머지되기 전에는 다음 명세를 시작하지 않는다

### 명령 승인

- push·GitHub 호출이 필요한 명령은 샌드박스 밖 실행 승인을 요청한다. **승인은 사용자가 직접 한다.** 허용되는 것은 `create-impl-pr` 실행뿐이고, `git push`·`gh pr create`를 직접 실행하지 않는다
- `gh pr merge`, `develop`·`main`으로의 push는 어떤 경우에도 실행하지 않는다

### 같은 작업 폴더를 사용자와 공유한다

- 작업을 시작할 때와 커밋하기 전에 `git status`를 확인한다. **내가 만들지 않은 변경·untracked 파일은 스테이지하거나 커밋하지 않는다** (`git add -A`·`git add .` 금지, 파일을 지정해서 add). 예상하지 못한 변경이 보이면 손대지 말고 보고한다
- Claude는 별도 워크트리에서 작업하므로 이 폴더를 건드리지 않는다
- PR 본문 초안은 `.ai-tmp/`(git 무시 경로)에 쓴다

## 작업 시작 전 반드시 읽을 문서

1. `CLAUDE.md`: 프로젝트 개요, 팀 구성, 알려진 이슈(Key learnings), 개발 커맨드
2. `.claude/rules/code-style.md`: 코드 스타일 (항상 적용)
3. `.claude/rules/git-rules.md`: 브랜치·커밋·PR 규칙 (항상 적용)
4. **프롬프트가 지정한 단위 명세** `docs/specs/<SPEC_ID>.md`: 구현은 이 문서를 기준으로 한다
5. 명세가 참조하는 배경 문서: `docs/PRD.md`, `docs/API_SPEC.md`, QA 항목이면 `docs/qa/QA_LIST.md`

## 언어

- 응답·코드 주석·커밋 메시지·문서: **한국어**
- 변수명·함수명·컴포넌트명: 영어

## 반드시 지킬 것

- **막히면 우회하지 말고 보고한다.** 권한 거부·샌드박스 차단·인증 실패 등으로 실행이 막히면, 다른 방법으로 돌아가지 말고 무엇이 어떤 이유로 막혔는지 그대로 보고한다
- **추측 금지.** `docs/API_SPEC.md`·PRD·명세에 없는 엔드포인트·요청/응답 필드·디자인 값을 만들어 쓰지 않는다. 필요하면 `needs_spec_revision` 또는 `needs_human`으로 멈춘다
- **API 계약을 바꾸지 않는다.** 엔드포인트·메서드·요청/응답 필드는 백엔드 레포 소관이다. 명세가 "BE 의존"으로 mock 기준을 정했으면 mock으로만 구현한다. API 계약 변경이 필요해 보이면 PR 본문 "백엔드 관련" 칸에 "BE 담당자 확인 필요"로 적는다
- **비밀번호·API 키·시크릿을 채팅으로 주고받지 않는다.** 필요한 값은 어느 파일(`.env.local`)의 어떤 키에 넣으면 되는지만 안내하고, 사용자가 직접 편집한다. `.env*` 파일은 커밋하지 않는다 (Public 레포)
- **커밋·PR은 Codex용 프롬프트의 흐름 안에서만** 한다. 커밋 메시지는 `<이모지> <타입>: <요약>`(한국어, 타입은 `CONTRIBUTING.md`, 이모지는 `.claude/commands/git/commit.md`), PR은 `create-impl-pr` 스크립트로만 연다. 프롬프트 없이 받은 작업은 사용자가 요청할 때만 일반 브랜치(`feature/`·`fix/` 등, `spec/`·`impl/` 제외)에서 커밋한다. **PR 머지는 절대 하지 않는다**
- **데이터 모델 구분**: `job_feed`(공유 원본)와 `job_postings`(사용자 복사본)를 섞지 않는다. `KanbanCard.postingId`는 `job_postings` ID라 피드 상세 엔드포인트에 쓸 수 없다
- **스타일 토큰**: Tailwind v4 닫힌 스케일이라 토큰에 없는 값(`gap-14` 등)은 조용히 무시된다. 토큰 밖 값은 `gap-[56px]`처럼 대괄호로 쓴다. `src/styles/tokens.css`는 생성물이라 직접 고치지 않는다 (`tokens.json` → `npm run build:tokens`)
- 로컬 스토리지 토큰 키(`chwihap_access_token`, `chwihap_refresh_token`)는 바꾸지 않는다

## 저장소 구조와 커맨드

| 앱                        | 위치        | 실행                 | 검증                                                 |
| ------------------------- | ----------- | -------------------- | ---------------------------------------------------- |
| 프론트엔드 (Next.js 16.2) | 루트 `src/` | `npm run dev` (3000) | `npm run typecheck`, `npm run build`, `npm run lint` |

- 경로 별칭: `@/*` → `src/*`
- 테스트 러너가 없다. `npm run typecheck`·`npm run build`와 로컬 실행(`npm run dev`)으로 검증한다
- `npm run lint`는 develop에 기존 오류가 있어 CI에서 필수가 아니다. 그래도 실행해서 **내가 바꾼 파일에 새 오류를 더하지 않는다**
- 기능 코드는 `src/features/<기능>/` 아래에 둔다 (구조는 `.claude/rules/code-style.md`)
