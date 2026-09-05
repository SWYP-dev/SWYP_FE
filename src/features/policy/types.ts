// 법률 문서(개인정보 처리방침·이용약관) 공통 데이터 모델.
// 법률 텍스트를 마크업에서 분리해 두어, 조문 수정 시 이 파일들만 고치면 되도록 했다.
// 렌더링은 src/components/legal/LegalDocument.tsx가 담당한다.

export type LegalBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'subheading'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'orderedList'; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] };

export interface LegalSection {
  /** 목차 앵커로 쓰이는 id. 영문 kebab-case. */
  id: string;
  title: string;
  blocks: LegalBlock[];
}

export interface LegalDocumentData {
  title: string;
  /** 문서 최상단 도입 문단 */
  intro: string;
  /** 제목 옆에 '(YYYY.MM.DD 시행)'으로 붙는다. 점 구분 형식으로 적을 것. */
  effectiveDate: string;
  sections: LegalSection[];
}
