# 취합(Chwihap) API 명세서 — 설명 보완본

**버전:** v1.14.0 | **작성일:** 2026-07-26 | **Base URL:** `https://api.chwihap.com`

- 변경 사항

  > **v1.0 → v1.1 변경 사항**
  - 알림 처리 방식: Kafka 비동기 큐 → Spring `@Scheduled` 기반 스케줄러로 변경
  - 알림 채널: 이메일 + 서비스 내 인앱 알림창 (카카오 알림톡 제거)
  - 7. Worker Internal API: Kafka 트리거 방식 제거, `@Scheduled`가 직접 처리하므로 내부 API 불필요
  - 5. Notification: 인앱 알림 조회 및 읽음 처리 API 추가, `NotificationType` Enum 변경

  > **v1.1 → v1.2 변경 사항**
  >
  > - DB 명세서 반영: `DocumentType` Enum에 `MEMO` 추가, 4.3 서류 목록에 MEMO 타입 예시 추가
  > - 4.3 서류 엔드포인트: FILE/LINK 분리 → `doc_type` 기반 단일 엔드포인트로 통합, MEMO 등록 API 추가
  > - 6.1 `storageLimit` 값 수정: 500MB → 100MB (DB 명세 기준)
  > - 3.1 칸반 보드 응답 필드명: `order` → `position` (DB 컬럼명 통일)
  > - 2.1 공고 피드 조회 설명: MySQL 원본 저장 + Redis 캐싱 방식으로 명확화
  >
  > **v1.2 → v1.3 변경 사항**
  >
  > - 3.2 칸반 카드 등록: 즐겨찾기 선행 정책 확정 — 즐겨찾기하지 않은 공고 등록 시 `POSTING_NOT_FAVORITED` (400) 에러 추가
  > - 3.3 칸반 카드 스테이지 이동: `position` 충돌 시 서버 재정렬 방식으로 정책 확정 (Lexorank 등은 추후 성능 이슈 발생 시 재검토)
  >
  > **v1.3 → v1.4 변경 사항**
  >
  > - 2.1 공고 피드 조회: `totalCount` 필드 제거 (커서 페이지네이션과의 구조적 충돌 해소)
  > - 3.4 칸반 카드 상세 조회: FILE 타입 서류의 `url` 필드 제거, 다운로드는 4.6 API 호출로 통일
  > - 3.6 칸반 카드 삭제 / 4.5 서류 삭제: 첨부 서류 삭제 정책 확정 — DB는 즉시 소프트 딜리트, S3 실제 파일은 매일 배치로 물리 삭제
  > - 3.8 스테이지 수정: 기본 스테이지 이름·순서 수정 허용 확정, 신규 카드 등록 대상 스테이지는 `position`이 아닌 고정 `stageId`로 식별하도록 명확화
  > - 4.1 서류 업로드(파일): `downloadUrl` 미포함 정책 확정 (4.6 흐름으로 통일)
  > - 6.2 회원 탈퇴: `deleted_at` 기준 30일 유예 후 S3 파일 및 계정 데이터 하드 삭제하는 배치 정책 확정
  > - 스케줄러 동작 명세에 S3 파일 정리, 탈퇴 계정 정리 배치 작업 추가
  >
  > **v1.4 → v1.5 변경 사항**
  >
  > - 3.3 / 3.7 오타 수정: `order` → `position` (v1.2에서 필드명 통일했으나 설명 텍스트에 누락되어 있던 부분)
  > - 4.4 서류 목록 조회: FILE 타입 `downloadUrl` 제거, 3.4와 동일하게 4.6 흐름으로 통일 (목록 응답도 캐싱 가능성이 있어 presigned URL을 담아두지 않기로 확정)
  > - 6.2 회원 탈퇴: S3 파일은 30일 유예 후 배치로 물리 삭제하되, 계정·서류 DB 레코드는 하드 삭제하지 않고 소프트 딜리트 상태로 계속 유지하는 것으로 정정
  >
  > **v1.5 → v1.6 변경 사항**
  >
  > - 공통 에러 응답 포맷: `error: { code, message }` 중첩 구조 → `code`/`message` 최상위 평탄화로 변경 (실제 공통 `ApiResponse` 구현 기준으로 정정, 인증/카카오 로그인 기능 구현 중 확인됨)
  >
  > **v1.6 → v1.7 변경 사항**
  >
  > - DB 명세서의 “복사(스냅샷) 모델” 반영: `job_feed`(공용 피드, 재수집 시 교체/만료될 수 있음)와 `job_postings`(유저가 즐겨찾기 시 복사해 영구 보존하는 사본)의 생명주기가 다름을 API 설계에 반영
  > - 2.3 즐겨찾기 추가: 응답에 `jobPostingId` 필드 추가. 즐겨찾기 시 서버 내부적으로 `job_postings`에 사본이 생성되며, 이후 즐겨찾기 관리(해제·목록)는 이 ID를 기준으로 한다 (원본 `job_feed`가 만료·재수집으로 사라져도 유지되는 안정적인 식별자이기 때문)
  > - 2.4 즐겨찾기 해제: `DELETE /api/v1/feed/{postingId}/favorite` → `DELETE /api/v1/feed/favorites/{jobPostingId}`로 엔드포인트 변경. 피드 ID가 아닌 사본 ID로 식별해야 만료되어 피드에서 사라진 공고도 즐겨찾기 해제가 가능하다
  > - 2.5 즐겨찾기 목록 조회: 응답 아이템의 `id` 필드명을 `jobPostingId`로 변경 (2.4 호출 시 그대로 사용)
  >
  > **v1.7 → v1.8 변경 사항**
  >
  > - 기능명세서(“통합 공고 목록 조회”) 대조 중 API 명세서에서 누락된 부분 발견 및 보완
  > - 2.1 공고 피드 조회: `region`(지역) 필터 파라미터 추가. `job_feed.region` 컬럼과 관련 인덱스는 DB 명세서에 이미 있었으나 API 파라미터 표에서 누락되어 있었음
  > - 2.1 공고 피드 조회: `jobCategory`, `career`도 `platform`과 동일하게 다중 선택(콤마 구분) 지원으로 확장 (기능명세서: “플랫폼, 지역, 직무, 경력, 마감일 임박 카테고리별 다중 선택 필터”)
  >
  > **v1.8 → v1.9 변경 사항**
  >
  > - **페이지네이션 방식 변경 (커서 → 페이지 번호):** 기능명세서 v1.2(“공고 페이징 조회”: 한 페이지당 20개 + 하단 페이지네이션 UI) 및 PRD v1.3(4.1.3 스크롤: 무한 스크롤 → 페이지네이션) 반영.
  > - 2.1 공고 피드 조회: `cursor` → `page`(0부터 시작) 파라미터로 변경. 응답의 `nextCursor` 제거, `page`/`size`/`totalPages`/`totalElements` 추가. (v1.4에서 제거했던 전체 개수 필드를 페이지 UI를 위해 `totalElements`/`totalPages`로 재도입). `INVALID_CURSOR` 에러 제거.
  > - 2.5 스크랩 목록 조회: 동일하게 `cursor` → `page` 전환, 응답에 페이지 메타데이터 추가.
  > - **용어 변경 (즐겨찾기 → 스크랩):** 기능명세서 v1.2·PRD v1.3에서 “즐겨찾기”가 “스크랩”으로 전면 변경됨에 따라 API 계약도 정합화.
  > - 엔드포인트: `POST /feed/{postingId}/favorite` → `POST /feed/{postingId}/scrap`, `DELETE /feed/favorites/{jobPostingId}` → `DELETE /feed/scraps/{jobPostingId}`, `GET /feed/favorites` → `GET /feed/scraps`
  > - 응답 필드: `isFavorite` → `isScrapped`, `favoritedAt` → `scrappedAt`
  > - 에러 코드: `FAVORITE_NOT_FOUND` → `SCRAP_NOT_FOUND` (코드값 F003 유지)
  > - 참고: 내부 영속 계층(`bookmarks` 테이블)은 명칭 변경 없이 유지. 3장 칸반 등록의 “스크랩 선행” 정책 문구·`POSTING_NOT_FAVORITED` 정합화는 별도 후속으로 처리 예정.
  > - **`Platform` Enum에 `PUBLIC` 추가:** 공공데이터포털(data.go.kr) 채용정보 API 수집 공고의 출처 뱃지 구분값. (Appendix 반영)
  >
  > **v1.9 → v1.10 변경 사항**
  >
  > - **2.1 공고 피드 조회: Redis 캐싱 전략 도입 보류.** k6 부하테스트로 baseline(3,673건)/대용량(50,673건)/조합 필터 시나리오를 실측한 결과, 현재 스코프(공공데이터포털 단일 소스)에서는 캐싱 도입 성능 근거를 찾지 못함 — 자세한 측정 과정과 근거는 `docs/Redis_도입_구현_기록.md` 참고. 조회는 MySQL 직접 조회만 유지하며, Phase 2에서 데이터 소스가 추가돼 실데이터 규모가 커지면 재검토 예정.
  >
  > **v1.10 → v1.11 변경 사항 (실제 코드 기준 정합화, 2026-07-24)**
  >
  > - **공통 에러 코드**: 명세서상 `UNAUTHORIZED`/`FORBIDDEN`/`NOT_FOUND`/`INVALID_INPUT`/`INTERNAL_ERROR` 표기를 실제 `ErrorCode` 구현 체계(도메인 접두어 A/U/F/K/C + 3자리 숫자)로 전면 정정. `FORBIDDEN` 코드는 실제로 존재하지 않음.
  > - **1.1 카카오 로그인**: `redirectUri` 필드 필수 추가, 화이트리스트 검증 실패 시 `INVALID_KAKAO_REDIRECT_URI`(A006, 400) 에러 추가.
  > - **2.1 공고 피드 조회**: 비로그인(토큰 없음) 접근을 허용하도록 인증 예외 처리됨(`SecurityConfig` GET permitAll). 공고 수집 소스가 “공공데이터포털 단일”이 아니라 워크넷(WORKNET)·공공기관(PUBLIC)·인사혁신처 공공취업정보(PUBLIC_PERSONNEL)·사람인(SARAMIN)·직접등록(DIRECT) 다중 소스임을 반영(`WANTED`는 실제로 존재하지 않음). `jobCategory`는 Enum이 아닌 자유 문자열, `region`은 `Region` Enum(17개 시/도 + 기타) 기반으로 자동 정규화됨을 명확화.
  > - **2.2 공고 상세 조회**: 현재 미인증 상태로 호출 시 서버 오류(500)가 발생할 수 있는 미해결 이슈 있음(비로그인 예외 처리가 2.1에만 적용되고 2.2에는 누락). 코드 확인 필요 항목으로 표시.
  > - **2.6**: 기존에 명세돼 있던 “단건 URL 등록(OG 파싱)” 기능은 실제로 구현되지 않았으며, 대신 “스크랩 없이 바로 칸반 등록”(`POST /api/v1/feed/{postingId}/kanban-card`) 기능으로 대체 반영.
  > - **3장 칸반**: 실제 에러 코드명 정정(`ALREADY_REGISTERED`→`DUPLICATE_KANBAN_CARD`, `CARD_NOT_FOUND`/`STAGE_NOT_FOUND`→`ENTITY_NOT_FOUND`, `DEFAULT_STAGE_NOT_DELETABLE`→`DEFAULT_STAGE_DELETE_NOT_ALLOWED`). 명세서에 없던 `POSTING_NOT_FAVORITED` 에러는 실제로 존재하지 않음 — 칸반 카드 등록은 “스크랩된 공고 소유 여부”를 `ENTITY_NOT_FOUND`로 처리. 스테이지 이름 검증 에러(K005~K009) 신규 반영. 3.8 스테이지 수정: 기본 스테이지는 이름 변경도 불가하도록 정책이 역전됨(`DEFAULT_STAGE_NAME_CHANGE_NOT_ALLOWED`, K023) — 문서 정책 문구와 실제 동작이 상충했던 부분 정정. 3.9 삭제: 카드가 있는 스테이지 삭제 시 `STAGE_HAS_CARDS`(K022) 신규 반영. 공고 직접 입력 등록(`POST /kanban/cards/direct`)·수정(`PATCH /kanban/cards/{cardId}/update`) API 신규 반영(3.10, 3.11).
  > - **4.1 서류 업로드(파일)**: Request에 `name` 필드가 실제로는 없음(업로드 파일의 원본 파일명을 그대로 사용) — 명세서에서 제거.
  > - **5.1/5.2 알림 설정**: `remindDays` 기본값이 `[7, 3, 1]`이 아니라 `[7, 3, 1, 0]`(당일 포함)임을 정정.
  > - **5.4 인앱 알림 목록**: “페이지네이션 없이 최근 N건” 설명을 삭제하고, 5.3과 동일한 `cursor`/`nextCursor`/`hasNext` 커서 기반 더보기 방식으로 정정(실제 `InAppNotificationListResponse` 기준).
  > - **Appendix**: `Platform`→`JobPlatform`(`SARAMIN, WORKNET, PUBLIC, PUBLIC_PERSONNEL, DIRECT`), `Career`→`CareerType`으로 실제 클래스명 반영, `JobCategory`는 Enum이 아닌 자유 문자열임을 명시, `Region` Enum 신규 추가, 구현되지 않은 `ParseStatus` 제거.
  > - **스케줄러 동작 명세**: “만료 공고 정리(0시)”, “탈퇴 계정 정리(2시)”는 실제 코드베이스에 구현되어 있지 않아 제거. 공고 수집을 워크넷/공공기관 수집(`JobFeedSyncScheduler`)과 공공취업정보 수집(`JobFeedPersonnelJobSyncScheduler`)으로 분리 반영(각각 매일 08/20시, 독립된 분산락 키 사용). 명세서에 없던 알림 이력 정리 스케줄러(`NotificationCleanupScheduler`, 매일 03시, 기본 보관기간 90일) 신규 반영.
  >
  > **v1.13 → v1.14 변경 사항 (2026-07-26)**
  >
  > - **4.1/4.4 서류(FILE) 응답: `name`이 항상 `{원본파일명}_v{version}.{확장자}` 형태로 반환되도록 정정.** 기존에는 목록 조회(4.4) 예시에만 버전 접미사가 붙어있고 업로드(4.1) 응답 예시는 원본 파일명 그대로였는데, 실제 구현(`DocumentResponse.resolveDocumentName`)은 업로드 시점부터 일관되게 버전 접미사를 붙인다. 확장자가 없는 파일명은 `{파일명}_v{version}`으로 반환.
  > - **4.2 서류 등록(외부 링크): Request/Response에 `category` 필드 추가(필수).** `DocumentLinkCategory` Enum(`RESUME`/`PORTFOLIO`/`PERSONAL_CHANNEL`/`OTHER`)으로, 링크 등록 시 필수 입력값이 됨. FILE/MEMO 타입에는 해당 필드가 없음(`null` 처리, 응답에서 생략됨).
  > - **4.7 링크 카테고리 수정 API 신규 추가**: `PATCH /api/v1/kanban/cards/{cardId}/documents/{documentId}/link/category`. LINK 타입 서류의 카테고리만 변경, FILE/MEMO 타입 호출 시 `INVALID_LINK_DOCUMENT_TYPE`(400) 에러.
  > - **4.8 링크 URL 수정 API 신규 추가**: `PATCH /api/v1/kanban/cards/{cardId}/documents/{documentId}/link`. LINK 타입 서류의 `url`만 변경하며 `name`은 변경되지 않음(등록 당시 이름 유지). 마찬가지로 LINK가 아닌 타입에는 `INVALID_LINK_DOCUMENT_TYPE`(400) 에러.
  > - **에러 코드 추가**: `INVALID_LINK_DOCUMENT_TYPE`(400) — “LINK 타입 서류만 링크 정보를 수정할 수 있습니다.”
  >
  > **v1.12 → v1.13 변경 사항 (2026-07-26)**
  >
  > - **2.5 스크랩 목록 조회: `jobCategory`/`career`/`region`/`deadlineSoon` 쿼리 파라미터 추가.** FE 스크랩 페이지에 직군·지역·경력·마감일 임박 필터 UI가 이미 있었으나 API가 `page`/`size`만 지원해 동작하지 않던 문제(QA 리포트) 해결. 필터 문법은 2.1 공고 피드 조회와 동일(콤마 구분 다중 선택, `deadlineSoon`은 마감 7일 이내 불리언 필터). `excludeExpired`는 스크랩 목록에는 적용하지 않음 — 스크랩은 만료 후에도 “내 공고” 관리 목적으로 계속 조회되어야 하는 사용자 소유 사본이라 2.1의 만료 제외 정책과 다르다.
  > - **2.5 스크랩 목록 조회: Response 예시에 실제 응답 필드인 `platform`/`jobCategory`/`career`/`region` 반영.** 기존 명세는 “스크랩 탭은 관리 목적이라 이 필드들을 제외했다”고 서술했으나, 실제 `ScrapListItemResponse` 구현에는 처음부터 포함되어 있었음(문서-코드 불일치 정정). 이번에 필터 파라미터를 추가하며 프론트가 카드에 해당 값을 표시/필터링할 수 있어야 하므로 응답에 유지.
  >
  > **v1.11 → v1.12 변경 사항 (2026-07-26)**
  >
  > - **2.1 공고 피드 조회: `excludeExpired` 쿼리 파라미터 추가 (기본값 `true`).** PRD 4.1.2 원칙(마감 지난 공고는 피드에서 자동 제외)을 조회 시점에 서버가 반영하도록 함. 기존에는 마감 여부와 무관하게 전체 공고를 조회하고 `isExpired` 플래그만 응답에 실어 보내, FE가 클라이언트 사이드로 만료 공고를 걸러내야 했음 — 이 경우 `totalElements`/`totalPages`가 필터링 전 개수 기준이라 페이지당 카드 수가 20개 미만으로 보이는 문제가 있었음. `excludeExpired=true`(기본값)로 호출하면 서버가 조회 쿼리 단계에서부터 마감 지난 공고를 제외하므로 페이지네이션 메타데이터와 실제 노출 카드 수가 일치함. `excludeExpired=false`로 호출하면 기존처럼 만료 공고도 포함해 조회 가능(`isExpired` 필드로 구분).
  > - **2.1 공고 피드 조회: 응답 `FeedItem`에 `jobPostingId` 필드 추가.** 기존에는 이미 스크랩된 공고(`isScrapped: true`)라도 피드 응답에 스크랩 사본(`job_postings`)의 ID가 없어, FE가 스크랩 해제 API(`DELETE /api/v1/feed/scraps/{jobPostingId}`)를 호출할 수 없는 문제가 있었음(QA 재현 항목). 스크랩된 공고는 해당 `jobPostingId`를, 스크랩되지 않은 공고는 `null`을 반환.
  > - **스케줄러 동작 명세**: “만료 공고 정리(DB 삭제) 스케줄러”는 이번 버전에서도 별도 구현하지 않기로 확정. 위 `excludeExpired` 파라미터로 조회 시점 필터링만으로 PRD 요구사항(피드 자동 제외)을 충족하며, `job_feed` 테이블 자체의 만료 데이터 정리는 저장 용량/성능 관점의 별도 이슈로 분리해 추후 논의.

---

## 공통 규칙

### 인증

- 모든 API는 `Authorization: Bearer {accessToken}` 헤더 필요 (로그인·회원가입 제외)
- Access Token 만료 시 `401 Unauthorized` 반환 → Refresh Token으로 재발급

### 응답 포맷

```json
{
  "success": true,
  "data": {}
}
```

### 에러 응답

```json
{
  "success": false,
  "data": null,
  "code": "INVALID_TOKEN",
  "message": "토큰이 만료되었습니다."
}
```

### 공통 에러 코드

> v1.11: 실제 `ErrorCode` enum 기준으로 전면 정정. `code` 값은 도메인 접두어(A=인증, U=회원, F=피드, K=칸반, C=공통)와 번호로 구성되며, `FORBIDDEN`에 해당하는 코드는 실제로 존재하지 않는다.

| 코드                           | HTTP | 설명                                                                                           |
| ------------------------------ | ---- | ---------------------------------------------------------------------------------------------- |
| `INVALID_INPUT_VALUE` (C001)   | 400  | 잘못된 입력값                                                                                  |
| `METHOD_NOT_ALLOWED` (C002)    | 405  | 허용되지 않은 메서드                                                                           |
| `ENTITY_NOT_FOUND` (C003)      | 404  | 요청한 리소스를 찾을 수 없음 (도메인별 세분화된 NOT_FOUND 대신 다수 API가 이 코드로 통일 처리) |
| `INTERNAL_SERVER_ERROR` (C004) | 500  | 서버 내부 오류                                                                                 |
| `UNAUTHORIZED` (A001)          | 401  | 인증 실패 또는 토큰 없음                                                                       |
| `INVALID_TOKEN` (A002)         | 401  | 유효하지 않거나 만료된 토큰                                                                    |

---

## 1. 인증 (Auth)

### 1.1 카카오 소셜 로그인

```
POST /api/v1/auth/kakao
```

**설명**
프론트엔드에서 카카오 OAuth2 인증을 완료하면 카카오로부터 일회성 인가 코드(authorization code)를 받는다. 이 코드를 서버에 전달하면 서버가 카카오 API를 호출해 사용자 정보를 가져온 뒤, 신규 유저면 자동 가입, 기존 유저면 로그인으로 처리하고 JWT 토큰을 발급한다.

**응답값 설계 의도**

- `accessToken` / `refreshToken`: 이후 모든 API 호출에 사용할 인증 토큰. Access Token은 단기(예: 1시간), Refresh Token은 장기(예: 30일) 유효.
- `isNewUser`: 프론트엔드가 신규 가입자에게 온보딩 화면을 보여줄지 여부를 판단하기 위한 플래그.
- `user` 객체: 로그인 직후 헤더/프로필 영역에 바로 렌더링할 수 있도록 닉네임·프로필 이미지를 함께 반환. 별도 `/users/me` 호출 없이 한 번에 처리하기 위함.

> **v1.11 변경**: `redirectUri` 필드가 필수로 추가됨. 카카오 로그인 시 프론트엔드가 사용한 redirect_uri를 서버에 전달해, 서버가 허용된 redirect_uri 화이트리스트(`KAKAO_ALLOWED_REDIRECT_URIS` 환경변수)와 대조 검증한다. 화이트리스트에 없는 값이면 카카오 API 호출 전에 400으로 즉시 거절한다.

**Request Body**

```json
{
  "code": "kakao_authorization_code",
  "redirectUri": "https://chwihap.com/oauth/kakao/callback"
}
```

**Response 200**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
    "isNewUser": false,
    "user": {
      "id": 1,
      "nickname": "동섭",
      "profileImage": "https://k.kakaocdn.net/..."
    }
  }
}
```

**에러**

| 코드                                | HTTP | 설명                                          |
| ----------------------------------- | ---- | --------------------------------------------- |
| `INVALID_KAKAO_CODE` (A003)         | 400  | 유효하지 않은 인가 코드                       |
| `KAKAO_SERVER_ERROR` (A004)         | 502  | 카카오 서버 오류                              |
| `INVALID_KAKAO_REDIRECT_URI` (A006) | 400  | 화이트리스트에 없는 redirect_uri (v1.11 추가) |

---

### 1.2 Access Token 재발급

```
POST /api/v1/auth/refresh
```

**설명**
Access Token이 만료됐을 때 Refresh Token을 이용해 새 Access Token을 발급한다. 프론트엔드는 API 호출 시 401 응답을 받으면 이 API를 자동으로 호출해 토큰을 갱신하는 인터셉터 패턴을 구현하게 된다.

**응답값 설계 의도**

- `accessToken`만 반환: Refresh Token은 재발급하지 않는 설계. MVP에서는 단순하게 Access Token만 재발급. 보안 강화가 필요하면 추후 Rotation 방식 도입 검토.

**Request Body**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**Response 200**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9..."
  }
}
```

**에러**

| 코드                           | HTTP | 설명                                   |
| ------------------------------ | ---- | -------------------------------------- |
| `INVALID_REFRESH_TOKEN` (A005) | 401  | 만료되거나 유효하지 않은 Refresh Token |

---

### 1.3 로그아웃

```
POST /api/v1/auth/logout
```

**설명**
서버에 저장된 Refresh Token을 무효화한다. Access Token은 서버에 저장되지 않으므로(Stateless JWT), 클라이언트가 Access Token을 삭제하는 것만으로도 사실상 로그아웃이 되지만, 서버 측 Refresh Token을 블랙리스트 처리해 탈취된 토큰으로의 재발급을 차단하기 위해 이 API를 호출한다.

**응답값 설계 의도**

- `data: null`: 로그아웃은 상태 변경만 수행하는 동작으로, 프론트엔드에 전달할 의미 있는 데이터가 없다. 성공 여부(`success: true`)만으로 충분.

**Response 200**

```json
{
  "success": true,
  "data": null
}
```

---

## 2. 통합 공고 피드 (Feed)

> **ID 체계 안내 (v1.7 추가)**

- `job_feed`는 공공데이터포털(data.go.kr) 채용정보 API로 수집한 공용 피드로, 재수집·만료 시 교체·삭제될 수 있다. 2.1(목록)·2.2(상세)의 `id` / `postingId`는 이 `job_feed.id`를 가리킨다. “피드 탐색 중” 화면에서 사용하는 ID.
- 유저가 스크랩(2.3)하면 서버가 내부적으로 해당 공고를 `job_postings`(유저 사본, 영구 보존)로 복사한다. 이 사본의 ID가 `jobPostingId`이며, 스크랩 해제(2.4)와 스크랩 목록(2.5)은 전부 이 `jobPostingId` 기준으로 동작한다. “스크랩 이후 관리” 화면에서 사용하는 ID.
- 즉 프론트엔드는 두 종류의 ID를 구분해서 들고 있어야 한다: 피드 카드에서 넘어온 `id`(=feed id, 2.3 요청에 사용) / 스크랩 이후 서버가 내려준 `jobPostingId`(2.4·2.5에 사용).

>

### 2.1 공고 피드 조회

```
GET /api/v1/feed
```

**설명**
여러 소스(워크넷, 공공기관, 인사혁신처 공공취업정보, 사람인 등)로 수집해 MySQL(`job_feed`)에 저장해둔 공고 목록을 반환한다. 필터·정렬·키워드 검색을 지원하며, 페이지 번호 기반 페이지네이션(한 페이지당 최대 20개, 하단 페이지네이션 UI)을 지원한다.

공고 수집은 Spring `@Scheduled`로 하루 2회(08시/20시) 백그라운드에서 자동 실행되며, 수집 결과는 MySQL에 저장된다. (v1.11: 소스가 “공공데이터포털 단일”이 아니라 워크넷·공공기관 수집(`JobFeedSyncScheduler`)과 인사혁신처 공공취업정보 수집(`JobFeedPersonnelJobSyncScheduler`)으로 이원화되어 있음을 반영)

**v1.11 변경**: 비로그인(토큰 없음) 상태에서도 조회 가능하도록 인증 예외 처리됨(`SecurityConfig`에서 `GET /api/v1/feed`만 `permitAll`). 비로그인 조회 시 `isScrapped` 등 개인화 필드는 기본값(`false`)으로 반환된다.

**v1.12 변경**: `excludeExpired` 쿼리 파라미터 추가(기본값 `true`) — PRD 4.1.2 원칙대로 마감 지난 공고를 조회 시점에 서버가 제외한다. 응답 `FeedItem`에 `jobPostingId` 필드 추가 — 스크랩된 공고의 스크랩 해제(2.4)에 필요한 식별자를 피드 조회 시점에 바로 받을 수 있다.

**캐싱 전략 (v1.10 정정):** ~~Redis 캐싱~~ 도입을 검토했으나, 실측 결과(k6 부하테스트, `docs/Redis_도입_구현_기록.md` 참고) 현재 데이터 규모에서 성능 개선 근거를 찾지 못해 보류. 조회는 MySQL 직접 조회만 수행하며, 캐시 계층은 없다. Phase 2에서 데이터 소스가 늘어나 실데이터 규모가 커지면 재검토한다.

**응답값 설계 의도**

- `platform`: 카드 UI에서 출처 뱃지(사람인/원티드 등)를 표시하기 위해 포함.
- `isScrapped`: 공고 카드에 스크랩(★) 아이콘의 초기 상태를 렌더링하기 위해 포함. 별도 API를 추가로 호출하지 않아도 되므로 N+1 문제 방지.
- `jobPostingId` (v1.12 추가): 스크랩된 공고(`isScrapped: true`)의 경우 스크랩 사본(`job_postings`)의 ID. 이 값을 스크랩 해제(2.4, `DELETE /api/v1/feed/scraps/{jobPostingId}`)에 그대로 사용한다. 스크랩되지 않은 공고는 `null`.
- `isExpired`: `excludeExpired=true`(기본값)로 조회하면 마감 지난 공고 자체가 응답에 포함되지 않으므로 항상 `false`. `excludeExpired=false`로 조회한 경우에만 마감 지난 공고가 섞여서 내려오며, 이때 “마감 완료” UI 표시용으로 사용.
- `page` / `size` / `totalPages` / `totalElements` / `hasNext`: 페이지 번호 기반 페이지네이션 메타데이터. 하단 페이지네이션 UI(현재 페이지·전체 페이지 수 표시, 페이지 이동)를 구성하는 데 사용. `page`는 **0부터 시작**하며, `hasNext`가 `false`면 마지막 페이지다. (v1.9에서 커서 기반 → 페이지 번호 기반으로 전환하며 `totalElements`/`totalPages` 재도입)

**Query Parameters**

| 파라미터         | 타입    | 필수 | 설명                                                                                                                                                                                                                          |
| ---------------- | ------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `page`           | integer | N    | 페이지 번호 (0부터 시작, 기본 0)                                                                                                                                                                                              |
| `size`           | integer | N    | 페이지 크기 (기본 20, 최대 50)                                                                                                                                                                                                |
| `sort`           | string  | N    | `LATEST`(기본) / `DEADLINE`                                                                                                                                                                                                   |
| `platform`       | string  | N    | `SARAMIN` / `WORKNET` / `PUBLIC` / `PUBLIC_PERSONNEL` / `DIRECT` (다중: 콤마 구분) (v1.11: `JobPlatform` 실제 값으로 정정, `WANTED`는 존재하지 않음)                                                                          |
| `jobCategory`    | string  | N    | 직무 카테고리 자유 문자열 (예: `BACKEND`, `FRONTEND`, `DESIGN`) (다중: 콤마 구분) (v1.11: Enum이 아닌 자유 텍스트 컬럼)                                                                                                       |
| `career`         | string  | N    | `NEW` / `EXPERIENCED` (다중: 콤마 구분)                                                                                                                                                                                       |
| `region`         | string  | N    | 지역 (예: `판교`, `강남`) (다중: 콤마 구분) (v1.8 추가, v1.11: 원문 입력값을 `Region` Enum 17개 시/도 + `OTHER`로 서버가 자동 정규화. `판교`/`분당`처럼 알려진 지역구 별칭은 소속 시/도로, 알려지지 않은 값은 `OTHER`로 매핑) |
| `deadlineSoon`   | boolean | N    | `true` 시 마감 7일 이내만 조회                                                                                                                                                                                                |
| `excludeExpired` | boolean | N    | (v1.12 추가) `true`(기본값) 시 마감 지난 공고를 조회 시점에 제외. `false` 시 만료 공고도 포함해 조회(`isExpired` 필드로 구분)                                                                                                 |
| `keyword`        | string  | N    | 기업명·직무명 키워드 검색                                                                                                                                                                                                     |

**Response 200**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 101,
        "platform": "SARAMIN",
        "companyName": "카카오",
        "jobTitle": "백엔드 개발자",
        "jobCategory": "BACKEND",
        "career": "NEW",
        "deadline": "2026-07-15",
        "thumbnailUrl": "https://...",
        "originalUrl": "https://saramin.co.kr/...",
        "isScrapped": true,
        "isExpired": false,
        "createdAt": "2026-06-29T08:00:00",
        "jobPostingId": 55
      }
    ],
    "page": 0,
    "size": 20,
    "totalPages": 42,
    "totalElements": 837,
    "hasNext": true
  }
}
```

---

### 2.2 공고 상세 조회

```
GET /api/v1/feed/{postingId}
```

**설명**
공고 피드에서 카드를 클릭했을 때 우측 슬라이드 패널에 표시할 상세 정보를 반환한다. 목록 API보다 더 많은 데이터(공고 본문 등)를 포함한다.

> **⚠️ v1.11 확인 필요 이슈**: 2.1과 달리 이 엔드포인트는 비로그인 접근에 대한 예외 처리가 되어 있지 않아(`FeedController.getFeedDetail`이 `principal.id()`를 그대로 호출), 비로그인 상태로 호출하면 500 오류가 발생할 수 있다. 2.1과 동일하게 공개 여부를 결정할지 팀 논의 필요.

**응답값 설계 의도**

- `description`: 피드 목록에서는 카드 크기 제한상 공고 본문을 내려주지 않고, 상세 조회 시에만 포함. 네트워크 비용 최적화.
- `isKanbanRegistered`: 슬라이드 패널 하단의 “칸반 보드에 등록” 버튼 활성화 여부를 판단하기 위해 포함. 이미 등록된 공고라면 버튼을 “등록됨”으로 비활성화 처리.
- `isScrapped`: 슬라이드 패널 내 스크랩 버튼의 상태를 렌더링하기 위해 포함.

**Path Parameters**

| 파라미터    | 타입 | 설명    |
| ----------- | ---- | ------- |
| `postingId` | long | 공고 ID |

**Response 200**

```json
{
  "success": true,
  "data": {
    "id": 101,
    "platform": "SARAMIN",
    "companyName": "카카오",
    "jobTitle": "백엔드 개발자",
    "jobCategory": "BACKEND",
    "career": "NEW",
    "deadline": "2026-07-15",
    "description": "공고 상세 내용...",
    "thumbnailUrl": "https://...",
    "originalUrl": "https://saramin.co.kr/...",
    "isScrapped": true,
    "isKanbanRegistered": false,
    "createdAt": "2026-06-29T08:00:00"
  }
}
```

---

### 2.3 스크랩 추가

```
POST /api/v1/feed/{postingId}/scrap
```

> **v1.9 변경**: 엔드포인트가 `POST /api/v1/feed/{postingId}/favorite` → `.../scrap`으로 변경. 응답 필드 `isFavorite` → `isScrapped`.

**설명**
공고를 스크랩에 추가한다. 스크랩은 칸반 등록의 선행 단계이며, 스크랩 탭에서 개인 관리 공고 목록으로 활용된다.

**응답값 설계 의도**

- `isScrapped: true`를 명시적으로 반환: 프론트엔드가 서버 상태를 신뢰하고 로컬 상태를 동기화할 수 있도록 결과를 echo back. 낙관적 업데이트(optimistic update) 실패 시 롤백 판단에 활용.
- `jobPostingId` (v1.7 추가): 스크랩 시 서버가 내부적으로 `job_feed` 공고를 `job_postings`(유저 사본)로 복사한 결과물의 ID. `postingId`(피드 ID)는 재수집·만료로 사라질 수 있는 임시 식별자인 반면, `jobPostingId`는 영구 보존되는 식별자다. 프론트엔드는 이 값을 저장해두었다가 2.4(스크랩 해제)·2.5(스크랩 목록) 호출에 사용해야 한다. 이미 스크랩된 공고를 다시 요청한 경우에는 기존 사본을 재사용하며 새로 생성하지 않는다.

**Response 200**

```json
{
  "success": true,
  "data": {
    "postingId": 101,
    "jobPostingId": 55,
    "isScrapped": true
  }
}
```

---

### 2.4 스크랩 해제

```
DELETE /api/v1/feed/scraps/{jobPostingId}
```

> **v1.9 변경**: 엔드포인트가 `DELETE /api/v1/feed/favorites/{jobPostingId}` → `.../scraps/{jobPostingId}`로 변경. 응답 필드 `isFavorite` → `isScrapped`, 에러 코드 `FAVORITE_NOT_FOUND` → `SCRAP_NOT_FOUND`.
> **v1.7 변경**: 기존 `DELETE /api/v1/feed/{postingId}/favorite`(피드 ID 기준)에서 경로가 변경되었다. 스크랩된 공고는 `job_postings` 사본으로 관리되고 원본 `job_feed`는 만료·재수집으로 사라질 수 있으므로, 사라지지 않는 `jobPostingId`(2.3 응답 또는 2.5 목록에서 얻은 값)로 식별해야 한다.

**설명**
스크랩을 해제한다. 이미 칸반에 등록된 카드가 있더라도 칸반 카드는 그대로 유지된다. (스크랩과 칸반 카드는 독립적으로 관리)

**Path Parameters**

| 파라미터       | 타입 | 설명                                                                                               |
| -------------- | ---- | -------------------------------------------------------------------------------------------------- |
| `jobPostingId` | long | 스크랩 시 생성된 `job_postings` 사본 ID (2.3 응답의 `jobPostingId` 또는 2.5 목록의 `jobPostingId`) |

**응답값 설계 의도**

- `isScrapped: false`를 명시적으로 반환: 2.3과 대칭 구조. 프론트엔드가 상태 변경 결과를 서버로부터 확인하는 구조.

**Response 200**

```json
{
  "success": true,
  "data": {
    "jobPostingId": 55,
    "isScrapped": false
  }
}
```

**에러**

| 코드              | HTTP | 설명                         |
| ----------------- | ---- | ---------------------------- |
| `SCRAP_NOT_FOUND` | 404  | 스크랩한 공고를 찾을 수 없음 |

---

### 2.5 스크랩 목록 조회

```
GET /api/v1/feed/scraps
```

> **v1.9 변경**: 엔드포인트가 `GET /api/v1/feed/favorites` → `.../scraps`로 변경. `cursor` → `page`(0부터 시작) 페이지네이션으로 전환하며 응답에 `page`/`size`/`totalPages`/`totalElements` 추가. 응답 필드 `favoritedAt` → `scrappedAt`.
> **v1.13 변경**: `jobCategory`/`career`/`region`/`deadlineSoon` 필터 파라미터 추가(문법은 2.1과 동일). Response 예시에 실제 응답 필드였던 `platform`/`jobCategory`/`career`/`region`을 반영(기존 명세의 “제외” 서술은 문서-코드 불일치였음).

**설명**
사용자가 스크랩한 공고 목록을 반환한다. 피드 탭과 분리된 “내 공고” 탭에서 노출되며, 칸반 미등록 공고와 등록 공고를 함께 조회해 한눈에 관리할 수 있다.

**응답값 설계 의도**

- `jobPostingId` (v1.7: `id`에서 필드명 변경): 스크랩 시 생성된 `job_postings` 사본 ID. 원본 `job_feed`가 만료·재수집으로 사라진 뒤에도 이 목록에는 계속 노출되어야 하므로, 피드 ID가 아닌 사본 ID를 기준으로 응답한다. 2.4(스크랩 해제) 호출 시 그대로 사용.
- `isKanbanRegistered`: 목록에서 칸반 등록 여부를 아이콘/뱃지로 구분 표시하기 위해 포함. “등록” 버튼 노출 여부 제어에도 활용.
- `scrappedAt`: 스크랩 목록의 기본 정렬 기준(최신 스크랩 순)으로 활용.
- `platform`/`jobCategory`/`career`/`region`: 스크랩 카드에도 직군·지역·경력·플랫폼 뱃지가 노출되며, 아래 필터 파라미터의 대상 필드이기도 하다.

**Query Parameters**

| 파라미터       | 타입    | 필수 | 설명                                                                                                                                  |
| -------------- | ------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `page`         | integer | N    | 페이지 번호 (0부터 시작, 기본 0)                                                                                                      |
| `size`         | integer | N    | 페이지 크기 (기본 20, 최대 50)                                                                                                        |
| `jobCategory`  | string  | N    | (v1.13 추가) 직군 필터, 콤마로 다중 선택 (예: `IT,디자인`). 자유 문자열이며 스크랩된 공고의 `jobCategory`와 정확히 일치하는 값만 매칭 |
| `career`       | string  | N    | (v1.13 추가) 경력 필터, 콤마로 다중 선택 (`NEW`, `EXPERIENCED`)                                                                       |
| `region`       | string  | N    | (v1.13 추가) 지역 필터, 콤마로 다중 선택 (예: `서울,경기`)                                                                            |
| `deadlineSoon` | boolean | N    | (v1.13 추가) `true`면 마감일이 오늘부터 7일 이내인 공고만 반환 (기본 `false`)                                                         |

**Response 200**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "jobPostingId": 55,
        "platform": "SARAMIN",
        "companyName": "카카오",
        "jobTitle": "백엔드 개발자",
        "jobCategory": "IT",
        "career": "EXPERIENCED",
        "region": "경기",
        "deadline": "2026-07-15",
        "thumbnailUrl": "https://...",
        "originalUrl": "https://...",
        "isKanbanRegistered": false,
        "scrappedAt": "2026-06-29T10:00:00"
      }
    ],
    "page": 0,
    "size": 20,
    "totalPages": 3,
    "totalElements": 47,
    "hasNext": true
  }
}
```

---

### 2.6 스크랩 없이 바로 칸반 등록

```
POST /api/v1/feed/{postingId}/kanban-card
```

> **v1.11 변경**: 기존 명세서에 있던 “단건 URL 등록(OG 파싱)” 기능(`POST /feed/url`, `ParseStatus` 등)은 실제로 구현되어 있지 않다(코드베이스 전체에 관련 클래스 없음). 대신 실제 코드에 “2.6”으로 주석된 이 엔드포인트로 대체 반영한다. 통합 공고 피드 카드에서 스크랩 단계를 거치지 않고 바로 칸반 보드(“지원 전” 스테이지)에 등록하는 기능이다.

**설명**
공고 피드(`job_feed`) 항목을 스크랩(2.3)하지 않고, 카드 등록 버튼 한 번으로 바로 칸반 보드에 등록한다. 서버 내부적으로는 스크랩(2.3)과 마찬가지로 `job_postings` 사본을 생성한 뒤 칸반 카드를 만든다.

**Path Parameters**

| 파라미터    | 타입 | 설명                         |
| ----------- | ---- | ---------------------------- |
| `postingId` | long | 공고 피드 ID (`job_feed.id`) |

**Response 201**

```json
{
  "success": true,
  "data": {
    "cardId": 10,
    "stageId": 1,
    "stageName": "지원 전",
    "postingId": 101,
    "companyName": "카카오",
    "jobTitle": "백엔드 개발자",
    "deadline": "2026-07-15"
  }
}
```

**에러**

| 코드                           | HTTP | 설명                    |
| ------------------------------ | ---- | ----------------------- |
| `ENTITY_NOT_FOUND` (C003)      | 404  | 존재하지 않는 공고      |
| `DUPLICATE_KANBAN_CARD` (K003) | 409  | 이미 칸반에 등록된 공고 |

---

## 3. 지원 현황 관리 (Kanban)

### 3.1 칸반 보드 전체 조회

```
GET /api/v1/kanban
```

**설명**
사용자의 칸반 보드 전체를 한 번에 반환한다. 스테이지 목록과 각 스테이지에 속한 카드 목록을 중첩 구조로 내려줘서, 프론트엔드가 단일 API 호출만으로 칸반 보드 전체를 렌더링할 수 있도록 설계됐다.

**응답값 설계 의도**

- 스테이지 + 카드를 중첩 구조로 반환: 스테이지 목록 API와 카드 목록 API를 분리하면 프론트엔드가 두 번 호출해야 하고, 스테이지 수만큼 카드 API를 호출하는 N+1 문제가 생긴다. 칸반 보드는 초기 로딩 시 전체 데이터가 필요하므로 단일 응답으로 묶음.
- `isDefault`: 기본 스테이지(지원 전/면접/최종 결과)는 삭제 불가 처리해야 하므로, 프론트에서 삭제 버튼 표시 여부를 판단하기 위해 포함.
- `position`: 스테이지 좌우 순서를 결정하는 값. DB 컬럼명(`kanban_stages.position`)과 통일. 사용자가 스테이지를 재배치했을 때 이 값 기준으로 정렬 렌더링.
- `deadlineChanged`: 수집 이후 원본 공고의 마감일이 변경된 경우 true로 세팅. 프론트엔드에서 카드에 “마감일 변경됨” 경고 뱃지를 표시하기 위함.

**Response 200**

```json
{
  "success": true,
  "data": {
    "stages": [
      {
        "id": 1,
        "name": "지원 전",
        "position": 1,
        "isDefault": true,
        "cards": [
          {
            "id": 10,
            "postingId": 101,
            "companyName": "카카오",
            "jobTitle": "백엔드 개발자",
            "deadline": "2026-07-15",
            "thumbnailUrl": "https://...",
            "originalUrl": "https://...",
            "deadlineChanged": false,
            "memo": "자소서 준비중",
            "registeredAt": "2026-06-29T11:00:00"
          }
        ]
      },
      {
        "id": 2,
        "name": "면접",
        "position": 2,
        "isDefault": true,
        "cards": []
      },
      {
        "id": 3,
        "name": "최종 결과",
        "position": 3,
        "isDefault": true,
        "cards": []
      }
    ]
  }
}
```

---

### 3.2 칸반 카드 등록

```
POST /api/v1/kanban/cards
```

**설명**
스크랩된 공고(`job_postings` 사본)를 칸반 보드의 첫 번째 스테이지(“지원 전”)에 카드로 등록한다. 스크랩 목록의 슬라이드 패널에서 “칸반 보드에 등록” 버튼 클릭 시 호출된다.

**응답값 설계 의도**

- `stageId` / `stageName`: 등록된 스테이지 정보를 반환해 프론트엔드가 칸반 보드에서 해당 스테이지로 스크롤하거나 강조 표시를 할 수 있도록 함.
- `companyName` / `jobTitle` / `deadline`: 카드를 즉시 렌더링하기 위해 필요한 최소 정보를 포함. 등록 후 칸반 보드 전체를 다시 조회(3.1 재호출)하지 않아도 신규 카드를 바로 삽입할 수 있음.

> **v1.11 정정**: 명세서에 있던 `POSTING_NOT_FAVORITED` 에러 코드는 실제로 존재하지 않는다. 이 API는 `postingId`를 “요청 유저 소유의 `job_postings`” 기준으로 조회하므로(즉 스크랩 안 된 공고는 애초에 조회되지 않음), 스크랩하지 않은 공고를 등록하려 하면 전용 에러가 아닌 범용 `ENTITY_NOT_FOUND`(404)가 반환된다. 스크랩 없이 바로 등록하려면 2.6을 사용한다.

**Request Body**

```json
{
  "postingId": 101
}
```

**Response 201**

```json
{
  "success": true,
  "data": {
    "cardId": 10,
    "stageId": 1,
    "stageName": "지원 전",
    "postingId": 101,
    "companyName": "카카오",
    "jobTitle": "백엔드 개발자",
    "deadline": "2026-07-15"
  }
}
```

**에러**

| 코드                           | HTTP | 설명                                 |
| ------------------------------ | ---- | ------------------------------------ |
| `ENTITY_NOT_FOUND` (C003)      | 404  | 존재하지 않거나 스크랩하지 않은 공고 |
| `DUPLICATE_KANBAN_CARD` (K003) | 409  | 이미 칸반에 등록된 공고              |

---

### 3.3 칸반 카드 스테이지 이동

```
PATCH /api/v1/kanban/cards/{cardId}/stage
```

**설명**
드래그앤드롭으로 카드를 다른 스테이지로 이동시키거나, 같은 스테이지 내에서 카드 순서를 변경할 때 호출된다. 드래그가 끝나는 시점(drop)에 단 한 번 호출되는 구조.

**응답값 설계 의도**

- `stageId` / `stageName` / `position`을 반환: 서버에서 확정된 이동 결과를 클라이언트에 echo back. 낙관적 업데이트(드래그 중 즉시 UI 반영)를 쓰다가 서버 응답 실패 시 이 값으로 롤백하기 위함.
- `position` 충돌 정책: 서버 재정렬 방식으로 확정. 요청받은 `stageId`의 `position` 이상인 기존 카드들을 +1씩 밀어내고, 이동한 카드를 요청받은 `position`에 삽입한다. 같은 스테이지 내 순서 변경도 동일하게 처리(기존 위치 제거 후 재삽입). 클라이언트는 유니크한 position 값을 신경 쓸 필요 없이 “몇 번째 자리에 놓였는지”만 보내면 된다. 카드 수가 많아져 재정렬 비용이 문제가 되면 추후 Lexorank 등으로 전환 검토.

**Path Parameters**

| 파라미터 | 타입 | 설명    |
| -------- | ---- | ------- |
| `cardId` | long | 카드 ID |

**Request Body**

```json
{
  "stageId": 2,
  "position": 1
}
```

**Response 200**

```json
{
  "success": true,
  "data": {
    "cardId": 10,
    "stageId": 2,
    "stageName": "면접",
    "position": 1
  }
}
```

**에러**

| 코드                      | HTTP | 설명                                                                             |
| ------------------------- | ---- | -------------------------------------------------------------------------------- |
| `ENTITY_NOT_FOUND` (C003) | 404  | 존재하지 않는 카드 또는 스테이지 (v1.11: 전용 코드가 아닌 범용 코드로 통일 처리) |

---

### 3.4 칸반 카드 상세 조회

```
GET /api/v1/kanban/cards/{cardId}
```

**설명**
칸반 카드를 클릭했을 때 우측 슬라이드 패널에 표시할 상세 정보를 반환한다. 공고 기본 정보 외에 사용자가 첨부한 서류 목록과 메모까지 포함해 단일 호출로 패널 전체를 렌더링할 수 있도록 설계됐다.

**응답값 설계 의도**

- `documents` 배열 포함: 서류 목록을 별도 API(4.3)로 분리해 두었지만, 카드 상세 패널 진입 시 서류 목록도 함께 보여줘야 하므로 상세 조회에도 포함. UX 상 “카드 상세”와 “서류 목록”은 동일 패널에서 노출되기 때문.
- `deadlineChanged`: 마감일 변경 감지 플래그. 카드 상세 패널에서도 경고 메시지를 표시하기 위해 포함.
- `originalUrl`: 슬라이드 패널 최상단의 “원본 공고 보러가기” 버튼에 사용.
- FILE 타입 서류에 `url` 필드 미포함 확정: 카드 상세는 캐싱/재사용 가능성이 있는 응답이라 만료되는 Presigned URL을 여기 담는 것은 부적절. 다운로드가 필요한 시점에 4.6 다운로드 URL 발급 API를 호출하는 흐름으로 통일한다. LINK 타입은 만료가 없으므로 `url`을 그대로 포함해도 무방.

**Response 200**

```json
{
  "success": true,
  "data": {
    "id": 10,
    "postingId": 101,
    "companyName": "카카오",
    "jobTitle": "백엔드 개발자",
    "deadline": "2026-07-15",
    "originalUrl": "https://...",
    "deadlineChanged": false,
    "memo": "자소서 준비중",
    "documents": [
      {
        "id": 1,
        "type": "FILE",
        "name": "이력서_v2.pdf",
        "version": 2,
        "uploadedAt": "2026-06-28T15:00:00"
      }
    ],
    "registeredAt": "2026-06-29T11:00:00"
  }
}
```

---

### 3.5 칸반 카드 메모 수정

```
PATCH /api/v1/kanban/cards/{cardId}/memo
```

**설명**
카드에 달린 메모를 수정한다. 면접 준비 상황, 합격 여부, 다음 일정 등 자유 텍스트로 기록하는 용도. 메모만 단독으로 수정하는 전용 엔드포인트를 분리한 이유는, 자주 수정되는 필드를 카드 전체 PUT으로 처리하면 불필요한 데이터가 전송되고 다른 필드 변경 이벤트와 혼재되기 때문.

**응답값 설계 의도**

- `cardId` + `memo`만 반환: 수정된 메모 내용을 서버로부터 확인해 프론트엔드 로컬 상태를 동기화. 카드 전체 데이터를 다시 내려줄 필요가 없으므로 최소 필드만 반환.

**Request Body**

```json
{
  "memo": "1차 면접 합격. 2차 면접 준비 필요."
}
```

**Response 200**

```json
{
  "success": true,
  "data": {
    "cardId": 10,
    "memo": "1차 면접 합격. 2차 면접 준비 필요."
  }
}
```

---

### 3.6 칸반 카드 삭제

```
DELETE /api/v1/kanban/cards/{cardId}
```

**설명**
칸반 보드에서 카드를 제거한다. 해당 공고의 즐겨찾기 상태는 유지된다. PRD에 “카드 삭제 시 유실 방지 확인 팝업 노출” 명세가 있으므로, 이 API 호출 전 프론트엔드에서 확인 팝업을 처리해야 한다.

**응답값 설계 의도**

- `data: null`: 삭제 결과는 “성공”만 확인하면 되므로 추가 데이터 없음.
- 첨부 서류 처리 정책 확정: 카드 삭제 시 연결된 서류 레코드는 즉시 소프트 딜리트 처리하고 `storageUsed`도 즉시 갱신한다. S3에 저장된 실제 FILE 객체는 매일 배치(만료 공고 정리와 동일한 주기)로 물리 삭제한다. 동기 트랜잭션 안에서 S3 삭제까지 처리하면 외부 API 실패가 카드 삭제 자체를 막을 수 있어, DB 상태와 스토리지 정리를 분리했다.

**Response 200**

```json
{
  "success": true,
  "data": null
}
```

---

### 3.7 스테이지 추가

```
POST /api/v1/kanban/stages
```

**설명**
사용자가 기본 3개 스테이지 외에 “코딩 테스트”, “인적성” 등 커스텀 스테이지를 추가한다. 최대 10개 제한이 있으며, 추가 시 원하는 위치(position)에 삽입할 수 있다.

**응답값 설계 의도**

- `isDefault: false`: 새로 추가된 스테이지는 커스텀이므로 삭제 가능. 프론트엔드에서 삭제 버튼 표시 여부를 판단하기 위해 포함.
- `id` + `position`: 생성된 스테이지 ID와 실제 적용된 순서를 반환해, 프론트엔드가 칸반 보드에 즉시 삽입 렌더링할 수 있도록 함.

**Request Body**

```json
{
  "name": "코딩 테스트",
  "position": 2
}
```

**Response 201**

```json
{
  "success": true,
  "data": {
    "id": 4,
    "name": "코딩 테스트",
    "position": 2,
    "isDefault": false
  }
}
```

**에러**

| 코드                             | HTTP | 설명                                            |
| -------------------------------- | ---- | ----------------------------------------------- |
| `STAGE_LIMIT_EXCEEDED` (K001)    | 400  | 스테이지 최대 개수(10개) 초과                   |
| `STAGE_NAME_REQUIRED` (K005)     | 400  | 전형 이름 미입력 (v1.11 추가)                   |
| `STAGE_NAME_DUPLICATE` (K006)    | 400  | 이미 존재하는 전형 이름 (v1.11 추가)            |
| `STAGE_NAME_SPECIAL_CHAR` (K007) | 400  | 전형 이름에 허용되지 않는 특수문자 (v1.11 추가) |
| `STAGE_NAME_TOO_SHORT` (K008)    | 400  | 전형 이름 최소 2자 미만 (v1.11 추가)            |
| `STAGE_NAME_TOO_LONG` (K009)     | 400  | 전형 이름 최대 20자 초과 (v1.11 추가)           |

---

### 3.8 스테이지 수정

```
PATCH /api/v1/kanban/stages/{stageId}
```

**설명**
스테이지 이름을 변경하거나 순서를 조정한다. 이름과 순서를 동시에 변경할 수도 있고 하나만 변경할 수도 있다.

> **v1.11 정책 역전**: 명세서 v1.4에서 “기본 스테이지도 이름 수정 허용”으로 확정했던 정책이 실제 구현에서는 반대로 되어 있다. `KanbanStageService.updateStage`가 기본 스테이지(`isDefault=true`)의 이름을 변경하려는 요청을 `DEFAULT_STAGE_NAME_CHANGE_NOT_ALLOWED`(K023, 400)로 거부한다. 기본 스테이지는 순서(`position`) 변경만 가능하고 이름은 변경할 수 없다. 문서 정책과 실제 동작이 상충하니 의도된 사양 변경인지 팀 확인 필요.

**응답값 설계 의도**

- 수정된 `id` / `name` / `position`만 반환: 스테이지 전체 목록을 다시 내려줄 필요 없이, 변경된 스테이지 정보만으로 프론트엔드 로컬 상태를 갱신.
- 신규 등록 카드가 들어가는 “첫 번째 스테이지”는 `position` 값이 아니라 기본 스테이지 중 등록 대상으로 지정된 고정 `stageId`로 식별한다. 따라서 사용자가 “지원 전” 스테이지의 순서를 뒤로 옮기더라도 신규 카드 등록 위치는 영향받지 않는다.

**Request Body**

```json
{
  "name": "코테",
  "position": 3
}
```

**Response 200**

```json
{
  "success": true,
  "data": {
    "id": 4,
    "name": "코테",
    "position": 3
  }
}
```

**에러**

| 코드                                                                           | HTTP | 설명                                               |
| ------------------------------------------------------------------------------ | ---- | -------------------------------------------------- |
| `DEFAULT_STAGE_NAME_CHANGE_NOT_ALLOWED` (K023)                                 | 400  | 기본 스테이지는 이름을 변경할 수 없음 (v1.11 추가) |
| `STAGE_NAME_DUPLICATE` / `SPECIAL_CHAR` / `TOO_SHORT` / `TOO_LONG` (K006~K009) | 400  | 3.7과 동일한 이름 검증 규칙 적용 (v1.11 추가)      |

---

### 3.9 스테이지 삭제

```
DELETE /api/v1/kanban/stages/{stageId}
```

**설명**
커스텀 스테이지를 삭제한다. 기본 스테이지(지원 전/면접/최종 결과)는 삭제 불가. 삭제하려는 스테이지에 카드가 있을 경우, 카드를 이동할 대상 스테이지를 함께 지정해야 삭제가 진행된다.

**응답값 설계 의도**

- `movedCardCount`: 이동된 카드 수를 반환해 사용자가 프론트엔드에서 “X개의 카드가 이동됐습니다” 같은 피드백을 받을 수 있도록 함.
- Request Body에 `moveToStageId` 포함: DELETE 메서드에 Request Body를 사용하는 것은 HTTP 스펙상 허용되지만 일부 환경에서 문제가 될 수 있음. Query Parameter로 대체하는 방안도 고려 가능 (`?moveToStageId=1`).

**Request Body**

```json
{
  "moveToStageId": 1
}
```

**Response 200**

```json
{
  "success": true,
  "data": {
    "movedCardCount": 3
  }
}
```

**에러**

| 코드                                      | HTTP | 설명                                                                             |
| ----------------------------------------- | ---- | -------------------------------------------------------------------------------- |
| `DEFAULT_STAGE_DELETE_NOT_ALLOWED` (K004) | 400  | 기본 스테이지는 삭제 불가 (v1.11: 코드명 정정)                                   |
| `ENTITY_NOT_FOUND` (C003)                 | 404  | 이동 대상 스테이지 없음 (v1.11: 전용 코드가 아닌 범용 코드로 통일 처리)          |
| `STAGE_HAS_CARDS` (K022)                  | 409  | 카드가 있는 스테이지인데 이동 대상(`moveToStageId`)을 지정하지 않음 (v1.11 추가) |

---

### 3.10 칸반 카드 직접 등록 (v1.11 신규)

```
POST /api/v1/kanban/cards/direct
```

**설명**
공고 피드에 없는 공고(사람인/원티드/잡코리아 등 미연동 플랫폼이나 지인 추천 등)를 사용자가 회사명·공고명·URL·마감일을 직접 입력해 칸반 보드(“지원 전” 스테이지)에 등록한다. 내부적으로 `platform=DIRECT`인 `JobPosting`을 새로 생성한 뒤 카드를 만든다.

**Request Body**

```json
{
  "companyName": "네이버",
  "title": "프론트엔드 개발자",
  "originalUrl": "https://www.jobkorea.co.kr/Recruit/GI_Read/12345",
  "deadline": "2026-08-01"
}
```

**Response 201**

```json
{
  "success": true,
  "data": {
    "cardId": 11,
    "stageId": 1,
    "stageName": "지원 전",
    "postingId": 999,
    "companyName": "네이버",
    "jobTitle": "프론트엔드 개발자",
    "deadline": "2026-08-01"
  }
}
```

**에러**

| 코드                                                       | HTTP | 설명                               |
| ---------------------------------------------------------- | ---- | ---------------------------------- |
| `CARD_COMPANY_NAME_REQUIRED` (K011)                        | 400  | 회사명 미입력                      |
| `CARD_COMPANY_NAME_SPECIAL_CHAR` (K012)                    | 400  | 회사명에 허용되지 않는 특수문자    |
| `CARD_COMPANY_NAME_TOO_SHORT` / `TOO_LONG` (K013/K014)     | 400  | 회사명 길이 제한(2~50자) 위반      |
| `CARD_JOB_POSTING_NAME_REQUIRED` (K015)                    | 400  | 공고명 미입력                      |
| `CARD_JOB_POSTING_NAME_SPECIAL_CHAR` (K016)                | 400  | 공고명에 허용되지 않는 특수문자    |
| `CARD_JOB_POSTING_NAME_TOO_SHORT` / `TOO_LONG` (K017/K018) | 400  | 공고명 길이 제한(2~100자) 위반     |
| `CARD_JOB_POSTING_URL_REQUIRED` (K019)                     | 400  | 공고 링크 미입력                   |
| `CARD_JOB_POSTING_URL_INVALID` (K020)                      | 400  | 유효하지 않은 URL 형식             |
| `CARD_JOB_POSTING_URL_TOO_LONG` (K021)                     | 400  | 공고 링크 최대 2048자 초과         |
| `DUPLICATE_KANBAN_CARD` (K003)                             | 409  | 동일 URL로 이미 등록된 카드가 있음 |

---

### 3.11 칸반 카드 직접 등록 수정 (v1.11 신규) 수정(작성자: 손세영 7월 30일)

```
PATCH /api/v1/kanban/cards/{cardId}/update
```

**설명**
3.10으로 직접 등록한 카드의 회사명·공고명·URL·마감일을 수정한다. 요청 필드와 검증 규칙은 3.10과 동일(`KanbanCardSaveRequest` 공유). 공고 피드에서 스크랩·자동 등록된 카드(3.2, 2.6)는 이 API로 수정할 수 없다.

**변경(작성자: 손세영)**

- 기존의 `DIRECT` 공고만 수정 가능했지만 명세와 맞지 않아서 모든 공고를 수정할 수 있도록 변경
- 프론트에서 값을 받을때 DB에서는 Null을 허용하지 않기 때문에 `null`을 보내면 `C001` 에러를 반환한다.
- DTO는 똑같이 `KanbanCardSaveRequest` 를 공유합니다.
- 카드 수정 시 스크랩 목록도 함께 변경될 수 있습니다.

**Path Parameters**

| 파라미터 | 타입 | 설명    |
| -------- | ---- | ------- |
| `cardId` | long | 카드 ID |

**Request Body**

```json
{
  "companyName": "네이버",
  "title": "프론트엔드 개발자(수정)",
  "originalUrl": "https://www.jobkorea.co.kr/Recruit/GI_Read/12345",
  "deadline": "2026-08-15"
}
```

**Response 200**

```json
{
  "success": true,
  "data": {
    "cardId": 11,
    "stageId": 1,
    "stageName": "지원 전",
    "postingId": 999,
    "companyName": "네이버",
    "jobTitle": "프론트엔드 개발자(수정)",
    "deadline": "2026-08-15"
  }
}
```

**에러**

| 코드                             | HTTP | 설명                                         |
| -------------------------------- | ---- | -------------------------------------------- |
| `CARD_UPDATE_NOT_ALLOWED` (K010) | 400  | 직접 등록한 카드가 아니면 수정 불가          |
| `ENTITY_NOT_FOUND` (C003)        | 404  | 존재하지 않는 카드                           |
| 그 외                            | -    | 3.10과 동일한 필드 검증 에러(K011~K021) 적용 |

### 3.12 지원 마감일 목록 조회(작성자: 손세영, 7월 30일 추가)

```json
GET /api/v1/kanban/cards/deadlines
```

**설명**

칸반 보드에 등록된 전체 공고를 마감일 순으로 확인할 수 있다.
지원 마감일 페이지에서 오늘 날짜부터 지원일이 남은 카드를 보여준다.

지원 마감일에서 상세 조회는 `3.4 칸반 카드 상세조회`를 통해서 상세 페이지를 조회한다.

**구현 의도**

- 지원 마감일은 오늘 마감을 포함하고 지난 마감일과 마감일이 없는(null) 카드는 제외한다.
  - 공고 마감일이 null인 경우 제외
- 마감일을 오름차 순으로 정렬한다.
- 같은 마감일의 경우는 `cardId` 순서로 정렬한다.

**Response 200**

```json
{
  "success": true,
  "data": {
    "cards": [
      {
        "cardId": 1,
        "companyName": "쿠팡",
        "jobTitle": "[쿠팡] 신입 백엔드 개발자(java, C++)",
        "deadline": "2026-07-30",
        "stageId": 1,
        "stageName": "지원 전"
      },
      {
        "cardId": 2,
        "companyName": "구글",
        "jobTitle": "[구글] 신입 백엔드 개발자(java, C++)",
        "deadline": "2026-07-30",
        "stageId": 1,
        "stageName": "지원 전"
      },
      {
        "cardId": 3,
        "companyName": "네이버",
        "jobTitle": "[네이버] 신입 백엔드 개발자(java, C++)",
        "deadline": "2026-07-31",
        "stageId": 1,
        "stageName": "지원 전"
      }
    ]
  },
  "code": null,
  "message": null
}
```

### 3.13 지원 마감일 카드 수정(작성자: 손세영, 7월 30일 추가)

```json
PATCH /api/v1/kanban/cards/{cardId}/stage-deadline
```

**설명**

지원 마감일 페이지에서 지원 마감일 및 전형 단계를 수정할 수 있도록 전용 API를 생성하였다.
기존의 지원 현황에서 사용하던 `3.11 칸반 보드 직접 등록` 의 데이터 필드가 다르고 사용 위치도 다르기 때문에 새롭게 API 생성했다.

**구현 의도**

- 회사명과 공고명은 지원 마감일에서 수정하지 못한다. → 기능 QA 고도화 내용
- 지원 마감일과 전형 단계는 수정가능
- 지원 마감일과 전형 단계는 부분적으로 수정 가능
  - 입력하지 않을 시 기존의 값 입력
- 전형 단계에서 카드 이동 시 스테이지의 가장 위에 위치
  - `지원 마감일 수정시 카드 이동 위치(position)`(스레드)에서 결정

**Path Parameters**

| 파라미터 | 타입 | 설명    |
| -------- | ---- | ------- |
| `cardId` | long | 카드 ID |

**Response 200**

```json
{
  "success": true,
  "data": {
    "cardId": 12,
    "stageId": 3,
    "stageName": "서류 지원",
    "position": 1,
    "deadline": "2026-08-20"
  },
  "code": null,
  "message": null
}
```

---

## 4. 서류·메모 관리 (Document)

> DB 명세 기준 `document_type`: `FILE` / `LINK` / `MEMO` 세 가지 타입을 단일 테이블(`documents`)에서 관리.
> 타입별 필수 컬럼이 다르며 CHECK 제약으로 강제됨:

- `FILE`: `file_url` NOT NULL
- `LINK`: `link_url` NOT NULL
- `MEMO`: `memo` NOT NULL

>

### 4.1 서류 업로드 (파일)

```
POST /api/v1/kanban/cards/{cardId}/documents/file
```

**설명**
이력서, 포트폴리오, 자기소개서 등의 파일을 카드에 첨부한다. `multipart/form-data` 형식으로 업로드하면 서버가 S3에 저장한 뒤 메타데이터를 DB에 기록한다. 동일 파일명으로 재업로드 시 버전 태그가 자동으로 붙는다.

**응답값 설계 의도**

- `version`: 동일 이름 파일을 덮어쓰지 않고 버전을 유지하는 정책 때문에 포함. 프론트엔드가 “v1”, “v2” 등으로 버전을 시각화할 수 있음.
- `size`: 업로드 후 계정 용량 사용량을 즉시 업데이트하기 위해 포함. 6.1 `/users/me`의 `storageUsed`와 연동.
- `downloadUrl` 미포함 확정: 업로드 응답에는 파일 접근 URL을 내려주지 않는다. 다운로드가 필요한 시점에 4.6 다운로드 URL 발급 API를 호출하는 흐름으로 통일(3.4와 동일한 정책).

**Request (multipart)**

| 필드   | 타입   | 설명                        |
| ------ | ------ | --------------------------- |
| `file` | binary | PDF, DOCX, PPTX (최대 10MB) |

> **v1.11 정정**: 명세서에 있던 `name`(파일 표시 이름) 필드는 실제로 없다. 표시 이름은 업로드한 파일의 원본 파일명(`file.getOriginalFilename()`)을 그대로 사용한다.
> **v1.14 정정**: `name`은 원본 파일명을 그대로 반환하지 않고, `resolveDocumentName`이 항상 `{원본파일명}_v{version}.{확장자}` 형태로 버전 접미사를 붙여 반환한다(확장자가 없으면 `{파일명}_v{version}`). 최초 업로드도 `version: 1`이라 `_v1`이 붙는다.

**Response 201**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "type": "FILE",
    "name": "이력서_v1.pdf",
    "version": 1,
    "size": 204800,
    "uploadedAt": "2026-06-29T12:00:00"
  }
}
```

**에러**

| 코드                     | HTTP | 설명                       |
| ------------------------ | ---- | -------------------------- |
| `FILE_SIZE_EXCEEDED`     | 400  | 파일 크기 10MB 초과        |
| `UNSUPPORTED_FILE_TYPE`  | 400  | 지원하지 않는 파일 형식    |
| `STORAGE_LIMIT_EXCEEDED` | 400  | 계정 저장 용량(100MB) 초과 |

---

### 4.2 서류 등록 (외부 링크)

```
POST /api/v1/kanban/cards/{cardId}/documents/link
```

**설명**
Notion, Google Docs 등 외부 URL을 서류로 등록한다. 파일 업로드와 달리 실제 파일을 저장하지 않으므로 용량 제한 없이 등록 가능하다. MVP에서 파일 업로드를 일부 대체하는 기능.

**응답값 설계 의도**

- `type: "LINK"`: FILE과 명시적으로 구분해, 목록 조회 시 프론트엔드가 다운로드 버튼 vs 외부 링크 버튼으로 다르게 렌더링할 수 있도록 함.
- `url`을 그대로 반환: 링크 타입은 Presigned URL 같은 별도 접근 URL이 필요 없으므로, 등록 시 입력한 URL을 그대로 반환.
- `category` (v1.14 추가): `RESUME`(이력서) / `PORTFOLIO`(포트폴리오) / `PERSONAL_CHANNEL`(개인 채널·블로그) / `OTHER`(기타) 중 하나. 등록 시 필수 입력값이며, 목록 화면에서 링크 카드를 카테고리별 아이콘/뱃지로 구분 표시하기 위해 추가됨. FILE/MEMO 타입에는 없는 필드(응답에서 생략).

**Request Body**

```json
{
  "name": "포트폴리오 노션",
  "url": "https://notion.so/...",
  "category": "PORTFOLIO"
}
```

**Response 201**

```json
{
  "success": true,
  "data": {
    "id": 2,
    "type": "LINK",
    "category": "PORTFOLIO",
    "name": "포트폴리오 노션",
    "url": "https://notion.so/...",
    "registeredAt": "2026-06-29T12:00:00"
  }
}
```

---

### 4.3 메모 등록

```
POST /api/v1/kanban/cards/{cardId}/documents/memo
```

**설명**
카드에 텍스트 메모를 서류 형태로 등록한다. 파일·링크와 동일한 `documents` 테이블에서 `doc_type: MEMO`로 관리된다. 면접 준비 노트, 자소서 초안 등 자유 텍스트를 공고 단위로 기록하는 용도.

**응답값 설계 의도**

- `type: "MEMO"`: FILE/LINK와 같은 타입 discriminator. 목록 조회 시 텍스트 뷰어로 렌더링하기 위해 포함.
- 별도 엔드포인트로 분리: 파일 업로드는 `multipart/form-data`, 링크와 메모는 JSON이라 Content-Type 처리 방식이 달라 분리하는 것이 구현상 깔끔함.

**Request Body**

```json
{
  "name": "1차 면접 준비 노트",
  "content": "기술 스택 질문 예상: Java 메모리 구조, GC 동작 원리..."
}
```

**Response 201**

```json
{
  "success": true,
  "data": {
    "id": 3,
    "type": "MEMO",
    "name": "1차 면접 준비 노트",
    "content": "기술 스택 질문 예상: Java 메모리 구조, GC 동작 원리...",
    "registeredAt": "2026-06-29T12:00:00"
  }
}
```

---

### 4.4 서류 목록 조회

```
GET /api/v1/kanban/cards/{cardId}/documents
```

**설명**
카드에 첨부된 FILE / LINK / MEMO 전체를 반환한다. `type` 필드로 구분해 프론트엔드가 타입별 다른 UI를 렌더링한다.

**응답값 설계 의도**

- `type`을 discriminator로 사용: 단일 배열에서 세 타입을 처리. 프론트엔드는 type에 따라 다운로드 버튼 / 외부 링크 버튼 / 텍스트 뷰어를 분기 렌더링.
- FILE 타입에 `downloadUrl` 미포함 확정(3.4와 동일 정책): 목록 응답도 캐싱될 수 있어 만료되는 Presigned URL을 담아두면 같은 위험이 있음. 다운로드 버튼 클릭 시점에 4.6을 호출해 URL을 발급받는 흐름으로 통일.
- `url` (LINK 타입): 외부 링크는 만료가 없으므로 저장된 URL을 그대로 반환.
- `content` (MEMO 타입): 메모 본문 전체를 반환. 목록에서도 내용을 바로 확인할 수 있도록 함.

**Response 200**

```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "id": 1,
        "type": "FILE",
        "name": "이력서_v1.pdf",
        "version": 1,
        "size": 204800,
        "uploadedAt": "2026-06-28T15:00:00"
      },
      {
        "id": 2,
        "type": "LINK",
        "category": "PORTFOLIO",
        "name": "포트폴리오 노션",
        "url": "https://notion.so/...",
        "registeredAt": "2026-06-29T12:00:00"
      },
      {
        "id": 3,
        "type": "MEMO",
        "name": "1차 면접 준비 노트",
        "content": "기술 스택 질문 예상: Java 메모리 구조, GC 동작 원리...",
        "registeredAt": "2026-06-29T12:00:00"
      }
    ]
  }
}
```

---

### 4.5 서류 삭제

```
DELETE /api/v1/kanban/cards/{cardId}/documents/{documentId}
```

**설명**
첨부된 서류를 삭제한다. DB 레코드는 타입에 관계없이 즉시 소프트 딜리트 처리하며, `storageUsed`도 이 시점에 즉시 갱신한다. LINK / MEMO 타입은 애초에 S3 용량을 쓰지 않으므로 여기서 끝나고, FILE 타입의 실제 S3 객체 물리 삭제는 매일 배치로 처리한다(3.6과 동일한 정책).

**응답값 설계 의도**

- `data: null`: 삭제 성공 확인만 필요하므로 추가 데이터 없음.
- S3 파일 삭제 시점 확정: DB 소프트 딜리트는 즉시, S3 물리 삭제는 배치. `storageUsed`는 DB 레코드 기준으로 즉시 갱신되므로 배치 지연과 무관하게 정확하다.

**Response 200**

```json
{
  "success": true,
  "data": null
}
```

---

### 4.6 파일 다운로드 URL 발급

```
GET /api/v1/kanban/cards/{cardId}/documents/{documentId}/download
```

**설명**
S3에 저장된 파일을 다운로드할 수 있는 Presigned URL을 발급한다. S3 파일에 직접 퍼블릭 접근을 허용하지 않고, 이 API를 통해 일회성 URL을 발급하는 방식으로 파일 접근을 본인 인증 기반으로 통제한다. FILE 타입 서류에만 적용되며, LINK/MEMO 타입 호출 시 에러를 반환한다.

**응답값 설계 의도**

- Presigned URL 방식 채택 이유: S3 파일을 퍼블릭으로 열면 URL만 알면 누구나 접근 가능. Presigned URL은 서버가 서명한 일회성 URL로, 인증된 사용자만 제한된 시간 내에 다운로드 가능. 자소서 등 민감 문서에 적합.
- `expiresAt`: 프론트엔드가 URL 만료 시점을 알아야 재발급 타이밍을 판단할 수 있으므로 포함. 유효 시간은 15분.

**Response 200**

```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://s3.amazonaws.com/...?X-Amz-Expires=900&...",
    "expiresAt": "2026-06-29T12:15:00"
  }
}
```

**에러**

| 코드                    | HTTP | 설명                                      |
| ----------------------- | ---- | ----------------------------------------- |
| `INVALID_DOCUMENT_TYPE` | 400  | FILE 타입이 아닌 서류에 다운로드 URL 요청 |

---

### 4.7 링크 카테고리 수정 (v1.14 신규)

```
PATCH /api/v1/kanban/cards/{cardId}/documents/{documentId}/link/category
```

**설명**
등록된 외부 링크(LINK 타입) 서류의 카테고리만 변경한다. URL·이름은 그대로 유지된다. 등록 당시 카테고리를 잘못 골랐거나, 이력서를 포트폴리오로 재분류하는 등의 상황을 위한 API.

**응답값 설계 의도**

- FILE/MEMO 타입에는 카테고리 개념이 없으므로, LINK가 아닌 서류에 호출하면 `INVALID_LINK_DOCUMENT_TYPE`(400) 에러로 명시적으로 막는다.

**Request Body**

```json
{
  "category": "OTHER"
}
```

**Response 200**

```json
{
  "success": true,
  "data": {
    "id": 2,
    "type": "LINK",
    "category": "OTHER",
    "name": "포트폴리오 노션",
    "url": "https://notion.so/...",
    "registeredAt": "2026-06-29T12:00:00"
  }
}
```

**에러**

| 코드                         | HTTP | 설명                                                  |
| ---------------------------- | ---- | ----------------------------------------------------- |
| `INVALID_LINK_DOCUMENT_TYPE` | 400  | LINK 타입이 아닌 서류(FILE/MEMO)에 카테고리 수정 요청 |

---

### 4.8 링크 URL 수정 (v1.14 신규)

```
PATCH /api/v1/kanban/cards/{cardId}/documents/{documentId}/link
```

**설명**
등록된 외부 링크(LINK 타입) 서류의 URL만 변경한다. **이름(`name`)은 변경되지 않고 등록 당시 값이 그대로 유지된다** — 원본 링크가 만료되거나 주소가 바뀌었을 때 새로 등록하지 않고 URL만 갱신할 수 있도록 하는 용도.

**Request Body**

```json
{
  "url": "https://notion.so/new-address"
}
```

**Response 200**

```json
{
  "success": true,
  "data": {
    "id": 2,
    "type": "LINK",
    "category": "PORTFOLIO",
    "name": "포트폴리오 노션",
    "url": "https://notion.so/new-address",
    "registeredAt": "2026-06-29T12:00:00"
  }
}
```

**에러**

| 코드                         | HTTP | 설명                                             |
| ---------------------------- | ---- | ------------------------------------------------ |
| `INVALID_LINK_DOCUMENT_TYPE` | 400  | LINK 타입이 아닌 서류(FILE/MEMO)에 URL 수정 요청 |

---

## 5. 알림 (Notification)

> **아키텍처 변경 (v1.0 → v1.1)**
> 알림 발송은 Spring `@Scheduled`로 매일 오전 9시 일괄 처리. 알림 채널은 **이메일** + **서비스 내 인앱 알림창** 두 가지. 카카오 알림톡은 미지원.
>
> 동작 흐름: `@Scheduled` → 마감일 D-7/D-3/D-1에 해당하는 카드 조회 → 이메일 발송 + 인앱 알림 레코드 INSERT → 완료.
> Kafka나 별도 Worker 없이 단일 스케줄러 스레드에서 동기 처리. 발송 실패 시 `status: FAILED`로 기록.

### 5.1 알림 설정 조회

```
GET /api/v1/notifications/settings
```

**설명**
사용자의 알림 설정 현황을 조회한다. 알림 설정 화면 진입 시 초기값을 로드하기 위해 호출된다.

**응답값 설계 의도**

- `emailEnabled`: 이메일 알림 수신 여부. false면 스케줄러가 해당 유저에게 이메일을 발송하지 않음.
- `inAppEnabled`: 인앱 알림창 수신 여부. false면 인앱 알림 레코드 자체를 생성하지 않음.
- `email`: 현재 알림을 수신할 이메일 주소 표시. 카카오 계정 연동 이메일이 기본값으로 설정됨. 카카오 OAuth 기반이라 이메일을 직접 변경할 수 없으므로 수정 불가 필드로 명시.
- `remindDays`: 배열로 반환해 D-7, D-3, D-1, D-Day 중 사용자가 선택한 기준일을 유연하게 관리. 향후 커스텀 기준일 추가 시 구조 변경 없이 대응 가능.

> **v1.11 정정**: 저장된 설정이 없는 사용자의 기본값은 `[7, 3, 1]`이 아니라 `[7, 3, 1, 0]`(D-Day 포함)이다.

**Response 200**

```json
{
  "success": true,
  "data": {
    "emailEnabled": true,
    "inAppEnabled": true,
    "email": "user@example.com",
    "remindDays": [7, 3, 1, 0]
  }
}
```

---

### 5.2 알림 설정 수정

```
PATCH /api/v1/notifications/settings
```

**설명**
이메일/인앱 알림 ON/OFF 및 리마인드 기준일을 변경한다. 예를 들어 이메일은 끄고 인앱 알림만 받거나, D-7 알림이 불필요하다면 `[3, 1, 0]`으로 줄일 수 있다.

**응답값 설계 의도**

- 변경된 설정값을 그대로 반환(echo back): 프론트엔드가 서버 상태를 신뢰하고 로컬 상태를 동기화. 특히 `remindDays` 배열은 서버에서 정렬·중복 제거 등 가공이 일어날 수 있으므로, 서버 확정값을 반환하는 것이 중요.
- `email`은 수정 불가: 카카오 계정 이메일이 자동 연동되므로 Request Body에 포함하지 않음.

> **v1.11 정정**: `remindDays`에는 `7`/`3`/`1`/`0`(D-Day)만 허용되며, 중복값은 제거되고 내림차순으로 정렬 저장된다. 빈 배열을 보내면 마감 리마인드를 받지 않는다.

**Request Body**

```json
{
  "emailEnabled": true,
  "inAppEnabled": true,
  "remindDays": [7, 3, 1, 0]
}
```

**Response 200**

```json
{
  "success": true,
  "data": {
    "emailEnabled": true,
    "inAppEnabled": true,
    "remindDays": [7, 3, 1, 0]
  }
}
```

---

### 5.3 알림 발송 이력 조회

```
GET /api/v1/notifications/history
```

**설명**
사용자에게 발송된 이메일 알림 이력을 최신순으로 조회한다. `@Scheduled` 기반 동기 처리이므로 `PENDING` 상태는 존재하지 않고, 발송 완료 시 `SUCCESS` 또는 `FAILED`로만 기록된다.

**응답값 설계 의도**

- `type: "EMAIL"`: 현재 이메일 채널만 이력에 기록. 인앱 알림은 별도 5.4 API로 조회하므로 여기서는 분리.
- `status` (`SUCCESS` / `FAILED`): 스케줄러가 이메일 발송 결과를 즉시 DB에 기록하므로 `PENDING` 상태 없음. 실패(`FAILED`) 시 사용자에게 “발송 실패” 표시를 줄 수 있음.
- `cardId` + `companyName`: 어느 회사의 공고에 대한 알림인지 맥락을 제공해, 연결된 카드로 바로 이동할 수 있는 UI를 구현하기 위함.

**Query Parameters**

| 파라미터 | 타입    | 필수 | 설명                                                          |
| -------- | ------- | ---- | ------------------------------------------------------------- |
| `cursor` | string  | N    | 첫 조회 시 생략, 이후 직전 응답의 `nextCursor` 전달           |
| `size`   | integer | N    | 페이지당 조회 개수 (생략/0 이하 시 20, 50 초과 시 50로 clamp) |

**Response 200**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "type": "EMAIL",
        "cardId": 10,
        "companyName": "카카오",
        "message": "카카오 지원 마감 D-3입니다.",
        "sentAt": "2026-07-12T09:00:00",
        "status": "SUCCESS"
      }
    ],
    "nextCursor": null,
    "hasNext": false
  }
}
```

---

### 5.4 인앱 알림 목록 조회

```
GET /api/v1/notifications/inbox
```

**설명**
서비스 내 알림창에 표시할 인앱 알림 목록을 반환한다. 헤더의 알림 벨 아이콘 클릭 시 드롭다운/패널로 노출되는 알림 목록이 이 API를 통해 채워진다. 읽지 않은 알림 수(`unreadCount`)를 함께 반환해 벨 아이콘에 뱃지를 표시할 수 있도록 한다.

> **v1.11 정정**: “페이지네이션 없이 최근 N건만 반환” 서술을 삭제한다. 실제로는 5.3 발송 이력 조회와 동일한 `cursor`/`nextCursor`/`hasNext` 기반 “더보기” 커서 페이지네이션이 구현되어 있다(`InAppNotificationListResponse`). 첫 요청은 `cursor` 생략, 이후 `hasNext=true`이면 `nextCursor`를 다음 요청의 `cursor`로 전달해 이어서 조회한다.

**응답값 설계 의도**

- `unreadCount`: 현재 페이지와 무관하게 전체 미읽음 개수를 항상 함께 반환해, 벨 아이콘 뱃지를 목록 페이지네이션과 독립적으로 갱신할 수 있도록 함.
- `isRead`: 읽은 알림과 안 읽은 알림을 UI에서 다르게 표시(강조/흐리기)하기 위해 포함.
- `cardId`: 알림 클릭 시 해당 칸반 카드로 바로 이동(딥링크)하기 위해 포함.
- `nextCursor` / `hasNext`: “더보기” 클릭 시 이어서 조회하기 위한 커서 페이지네이션 메타데이터.

**Query Parameters**

| 파라미터 | 타입    | 필수 | 설명                                                          |
| -------- | ------- | ---- | ------------------------------------------------------------- |
| `cursor` | string  | N    | 첫 조회 시 생략, 이후 직전 응답의 `nextCursor` 전달           |
| `size`   | integer | N    | 페이지당 조회 개수 (생략/0 이하 시 20, 50 초과 시 50로 clamp) |

**Response 200**

```json
{
  "success": true,
  "data": {
    "unreadCount": 2,
    "items": [
      {
        "id": 5,
        "cardId": 10,
        "companyName": "카카오",
        "message": "카카오 지원 마감 D-3입니다.",
        "isRead": false,
        "createdAt": "2026-07-12T09:00:00"
      },
      {
        "id": 4,
        "cardId": 11,
        "companyName": "네이버",
        "message": "네이버 지원 마감 D-1입니다.",
        "isRead": false,
        "createdAt": "2026-07-14T09:00:00"
      }
    ],
    "nextCursor": null,
    "hasNext": false
  }
}
```

---

### 5.5 인앱 알림 읽음 처리

```
PATCH /api/v1/notifications/inbox/read
```

**설명**
인앱 알림을 읽음 처리한다. 특정 알림 하나만 읽음 처리하거나, 전체 알림을 한 번에 읽음 처리할 수 있다. 알림창을 열었을 때 “모두 읽음” 버튼 또는 개별 알림 클릭 시 호출된다.

**응답값 설계 의도**

- `ids` 배열로 복수 처리 지원: 개별 1건 클릭과 “모두 읽음” 버튼을 동일 API로 처리하기 위해 배열 형태로 받음. “모두 읽음” 시에는 클라이언트가 현재 목록의 전체 id를 배열로 보내거나, `all: true` 플래그를 추가하는 방식으로 확장 가능.
- `updatedCount`: 실제 읽음 처리된 건수를 반환해 프론트엔드에서 `unreadCount` 뱃지를 즉시 갱신할 수 있도록 함.

**Request Body**

```json
{
  "ids": [4, 5]
}
```

**Response 200**

```json
{
  "success": true,
  "data": {
    "updatedCount": 2
  }
}
```

---

## 6. 사용자 (User)

### 6.1 내 정보 조회

```
GET /api/v1/users/me
```

**설명**
로그인한 사용자의 프로필 정보와 파일 저장 용량 현황을 반환한다. 마이페이지 렌더링 및 서류 업로드 전 용량 초과 여부 사전 확인에 활용된다.

**응답값 설계 의도**

- `storageUsed` / `storageLimit`: 바이트 단위로 반환해 프론트엔드가 직접 MB/GB 단위로 변환해 표시. 서버가 문자열(“10.5 MB”)로 변환해 내려주면 프론트 표시 형식 변경 시 유연성이 떨어지므로, 숫자 원형 데이터로 반환.
- `email`: 알림 수신 이메일 표시용. 카카오 계정과 연동된 이메일.

**Response 200**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "nickname": "동섭",
    "profileImage": "https://k.kakaocdn.net/...",
    "email": "user@example.com",
    "storageUsed": 10485760,
    "storageLimit": 104857600,
    "createdAt": "2026-06-01T00:00:00"
  }
}
```

---

### 6.2 회원 탈퇴

```
DELETE /api/v1/users/me
```

**설명**
계정을 탈퇴 처리한다. 실제 DB 레코드를 즉시 삭제하지 않고 소프트 딜리트(`is_deleted = true`, `deleted_at` 기록) 방식으로 비활성화한다. 칸반 카드, 서류, 알림 설정 등 연관 데이터도 함께 비활성화된다.

**S3 파일 삭제 정책 확정:** 탈퇴 시점에는 DB만 소프트 딜리트하고, `deleted_at` 기준 30일이 지난 계정의 S3 파일을 배치로 물리 삭제한다(그 사이 문의 등으로 복구가 필요한 경우를 대비한 유예 기간). 계정·서류 DB 레코드는 30일 경과 후에도 하드 삭제하지 않고 소프트 딜리트 상태로 유지한다.

**응답값 설계 의도**

- `data: null`: 탈퇴 후 클라이언트는 세션을 초기화하고 로그인 화면으로 이동하면 되므로 추가 데이터 불필요.

**Response 200**

```json
{
  "success": true,
  "data": null
}
```

---

## Appendix. 도메인 Enum

> v1.11: 실제 코드의 Enum 클래스명·값 기준으로 전면 정정. `ParseStatus`(2.6 OG 파싱)는 해당 기능이 구현되지 않아 제거.

| Enum                                     | 값                                                                                                                                                                                                                                                                              |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `JobPlatform` (명세서 구버전 `Platform`) | `SARAMIN`, `WORKNET`, `PUBLIC`, `PUBLIC_PERSONNEL`, `DIRECT` (`WANTED`는 존재하지 않음)                                                                                                                                                                                         |
| `jobCategory`                            | Enum 아님 — 자유 문자열 컬럼 (예: `BACKEND`, `FRONTEND`, `DESIGN` 등은 실제 수집 데이터에서 관측되는 값일 뿐 고정된 목록이 아님)                                                                                                                                                |
| `CareerType` (명세서 구버전 `Career`)    | `NEW`, `EXPERIENCED`                                                                                                                                                                                                                                                            |
| `Region` (v1.11 신규)                    | `SEOUL`, `BUSAN`, `DAEGU`, `INCHEON`, `GWANGJU`, `DAEJEON`, `ULSAN`, `SEJONG`, `GYEONGGI`, `GANGWON`, `CHUNGBUK`, `CHUNGNAM`, `JEONBUK`, `JEONNAM`, `GYEONGBUK`, `GYEONGNAM`, `JEJU`, `OTHER` — 원문 지역명(시/도명 또는 판교·분당 등 알려진 지역구 별칭)을 표준 시/도로 정규화 |
| `DocumentType`                           | `FILE`, `LINK`, `MEMO`                                                                                                                                                                                                                                                          |
| `NotificationStatus`                     | `SUCCESS`, `FAILED`                                                                                                                                                                                                                                                             |
| `NotificationType`                       | `EMAIL`, `IN_APP`                                                                                                                                                                                                                                                               |
| `DocumentLinkCategory`                   | `RESUM` , `PROTFOLIO`, `PERSONAL_CHANNEL` , `OTHER`                                                                                                                                                                                                                             |

### 추가(작성: 손세영, 7월 30일 작성)

- 카테고리 분류를 위해서 `DocumentLinkCategory` Enum 추가
  - RESUM : 이력서
  - PROTFOLIO : 포트폴리오
  - PERSONAL_CHANNEL : 개인 채널
  - OTHER : 기타

추후 카테고리별 기능 추가 가능

---

## 스케줄러 동작 명세 (비-API)

> API가 아닌 서버 내부 동작이므로 별도 엔드포인트 없음. `@Scheduled` 어노테이션으로 Spring 컨텍스트 내부에서 실행.
>
> **v1.11 정정**: “만료 공고 정리(0시)”, “탈퇴 계정 정리(2시)”는 실제 코드베이스에 구현되어 있지 않아 표에서 제거했다(구현 필요 항목으로 별도 논의 필요). 공고 수집은 소스별로 스케줄러가 분리되어 있으며, 명세서에 없던 알림 이력 정리 스케줄러가 추가로 존재한다.
>
> **v1.12 정정**: “만료 공고 정리” 스케줄러는 계속 구현하지 않기로 확정. 대신 2.1 공고 피드 조회에 `excludeExpired` 파라미터(기본값 `true`)를 추가해 조회 시점에 서버가 마감 지난 공고를 걸러내는 방식으로 PRD 요구사항을 충족한다. `job_feed` 테이블의 만료 데이터를 실제로 삭제하는 배치는 저장 용량/성능이 문제가 될 때 별도로 재논의한다.

| 작업                        | 실행 주기                                                    | 동작                                                                                                                                                |
| --------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 공고 수집 (워크넷/공공기관) | 매일 오전 8시, 오후 8시 (`JobFeedSyncScheduler`)             | 워크넷·공공기관 채용정보 API 호출 → DB(`job_feed`) 저장. 블루/그린 배포 전환 중 인스턴스 중복 실행 방지를 위해 Redis 분산 락(Redisson `RLock`) 적용 |
| 공고 수집 (공공취업정보)    | 매일 오전 8시, 오후 8시 (`JobFeedPersonnelJobSyncScheduler`) | 인사혁신처 공공취업정보 API 호출 → DB(`job_feed`, `platform=PUBLIC_PERSONNEL`) 저장. 별도 분산 락 키 사용                                           |
| 마감일 알림 발송            | 매일 오전 9시 (`NotificationScheduler`)                      | 사용자별 `remindDays`(기본 `[7,3,1,0]`) 설정에 해당하는 카드 조회 → 이메일 발송 + 인앱 알림 INSERT                                                  |
| S3 파일 정리                | 매일 오전 1시 (`S3DocumentCleanupScheduler`)                 | 소프트 딜리트된 서류(카드 삭제 3.6 / 서류 삭제 4.5 포함) 중 S3 미정리 건의 실제 객체 삭제                                                           |
| 알림 이력 정리 (v1.11 신규) | 매일 오전 3시 (`NotificationCleanupScheduler`)               | 발송된 지 `retention-days`(기본 90일, 환경변수로 조정 가능) 경과한 알림 이력 삭제                                                                   |
