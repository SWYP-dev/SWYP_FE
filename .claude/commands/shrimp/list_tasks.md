---
description: "상태별(all/pending/in_progress/completed) 작업 목록을 조회한다"
---

# /shirimp:list_tasks

`mcp__shrimp-task-manager__list_tasks` 도구를 호출한다. 상태 추적, 우선순위, 의존관계를 포함한 구조화된 작업 목록을 생성한다.

## 사용법

```
/shirimp:list_tasks $ARGUMENTS
```

`$ARGUMENTS`가 `all` / `pending` / `in_progress` / `completed` 중 하나면 그대로 `status`로 사용하고, 비어 있으면 `all`을 기본값으로 사용한다.

## 파라미터

- `status` (필수, enum: `all` | `pending` | `in_progress` | `completed`): 조회할 작업 상태

## 동작

1. `$ARGUMENTS`를 파싱해 유효한 enum 값이면 그대로 사용, 아니면 `all`로 호출한다.
2. 반환된 목록을 표 형태(이름/상태/의존성)로 요약해 사용자에게 보여준다.

## 주의사항

- 대량의 완료 작업이 있으면 목록이 길어질 수 있으므로, 사용자가 특정 상태만 원한다는 신호가 있으면 그 상태로 좁혀 호출한다.
