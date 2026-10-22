---
spec_id: <SPEC_ID>
revision: 0
---

# <SPEC_ID> — <한 줄 제목>

<!--
단위 명세 템플릿 (docs/workflow/claude-codex-plan.md 6.1). /design-pr 커맨드가 이 파일을 복사해 docs/specs/<SPEC_ID>.md를 만든다.

형식 규칙 (scripts/ai/spec-check.mjs가 PR에서 검사한다)
- frontmatter의 spec_id는 브랜치 spec/<SPEC_ID>-r<N>과 같고, revision은 develop에 있는 이전 revision + 1 (처음이면 0)
- 수용 기준은 목록 형식 "- AC-01 ..."으로 정의한다. 번호는 두 자리 이상, 중복 금지
  본문에서 기준을 가리킬 때는 문장 맨 앞이 아닌 곳에 쓰거나 "(AC-01)"처럼 괄호로 감싼다 — 줄 맨 앞의 "- AC-01"만 정의로 센다
- 사람이 직접 확인해야 하는 기준은 ID 뒤에 [manual]을 붙인다. Codex는 그 지점에서 멈추고 사용자에게 확인을 요청하고,
  Claude 리뷰는 판정하지 않고 PR 체크리스트로 남긴다
- 수용 기준은 코드를 읽거나 명령을 실행해 참·거짓을 가릴 수 있게 쓴다 ("잘 동작한다" 대신 "X를 저장하면 Y가 반환된다")
- 빌드·타입 검사 통과는 **CI 기준**으로 따로 한 줄에 쓴다: "- AC-xx `npm run typecheck`·`npm run build`가 통과한다"
  (명령은 CI 필수 잡이 실행하는 것만 — scripts/ai/spec-file.mjs CI_COMMANDS)
  이 형식이면 Claude 리뷰는 판정하지 않고 같은 head의 ci 잡 성공으로 판정한다. 다른 주장을 같은 줄에 섞으면 CI 기준이 아니게 되어
  읽기 전용 리뷰가 판정 불가(cannot_determine)로 남겨 게이트가 실패한다
- **lint 통과를 수용 기준으로 쓰지 않는다.** develop에 기존 lint 오류가 있어 CI에서 필수가 아니다(현황 표시만). 테스트 러너도 없으므로 `npm test`도 쓰지 않는다
- BE 의존 기능(API가 아직 없거나 바뀔 예정)은 설계 결정에 "BE 의존"과 mock 위치를 적고, 수용 기준은 mock 기준으로 쓴다
- [manual] 기준의 확인 방법은 "Vercel 프리뷰 또는 로컬 `npm run dev`"에서 어느 화면의 무엇을 보는지로 쓴다

이 주석 블록은 명세를 만들 때 지운다.
-->

## 배경

- 왜 이 작업이 필요한가, 지금 상태는 어떤가 (관련 파일·문서 경로 포함)

## 범위

**포함**

-

**제외**

- 이번에 하지 않는 것과 그 이유. 정책 경로(`.github/`, `.claude/`, `.codex/`, `.agents/`, `docs/ai/`, `docs/workflow/`, `scripts/ai/`, `AGENTS.md`, `CLAUDE.md`)와 `docs/specs/`는 구현 PR에서 바꿀 수 없으므로, 필요하면 여기에 "머지 후 일반 브랜치 PR로 처리"라고 적는다

## 설계 결정

- 구현자가 임의로 정하면 안 되는 결정 (사용할 API·필드는 `docs/API_SPEC.md` 기준, 데이터 구조, 파일 위치 등). 없으면 이 절을 지운다
- BE 의존: 없음 (있으면 "BE 의존 — <API>가 미구현. `src/features/<기능>/mock/`의 mock으로 구현"처럼 쓴다)

## 수용 기준

- AC-01
- AC-02
- AC-03 [manual]

## 테스트 계획

구현 후 **커밋하기 전에** 아래를 실행하고 명령과 결과를 PR 본문에 남긴다. 커밋 후에만 결과가 나오는 명령(`git diff develop...HEAD` 등)은 쓰지 않는다 — 변경 범위 확인은 `git diff --cached --name-status origin/develop`, `git status --short`처럼 인덱스·작업 트리 기준으로 쓴다.

```bash
# 예) 저장소 루트에서
npm run typecheck
npm run build
npm run lint   # 참고용 — 바꾼 파일에 새 오류가 없는지만 본다 (기존 오류는 수용 기준 아님)
git diff --cached --name-status origin/develop
```

[manual] 기준은 무엇을 어떻게 확인하는지 적는다 (예: Vercel 프리뷰 또는 로컬 `npm run dev`의 /kanban에서 카드 드래그 후 위치 유지 확인).
