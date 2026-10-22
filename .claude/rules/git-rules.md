# git-rules.md

이 저장소에서 Git을 사용할 때 따르는 규칙입니다.

## 브랜치 구조

- **`main`**: 배포용 (Vercel). `develop`에서 충분히 검증된 뒤에만 반영하고, `develop` → `main` 병합은 태영 단독으로 배포 시점에 한다
- **`develop`**: 통합 브랜치이자 기본 브랜치. ruleset으로 보호된다 (직접 push·강제 push·삭제 금지, PR 필수, `pr-gate` 필수, 머지 전 최신화 필수)
- 작업 브랜치는 항상 `develop`에서 분기하고 `develop`으로 PR을 연다

## 브랜치 접두사

| 접두사                                                             | 용도                              | 만드는 주체              | 분류(`pr-gate`)                       |
| ------------------------------------------------------------------ | --------------------------------- | ------------------------ | ------------------------------------- |
| `feature/` `fix/` `design/` `refactor/` `chore/` `docs/` `hotfix/` | 일반 작업 (기존 관행)             | 사용자·Claude(요청 시)   | `general`: CI만 필수                  |
| `spec/<SPEC_ID>-r<N>`                                              | 단위 명세 PR (`N` = revision 0~2) | Claude `/design-pr`만    | `spec`: 명세 형식·revision 검사       |
| `impl/<SPEC_ID>-spec-<명세 PR 번호>`                               | 명세 구현 PR                      | Codex `create-impl-pr`만 | `impl`: 메타데이터 대조 + Claude 리뷰 |

- `spec/`·`impl/`은 **파이프라인 예약 접두사**다. 일반 작업에 쓰지 않는다. 형식이 틀리면 `unknown`으로 분류되어 `pr-gate`가 실패한다
- `SPEC_ID`는 대문자로 시작하는 `<묶음>-<번호>` (예: `FEATURE-0001`, `QA-012`)
- 브랜치는 기능 단위로 나눈다 (예: `feature/kanban-board`)

## 경로 규칙

`classify`(CI)와 로컬 `scripts/ai/classify-pr.mjs`가 같은 규칙으로 실제 변경 경로를 대조한다.

| 경로      | 내용                                                                                                                                          | 규칙                                                                                  |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| 명세 경로 | `docs/specs/**`                                                                                                                               | `spec` PR은 이 경로만 바꾼다. `impl` PR은 바꿀 수 없다                                |
| 정책 경로 | `.github/**`, `.claude/**`, `.codex/**`, `.agents/**`, `docs/ai/**`, `docs/workflow/**`, `scripts/ai/**`, 모든 폴더의 `AGENTS.md`·`CLAUDE.md` | `spec`·`impl` PR에서 바꿀 수 없다. **일반 브랜치 PR로 올리고 사용자가 직접 검토**한다 |
| 그 외     | 앱 코드·일반 문서 등                                                                                                                          | `impl` PR의 변경 범위                                                                 |

- 리뷰 기준·프롬프트·스키마·워크플로우를 바꾸는 수정은 그것을 쓰는 spec/impl PR보다 **먼저** 일반 브랜치 PR로 머지한다 (판정 스크립트는 base 쪽 파일로 실행된다)

## 인증/세션 관련 작업

`feature/auth-*`로 격리해서 작업한다. 배포 전 충분한 테스트 없이는 사고 위험이 큰 영역이므로, `develop`에 머지하기 전 별도 검증 단계를 거친다.

## 커밋 메시지

- 한국어, 형식 `<이모지> <타입>: <요약>` (예: `✨ feat: 칸반 카드 정렬 추가`, `📝 docs: FEATURE-0001 명세 추가`)
- 타입은 `CONTRIBUTING.md`, 이모지 대응은 `.claude/commands/git/commit.md`를 따른다
- 하나의 커밋에는 하나의 논리적 변경만 넣는다
- Claude는 사용자가 요청할 때만 커밋한다 (`/design-pr`은 사용자 확인 단계 이후). Codex는 Codex용 프롬프트의 흐름 안에서만 커밋한다

## PR / 머지

- PR base는 항상 `develop`. 본문은 `.github/PULL_REQUEST_TEMPLATE.md` 형식을 따른다 (spec·impl PR 포함)
- **머지는 사용자(태영)만 한다.** Claude·Codex는 머지, `develop`·`main` push, force push를 하지 않는다. 자동 머지는 쓰지 않는다
- 머지 조건: `pr-gate` 통과 + 브랜치 최신화(base가 바뀌었으면 Update branch 후 재검증) + `[manual]` 체크리스트 확인
- 승인 필수 규칙은 쓰지 않는다 (FE 레포 단독 작업. 켜면 본인 PR을 승인할 수 없어 막힌다)
- 파이프라인 도입용 PR(정책 경로만 바꾸는 PR)에는 "이 PR은 파이프라인 도입용이며 앱 코드는 바꾸지 않는다"를 본문에 적는다
- GitHub 웹의 PR 생성 화면이 500을 반환하면 `gh pr create --base develop`으로 만든다. 로컬 머지 후 `develop`에 push하는 우회는 ruleset으로 막히므로 쓰지 않는다

## 보안

- `.env*` 파일은 커밋하지 않는다 (Public 레포)
- 토큰·API 키는 채팅이나 파일에 쓰지 않는다. GitHub Secrets(`CLAUDE_CODE_OAUTH_TOKEN`)는 사용자가 직접 등록한다
