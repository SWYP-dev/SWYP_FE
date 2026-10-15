---
description: "작업 요구사항을 심층 분석하고 코드베이스를 조사해 기술적 실현 가능성과 위험을 평가한다"
---

# /shirimp:analyze_task

`mcp__shrimp-task-manager__analyze_task` 도구를 호출한다. `plan_task` 이후 단계로, 작업 요구사항을 체계적으로 분석하고 실제 코드베이스를 조사해 기술적 실현 가능성과 잠재적 위험을 평가한다. 코드가 필요하면 완전한 코드 대신 pseudocode로 고수준 로직 흐름과 핵심 단계만 제공한다.

## 사용법

```
/shirimp:analyze_task $ARGUMENTS
```

`$ARGUMENTS`에는 분석할 작업에 대한 초기 해결 구상을 적는다.

## 파라미터

- `summary` (필수, 10자 이상): 작업 목표·범위·핵심 기술 과제를 포함한 구조화된 작업 요약
- `initialConcept` (필수, 50자 이상): 기술 방안·아키텍처 설계·실행 전략을 포함한 초기 해결 구상 (코드는 pseudocode만)
- `previousAnalysis` (선택): 재분석 시에만 제공하는 이전 반복의 분석 결과

## 동작

1. 이전 `plan_task`/대화 맥락에서 작업 요약을 뽑아 `summary`로 구성한다.
2. `$ARGUMENTS`(또는 대화에서 논의된 기술 방안)를 50자 이상의 `initialConcept`로 구성한다. 정보가 부족하면 실제 코드를 먼저 읽어 채운다 — 추측하지 않는다.
3. 이미 한 번 분석한 작업을 다시 분석하는 경우 `previousAnalysis`에 이전 결과를 넣어 반복 개선한다.

## 주의사항

- 완전한 소스코드를 작성하지 말고 pseudocode + 핵심 단계만 제공한다.
