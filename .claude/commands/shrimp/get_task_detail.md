---
description: "작업 ID로 잘리지 않은 전체 구현 가이드와 검증 기준을 조회한다"
---

# /shirimp:get_task_detail

`mcp__shrimp-task-manager__get_task_detail` 도구를 호출한다. 작업 ID를 기반으로 잘리지 않은 완전한 구현 가이드와 검증 기준을 포함한 작업의 전체 상세 정보를 조회한다.

## 사용법

```
/shirimp:get_task_detail $ARGUMENTS
```

`$ARGUMENTS`는 조회할 작업의 `taskId`다. 정확한 ID를 모르면 먼저 `/shirimp:query_task`로 검색한다.

## 파라미터

- `taskId` (필수, 1자 이상): 상세정보를 볼 작업 ID

## 동작

1. `$ARGUMENTS`가 비어 있으면 `/shirimp:list_tasks all` 또는 `/shirimp:query_task`로 후보를 먼저 좁힌다.
2. 반환된 전체 가이드/검증 기준을 요약 없이 필요한 만큼 사용자에게 전달한다.
