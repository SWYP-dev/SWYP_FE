---
description: "복잡한 작업을 독립적인 서브태스크로 분할하고 의존관계·우선순위를 설정한다"
---

# /shirimp:split_tasks

`mcp__shrimp-task-manager__split_tasks` 도구를 호출한다. 복잡한 작업을 독립적으로 완료·검증 가능한 서브태스크로 분할한다.

## 사용법

```
/shirimp:split_tasks $ARGUMENTS
```

`$ARGUMENTS`에 분할할 작업 목록(또는 지금까지 논의한 기능 범위)을 설명한다.

## 파라미터

- `updateMode` (필수, enum): `append`(기존 유지+추가) | `overwrite`(미완료 작업 전체 교체) | `selective`(이름 매칭 기반 스마트 업데이트, 미세조정 권장) | `clearAllTasks`(전체 초기화+백업). 사용자가 명시하지 않으면 기본은 `clearAllTasks`이며, 기존 작업을 유지하며 미세조정하려는 의도가 보이면 `selective`를 제안한다.
- `tasksRaw` (필수, JSON 문자열): 각 작업이 `name`/`description`/`implementationGuide`/`notes`/`dependencies`/`relatedFiles`/`verificationCriteria`를 포함하는 배열

## 분할 원칙 (필독)

- **최소 단위**: 각 서브태스크는 개발자 1인이 1~2일(8~16시간) 내 완료·검증 가능해야 한다
- **최대 복잡도 제한**: 하나의 서브태스크가 프론트/백엔드/DB 등 여러 기술 영역을 넘나들지 않는다 — 교차 영역 작업은 여러 서브태스크로 나눈다
- **권장 작업 수**: 한 번에 10개를 넘지 않는다. 더 필요하면 우선순위별로 6~8개씩 배치 제출한다
- **권장 길이**: 각 분할 항목은 5,000자를 넘지 않는다
- **깊이 제한**: 작업 트리는 3단계(기능 모듈 → 주요 흐름 → 핵심 단계)를 넘지 않는다

## 동작

1. 대화에서 정의된 서브태스크들을 위 원칙에 맞게 정리한다.
2. 각 서브태스크의 `dependencies`(선행 작업 전체 이름)와 `relatedFiles`(TO_MODIFY/REFERENCE/CREATE/DEPENDENCY/OTHER)를 명시한다.
3. 인터페이스 설계가 포함되면 함수/클래스/스키마 정의, 타입, 에러 처리, 예시 데이터까지 일관되게 제공한다.
4. `updateMode`를 사용자 의도에 맞게 선택한다 — 애매하면 `selective`를 기본으로 제안하고 확인받는다.

## 주의사항

- `overwrite`/`clearAllTasks`는 기존 미완료 작업에 영향을 준다 — 사용자에게 먼저 확인한다.
