---
spec_id: CLEANUP-0001
revision: 0
---

# CLEANUP-0001 — 실수로 커밋된 `tatus` 파일 삭제

## 배경

- 저장소 루트의 `tatus`(약 3.4KB)는 `git log` 출력이 파일로 저장된 것이다. 2026-07-09 `d8192fa`(#12) 무렵 `git status`를 잘못 입력해 생긴 것으로 보이며, 이후 커밋에 포함되어 추적되고 있다
- 코드·설정·문서 어디에서도 이 파일을 참조하지 않는다 (`git grep -n "tatus"`로 확인. `status`가 포함된 단어만 검색된다)
- Claude·Codex 파이프라인의 첫 파일럿으로, 앱 동작에 영향이 없는 삭제 1건을 끝까지 실행한다 (`docs/workflow/claude-codex-plan.md` 0장 세팅 순서 Step 4)

## 범위

**포함**

- 루트의 `tatus` 파일 삭제

**제외**

- 다른 파일 정리(`.gitignore` 추가 등). 이번 작업은 삭제 1건만 한다
- plan 문서에 파일럿 결과를 기록하는 일. 정책 경로라 구현 PR에서 바꿀 수 없으므로 머지 후 일반 브랜치 PR로 처리

## 설계 결정

- 삭제는 `git rm tatus`로 한다
- BE 의존: 없음

## 수용 기준

- AC-01 루트의 `tatus` 파일이 저장소에서 삭제된다 (`git ls-files tatus`의 출력이 비어 있다)
- AC-02 `tatus` 외에는 어떤 파일도 바뀌지 않는다
- AC-03 `npm run typecheck`·`npm run build`가 통과한다
- AC-04 [manual] Vercel 프리뷰 또는 로컬 `npm run dev`에서 랜딩 페이지(`/`)가 이전과 같이 표시된다

## 테스트 계획

구현 후 **커밋하기 전에** 아래를 실행하고 명령과 결과를 PR 본문에 남긴다.

```bash
# 아래는 git rm tatus 실행 후, 커밋하기 전에 실행한다 (구현 전에는 tatus가 출력되는 것이 정상)

# (AC-01) 출력이 비어 있어야 한다
git ls-files tatus

# (AC-02) 출력이 "D<탭>tatus" 한 줄이어야 한다
git diff --cached --name-status origin/develop

# (AC-03)
npm run typecheck
npm run build
```

AC-04 [manual]: PR을 만든 뒤 PR의 Vercel 프리뷰(또는 로컬 `npm run dev`의 `http://localhost:3000/`)에서 랜딩 페이지가 깨짐 없이 표시되는지 사용자가 확인한다.
