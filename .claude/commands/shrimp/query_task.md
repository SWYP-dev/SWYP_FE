---
description: "키워드 또는 작업 ID로 작업을 검색해 요약 정보를 보여준다"
---

# /shirimp:query_task

`mcp__shrimp-task-manager__query_task` 도구를 호출한다. 키워드 또는 ID를 기준으로 작업을 검색하고 축약된 작업 정보를 표시한다.

## 사용법

```
/shirimp:query_task $ARGUMENTS
```

`$ARGUMENTS`를 검색어(`query`)로 사용한다. UUID처럼 보이면 ID 검색 모드로 호출한다.

## 파라미터

- `query` (필수, 1자 이상): 작업 ID 또는 공백으로 구분된 여러 키워드
- `isId` (선택, boolean, 기본 false): ID 검색 모드 여부
- `page` (선택, 기본 1): 페이지 번호
- `pageSize` (선택, 기본 5, 최대 20): 페이지당 표시 개수

## 동작

1. `$ARGUMENTS`가 UUID 패턴이면 `isId: true`로 호출한다.
2. 결과가 많으면 `page`/`pageSize`로 필요한 범위만 조회한다.

## 주의사항

- 전체 상세 정보가 필요하면 검색 후 `/shirimp:get_task_detail`로 이어서 조회한다.
