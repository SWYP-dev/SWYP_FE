@AGENTS.md

# SWYP 프로젝트 가이드

## 📌 주요 프로젝트 문서 (참조하면서 활용)

작업 중 세부 비즈니스 로직이나 명세가 필요한 경우 아래 문서를 찾아 읽고 참고하세요:

- **PRD 문서**: `docs/PRD.md`
- **API 명세서**: `docs/API_SPEC.md`

## 🛠️ 개발 및 코드 규칙

- **Framework**: Next.js (App Router), TypeScript, Tailwind CSS
- **패키지 매니저**: `npm`
- **빌드/테스트 명령어**: `npm run build`, `npm run dev`

## 🎨 코딩 컨벤션

- 컴포넌트는 `src/features/` 아래 기능 단위 모듈 구조를 따릅니다.
- 타입 정의는 `src/types/` 또는 해당 feature 폴더 내 `type.ts`를 사용합니다.
- 코드는 한국어 주석을 선호합니다.

## 팀 구성

- PM: 이세은
- 디자이너: 손진영
- 프론트엔드 : 한태영 (본인)
- 백엔드: 김동섭, 손세영

## Git 브랜치 전략

- main → develop → feature/기능명 (Squash and merge), develop → main 병합 태영 단독 진행 가능. 태영님은 프론트 셀프 리뷰/셀프 머지 권한 보유.

## Key learnings & principles

- 추측 금지: API 명세서·PRD·Figma 스펙에 없는 내용은 임의 구현하지 않고 사용자에게 먼저 질문. 불확실한 사항은 세영님/동섭님(백엔드), 진영님(디자인), 세은님(PM)에게 확인 요청 메시지 초안 작성.
- API 명세서 vs. 실제 Swagger 응답 불일치: 명세 텍스트를 기준으로 하되, 실제 동작이 다를 경우 반드시 플래그 처리. Swagger 라이브 테스트로 실제 동작 확인하는 방식 선호.
- Figma 스펙 정밀 준수: 임의 근사치 사용 금지. Figma에서 확인된 값(패딩, 사이즈, 갭 등)을 정확히 반영. 확인 안 되는 항목은 질문.
- Tailwind CSS v4 커스텀 스케일: 프로젝트가 커스텀 스케일(2/4/8/12/16/20/24/32px 등)을 사용하므로, 스케일 외 값(예: gap-14, px-9, size-3.5)은 조용히 무시됨 → arbitrary bracket 표기(gap-[56px], px-[36px]) 필수.
  SVG 색상: public/icons/의 SVG는 hardcoded stroke/fill → next/image로 색상 override 불가 → 인라인 SVG + currentColor 패턴 사용.
- 3계층 데이터 모델: job_feed(공유 원본) → job_postings(스크랩/등록 시 사용자 복사본) → 칸반/마감일 뷰(동일 job_postings 렌더링). 사용자 편집이 공개 데이터를 덮어쓰지 않도록 주의; 반대로 배치 동기화가 사용자 수정값을 덮어쓸 위험도 있음.
- KanbanCard.postingId: job_postings 영구 복사본 ID (feed ID 아님) → feed detail 엔드포인트 재사용 불가.
- 문서 첨부 name 필드: 사용자가 직접 입력하는 것이 아니라 linkCategory 드롭다운 선택값이 들어감 → 백엔드가 필드 제거를 제안해도 제거 불가.
- 스코프 변경 원칙: PRD 외 신규 기능 제안은 세은님(PM)에게 스코프 변경 여부 먼저 확인 후 진행.
- GitHub PR 500 에러 우회: /pull/create 라우트가 500 반환 시 로컬 직접 머지(git merge + git push) 사용. 반복 충돌 파일 4종 확인: src/app/scraps/page.tsx, src/features/deadlines/components/DeadlineList.tsx, src/features/kanban/components/KanbanBoard.tsx, src/features/kanban/components/KanbanColumn.tsx.
- vim 우회: git commit 중 vim 열릴 경우 git commit -m "message" 직접 사용.
- DropdownMenu z-index: Popover z-50 < 모달 z-[60] 충돌 → 클릭이 모달을 닫아버리는 버그 주의.

## Approach & patterns

코드 작업 시 필수 Git 프로세스 안내 (단순 에러 해결·질문 제외, 후속 수정본에도 동일 적용):

- 브랜치 생성 명령어 (feature/기능명 또는 fix/기능명, develop 기준)
- CONTRIBUTING.md 커밋 컨벤션에 맞춘 커밋 메시지
- PR 생성 링크 및 CONTRIBUTING.md 기반 PR 디스크립션 (.github/PULL_REQUEST_TEMPLATE.md 형식, "리뷰어에게" / "확인 필요" 섹션 포함)

## 코드 결과물 제공 방식:

새 폴더 트리 전체 출력 금지
기존 프로젝트 구조 대비 파일 추가/수정/삭제 내역을 명시적으로 구분해서 안내
파일은 한 번에 하나씩 완성된 전체 내용으로 제공 (부분 스니펫 금지)
수정 전 항상 develop 브랜치 코드 기준으로 작업; 필요한 파일·코드가 없으면 추측하지 말고 어떤 파일이 필요한지 먼저 질문

## Figma MCP 사용:

Figma:get_design_context: fileKey=ar1tLubNIUVwLhU09duB9n, nodeId (URL의 ?node-id= 파라미터에서 하이픈→콜론 변환, 예: 49-8062 → 49:8062), clientFrameworks=react,nextjs, clientLanguages=typescript
Figma:get_metadata: fallback으로 사용
두 node ID가 동일 출력 반환 시 사용자에게 어떤 차이를 의도하는지 질문

## 환경:

Windows PowerShell. grep 사용 불가 → Select-String 사용. head 사용 불가 → Get-Content {file} | Select-Object -Index ({start}..{end}).

## 로컬 토큰 키: chwihap_access_token, chwihap_refresh_token

## Tools & resources

- GitHub: SWYP-dev/SWYP_FE, default branch 이슈로 PR base 브랜치 매번 수동 확인 필요
- Vercel: 프로젝트명 swyp-fe, Hobby plan. 환경변수: NEXT_PUBLIC_API_BASE_URL, NEXT_PUBLIC_KAKAO_CLIENT_ID, NEXT_PUBLIC_KAKAO_REDIRECT_URI
- 백엔드 API: https://api.chwihap.com (AWS, IP: 13.210.187.59), Swagger: http://13.210.187.59/swagger-ui/index.html (raw IP라 web_fetch 접근 불가)
- DNS (Gabia): A레코드 @ → Vercel, api → 백엔드 IP; CNAME www → Vercel DNS. Gabia CNAME 값에 trailing period(.) 필수.
- Figma MCP: Figma:get_design_context, Figma:get_metadata
- 에디터: Cursor (VS Code fork), Windows PowerShell
