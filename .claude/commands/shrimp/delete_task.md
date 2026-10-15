---
description: "미완료 작업을 삭제한다 (완료된 작업은 삭제 불가)"
---

# /shirimp:delete_task

`mcp__shrimp-task-manager__delete_task` 도구를 호출한다. 미완료 작업을 삭제한다. 완료된 작업은 시스템 기록의 무결성을 위해 삭제할 수 없다.

## 사용법

```
/shirimp:delete_task $ARGUMENTS
```

`$ARGUMENTS`는 삭제할 작업의 UUID(`taskId`)다. 비어 있으면 `/shirimp:list_tasks pending`으로 후보를 보여주고 확인받는다.

## 파라미터

- `taskId` (필수, UUID v4 형식): 삭제할, 시스템에 존재하고 미완료 상태인 작업의 고유 식별자

## 동작

1. 대상 작업이 완료 상태가 아닌지 확인한다 (완료 작업이면 도구 호출이 거부된다).
2. 삭제 전 어떤 작업을 삭제하는지 사용자에게 이름/설명으로 한 번 더 확인한다.

## 주의사항

- 삭제는 되돌릴 수 없다. 여러 작업을 한꺼번에 정리하려면 `/shirimp:clear_all_tasks`를 고려하되, 그 쪽이 더 파괴적이므로 신중히 선택한다.
