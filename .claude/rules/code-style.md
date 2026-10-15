# code-style.md

이 저장소에서 코드를 작성할 때 따르는 컨벤션입니다.

## 언어

- **변수명/함수명/컴포넌트명**: 영어
- **코드 주석**: 한국어
- **커밋 메시지**: 한국어 (`.claude/rules/git-rules.md` 참조)

## 컴포넌트 패턴

- **기본은 Server Component**. `"use client"`는 실제로 상태/이벤트/브라우저 API가 필요한 최소 범위에만 붙인다
- 데이터 페칭은 Server Component에서 수행하고, Client Component에는 props로 전달한다 (`location/page.tsx`, `site-footer.tsx`가 참고 패턴)
- 전체 페이지를 `"use client"`로 선언하고 `useEffect`로 데이터를 페칭하는 패턴은 지양한다 (SSR 이점 상실, `setlist/page.tsx`·`event-goods/page.tsx`가 반면교사 사례 — work01에서 리팩토링 대상)

## 중복 제거

- 모바일/데스크탑 조건부 렌더링처럼 반복되는 UI는 공통 컴포넌트로 분리한다 (예: `LineupCard`)
- 같은 로직을 여러 곳에 복붙하지 말고 `components/common/`, `components/ui/` 등 공용 위치로 옮긴다

## 아이콘/매핑 렌더링

- 아이콘이나 타입별 분기 렌더링은 `switch`문 대신 **객체 매핑(`Record` 타입)**을 사용한다

```ts
// 지양
switch (type) {
  case "a": return <IconA />;
  case "b": return <IconB />;
}

// 권장
const ICON_MAP: Record<Type, React.ReactNode> = {
  a: <IconA />,
  b: <IconB />,
};
```

## 메모이제이션

- `memo` 적용 여부는 컴포넌트 전반에서 일관성을 유지한다 (일부만 적용하지 않기)
- React Compiler(`reactCompiler: true`)가 활성화돼 있어 수동 메모이제이션이 필요 없는 경우가 많음 — 적용 전에 정말 필요한지 먼저 확인

## 네이밍

- id 값에 `&` 등 특수문자 사용을 지양한다 (라우팅/쿼리 파싱 이슈 방지)
- Next.js App Router에서 여러 폴더에 `page.tsx`가 존재하는 것은 의도된 컨벤션이므로 통일하려 하지 않는다

## 타입

- TypeScript strict mode 기준으로 작성한다 (`any` 지양, 타입 정의는 `types/`에 위치)

## 보안

- `.env` 관련 파일은 절대 커밋하지 않는다 (Public 레포이므로 특히 주의)
- 브라우저에 노출되는 `NEXT_PUBLIC_*` 값과 서버 전용 시크릿을 구분해서 관리한다
