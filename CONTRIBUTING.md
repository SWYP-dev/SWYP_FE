# Contributing Guide

SWYP 웹 14기 채용 공고 통합 관리 서비스 프로젝트의 협업 규칙입니다.
프론트엔드/백엔드 모두 작업 전 이 문서를 한 번씩 읽어주세요.

## 브랜치 전략

```
main
 └─ develop
     ├─ feature/기능명
     └─ hotfix/수정할-기능
```

- **main**: 배포(운영) 브랜치. 직접 커밋 금지, `develop`에서 병합된 안정 버전만 올라옵니다.
- **develop**: 통합 개발 브랜치. 모든 `feature` 브랜치는 여기서 분기하고 여기로 병합합니다.
- **feature/기능명**: 개별 기능 개발 브랜치. 예) `feature/kanban-board`, `feature/slide-panel`
- **hotfix/수정할-기능**: 긴급 수정 브랜치. 배포 후 발견된 급한 버그 등에 사용합니다.

### 브랜치 생성 예시

```bash
git checkout develop
git pull origin develop
git checkout -b feature/기능명
```

## 커밋 컨벤션

| 타입 | 설명 |
|------|------|
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `docs` | 문서 수정 |
| `style` | 코드 스타일 수정 (포맷팅, 세미콜론 등 로직 변경 없음) |
| `design` | 사용자 UI 디자인 변경 |
| `refactor` | 리팩토링 |
| `test` | 테스트 코드 추가/수정 |
| `build` | 빌드 파일 수정 |
| `ci` | CI 설정 파일 수정 |
| `perf` | 성능 개선 |
| `chore` | 설정, 빌드, 패키지 수정 |
| `rename` | 파일 혹은 폴더명만 수정한 경우 |
| `remove` | 파일 삭제 |

**형식**

```
<타입>: <변경 내용 요약>

예)
feat: 칸반 보드 드래그 앤 드롭 기능 추가
fix: 마감일 정렬 오류 수정
design: 슬라이드 패널 레이아웃 조정
chore: prettier 설정 추가
```

- 제목은 50자 이내, 명령문 형태로 간결하게 작성
- 하나의 커밋에는 하나의 논리적 변경만 포함

## 코드 컨벤션

폴더 구조(feature-based), 네이밍 규칙, 코드 스타일, 주석 작성법, API 연동 규칙(공통 응답 타입, ID 문자열 처리, enum 유니온 타입, 에러 코드 분기 처리)은 별도 `CONVENTION.md` 문서를 따릅니다. PR 작성 전 한 번씩 확인해주세요.

## Pull Request 워크플로우

PR 생성 시 base 브랜치는 **반드시 `develop`** 으로 설정합니다. (`main`은 배포 브랜치이므로 기능/문서 PR의 병합 대상이 아닙니다.)

PR 본문은 [`.github/PULL_REQUEST_TEMPLATE.md`](./.github/PULL_REQUEST_TEMPLATE.md)를 따릅니다.

### GitHub 저장소 설정 (최초 1회, 관리자)

| 설정 | 권장값 | 이유 |
|------|--------|------|
| **Default branch for pull requests** | `develop` | PR 생성 시 base가 `main`으로 잡히는 것 방지 |
| **Default branch** | `develop` 권장 | PR 템플릿 자동 적용 조건 충족 (아래 참고) |

> **PR 템플릿 자동 적용 조건**  
> GitHub는 PR 템플릿을 **저장소 default branch**(`main` 또는 `develop`)에 있는 파일만 읽습니다.  
> feature 브랜치에만 있으면 PR 생성 화면에 자동으로 채워지지 않습니다.  
> `develop`에 머지된 뒤에도 default branch가 `main`이면, `develop → main` 병합 전까지는 자동 적용되지 않습니다.  
> git-flow를 쓰는 경우 default branch를 `develop`으로 두는 것을 권장합니다.

**PR 생성 링크 예시** (base=`develop` 고정):

```
https://github.com/SWYP-dev/SWYP_FE/compare/develop...<브랜치명>?expand=1
```

### 1. PR 생성 전 체크리스트

- [ ] `develop` 브랜치 최신 내용을 받아서 충돌을 미리 확인했는가
- [ ] 불필요한 `console.log`, 주석 처리된 코드가 남아있지 않은가
- [ ] 로컬에서 정상 동작 확인했는가
- [ ] PR 템플릿 항목을 빠짐없이 작성했는가

### 2. 리뷰 및 머지 규칙

| 구분 | 규칙 |
|------|------|
| **프론트엔드 PR** | 단독 담당이므로 셀프 리뷰 후 셀프 머지 가능 |
| **백엔드 PR** | 백엔드 팀원 간 상호 리뷰 필수 → 승인 후 **작성자 본인이 머지** |

- 머지 방식은 **Squash and merge**를 기본값으로 사용합니다. (커밋 히스토리를 깔끔하게 유지하기 위함)
- 리뷰 요청 시, 프론트엔드에 직접 영향을 주는 항목과 백엔드 이슈 중 프론트 설계에 간접 영향을 주는 항목을 구분해서 남겨주세요.

### 3. 병합 순서

```
feature/기능명 → develop → (일정 도달 시) main
```

`main`으로의 병합은 팀 논의 후 진행합니다.

## 기타

- 디자인 토큰 관련 변경은 `chore/design-system` 브랜치를 통해서만 진행합니다.
- 필터 상태 등 UI 상태는 로컬 상태가 아닌 URL 쿼리 파라미터 기반으로 관리하는 것을 원칙으로 합니다.
