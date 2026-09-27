---
description: "가설을 세우고 검증·수정하며 단계적으로 사고를 심화하는 프로세스를 기록한다"
---

# /shirimp:process_thought

`mcp__shrimp-task-manager__process_thought` 도구를 호출한다. 가설을 세우고, 의심하고, 검증하고, 수정하는 과정을 통해 점진적으로 이해를 심화시키고 효과적인 해결책을 도출하는 유연하고 발전 가능한 사고 프로세스를 진행한다. 데이터 수집·분석·리서치가 필요한 상황에서는 먼저 프로젝트 관련 코드를 검토하고, 관련 코드가 없으면 추측 대신 웹을 검색한다.

## 사용법

```
/shirimp:process_thought $ARGUMENTS
```

`$ARGUMENTS`는 이번 사고 단계에서 다룰 내용이다.

## 파라미터

- `thought` (필수, 1자 이상): 사고 내용
- `thought_number` (필수, 정수>0): 현재 사고 번호
- `total_thoughts` (필수, 정수>0): 예상 총 사고 수 (더 필요하면 언제든 변경 가능)
- `next_thought_needed` (필수, boolean): 다음 사고 단계가 필요한지 여부 (충분하면 false)
- `stage` (필수): 사고 단계 — Problem Definition / Information Gathering / Research / Analysis / Synthesis / Conclusion / Critical Questioning / Planning 중 하나
- `tags` (선택, 문자열 배열): 사고 태그
- `axioms_used` (선택, 문자열 배열): 사용한 공리
- `assumptions_challenged` (선택, 문자열 배열): 도전한 가정

## 동작

1. 현재 몇 번째 사고 단계인지, 전체 예상 단계 수를 파악해 `thought_number`/`total_thoughts`를 설정한다.
2. 사고가 충분히 진행되어 결론에 도달했으면 `next_thought_needed: false`로 마무리한다.

## 주의사항

- 이 도구는 작업을 대신 완료해주지 않는다 — 사고 과정을 구조화하고 기록하는 용도다.
