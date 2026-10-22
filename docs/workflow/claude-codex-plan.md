# Claude Code · Codex 업무 프로세스 연결 계획 (v1)

대상 저장소: **`SWYP-dev/SWYP_FE`** (취합 프론트엔드)
작성일: **2026-10-22 (한국 시간)**. 다른 프로젝트에서 2026-10-20에 설계·검증한 계획을 이 저장소 값으로 옮겼다.
공식 문서·Action 정의 확인일: 2026-10-17 (`claude-code-action` v1 `token.ts`의 토큰 처리 로직은 2026-10-20 확인).
목표 브랜치: **`develop`**
문서 범위: 자동화 설계, 설정 항목, 도입 순서, 검증 기준, 직접 확인 목록, 진행 표. 문서 자체는 저장소·계정 설정을 바꾸지 않는다. 실제 반영 상태는 15장 진행 표로 관리한다.

근거 표기:

- **[확인]** 공식 문서·Action 정의·소스로 직접 확인한 사항
- **[권장]** 이 프로젝트의 운영 권장안
- **[미확인]** 문서만으로 확정하지 못한 사항. 도입 시 실제 환경에서 검증 (13.4)

---

## 0. 이 저장소 확정 사항 (2026-10-22)

계획 검토 후 사용자가 확정한 값이다. 아래 본문과 다르면 이 절이 우선한다.

| #   | 항목                | 확정                                                                                                                                                                                                                                   |
| --- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 협업 형태           | FE 레포는 `xodudgks` 단독으로 PR을 올리고 머지한다. 승인 필수·CODEOWNERS를 쓰지 않는다. 다른 협업자(BE·디자인)도 ruleset의 적용을 받는다                                                                                               |
| 2   | 저장소 구조         | 단일 Next.js 앱(루트 `src/`). 백엔드는 별도 레포(`https://api.chwihap.com`)라 이 레포에서 API 계약을 바꿀 수 없다                                                                                                                      |
| 3   | 명세 경로           | `docs/specs/`. 단위 명세는 `docs/specs/<SPEC_ID>.md`(대문자 ID, frontmatter 검사 대상), 그 외 파일(`README.md` 등)은 관련 문서로 취급                                                                                                  |
| 4   | 브랜치 접두사       | `spec/`·`impl/`만 파이프라인 예약 접두사. 그 외 브랜치는 기존 관행(`feature/ fix/ design/ docs/ chore/ refactor/ hotfix/`)을 유지하고 `general`로 분류해 CI만 요구                                                                     |
| 5   | CI 구조             | `ci.yml`을 새로 만든다(`workflow_call` + `develop` push). 잡은 `typecheck`·`build`가 필수, `lint`는 `continue-on-error: true`로 현황만 표시한다. `pr-validation.yml`이 호출한다. 비밀값은 `review` 잡에만 준다                         |
| 6   | lint                | develop에 기존 오류 7건(렌더 중 ref 접근·effect 안 setState)이 있어 필수 체크에서 뺀다. `CI_COMMANDS`에도 넣지 않고, 명세 템플릿은 lint 통과를 수용 기준으로 쓰지 못하게 한다. 필수로 올릴 때는 15장 해당 행대로 한 PR에서 함께 바꾼다 |
| 7   | build               | CI에서 실행한다. `NEXT_PUBLIC_*` 없이 빌드가 실패하면 더미 값을 `env:`로 준다(시크릿 아님)                                                                                                                                             |
| 8   | 사람 작업 수용 기준 | 명세에 `AC-xx [manual]`로 표기. 확인 방법은 "Vercel 프리뷰 또는 로컬 `npm run dev`". Codex는 그 지점에서 멈추고 확인 요청을 출력한다. Claude 리뷰는 `[manual]`을 판정에서 빼고 PR 체크리스트로 남긴다                                  |
| 9   | BE 의존 기능        | API가 없거나 바뀔 예정이면 명세에 "BE 의존"을 적고 수용 기준은 mock 기준으로 쓴다. API 계약 변경이 필요하면 PR 본문에 "BE 담당자 확인 필요"로 남긴다                                                                                   |
| 10  | Codex 범위          | 구현 → 커밋 → `create-impl-pr`로 **PR 생성까지**. PR 체크 확인과 머지는 사용자가 한다. impl PR 본문은 `.github/PULL_REQUEST_TEMPLATE.md` 섹션 + `## 수용 기준`·`## 테스트`                                                             |
| 11  | PR 생성·머지        | 머지는 항상 사용자. Claude는 `/design-pr`의 spec PR만 연다. 일반 PR은 사용자(`/git:push` 포함), 구현 PR은 `create-impl-pr`(사용자 승인). 머지 방식은 정하지 않고 파일럿에서 merge SHA 대조가 통과하는지만 확인한다                     |
| 12  | Claude 작업 공간    | 별도 `git worktree` `C:\Users\PC\worktrees\swyp-claude` (OneDrive 밖). Codex·사용자는 OneDrive 체크아웃을 쓴다                                                                                                                         |
| 13  | Claude 리뷰 인증    | `CLAUDE_CODE_OAUTH_TOKEN` (`claude setup-token`을 별도 터미널에서 실행해 사용자가 직접 발급·등록, 2026-10-22 등록). 구독 한도를 쓰므로 추가 API 과금 없음. `ANTHROPIC_API_KEY`는 쓰지 않는다                                           |
| 14  | Codex 환경          | Cursor의 Codex 패널(`openai.chatgpt` 확장), ChatGPT 로그인, 로컬 실행, 승인 정책 「요청 시」(`on-request`), 승인은 사용자 직접(`auto_review` 사용 금지). `gh`·`git push`에는 "항상 허용"을 주지 않는다                                 |
| 15  | 전환 시점           | Step 1~4(파이프라인 구축 + 파일럿)를 먼저 끝낸다. 이후 첫 실제 기능은 미정(15장)                                                                                                                                                       |

### 세팅 순서

| Step | 브랜치                   | 내용                                                                                                                                                                                                                                                                      |
| ---- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0    | (사람)                   | 4.1 체크리스트 H-1~~H-3·H-7~~H-9. OAuth 토큰 발급·Secret 등록, Codex 패널 로컬 실행·명령 승인 확인                                                                                                                                                                        |
| 1    | `chore/ai-pr-validation` | `ci.yml` 신설, `pr-validation.yml`, 판정 스크립트(`classify-pr`·`gh-output`·`spec-file`·`spec-check`·`impl-meta`)와 테스트, 이 문서, `package.json` `typecheck`, `.gitignore`(`.ai-tmp/`·`.playwright-mcp/`), 라벨 3개. 머지 후 `develop` ruleset(H-4)과 차단 테스트(H-5) |
| 2    | `chore/ai-claude-review` | 리뷰 프롬프트·스키마, `review.mjs`와 테스트. 이 PR에서 처음으로 base 스크립트로 `pr-gate`가 정상 판정된다                                                                                                                                                                 |
| 3    | `chore/ai-spec-flow`     | 명세 템플릿, `/design-pr`, `spec-merged-notify.yml`, Codex 프롬프트 템플릿, `spec-notify.mjs`·`create-impl-pr.mjs`와 테스트, `docs/specs/README.md`, `AGENTS.md`·`CLAUDE.md`·`git-rules.md`·`code-style.md`·`.claude/agents/code-reviewer.md` 새 흐름 반영                |
| 4    | 파일럿                   | `CLEANUP-0001`: 추적 중인 쓰레기 파일 `tatus`(2026-07-09 실수로 커밋된 `git log` 출력) 삭제로 end-to-end 1건. 13.2 핵심 시나리오, 리뷰 1회 성공·취소 차단, 비용 실측                                                                                                      |

- 세 PR의 본문에는 "이 PR은 파이프라인 도입용이며 앱 코드는 건드리지 않는다"를 적는다.
- **Step 1 PR의 `pr-gate`는 실패한다.** `classify`가 base(develop)의 `scripts/ai/classify-pr.mjs`로 실행되는데, Step 1 시점의 develop에는 이 파일이 없다. ruleset을 Step 1 머지 뒤에 켜는 이유이며, 정상 판정은 Step 2 PR에서 처음 확인한다.
- Claude 리뷰는 머지된 spec PR과 연결된 `impl` PR에서만 돌기 때문에 Step 2 단독으로는 실제 실행을 확인할 수 없다. 실행 확인은 Step 4에서 한다.

---

## 1. 채택할 운영 방식

**Claude가 명세를 만들고, 사람이 머지하면, 패널의 Codex가 판정·구현해 PR을 올리고, CI와 Claude 리뷰를 통과한 PR을 사람이 머지한다.**

| 항목                    | 기본 설정                                                                                      |
| ----------------------- | ---------------------------------------------------------------------------------------------- |
| 설계·명세 작성          | 로컬 Claude Code 설계 커맨드 (기존 구독)                                                       |
| 명세 PR 생성            | 설계 커맨드 마지막에 커밋·푸시·`gh pr create --base develop --label spec` (브랜치 `spec/...`)  |
| 명세 머지               | 사람                                                                                           |
| 머지 알림               | GitHub Actions가 PR에 **Codex용 프롬프트 코멘트** 게시 (AI 없음)                               |
| 판정 + 구현             | Cursor의 Codex 패널, ChatGPT 로그인(구독). `gpt-6.1-sol` · medium 권장                         |
| 명세 보완               | Codex가 보완 요청문 출력 → 사람이 Claude Code에 전달 → 새 명세 PR(`revision` +1)               |
| 구현 PR 생성            | Codex가 로컬 스크립트로 생성 (내 계정, 브랜치 `impl/...`, `--label impl`)                      |
| 구현 검증               | 한 워크플로우의 `ci` + Claude 명세 대조 리뷰 + `pr-gate`                                       |
| 정책 파일 변경          | 일반 브랜치 PR (`spec/`·`impl/` 외, CI만 필수, 사람 검토)                                      |
| 구현 머지               | 사람. 자동 머지 금지                                                                           |
| 서로 다른 명세 회차     | 최대 3개 (`revision` 0 → 1 → 2)                                                                |
| Claude 리뷰 모델 [권장] | `claude-sonnet-5-5`, `risk-high` 라벨 PR만 `claude-opus-5-5` (라벨 변경 후 리뷰는 수동 재실행) |
| Claude 인증 [확정]      | OAuth 토큰 (Claude 구독, 6.3). API 키는 쓰지 않음                                              |

---

## 2. 전체 흐름

```mermaid
flowchart TD
    A[Claude Code: 명세 작성] --> B[커밋·푸시·spec PR 자동 생성]
    B --> C[사람: 명세 검토·develop 머지]
    C --> D[Actions: Codex용 프롬프트를 PR 코멘트로 게시]
    D --> E[사람: develop 최신화 후 패널 Codex에 프롬프트 붙여넣기]
    E --> F{Codex 판정}
    F -->|ready| G[Codex: 구현·테스트·커밋]
    G --> H[Codex: 스크립트로 impl PR 생성]
    H --> I[Actions: ci]
    H --> J[Actions: Claude 명세 대조 리뷰]
    I --> K{pr-gate 통과?}
    J --> K
    K -->|아니오| L[사람 지시로 Codex 수정 후 재푸시]
    L --> I
    L --> J
    K -->|예| M[사람: 검토·머지]
    F -->|needs_spec_revision 이고 revision < 2| N[Codex: Claude용 보완 요청문 출력]
    N --> O[사람: Claude Code에 전달 → revision+1 spec PR]
    O --> C
    F -->|needs_spec_revision 이고 revision = 2| P[사람이 직접 판단]
    F -->|needs_human| P
```

자동 구간: **B(PR 생성), D(프롬프트 게시), I·J·K(검증)**. 사람이 시작하는 구간: E(Codex 시작), O(보완 전달).

---

## 3. 확인한 사항

### 3.1 GitHub 이벤트와 토큰 [확인]

- `GITHUB_TOKEN`이 만든 이벤트는 원칙적으로 새 워크플로우 실행을 만들지 않는다 (`workflow_dispatch`, `repository_dispatch` 예외). `GITHUB_TOKEN`으로 PR을 만들면 일부 이벤트는 사람의 승인 대기 상태로 실행이 생성된다.
- 이 계획에서는 PR을 **사람 계정(로컬 `gh`)이 만들기 때문에** 위 제한에 걸리지 않는다. 핵심 경로에 영향이 없다.
- 경로·브랜치 필터로 건너뛴 워크플로우의 체크는 "Pending"으로 남아 필수 체크가 걸린 PR의 머지를 막는다.

출처: [GitHub: Triggering a workflow](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow)

### 3.2 Claude Action [확인]

- `prompt`를 주면 자동화 모드. `claude_args`로 `--model`, `--max-turns`, `--json-schema` 등을 전달하고 출력 `structured_output`을 받는다.
- **GitHub 인증**: `github_token`(내부적으로 override 토큰)을 주면 그대로 사용한다. 주지 않으면 OIDC 토큰을 받아 Claude GitHub App 토큰으로 교환한다(`id-token: write` 필요). `anthropic_api_key`는 모델 인증일 뿐 GitHub 인증을 대신하지 않는다. 교환 단계에서 `workflow_not_found_on_default_branch` 같은 워크플로우 검증 오류가 날 수 있다.
- 이슈·PR 이벤트에서는 트리거 사용자가 쓰기 권한을 가져야 한다. 봇 actor는 `allowed_bots`가 없으면 거부된다. 이 계획에서는 사람이 PR을 만들므로 해당 없다.
- PR에서 실행할 때 `.claude/`, `.mcp.json`, `CLAUDE.md` 등 설정 경로는 **PR base 브랜치 버전으로 복원**된다. `.github/ai/` 전체가 자동 복원되는 것은 아니다.
- 인증(모델): `anthropic_api_key`(API 과금) 또는 `claude_code_oauth_token`(`claude setup-token`, 발급한 사람의 구독 한도 사용).

출처: [claude-code-action v1 action.yml](https://github.com/anthropics/claude-code-action/blob/v1/action.yml), [token.ts](https://github.com/anthropics/claude-code-action/blob/v1/src/github/token.ts), [Claude Code GitHub Actions](https://code.claude.com/docs/en/github-actions)

### 3.3 `pull_request` 워크플로우의 출처

`pull_request` 이벤트의 워크플로우 파일은 PR의 병합 결과 기준으로 실행되므로, PR 안에서 `.github/workflows/`를 고치면 그 PR의 검증에 영향을 줄 수 있다. 그래서 워크플로우·정책 파일 변경은 일반 브랜치 PR로 분리하고(10.3) 별도 사람 검토를 거친다. 기본 브랜치를 `develop`으로 바꾸는 일은 이 계획의 필수 조건이 아니다. 동작이 안 되면 원인(워크플로우 위치, 토큰 방식)을 확인하고 대응한다.

### 3.4 모델 선택 가이드 [확인]

OpenAI 공식 가이드: Astra = 가장 강력(고비용), GPT-6.1 Sol = 시간·비용을 함께 관리해야 하는 복잡한 작업, Luna = 효율 중심(범위가 정해진 작업). Sol · Medium이 "복잡한 기술 작업" 기준이다. 패널에서는 모델 선택 UI로 고른다.

출처: [OpenAI: Model selection](https://developers.openai.com/api/docs/guides/model-selection)

### 3.5 Codex 로그인 [확인]

로컬 IDE는 ChatGPT 로그인과 API 키 로그인을 모두 지원한다. 이 프로젝트의 패널은 **ChatGPT 로그인**으로 쓴다(4.1 H-8에서 패널 계정 표시로 확인). 이 경우 OpenAI API 과금 없이 구독 한도를 쓴다. API 키로 로그인하면 API 과금으로 바뀌므로 로그인 방식을 바꾸지 않는다.

출처: [OpenAI: Authentication](https://learn.chatgpt.com/docs/auth)

---

## 4. 사전 점검 (Phase 0)

| #   | 점검                         | 통과 기준                                                                                                               | 실패 시                                            |
| --- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| 0-1 | 저장소 공개 여부와 소유 플랜 | `develop`에 보호 규칙·필수 체크를 **실제로 설정**할 수 있음                                                             | 아래 대응                                          |
| 0-2 | 필수 체크 차단 테스트        | 일부러 실패시킨 체크가 있는 PR의 머지 버튼이 **차단**됨. 관리자(본인) 우회 설정도 확인                                  | 0-1과 동일                                         |
| 0-3 | 워크플로우 동작              | 테스트 PR에서 `pull_request` 워크플로우가 `develop` 대상으로 정상 실행됨                                                | 워크플로우 파일 위치·권한 설정 점검                |
| 0-4 | Claude 인증·Secrets          | `CLAUDE_CODE_OAUTH_TOKEN` 등록, `ANTHROPIC_API_KEY`는 등록하지 않음                                                     | —                                                  |
| 0-5 | 로컬 `gh` 신원               | `gh auth status` 정상, `gh api user`의 로그인이 내 계정, `GH_TOKEN`·`GITHUB_TOKEN` 환경변수가 다른 신원을 선택하지 않음 | PR 작성자가 달라질 수 있음                         |
| 0-6 | 패널 Codex 실행 모드         | ChatGPT 로그인(확인됨) + **로컬 작업 디렉터리** 실행 + `git`·`gh`를 내 인증으로 사용. 첫 기능 실행 후 PR 작성자를 확인  | 클라우드 실행이면 작성자가 연동 봇일 수 있다 (9.2) |
| 0-7 | OS와 스크립트                | Windows면 Git Bash/WSL로 `.sh` 실행 가능 여부 확인. 아니면 PowerShell 또는 Node 스크립트로 작성                         | 9.3                                                |

**0-1·0-2 실패 시 대응 [권장]**: 개인 소유 private 저장소는 플랜에 따라 보호 규칙·필수 체크가 적용되지 않을 수 있다 [미확인]. 선택지는 (a) 지원되는 플랜 사용, (b) 저장소 공개(비밀 값 노출 검토 필요), (c) 강제 장치 없이 운영. (c)면 `pr-gate`는 **권고 수준**이고 머지 차단은 사람의 규율에 의존한다고 명시하고 진행한다. 이 저장소는 Public + org Free이고 ruleset을 만들 수 있어(기존 `main` ruleset 존재) 해당하지 않는다.

### 4.1 이 저장소 체크리스트 (2026-10-22)

✅ 확인됨 · 🧑 사용자가 직접 · 🤖 승인 후 Claude 실행 가능

| #    | 무엇을 (Phase 0 대응)             | 어디서                                                                                                                                    | 통과 기준                                                                                             | 시점             | 상태               |
| ---- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------- | ------------------ |
| H-1  | OAuth 토큰 발급·Secret 등록 (0-4) | **별도 터미널**에서 `claude setup-token` → Settings → Secrets and variables → Actions. `!` 접두어로 실행하지 않는다(출력이 대화에 남는다) | `gh secret list -R SWYP-dev/SWYP_FE`에 `CLAUDE_CODE_OAUTH_TOKEN`만 보임                               | Step 2 전        | 🧑 ✅ (2026-10-22) |
| H-2  | 공개 여부·플랜 (0-1)              | `gh repo view`, org 멤버십                                                                                                                | Public + org Free + org admin, ruleset 생성 가능                                                      | —                | ✅                 |
| H-3  | Actions 설정                      | Settings → Actions → General                                                                                                              | Actions 켜짐, 모든 액션 허용, 기본 토큰 권한 `read`                                                   | —                | ✅                 |
| H-4  | `develop` ruleset (10.4)          | Settings → Rules → Rulesets → `develop-protection`                                                                                        | Active, Bypass 비움, 삭제·강제 push 금지, PR 필수(승인 0), `pr-gate` 필수 + 최신화 요구               | Step 1 머지 직후 | 🧑                 |
| H-5  | 차단 테스트 (0-2)                 | 🤖 `spec/bad-name` 브랜치에 `docs/specs/` 파일 1개로 PR → 🧑 머지 버튼 확인                                                               | `unknown`으로 `pr-gate` 실패, `mergeStateStatus` = `BLOCKED`, 우회 옵션 없음. 머지 없이 닫음          | H-4 직후         | 🧑🤖               |
| H-6  | 워크플로우 동작 (0-3)             | Step 1 PR Checks 탭                                                                                                                       | `classify`·`ci`·`pr-gate` 실행 (`review`는 skipped. classify 실패는 0장 세팅 순서 주의 참고)          | Step 1 PR        | 🧑                 |
| H-7  | 로컬 `gh` 신원 (0-5)              | `gh auth status`, `gh api user --jq .login`                                                                                               | `xodudgks`, `GH_TOKEN`·`GITHUB_TOKEN` 비어 있음. 파일럿에서 `create-impl-pr`의 "실행 신원"으로 재확인 | —                | ✅                 |
| H-8  | Codex 패널 (0-6)                  | Cursor의 Codex 패널 → 계정 표시, 입력창 방패 메뉴                                                                                         | ChatGPT 계정 표시, 로컬 실행, `on-request`, 네트워크 명령에 승인 창이 뜸                              | Step 3 전        | 🧑                 |
| H-9  | OS와 스크립트 (0-7)               | 로컬                                                                                                                                      | Node v24.12.0(CI 24.x), git 2.55, gh 2.92. `.mjs`라 PowerShell에서 실행                               | —                | ✅                 |
| H-10 | Claude 전용 worktree              | `git worktree add --detach C:\Users\PC\worktrees\swyp-claude origin/develop` → `npm ci`                                                   | `git worktree list`에 표시                                                                            | Step 1 전        | 🤖 ✅ (2026-10-22) |
| H-11 | 라벨 `spec`·`impl`·`risk-high`    | 🤖 `gh label create`                                                                                                                      | `gh label list`에 3개                                                                                 | Step 1           | 🤖                 |

---

## 5. 단계별 실행 계약

| 단계 | 주체                                                                                         | 수행 내용                                                                                                                               | 결과                  |
| ---- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| 1    | 사람 → 로컬 Claude Code                                                                      | 요구사항·수용 기준·범위·테스트 계획 작성. frontmatter에 `spec_id`, `revision`                                                           | 명세 파일             |
| 2    | 설계 커맨드 (자동)                                                                           | 커밋·푸시 후 `gh pr create --base develop --label spec`                                                                                 | 명세 PR               |
| 3    | 사람                                                                                         | 명세 검토 후 머지                                                                                                                       | `develop`에 명세 반영 |
| 4    | Actions (자동)                                                                               | 머지된 `spec` PR에 Codex용 프롬프트 코멘트 게시/갱신 (6.4)                                                                              | PR 코멘트             |
| 5    | 사람 → 로컬 준비 → 패널 Codex                                                                | 저장소·remote·작업 트리 확인, `develop` fast-forward 최신화(기존 작업이 있으면 임의 stash·reset 없이 별도 작업 경로), 프롬프트 붙여넣기 | Codex 세션 시작       |
| 6    | Codex                                                                                        | 명세와 코드를 읽고 JSON 판정 출력                                                                                                       | 판정                  |
| 6-a  | Codex (`ready`)                                                                              | revision 0·1·2 모두 해당. 구현 브랜치 생성, 구현, 테스트 실행, **허용 파일 커밋**                                                       | 구현 커밋             |
| 6-b  | Codex (`needs_spec_revision` 이고 `revision < 2`)                                            | 구현하지 않고 Claude용 보완 요청문 출력 후 종료                                                                                         | 보완 요청문           |
| 6-c  | Codex (`needs_spec_revision` 이고 `revision >= 2`, 또는 `needs_human`, 또는 메타데이터 오류) | 근거를 출력하고 종료                                                                                                                    | 사람 판단             |
| 7    | Codex                                                                                        | `create-impl-pr` 실행: 사전 검사 후 푸시, `gh pr create --base develop --label impl`                                                    | 구현 PR               |
| 8    | Actions (자동)                                                                               | `classify` → `ci` + Claude 리뷰 → `pr-gate`                                                                                             | 필수 체크             |
| 9    | 사람                                                                                         | 최신 커밋의 체크·리뷰 확인 후 머지                                                                                                      | `develop` 반영        |

머지되지 않고 닫힌 `spec` PR에는 프롬프트가 게시되지 않는다.

### 5.1 판정 규칙

```text
decision == ready                            → revision 0·1·2 모두 구현 가능
decision == needs_spec_revision && r < 2      → 보완 요청문 출력
decision == needs_spec_revision && r >= 2     → needs_human
decision == needs_human                       → 사람 판단
revision 누락·음수·비정수·2 초과              → 메타데이터 오류, 실행 중단
```

`revision`은 사람이 참여하는 보완 정책의 기록이며, 프롬프트만으로는 강제 상한이 아니다. 강제 지점은 명세 PR의 CI 검사다(10.3): 같은 `spec_id`의 보완은 `develop`에 있는 이전 revision +1이어야 한다. 같은 revision을 수동으로 다시 실행하는 것까지 막지는 않으므로 상한은 "서로 다른 명세 회차 최대 3개"로 표현한다.

---

## 6. 규칙과 메타데이터

### 6.1 연결 단위

| 항목               | 예시                                                       |
| ------------------ | ---------------------------------------------------------- |
| 명세 ID            | `FEATURE-0123`                                             |
| 명세 경로          | 레포의 실제 위치에 맞춤 (예: `docs/specs/FEATURE-0123.md`) |
| 명세 브랜치        | `spec/FEATURE-0123-r0` (최초), `-r1`, `-r2`                |
| 구현 브랜치        | `impl/FEATURE-0123-spec-456` (`456` = 머지된 명세 PR 번호) |
| 그 외(일반) 브랜치 | 기존 관행 `feature/<설명>`, `fix/<설명>` 등 (`general`)    |

```yaml
---
spec_id: FEATURE-0123
revision: 0
---
```

보완 요청으로 Claude가 명세를 고칠 때 `revision`을 1 올린다. 수용 기준에는 `AC-01` 같은 ID를 부여해 판정·리뷰와 연결한다.

### 6.2 구현 PR 본문 메타데이터

`create-impl-pr`이 PR 본문에 JSON 블록을 넣는다. 블록 바로 앞에 `<!-- impl-meta -->` 마커를 한 번만 두고, 키는 아래 6개만 쓴다 (구현: `scripts/ai/impl-meta.mjs`의 `formatMeta`·`checkImplMeta`).

```json
{
  "spec_id": "FEATURE-0123",
  "spec_path": "docs/specs/FEATURE-0123.md",
  "revision": 0,
  "source_spec_pr": 456,
  "source_spec_merge_sha": "<명세 PR merge SHA>",
  "feasibility": "ready"
}
```

`pr-gate`는 이 값을 **신뢰 근거가 아니라 대조 대상**으로 다룬다. 대조 항목:

1. 브랜치명 `impl/<spec_id>-spec-<N>`과 `spec_id`·`source_spec_pr` 일치
2. `source_spec_pr`가 실제로 머지된 `spec` PR이고 merge SHA가 본문과 같음
3. 그 merge SHA의 명세 파일 내용 해시를 계산
4. **base(`develop`) 현재의 같은 `spec_id` 명세 경로**의 내용 해시와 revision을 계산해 3과 비교. 다르면 구버전 명세 구현이므로 실패("superseded")
5. 경로 이동·명세 분할이 있었다면 명시적 관계(메타데이터에 `supersedes` 등)가 없는 한 실패 처리하고 사람이 판단. 모든 `develop` 커밋이 명세 변경은 아니므로 `merge SHA == develop HEAD` 같은 비교는 쓰지 않는다

### 6.3 Claude 리뷰 인증과 비용

| 방식                             | 비용                             | 주의                                                                       |
| -------------------------------- | -------------------------------- | -------------------------------------------------------------------------- |
| `ANTHROPIC_API_KEY`              | 리뷰 1회 약 $0.3~0.5 (아래 가정) | 콘솔에서 월 한도 설정. 이 저장소는 쓰지 않는다                             |
| `CLAUDE_CODE_OAUTH_TOKEN` [확정] | 추가 API 과금 없음               | 설계 작업과 구독 한도를 공유. 사용량·추가 크레딧 정책은 구독 안내에서 확인 |

가정: Sonnet 5.5 입력 $2 / 출력 $10 (100만 토큰당)은 공식 모델 표에서도 확인된다. **리뷰 1회**가 입력 10~~20만, 출력 1만 토큰이면 $0.30~0.50이다. 이를 "기능당 비용"으로 고정하지 않는다. 커밋마다 재검증하고, 에이전트가 파일을 반복해 읽으면 토큰이 누적되므로 기능당 비용은 리뷰 실행별 실제 사용량의 합이다. "월 10건 = $3~~5"는 **각 기능이 리뷰 1회로 끝나는 시나리오**일 뿐이다. 첫 몇 건의 실제 사용량으로 보정한다. `risk-high`(Opus)는 더 비싸다. 두 인증 방식을 동시에 설정하지 않는다.

Codex 판정·구현은 ChatGPT 구독 한도를 쓴다. 비용 0이 아니라 "추가 API 과금 없음"이며, 한도 소진 시 중단될 수 있다.

### 6.4 프롬프트 코멘트

- 포함: `spec_id`, 명세 PR 번호, 명세 경로, merge SHA, `revision`, 템플릿 버전
- 식별용 숨은 마커(예: `<!-- codex-prompt:FEATURE-0123:r0 -->`)를 넣어, 워크플로우를 재실행하면 기존 코멘트를 **갱신**하고 중복 게시하지 않는다

---

## 7. 명세 보완 루프 (수동)

1. Codex가 `needs_spec_revision`이고 `revision < 2`이면 구현하지 않고, **Claude용 보완 요청문**을 하나의 코드 블록으로 출력한다. 포함: 명세 경로, 현재 `revision`, 막힌 수용 기준 ID, 이유, 요청 변경.
2. 사람이 요청문을 로컬 Claude Code에 붙여넣는다. Claude가 명세를 고치고 `revision`을 +1 한 뒤 설계 커맨드로 `spec/FEATURE-0123-r{N}` 명세 PR을 만든다.
3. 사람이 머지하면 4단계 코멘트가 갱신되고 5단계부터 반복한다.
4. `revision`이 2인 명세가 다시 `needs_spec_revision`이면 `needs_human`으로 종료한다. 사람이 범위를 정리하거나 명세를 쪼갠다. (r2가 `ready`면 정상 구현한다.)

이 루프의 빈도를 처음 몇 건 기록한다. 잦다면 명세 템플릿이나 설계 프롬프트에 부족한 부분이 있다는 신호다.

---

## 8. 워크플로우와 파일 구성

### 8.1 추가할 파일 (제안)

| 제안 경로                                    | 책임                                                             |
| -------------------------------------------- | ---------------------------------------------------------------- |
| `.claude/commands/design-pr.md`              | 설계 커맨드에 커밋·푸시·명세 PR 생성 연결, `revision` 갱신       |
| `AGENTS.md`, `CLAUDE.md`                     | 자동 머지 금지, 명세 준수, 변경 범위, Codex 판정·종료 규칙 (9.1) |
| `docs/ai/codex-prompt.template.md`           | 4단계 코멘트가 채울 Codex 프롬프트 템플릿                        |
| `scripts/ai/create-impl-pr.*`                | 구현 PR 생성 (OS에 맞는 형식, 0-7)                               |
| `scripts/ai/classify-pr.*`                   | CI와 로컬이 **같은 규칙**으로 PR 분류·경로 검사 (10.3)           |
| `.github/workflows/spec-merged-notify.yml`   | 4단계: 프롬프트 코멘트 게시/갱신                                 |
| `.github/workflows/pr-validation.yml`        | `classify`, `ci`, `review`, `pr-gate`                            |
| `.github/ai/prompts/spec-review.md`          | Claude 리뷰 프롬프트                                             |
| `.github/ai/schemas/spec-review.schema.json` | Claude 리뷰 JSON Schema                                          |

### 8.2 명세 머지 알림 (4단계)

```yaml
on:
  pull_request:
    branches: [develop]
    types: [closed]

permissions:
  contents: read
  pull-requests: write

jobs:
  notify:
    if: >-
      github.event.pull_request.merged == true &&
      startsWith(github.event.pull_request.head.ref, 'spec/')
    runs-on: ubuntu-latest
    # steps: 템플릿에 검증된 spec_path, merge SHA, revision을 채워 코멘트 게시/갱신
```

발췌 예시이며 완성된 파일이 아니다.

- PR 제목·본문·브랜치명을 쉘에 직접 끼워 넣지 않는다 (`env:`로 전달, 정규식 검증).
- 코멘트에 넣는 값은 검증된 `spec_path`(허용 디렉터리 패턴), 머지 SHA, `revision`뿐이다.
- 비밀 값·AI 호출 없음. Actions 러너 포함 시간은 소량 소모한다.

### 8.3 구현 PR 검증 (8단계)

한 워크플로우(`pr-validation.yml`)에 네 개의 작업을 둔다.

```yaml
on:
  pull_request:
    branches: [develop]
    types: [opened, synchronize, reopened, ready_for_review]

permissions:
  contents: read
  pull-requests: read
  issues: read
```

| 작업       | 내용                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------- |
| `classify` | 브랜치 접두사와 변경 파일 경로로 분류 (`spec` / `impl` / `general` / 예약 접두사 형식 위반)             |
| `ci`       | `ci.yml` 호출. `typecheck`·`build` 필수, `lint`는 현황 표시(0장 #6). 테스트 러너 없음. 모든 대상 PR     |
| `review`   | `classify`가 `impl`일 때만 Claude 명세 대조 리뷰 (10.1). **실행되면 매번 새로 수행** (결과 재사용 없음) |
| `pr-gate`  | `needs: [classify, ci, review]`, `if: always()`. 분류별 규칙으로 최종 판정 (10.2)                       |

**이 구성의 이유**: 이벤트를 위 4개로 제한하면 모든 실행에서 `classify`가 같은 입력으로 같은 결정을 내리므로, "게이트는 돌았는데 리뷰는 skipped" 상태가 `impl`에서 생기지 않는다. `review`가 skipped인 것은 `classify`가 `impl`이 아니라고 했을 때뿐이고, 그때 게이트는 해당 분류의 규칙을 적용한다. 라벨 변경은 어떤 작업도 다시 시작하지 않는다.

비용 최적화(같은 head·base·명세 해시·정책 해시·모델·위험도 키로 결과 재사용)는 정확한 동작을 확인한 뒤 추가한다. 추가한다면 키 전체를 쓰고, 신뢰하는 이전 실행의 pass만 재사용하며, 이 방식과 매번 실행 방식을 섞지 않는다. `risk-high`를 나중에 붙이면 리뷰를 수동 재실행한다.

---

## 9. Codex 패널 운영

### 9.1 프롬프트와 AGENTS.md

프롬프트(템플릿)는 다음을 지시한다.

1. 지정된 명세 파일(merge SHA 기준)과 관련 코드를 읽는다.
2. 구현 전에 아래 JSON 판정을 먼저 출력한다. 판정 규칙은 5.1을 따른다.
3. `ready`일 때만 `impl/<spec_id>-spec-<N>` 브랜치를 만들어 구현하고, 테스트를 실제 실행해 명령·결과를 기록한 뒤 **커밋한다**.
4. `needs_spec_revision`이면 구현하지 않고 Claude용 보완 요청문을 출력하고 종료한다.
5. `create-impl-pr`로 PR을 만든다. **머지하지 않는다. `develop`에 직접 푸시하지 않는다.**

```json
{
  "decision": "ready | needs_spec_revision | needs_human",
  "spec_id": "FEATURE-0123",
  "revision": 0,
  "summary": "한 줄 요약",
  "blockers": [{ "requirement_id": "AC-03", "reason": "…", "requested_change": "…" }]
}
```

`AGENTS.md`의 "막히면 멈추고 보고"는 `needs_human` 종료로 그대로 쓴다. 기존 금지사항(예: API 계약 변경 금지, 토큰 키 변경 금지)도 유지한다. `ready` 판정은 구현 성공을 보장하지 않는다. 테스트가 실패한 채 PR을 올리지 않고 결과를 보고한 뒤 사람의 지시를 기다린다.

### 9.2 PR 작성자와 실행 모드

`create-impl-pr`은 로컬 `git`, `gh`의 **내 인증**으로 실행되므로 PR 작성자가 나이고 CI가 정상 시작된다. 패널 Codex가 클라우드 작업 방식으로 푸시·PR하면 작성자가 연동 봇일 수 있고, 그러면 승인 대기나 Claude Action의 봇 거부가 생길 수 있다 [미확인]. 첫 기능 실행 후 `gh pr view --json author`로 작성자를 확인하고, 클라우드 실행은 기본 경로에서 제외한다.

### 9.3 스크립트 규칙

`create-impl-pr`은 PR을 만들기 전에 다음을 검사한다.

- 현재 브랜치가 `impl/<spec_id>-spec-<N>` 형식이고 `develop`이 아님
- 작업 트리가 깨끗함(이미 커밋됨). 커밋은 앞 단계에서 허용된 파일만 대상으로 한다
- `classify-pr`과 **같은 규칙**으로 변경 경로 검사: 워크플로우·정책 경로(10.3)를 포함하면 중단
- `<N>`이 머지된 `spec` PR인지 `gh`로 확인하고 merge SHA를 가져옴
- 같은 브랜치의 열린 PR이 있으면 새로 만들지 않고 갱신
- PR 본문은 `--body-file`, 라벨 `impl`
- `gh api user` 결과를 출력해 어떤 신원으로 실행되는지 보이게 한다

로컬 검사만으로 강제된 것으로 보지 않는다. 같은 분류 규칙을 CI(`classify`)가 다시 적용한다.

### 9.4 모델 사용 기준 [권장]

| 작업                  | 모델 · effort          | 비고                                 |
| --------------------- | ---------------------- | ------------------------------------ |
| 판정 + 구현           | `gpt-6.1-sol` · medium | 한 세션에서 연속 수행해 맥락 재사용  |
| 범위가 아주 작은 수정 | Luna · low             | 명세가 작고 범위가 명확할 때         |
| 막히는 작업의 재시도  | Astra                  | 고비용·한도 소모가 크므로 수동으로만 |

---

## 10. Claude 명세 대조 리뷰와 머지 차단

### 10.1 리뷰 구성

Claude는 연결된 명세의 각 수용 기준에 `충족 / 미충족 / 판단 불가`를 기록하고 근거를 제시한다. 범위 밖 변경, 오류 처리, 권한, 호환성도 본다. JSON Schema로 검증 가능한 판정을 받는다. 리뷰는 **읽기만** 한다. 테스트는 독립 CI가 수행한다.

```yaml
review:
  needs: classify
  if: needs.classify.outputs.kind == 'impl'
  steps:
    # 신뢰하는 base 버전의 프롬프트·스키마를 별도 경로로 체크아웃하고
    # 명세·diff·고정 프롬프트를 선행 step에서 준비한다.
    - name: Review specification compliance
      id: review
      uses: anthropics/claude-code-action@v1 # 운영 전에 검토한 커밋 SHA로 고정
      with:
        claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
        github_token: ${{ github.token }}
        base_branch: develop
        prompt: ${{ steps.build_prompt.outputs.prompt }}
        claude_args: |
          --model claude-sonnet-5-5
          --max-turns 20
          --tools "Read,Glob,Grep"
          --allowedTools "Read,Glob,Grep"
          --disallowedTools "mcp__*"
          --json-schema '<실제 리뷰 JSON Schema>'
```

입력 구성을 보이는 발췌이며 완성된 파일이 아니다.

- `github_token`을 명시해 OIDC·Claude GitHub App 교환을 피한다 [확인]. 이 작업은 읽기 권한만 갖는다.
- `--tools`·`--allowedTools`·`--disallowedTools` 구성과 `--model` 문자열은 외부 점검 제안이며 **실제 프롬프트·스키마·입력 파일로 시험해 확인한다** [미확인].
- PR에 결과를 게시하려면 별도 단계에 `pull-requests: write`를 부여한다. 게이트는 `structured_output`을 직접 읽으므로 코멘트 게시는 선택이다.
- 프롬프트·스키마·검증 코드는 base(`develop`)에서 읽는다. `risk-high`는 `claude-opus-5-5`로 바꾼다. `allowed_bots`는 설정하지 않는다.

스키마는 최소한 `verdict`, `spec_merge_sha`, `reviewed_head_sha`, 수용 기준별 결과, 차단 사유를 포함한다. 성공 조건: Action 성공 + 유효 JSON + `reviewed_head_sha`가 현재 head와 일치 + `spec_merge_sha`가 메타데이터와 일치 + `verdict=pass`. 빈 출력·스킵·실패·취소는 모두 실패다.

**구현 (이 저장소 Step 1·2)**

| 파일                                         | 내용                                                                                                                                                            |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.github/ai/prompts/spec-review.md`          | 리뷰 프롬프트. 검증된 ID·경로·SHA만 끼워 넣고, diff는 `.review/pr.diff` 파일로 읽게 한다                                                                        |
| `.github/ai/schemas/spec-review.schema.json` | `verdict`, `spec_id`, `spec_merge_sha`, `reviewed_head_sha`, `criteria[]`(`met`·`not_met`·`cannot_determine`·`manual`), `blocking_issues[]`, `summary`          |
| `scripts/ai/review.mjs`                      | `prompt`: 입력 준비 / `verify`: 결과 검증 — 명세의 `AC-xx`와 1:1 대응, `[manual]` 기준만 `manual`, `pass`와 기준별 상태가 모순 없음. 결과 표를 잡 요약에 남긴다 |
| `scripts/ai/spec-file.mjs`                   | 명세 frontmatter·수용 기준 해석, 내용 해시(CRLF 무시)                                                                                                           |
| `scripts/ai/spec-check.mjs`                  | `spec` PR 검사: frontmatter = 브랜치명, `AC-xx` 1개 이상·중복 없음, revision = develop +1(없으면 0), 다른 단위 명세 동시 변경 금지                              |
| `scripts/ai/impl-meta.mjs`                   | 6.2 대조 1~5. superseded 판정은 merge SHA와 base의 명세 내용 해시 비교                                                                                          |

- Action은 v1.0.244(`58985842`)로 고정했다. 프롬프트를 주면 agent 모드로 돌고, 허용 도구에 `mcp__github*`가 없으면 GitHub MCP 서버를 붙이지 않는다 (소스 확인).
- `review`는 `classify`가 `impl`이고 메타데이터 대조를 통과했을 때만 돈다. 형식이 틀린 PR에 구독 한도를 쓰지 않기 위함이다.
- `risk-high` 라벨은 PR 생성 직후 이벤트에 실리지 않을 수 있다. 붙인 뒤에는 리뷰를 수동 재실행한다.

**판정 책임 분리 (원본 프로젝트에서 2026-10-21 발견)**

읽기 전용 리뷰는 명령을 실행하지 못하므로 "build·typecheck 통과" 같은 기준을 `cannot_determine`으로 남기고, 그 결과 CI가 통과했는데도 게이트가 실패한 사례가 있었다. 기준마다 판정 주체를 명세에서 기계적으로 정한다.

| 기준                                                                                                                                                  | 판정 주체                     | 리뷰 status                        | 게이트                                                          |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ---------------------------------- | --------------------------------------------------------------- |
| `[manual]`                                                                                                                                            | 사람                          | `manual`                           | PR 체크리스트                                                   |
| CI 기준 — 문장 전체가 "`<범위>`에서 `<CI 명령>`…이 통과한다"이고 명령이 그 범위 CI 잡의 명령(`spec-file.mjs` `CI_COMMANDS`, ci.yml과 테스트로 대조)뿐 | 같은 실행·같은 head의 `ci` 잡 | `ci`                               | `ci` 잡 success 필수 (요약에 기준 ID와 결과 기록)               |
| 그 외                                                                                                                                                 | Claude 정적 리뷰              | `met`·`not_met`·`cannot_determine` | `met`이 아니면 실패 — `cannot_determine`을 일괄 허용하지 않는다 |

- CI 기준 목록은 워크플로우가 base의 명세에서 계산해 프롬프트에 넣는다. 리뷰가 목록 밖 기준에 `ci`를 쓰거나, 목록의 기준을 `ci`가 아닌 상태로 내면 결과 검증에서 실패한다.

**원본 프로젝트 검증 결과 (2026-10-20, 같은 스크립트·Action 버전) [확인]**

| 시나리오                         | 결과                                                                                                                      |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 리뷰 잡 실패                     | 스키마의 `$schema` 키를 CLI가 거부 → `review` 실패 → `pr-gate` 실패. 키를 제거한 스키마가 이 저장소에 들어온다            |
| 정상 리뷰                        | `claude-sonnet-5-5`, 8턴, 약 20초, 권한 거부 0. 결과 검증 통과 → `pr-gate` 통과. API 환산 약 $0.33(실제는 구독 한도 차감) |
| 메타데이터 변조 (다른 merge SHA) | 리뷰 없이 `pr-gate` 실패                                                                                                  |
| 실행 취소                        | `pr-gate` 실패, 머지 상태 `BLOCKED`                                                                                       |

- `--tools`·`--allowedTools`·`--disallowedTools`와 모델 문자열은 그대로 동작했다.
- 이 저장소에서는 Step 4 파일럿에서 정상 리뷰·실행 취소를 다시 확인한다 (13.2).
- 리뷰를 다시 돌리는 방법: 본문 수정·라벨 변경으로는 재실행되지 않는다. 새 커밋 push, Update branch, 또는 PR 닫고 다시 열기. 워크플로우 "Re-run"은 처음 이벤트의 base SHA를 그대로 쓰므로 base 쪽 프롬프트·스키마를 고친 뒤에는 Update branch를 쓴다.

### 10.2 `pr-gate` 규칙

| 분류      | 통과 조건                                                                                                                   |
| --------- | --------------------------------------------------------------------------------------------------------------------------- |
| `impl`    | `ci` 성공 + `review` 성공(10.1) + 6.2 메타데이터 대조 통과                                                                  |
| `spec`    | `ci` 성공 + 명세 형식(frontmatter, `AC-xx`) 검사 + 변경 파일이 명세·관련 문서 경로에만 있음 + revision이 이전 +1 (최초는 0) |
| `general` | `ci` 성공 (`spec/`·`impl/` 외 모든 브랜치. 사람이 직접 검토하고 머지)                                                       |
| `unknown` | **실패.** `spec/`·`impl/`로 시작하지만 형식이 틀린 브랜치. 예약 접두사를 자동 통과시키지 않는다                             |

`pr-gate`는 `if: always()`로 실행하고 상위 작업 결과를 확인한다. 필수 워크플로우에는 경로 필터로 실행이 빠지는 구성을 피한다. 건너뛴 체크는 Pending으로 남는다 [확인]. 필수 체크 이름은 실제 실행 후 표시되는 이름으로 등록한다. CI는 AI가 쓴 "테스트 통과" 문장을 신뢰하지 않고 독립 실행한다.

### 10.3 분류와 정책 경로

`classify`(와 로컬 `classify-pr`)는 같은 규칙을 쓴다. 브랜치 접두사만 보지 않고 **실제 diff 경로**로 대조한다.

| 경로 종류                    | 설명                                                                                                                                                                                           |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 명세 경로                    | `docs/specs/**`. `spec` PR은 이 경로와 관련 문서에만 변경이 있어야 한다                                                                                                                        |
| 정책 경로                    | `.github/**`, `.claude/**`, `.codex/**`, `.agents/**`(Codex 스킬), `docs/ai/**`, `docs/workflow/**`, `scripts/ai/**`, 모든 폴더의 `AGENTS.md`·`CLAUDE.md` (구현: `scripts/ai/classify-pr.mjs`) |
| 그 외(코드·테스트·일반 문서) | `impl` PR의 변경 범위                                                                                                                                                                          |

- `spec` PR에 코드가 섞이면 명세 경로로 통과하지 못한다. `impl` PR에 정책 경로가 섞이면 실패한다.
- `spec` PR에 정책 경로가 섞여도 실패한다. 정책 경로의 변경은 일반 브랜치 PR로 따로 올리고 사람이 직접 검토한다. 리뷰 기준·프롬프트·스키마를 바꾸는 수정은 반드시 먼저 일반 브랜치 PR로 머지한다.
- 이 규칙은 `.github/`에 들어 있어 PR 안에서 바뀔 수 있다. 그래서 정책 변경의 분리와 사람 검토가 실제 방어선이다. 팀 레포로 바뀌어 여러 사람이 머지하게 되면 `CODEOWNERS`로 정책 경로 소유자를 지정한다 (지금은 단독 운영이라 쓰지 않는다).

### 10.4 보호 규칙

(Phase 0에서 설정 가능 여부 확인)

| 체크·정책                 | 설정                                                                                                                                                         |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pr-gate`                 | 필수 체크 (`ci`는 `pr-gate`가 포함해 확인하므로 별도 등록은 선택)                                                                                            |
| **머지 전 브랜치 최신화** | **Require branches to be up to date before merging** 적용. base가 바뀌면 게이트와 필요한 리뷰를 다시 계산한다. 적용하지 않으면 이전 성공 결과가 남을 수 있다 |
| 직접 푸시                 | `develop` 직접 푸시·강제 푸시·삭제 금지, PR 필수. Bypass 목록은 비워 관리자도 우회하지 않는다                                                                |
| 자동 머지                 | 사용하지 않음                                                                                                                                                |
| 승인 요구                 | **사용하지 않음** (단독 작업 확정, 0장 #1). 켜면 본인 PR을 승인할 수 없어 막힌다                                                                             |

**한계 [확인된 구조]**: Codex가 내 인증을 쓰므로 GitHub는 사람과 에이전트를 구분하지 못한다. 보호 규칙은 `develop` 직접 푸시를 막을 수 있어도 에이전트가 일반 merge API를 호출하는 것까지 막았다고 말할 수 없다. 방어는 `AGENTS.md`의 "머지 금지"와 패널의 명령 승인 설정에 의존한다.

---

## 11. 인증·권한

| 설정                                               | 용도                                    |
| -------------------------------------------------- | --------------------------------------- |
| `ANTHROPIC_API_KEY` 또는 `CLAUDE_CODE_OAUTH_TOKEN` | Claude 리뷰 모델 인증 (둘 중 하나만)    |
| `github_token: ${{ github.token }}`                | Claude Action의 GitHub 인증 (읽기 권한) |
| 로컬 `gh` 로그인                                   | 명세 PR·구현 PR 생성 (내 계정)          |
| ChatGPT 로그인                                     | 패널 Codex (저장소 Secret 불필요)       |

| 작업                   | GitHub 토큰                                               | AI 인증             |
| ---------------------- | --------------------------------------------------------- | ------------------- |
| 명세 머지 알림         | `GITHUB_TOKEN` (`contents: read`, `pull-requests: write`) | 없음                |
| `classify`·`ci`        | `contents: read`                                          | 없음 (AI 키 비노출) |
| `review`               | `contents: read`, `pull-requests: read`, `issues: read`   | Claude 키           |
| 결과 코멘트 게시(선택) | `pull-requests: write` (별도 작업)                        | 없음                |

- 외부 fork PR은 일반 CI만 자동 실행하고, 비밀 값이 필요한 AI 리뷰는 신뢰 확인 뒤에만 돌린다. `pull_request_target`에서 PR 코드를 체크아웃해 비밀 값과 함께 실행하지 않는다.
- 이 구조에는 쓰기 권한을 가진 GitHub App/PAT가 없다. 대신 **내 로컬 인증을 에이전트가 쓸 수 있다**는 점이 보안 경계다(10.4 한계).

---

## 12. 비용·실패 운영

### 12.1 추가 비용

| 항목            | 추가 비용                                                                                                |
| --------------- | -------------------------------------------------------------------------------------------------------- |
| Codex 판정·구현 | 추가 API 과금 없음 (ChatGPT 구독 한도 사용)                                                              |
| Claude 설계     | 추가 없음 (기존 구독)                                                                                    |
| Claude 리뷰     | API 키: 리뷰 1회 약 $0.3~0.5 (6.3의 가정). 커밋마다 누적 / OAuth: 추가 API 과금 없음, 구독 한도 공유     |
| GitHub Actions  | 이 저장소는 Public이라 표준 러너 사용은 과금 대상이 아니다 [미확인: 도입 시 공식 요금 페이지에서 재확인] |

### 12.2 통제

- Claude 리뷰: `--max-turns`, `timeout-minutes`(시작값 15분), 실패 시 무제한 재실행 금지, 읽기 도구만 허용
- OAuth 토큰이라 콘솔 지출 한도는 해당 없다. 대신 구독 사용량을 보고 `--max-turns`를 조정한다
- 리뷰 입력은 연결된 명세와 PR diff 중심으로 제공
- Codex 쪽은 한도 소진·반복을 사람이 패널에서 보고 중단

### 12.3 실패 유형별 처리

| 유형                                           | 처리                                                                   |
| ---------------------------------------------- | ---------------------------------------------------------------------- |
| 명세 누락·모순                                 | 7장 수동 보완 루프                                                     |
| 보완 상한 도달                                 | 사람이 범위 조정·명세 분할                                             |
| Claude 인증·429·시간 초과                      | `pr-gate` 실패 유지, 재실행은 사람이 수동으로                          |
| 테스트·Claude 리뷰 실패                        | 머지 차단, Codex에 수정 지시 후 재푸시(새 head로 CI·리뷰 모두 재실행)  |
| 더 새로운 명세가 머지된 뒤 이전 구현 머지 시도 | 6.2의 4번 대조(`develop` 현재 명세 해시·revision)에서 실패             |
| `develop`이 앞서간 구현 PR                     | 최신화 후 게이트·리뷰 재계산 (10.4)                                    |
| 동일 명세로 PR을 두 번 생성                    | 스크립트가 기존 PR을 갱신                                              |
| 예약 접두사 형식 위반 PR                       | 게이트 실패, 형식에 맞게 브랜치 재구성 (파이프라인 밖이면 일반 접두사) |

---

## 13. 도입 순서, 인수 테스트, 열린 항목

### 13.1 도입 순서

1. **Phase 0**: 4장·4.1 점검. H-5(필수 체크 차단)를 통과하기 전에는 Step 2로 넘어가지 않는다.
2. **Phase 1: 검증 파이프라인** (Step 1·2) — `classify`·`ci`·`pr-gate`를 먼저 넣고(Step 1) ruleset·차단 테스트로 실패 체크가 머지를 막는지 확인 → 리뷰 프롬프트·스키마·검증 스크립트(Step 2). 리뷰의 실제 실행 확인은 Step 4로 미룬다(0장 세팅 순서 주의).
3. **Phase 2: 명세·구현 연결** (Step 3·4) — `/design-pr`, `spec-merged-notify.yml`, 프롬프트 템플릿, `create-impl-pr`, `AGENTS.md`·`CLAUDE.md` → 파일럿 `CLEANUP-0001`로 끝까지 실행.
4. **Phase 3 (선택)**: lint 필수화, `develop` 푸시 시 통합 점검, 리뷰 결과 재사용 캐시, 보완 루프 빈도가 높으면 명세 템플릿 개선.

각 Step의 PR은 일반 브랜치(`chore/ai-*`)라 `general`로 분류되어 CI만 필수다. 정책 경로라서 내용은 사람이 직접 검토한다.

### 13.2 인수 테스트

"확인 위치"가 단위 테스트인 항목은 `scripts/ai/*.test.mjs`가 `classify` 잡에서 매 PR마다 실행된다.

| 시나리오                                 | 기대 결과                                       | 이 저장소 확인 위치                                                     |
| ---------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------- |
| 필수 체크가 실패한 PR 머지 시도          | 머지 차단 (Phase 0)                             | H-5                                                                     |
| 예약 접두사 형식이 틀린 브랜치 PR        | `unknown`으로 실패 (일반 브랜치는 CI만)         | H-5 (`spec/bad-name`)                                                   |
| 일반 브랜치 PR                           | CI만으로 통과                                   | Step 2 PR (base 스크립트로 처음 정상 판정)                              |
| lint 오류가 있어도 `ci` 성공             | `lint` 잡만 실패 표시, `ci`·`pr-gate` 통과      | Step 1·2 PR (develop 기존 오류 7건) — `workflow_call` 동작 [미확인]     |
| 정상 `spec` PR 머지                      | Codex 프롬프트 코멘트 게시                      | 파일럿 spec PR                                                          |
| 같은 워크플로우 재실행                   | 코멘트 중복 없이 갱신                           | 파일럿 후 `spec-merged-notify` 수동 실행                                |
| `spec` PR을 머지 없이 닫음               | 코멘트 없음                                     | Step 3 이후 테스트 spec PR 1건 (닫기만)                                 |
| `ready` 판정 후 구현                     | `impl/` 브랜치 PR 생성                          | 파일럿                                                                  |
| `[manual]` 기준에서 Codex 멈춤           | 확인 요청 출력 후 대기                          | 파일럿 AC-04                                                            |
| 패널에서 만든 `impl` PR                  | 승인 대기 없이 CI·리뷰 자동 실행, 작성자가 본인 | 파일럿 (`gh pr view --json author`)                                     |
| 정상 Claude 리뷰                         | `review` 성공 → `pr-gate` 통과                  | 파일럿 impl PR (턴 수·시간 기록)                                        |
| Claude 출력 취소                         | `pr-gate` 실패, `BLOCKED`                       | 파일럿 impl PR 첫 실행을 취소 → 닫고 다시 열어 재실행                   |
| merge SHA 대조 (머지 방식 미지정)        | 평소 방식으로 spec PR을 머지해도 대조 통과      | 파일럿 impl PR                                                          |
| `needs_spec_revision` (revision 0·1)     | 구현 없이 Claude용 요청문                       | 파일럿에서 발생하면 기록 (일부러 만들지 않음)                           |
| 같은 revision으로 보완 PR (이전 +1 아님) | `spec` PR 검사 실패                             | 단위 테스트                                                             |
| `spec/` PR에 코드 파일 포함              | `pr-gate` 실패                                  | 단위 테스트                                                             |
| `impl/` PR에 `.github/` 파일 포함        | `pr-gate` 실패                                  | 단위 테스트                                                             |
| PR 제목에 쉘 문자                        | 쉘 실행 없음                                    | 워크플로우 구조(`env:` 전달)                                            |
| `needs_spec_revision` (revision 2)       | 요청문 없이 `needs_human` 종료                  | 프롬프트 템플릿 규칙                                                    |
| 메타데이터 `revision` 누락·범위 초과     | 실행 중단                                       | 단위 테스트                                                             |
| 같은 명세로 스크립트 두 번 실행          | PR 중복 없음                                    | 단위 테스트 / 파일럿 재실행 시 확인                                     |
| 통과한 PR에 라벨만 추가·제거             | 어떤 작업도 재실행되지 않음                     | 워크플로우 이벤트 제한 (선택 확인)                                      |
| 브랜치명·메타데이터 변조                 | `pr-gate` 실패                                  | 단위 테스트 (실제 시험은 선택: 테스트 impl PR 1건, 리뷰 한도 소모 없음) |
| 빈 결과·리뷰 실패                        | `pr-gate` 실패                                  | 단위 테스트 (`review.test.mjs`)                                         |
| PR에 새 커밋 추가                        | CI와 리뷰 모두 재실행                           | 파일럿 중 수정 커밋이 생기면 확인                                       |
| `develop`이 먼저 바뀐 PR                 | 최신화 요구, 재계산 후 통과                     | Step 2·3 PR (Update branch)                                             |
| 새 명세 머지 후 이전 구현 머지 시도      | `pr-gate` 실패(superseded)                      | 단위 테스트                                                             |
| `develop` 직접 푸시                      | 보호 규칙으로 차단                              | H-4 이후 (선택)                                                         |

완료 기준: 위 표에서 H-5·Step 2·파일럿 항목을 통과하고 `pr-gate`를 필수 체크로 등록한 시점.

### 13.3 채울 값

| 항목                  | 값 (2026-10-22 확인)                                                                                                                                              |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 저장소 플랜·보호 규칙 | `SWYP-dev/SWYP_FE`, Public, org Free. 기존 ruleset은 `main` 1개(disabled). `develop-protection`은 Step 1 머지 후 설정(H-4)                                        |
| 협업자                | `xodudgks`(admin), BE·디자인 3명. FE PR·머지는 `xodudgks` 단독                                                                                                    |
| 명세 경로·정책 경로   | 명세 `docs/specs/**`, 정책 경로는 10.3 표 그대로                                                                                                                  |
| 기존 Claude 커맨드    | `.claude/commands/git/commit.md`, `.claude/commands/git/push.md` (설계 커맨드는 Step 3에서 `design-pr.md` 추가)                                                   |
| Claude 인증 방식      | OAuth 토큰 (`CLAUDE_CODE_OAUTH_TOKEN`, Claude 구독). 2026-10-22 등록                                                                                              |
| 테스트 명령           | 테스트 러너 없음. CI 필수: `npm run typecheck`(`tsc --noEmit`, Step 1에서 스크립트 추가)·`npm run build`. 현황 표시: `npm run lint`                               |
| `CI_COMMANDS`         | `{ root: ['npm run typecheck', 'npm run build'] }` — `ci.yml`의 필수 잡과 `spec-check.test.mjs`가 대조(`continue-on-error` 잡 제외)                               |
| 월 예산               | 추가 과금 없음 (구독 한도 사용). 비용 통제는 `--max-turns`·`timeout-minutes`·리뷰 입력 축소                                                                       |
| 스크립트 형식         | Node(`.mjs`). 로컬 Windows와 CI ubuntu에서 같은 규칙 모듈 공유                                                                                                    |
| 기본 브랜치·기존 CI   | 기본 브랜치 `develop`(로컬 `origin/HEAD`는 `git remote set-head origin -a`로 갱신). 기존 워크플로우는 `build-tokens.yml`(`chore/design-system` push용, 충돌 없음) |
| `gh` 신원 (0-5)       | `xodudgks`, `GH_TOKEN`·`GITHUB_TOKEN` 비어 있음 — 통과                                                                                                            |
| Actions 설정          | 켜짐, 모든 액션 허용, 기본 토큰 권한 `read`, SHA 고정 강제 없음                                                                                                   |
| 작업 공간             | Codex·사용자: `C:\Users\PC\OneDrive\Dokumen\swyp` / Claude: `C:\Users\PC\worktrees\swyp-claude`                                                                   |

### 13.4 확인하지 못한 항목 [미확인]

| 항목                                                                                                 | 확인 방법                                                            |
| ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `workflow_call`로 부른 `ci.yml`의 `continue-on-error` 잡이 실패해도 호출 잡(`ci`) 결과가 success인지 | Step 1 PR의 `ci` 결과 (lint 오류 7건으로 자연히 시험됨)              |
| `NEXT_PUBLIC_*` 없이 CI build가 통과하는지                                                           | Step 1 PR. 실패하면 `ci.yml`에 더미 값 추가                          |
| Vercel이 `SWYP-dev/SWYP_FE` PR에 프리뷰를 만드는지                                                   | Vercel 대시보드 → swyp-fe → Settings → Git → Connected Repository    |
| org 단위 Actions 정책                                                                                | org Settings → Actions → General (`gh` 토큰에 `admin:org` 권한 없음) |
| 패널 Codex의 로컬 실행과 PR 작성자                                                                   | 파일럿 후 `gh pr view --json author`                                 |
| ChatGPT 구독별 Codex 사용 한도, 패널 모델 선택 UI                                                    | 패널 설정과 구독 안내                                                |
| 요금표(Claude 구독 한도, GitHub Actions Public 저장소)                                               | 도입 시점의 공식 안내                                                |
| PR 생성 직후 라벨이 이벤트에 실리는지                                                                | 분류가 브랜치명·경로 기준이라 영향 작음. 참고용 확인                 |

실제 YAML을 배포할 때는 선택한 Action 커밋의 정의와 다시 대조한다.

---

## 14. 사람이 직접 확인할 것

내가(또는 에이전트가) 대신 확인할 수 없고, 대상 저장소·계정에서 직접 봐야 하는 것만 모았다. 이 저장소의 실행 목록은 4.1이다.

| #   | 확인                                                                   | 방법                                                              | 4.1 대응 |
| --- | ---------------------------------------------------------------------- | ----------------------------------------------------------------- | -------- |
| 1   | `develop` 보호 규칙·필수 체크가 **실제로 머지를 막는가**               | 실패하는 체크가 있는 테스트 PR의 머지 버튼. 관리자 우회 옵션 확인 | H-4·H-5  |
| 2   | 저장소 공개 여부·플랜, 협업자 유무                                     | Settings 화면                                                     | H-2 ✅   |
| 3   | `gh` 신원                                                              | `gh auth status`, `gh api user --jq .login`, 환경변수             | H-7 ✅   |
| 4   | 패널 Codex가 **로컬**에서 실행되는지, 명령 승인 설정                   | 패널 설정, 파일럿에서 작업 디렉터리·푸시 주체 확인                | H-8      |
| 5   | Codex가 ChatGPT 로그인 상태 유지 (API 키로 바뀌지 않았는지)            | 패널 계정 표시                                                    | H-8      |
| 6   | Claude 리뷰 인증 등록                                                  | 저장소 Secrets                                                    | H-1 ✅   |
| 7   | 작업 환경 OS·스크립트                                                  | Node·git·gh 버전                                                  | H-9 ✅   |
| 8   | 저장소 사실: 명세 경로, 커맨드 경로, 테스트 명령, 기존 CI, 기본 브랜치 | 저장소 확인                                                       | 13.3 ✅  |
| 9   | 첫 기능 실측: Claude 리뷰 턴 수·시간, Codex 한도 소모                  | Actions 잡 요약, 패널 사용량                                      | 파일럿   |

---

## 15. 진행 계획 표

상태 칸은 진행하면서 직접 갱신한다. ⬜ 대기 · ◐ 진행 중 · ✅ 완료

| Phase | 작업                                                                                                                                                                         | 완료 기준                                                                                     | 담당      | 상태            |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------- | --------------- |
| 0     | 4.1 H-1~H-3·H-7·H-9·H-10                                                                                                                                                     | 통과 기준 충족                                                                                | 사람      | ✅ (2026-10-22) |
| 0     | 4.1 H-8 Codex 패널                                                                                                                                                           | ChatGPT 로그인·로컬·`on-request` 확인                                                         | 사람      | ⬜              |
| 1     | Step 1 `chore/ai-pr-validation` + 라벨(H-11)                                                                                                                                 | PR에서 `classify`·`ci`·`pr-gate` 실행 (H-6), 머지                                             | 구현+사람 | ⬜              |
| 0     | `develop` ruleset (H-4)                                                                                                                                                      | 10.4 표대로 설정                                                                              | 사람      | ⬜              |
| 0     | 필수 체크 차단 테스트 (H-5)                                                                                                                                                  | `spec/bad-name` PR이 `BLOCKED`, 우회 옵션 없음                                                | 사람+구현 | ⬜              |
| 1     | Step 2 `chore/ai-claude-review`                                                                                                                                              | 이 PR의 `pr-gate`가 base 스크립트로 통과, 머지                                                | 구현+사람 | ⬜              |
| 2     | Step 3 `chore/ai-spec-flow`                                                                                                                                                  | `pr-gate` 통과, develop의 `AGENTS.md`·`CLAUDE.md`가 새 흐름                                   | 구현+사람 | ⬜              |
| 2     | OneDrive 체크아웃 정리                                                                                                                                                       | 복사해 둔 파이프라인 파일 제거, `AGENTS.md` 되돌림 후 develop 최신화                          | 사람+구현 | ⬜              |
| 2     | 파일럿 `CLEANUP-0001` (`tatus` 삭제) end-to-end                                                                                                                              | 13.2 파일럿 항목 통과, PR 작성자 확인, 리뷰 실측 기록                                         | 사람+구현 | ⬜              |
| 3     | 비용 실측 후 `--max-turns`·`timeout-minutes` 조정                                                                                                                            | 구독 한도 안에서 운영                                                                         | 사람      | ⬜              |
| 3     | **lint 필수화**: 기존 lint 오류 7건 정리 후 `ci.yml`의 `continue-on-error` 제거 + `CI_COMMANDS`에 `npm run lint` 추가 + `spec-check.test.mjs` 대조 확인 — **한 PR에서 함께** | 세 곳이 일치하고 `pr-gate` 통과. 명세 템플릿의 "lint 통과를 AC로 쓰지 말 것" 문구도 함께 제거 | 사람+구현 | ⬜              |
| 3     | 첫 실제 기능에 새 흐름 적용                                                                                                                                                  | 대상 결정 후 기록                                                                             | 사람      | ⬜ (대상 미정)  |

### 파일럿 결과

파일럿을 마친 뒤 단계별 결과(명세 PR 번호, Codex 판정, 구현 PR, 리뷰 턴 수·시간, 배운 점)를 이 절에 기록한다.
