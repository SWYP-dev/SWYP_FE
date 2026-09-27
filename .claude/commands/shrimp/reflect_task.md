---
description: "analyze_task의 분석 결과를 비판적으로 검토해 완성도를 평가하고 개선점을 찾는다"
---

# /shirimp:reflect_task

`mcp__shrimp-task-manager__reflect_task` 도구를 호출한다. `analyze_task` 결과를 비판적으로 검토해 솔루션의 완전성을 평가하고 최적화 기회를 찾으며, 모범 사례 부합 여부를 확인한다. 코드가 필요하면 pseudocode로 고수준 로직만 제공한다.

## 사용법

```
/shirimp:reflect_task $ARGUMENTS
```

## 파라미터

- `summary` (필수, 10자 이상): `analyze_task` 단계와 동일하게 유지해 연속성을 보장하는 구조화된 작업 요약
- `analysis` (필수, 100자 이상): 모든 기술적 세부사항·의존 컴포넌트·구현 방안을 포함한 완전하고 상세한 기술 분석 결과 (코드는 pseudocode만)

## 동작

1. 직전 `analyze_task` 호출에서 사용한 `summary`를 그대로 재사용한다.
2. `analyze_task`가 반환한 분석 결과를 100자 이상으로 확장·정리해 `analysis`로 전달한다.

## 주의사항

- `analyze_task` 없이 단독으로 의미 있게 사용하기 어렵다 — 먼저 `/shirimp:analyze_task`를 실행한 뒤 사용한다.
