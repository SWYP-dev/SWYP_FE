---
description: "프로그래밍 관련 주제를 체계적으로 심층 리서치하는 전용 모드로 진입한다"
---

# /shirimp:research_mode

`mcp__shrimp-task-manager__research_mode` 도구를 호출한다. 프로그래밍 관련 주제를 심층적으로 리서치해야 할 때 전용 리서치 모드로 진입한다. 웹 검색과 코드 검색 도구를 체계적으로 사용해 리서치의 깊이와 폭을 보장하고 주제 이탈을 방지한다. 기술 리서치, 모범 사례 탐색, 솔루션 비교 등에 적합하다.

## 사용법

```
/shirimp:research_mode $ARGUMENTS
```

`$ARGUMENTS`는 리서치할 구체적인 주제다.

## 파라미터

- `topic` (필수, 5자 이상): 명확하고 구체적인 리서치 주제
- `currentState` (필수): 지금 수행해야 할 내용 (예: 특정 키워드 웹 검색, 특정 코드 분석). 리서치 후 다시 이 도구를 호출해 이전 상태(`previousState`)와 통합한다
- `nextSteps` (필수): 후속 계획/단계/방향. 주제 이탈 방지 용도이며, 방향이 바뀌면 갱신한다
- `previousState` (선택, 기본 빈 문자열): 이전 리서치 상태 요약. 첫 호출에는 비워두고, 이후 호출부터 이전의 핵심 성과를 채운다

## 동작

1. 첫 호출은 `previousState`를 비워두고 `topic`/`currentState`/`nextSteps`만 채운다.
2. 리서치를 진행한 뒤 다시 호출할 때는 이전 결과를 `previousState`에 요약해 이어간다.
3. 방향이 틀어지면 `nextSteps`를 갱신해 주제를 다시 좁힌다.
