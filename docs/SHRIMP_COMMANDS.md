# Shrimp Task Manager 커맨드 가이드

`.claude/commands/shrimp/`에 등록된 커스텀 슬래시 커맨드 목록. 실제 호출은 `/shrimp:커맨드명` 형식.

## 1. 프로젝트 준비

| 커맨드 | 설명 |
|---|---|
| `/shrimp:init_project_rules` | 프로젝트 표준 문서(`shrimp-rules.md`) 생성/갱신. 새 프로젝트에 처음 붙이거나 규칙이 바뀌었을 때 실행 |

## 2. 작업 계획 단계

| 커맨드 | 설명 |
|---|---|
| `/shrimp:plan_task` | 복잡한 작업/기능에 대한 계획 수립 가이드 시작. 기존 작업 참고해서 중복 방지 |
| `/shrimp:analyze_task` | `plan_task` 다음 단계. 코드베이스 실제 조사해서 기술적 실현 가능성·리스크 평가 |
| `/shrimp:reflect_task` | `analyze_task` 결과를 비판적으로 재검토해서 완성도 평가, 개선점 도출 |
| `/shrimp:split_tasks` | 복잡한 작업을 독립적으로 완료·검증 가능한 서브태스크로 분할 (의존관계·우선순위 설정) |
| `/shrimp:research_mode` | 웹/코드 검색으로 특정 기술 주제를 심층 리서치하는 전용 모드 |

## 3. 작업 조회

| 커맨드 | 설명 |
|---|---|
| `/shrimp:list_tasks` | 상태별(all/pending/in_progress/completed) 작업 목록 조회 |
| `/shrimp:query_task` | 키워드나 ID로 작업 검색 (요약 정보) |
| `/shrimp:get_task_detail` | 작업 ID로 잘리지 않은 전체 구현 가이드·검증 기준 조회 |

## 4. 작업 실행/수정

| 커맨드 | 설명 |
|---|---|
| `/shrimp:execute_task` | 특정 작업의 실행 가이드 조회 (호출 자체가 완료 처리는 아님, 이후 실제 구현은 직접 해야 함) |
| `/shrimp:update_task` | 작업 이름/설명/의존성/관련 파일/구현 가이드/검증 기준 수정 (완료된 작업은 summary·관련 파일만 수정 가능) |
| `/shrimp:verify_task` | 검증 기준에 따라 작업 완료 여부 채점 (80점 이상이면 자동 완료 처리) |

## 5. 정리/삭제

| 커맨드 | 설명 |
|---|---|
| `/shrimp:delete_task` | 미완료 작업 삭제 (완료된 작업은 기록 무결성 때문에 삭제 불가) |
| `/shrimp:clear_all_tasks` | ⚠️ 미완료 작업 전체 초기화 (파괴적 작업, 완료 작업은 백업 후 유지) |

## 6. 보조 도구

| 커맨드 | 설명 |
|---|---|
| `/shrimp:process_thought` | 가설 세우고 검증·수정하며 단계적으로 사고를 심화시키는 프로세스 기록용 |

## 일반적인 흐름

```
init_project_rules (최초 1회)
  → plan_task → analyze_task → reflect_task → split_tasks
  → (list_tasks / query_task로 확인)
  → execute_task → 구현 → verify_task
```
