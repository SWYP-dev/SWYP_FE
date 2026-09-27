---
description: "특정 작업 ID의 실행 가이드를 조회한다 (호출 자체가 작업 완료를 의미하지 않음)"
---

# /shirimp:execute_task

`mcp__shrimp-task-manager__execute_task` 도구를 호출한다. 특정 작업의 지침 가이드를 조회한다. 이 가이드를 기반으로 실제 프로그래밍 작업을 완료해야 한다.

## 사용법

```
/shirimp:execute_task $ARGUMENTS
```

`$ARGUMENTS`는 실행할 작업의 UUID(`taskId`)다. 비어 있으면 `/shirimp:list_tasks pending`으로 후보를 먼저 보여주고 사용자에게 확인받는다.

## 파라미터

- `taskId` (필수, UUID v4 형식): 시스템에 존재하는 유효한 작업의 고유 식별자

## 동작

1. `$ARGUMENTS`가 유효한 UUID 형식이 아니면 작업 목록에서 taskId를 확인한다.
2. 도구가 반환하는 단계별 가이드를 **그대로 따라** 실제 코드 작업을 수행한다.

## 주의사항

- **엄중 경고**: `execute_task`를 호출했다고 해서 작업이 완료된 것이 아니다. 도구가 반환한 가이드에 따라 단계별로 실제 구현을 마쳐야 하며, 완료 후에는 `/shirimp:verify_task`로 검증해야 한다.
