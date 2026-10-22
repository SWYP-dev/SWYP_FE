# docs/specs

Claude·Codex 파이프라인의 **단위 명세** 폴더입니다 (`docs/workflow/claude-codex-plan.md` 6.1).

- 단위 명세: `docs/specs/<SPEC_ID>.md`. frontmatter(`spec_id`, `revision`)와 수용 기준(`AC-xx`)을 CI가 검사한다
- 그 외 파일(이 README 등)은 관련 문서로 취급하며 검사 대상이 아니다
- 새 명세는 `/design-pr`로 `docs/ai/spec-template.md`를 복사해 만든다. 이 폴더는 `spec/` 브랜치 PR에서만 바꾼다
