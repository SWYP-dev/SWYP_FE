---
description: "작업의 이름/설명/의존성/관련 파일/구현 가이드/검증 기준을 수정한다"
---

# /shirimp:update_task

`mcp__shrimp-task-manager__update_task` 도구를 호출한다. 작업 내용(이름, 설명, 메모, 의존 작업, 관련 파일, 구현 가이드, 검증 기준)을 수정한다. 완료된 작업은 `summary`(관련 필드)와 관련 파일만 수정 가능하다.

## 사용법

```
/shirimp:update_task $ARGUMENTS
```

`$ARGUMENTS`에 어떤 작업(taskId 또는 이름)의 무엇을 바꿀지 설명한다.

## 파라미터

- `taskId` (필수, UUID v4 형식): 수정할, 존재하고 미완료 상태인 작업의 고유 식별자
- `name` (선택): 새 작업 이름
- `description` (선택): 새 작업 설명
- `notes` (선택): 새 보충 설명
- `dependencies` (선택, 문자열 배열): 새 의존 작업 목록
- `relatedFiles` (선택, 배열): `path`/`type`(TO_MODIFY/REFERENCE/CREATE/DEPENDENCY/OTHER)/`description`/`lineStart`/`lineEnd`
- `implementationGuide` (선택): 새 구현 가이드
- `verificationCriteria` (선택): 새 검증 기준

## 동작

1. 대상 `taskId`가 불명확하면 `/shirimp:query_task`로 먼저 찾는다.
2. 변경할 필드만 채워 호출한다 (나머지는 생략).

## 주의사항

- 완료된 작업에는 요약/관련 파일 외의 필드 수정이 제한된다.
