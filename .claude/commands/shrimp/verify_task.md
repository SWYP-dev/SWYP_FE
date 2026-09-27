---
description: "작업 완료 여부를 검증 기준에 따라 채점한다 (80점 이상이면 자동 완료 처리)"
---

# /shirimp:verify_task

`mcp__shrimp-task-manager__verify_task` 도구를 호출한다. `verificationCriteria`에 따라 작업을 종합적으로 점검하고 채점한다. `verificationCriteria`를 모르거나 잊었다면 먼저 `/shirimp:get_task_detail`로 조회한다.

## 사용법

```
/shirimp:verify_task $ARGUMENTS
```

`$ARGUMENTS`는 검증할 작업의 UUID(`taskId`)다.

## 채점 기준

1. **요구사항 부합도 (30%)** — 기능 완전성, 제약조건 준수, 엣지케이스 처리
2. **기술 품질 (30%)** — 아키텍처 일관성, 코드 견고성, 구현의 우아함
3. **통합 호환성 (20%)** — 시스템 통합, 상호운용성, 호환성 유지
4. **성능 확장성 (20%)** — 성능 최적화, 부하 적응력, 리소스 관리

## 파라미터

- `taskId` (필수, UUID v4 형식): 검증할 작업의 고유 식별자
- `score` (필수, 0~100): 위 기준에 따른 종합 점수. 80점 이상이면 작업이 자동으로 완료 처리된다
- `summary` (필수, 30자 이상):
  - 80점 이상: 구현 결과와 중요한 결정을 간결히 설명하는 완료 요약
  - 80점 미만: 누락되거나 수정이 필요한 부분에 대한 설명

## 동작

1. `get_task_detail`로 `verificationCriteria`를 확인한다.
2. 기준별로 실제 코드/결과를 점검해 `score`를 산정한다.
3. 점수에 맞는 형식으로 `summary`를 작성한다.

## 주의사항

- 점수를 근거 없이 후하게 주지 않는다 — 각 기준을 실제로 확인한 뒤 채점한다.
