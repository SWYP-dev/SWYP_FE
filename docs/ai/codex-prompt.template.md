[Codex 작업 지시 — {{SPEC_ID}} r{{REVISION}}] (템플릿 v1)

명세: {{SPEC_PATH}}
명세 PR: #{{SPEC_PR}} (merge SHA {{MERGE_SHA}})
구현 브랜치: impl/{{SPEC_ID}}-spec-{{SPEC_PR}}

AGENTS.md의 규칙을 모두 따른다. 아래 순서를 건너뛰지 않는다.

## 0. 준비 (실패하면 멈추고 보고)

1. `git status` — 커밋되지 않은 변경이나 내가 만들지 않은 파일이 있으면 손대지 말고 멈춘다
2. `git fetch origin`
3. `git merge-base --is-ancestor {{MERGE_SHA}} origin/develop` 가 성공해야 한다
4. `git diff --quiet {{MERGE_SHA}} origin/develop -- {{SPEC_PATH}}` 가 성공해야 한다 — 실패하면 develop에 더 새 명세가 있다는 뜻이므로 구현하지 않고 `needs_human`으로 종료한다
5. 명세 frontmatter의 `spec_id`가 `{{SPEC_ID}}`, `revision`이 `{{REVISION}}`인지 확인한다. 다르거나 없으면 메타데이터 오류로 종료한다

## 1. 판정 (구현 전에 먼저 출력)

명세 전체와 관련 코드를 읽고, 아래 JSON을 코드 블록 하나로 먼저 출력한다.

```json
{
  "decision": "ready | needs_spec_revision | needs_human",
  "spec_id": "{{SPEC_ID}}",
  "revision": {{REVISION}},
  "summary": "한 줄 요약",
  "blockers": [{ "requirement_id": "AC-xx", "reason": "…", "requested_change": "…" }]
}
```

- `ready`: 명세만으로 모든 수용 기준을 구현·검증할 수 있다
- `needs_spec_revision`: 명세가 모순되거나 빠져서 구현자가 임의로 결정해야 한다. 이때 revision이 2면 대신 `needs_human`
- `needs_human`: 명세 밖의 판단(권한·운영·데이터)이 필요하다

## 2. needs_spec_revision (revision 0·1)

구현하지 않는다. 사용자가 Claude Code에 붙여넣을 **보완 요청문**을 코드 블록 하나로 출력하고 끝낸다.

```
[명세 보완 요청 — {{SPEC_ID}} r{{REVISION}}]
명세: {{SPEC_PATH}} (명세 PR #{{SPEC_PR}})
1. AC-xx — <막힌 이유> → <요청하는 변경>
2. ...
/design-pr 로 revision을 올려 다시 명세 PR을 열어 주세요.
```

## 3. needs_human

근거를 출력하고 끝낸다. 구현·브랜치 생성·커밋을 하지 않는다.

## 4. ready — 구현

1. `git switch -c impl/{{SPEC_ID}}-spec-{{SPEC_PR}} origin/develop`
2. 명세의 범위·설계 결정대로 구현한다. 범위 밖 수정, 명세에 없는 기능·추상화는 하지 않는다
3. **바꾸면 안 되는 경로**: `docs/specs/`, `.github/`, `.claude/`, `.codex/`, `.agents/`, `docs/ai/`, `docs/workflow/`, `scripts/ai/`, 모든 폴더의 `AGENTS.md`·`CLAUDE.md`. 바꿔야 한다면 멈추고 보고한다 (CI가 이 PR을 실패시킨다)
4. **`[manual]` 기준**: 그 기준을 확인할 지점에 오면 멈추고, 사용자에게 무엇을 어떻게 확인하면 되는지(로컬 `npm run dev`의 어느 화면에서 무엇을) 적어 확인을 요청한다. 확인을 받은 뒤 진행한다. PR이 있어야 확인할 수 있는 기준(Vercel 프리뷰 등)은 PR을 만든 뒤에 요청한다
5. 명세의 테스트 계획 명령을 **실제로 실행**한다. 하나라도 실패하면 커밋·PR을 하지 않고 출력과 함께 보고한 뒤 지시를 기다린다. 단 `npm run lint`는 develop에 기존 오류가 있으므로, **내가 바꾼 파일에 새 오류가 없으면** 통과로 본다

## 5. ready — 커밋과 PR

1. 바꾼 파일만 지정해 `git add` 한다 (`git add -A`·`git add .` 금지). 커밋 메시지는 한국어 `<이모지> <타입>: <요약>` 한 줄 제목으로 쓴다 (타입은 `CONTRIBUTING.md`, 이모지는 `.claude/commands/git/commit.md`의 표)
2. PR 본문을 `.ai-tmp/impl-pr-body.md`에 쓴다 (git이 무시하는 경로). `.github/PULL_REQUEST_TEMPLATE.md`의 절을 **순서대로 모두** 쓰고, `## 상세 내용` 다음에 `## 수용 기준`·`## 테스트`를 넣는다. 해당 없는 절은 지우지 말고 "없음"이라고 쓴다
   - `## 개요` — 무엇을 구현했는지 한두 문장
   - `## 작업 유형` — 해당 항목에 체크
   - `## 상세 내용` — 바꾼 파일과 이유
   - `## 수용 기준` — 기준마다 충족 근거(`파일:줄`). `[manual]` 기준은 `- [ ] AC-xx …` 체크리스트로
   - `## 테스트` — 실행한 명령과 결과 요약
   - `## 관련 이슈` — `명세: {{SPEC_PATH}} (명세 PR #{{SPEC_PR}})`
   - `## 스크린샷 / 영상` — UI 변경이 있으면 "사용자가 확인 후 첨부 (`[manual]` AC-xx)", 없으면 "없음"
   - `## 프론트엔드 영향 / 백엔드 확인 필요 사항` — API 계약 변경이 필요해 보이면 "백엔드 관련"에 "BE 담당자 확인 필요"로 적는다
   - `## 체크리스트`, `## 리뷰어에게`
   - 메타데이터 블록은 쓰지 않는다 (스크립트가 붙인다)
3. `node scripts/ai/create-impl-pr.mjs --title "<이모지> <타입>: <요약>" --body-file .ai-tmp/impl-pr-body.md`
   - push와 GitHub 호출이 필요하므로 샌드박스 밖 실행 승인을 요청한다. 사용자가 승인한다
   - 스크립트가 거부하면 우회하지 말고 출력을 그대로 보고한다
4. 출력된 PR URL을 사용자에게 알리고 끝낸다. **PR을 머지하지 않는다. `develop`·`main`에 직접 push하지 않는다.** CI·Claude 리뷰 결과(`pr-gate`)는 사용자가 확인한다

## 6. 수정 요청을 받았을 때

`pr-gate`가 실패해 사용자가 수정을 지시하면, 같은 브랜치에서 지시된 항목만 고치고 **추가 커밋**한다 (amend·force push 금지). 테스트 계획을 다시 실행한 뒤 5-3의 스크립트를 다시 실행하면 push와 PR 본문 갱신이 함께 된다.
