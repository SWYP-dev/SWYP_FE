import { TableOfContents } from '@/features/policy/components/TableOfContents';
import { LegalBlock, LegalDocumentData } from '@/features/policy/types';

interface LegalDocumentProps {
  data: LegalDocumentData;
}

// 취합 디자인 토큰(src/styles/tokens.css) 기준으로 구성.
// 원티드 개인정보 처리방침처럼 채움(배경 블록)을 걷어내고 선과 여백으로만 구획하는
// 문서형 톤을 따른다. 본문 15px(text-4)/leading 1.8, 조문 제목 20px(text-8).
function Block({ block }: { block: LegalBlock }) {
  switch (block.type) {
    case 'paragraph':
      return <p className="text-4 leading-[1.8] text-label-body">{block.text}</p>;

    case 'subheading':
      return <p className="text-5 font-semibold leading-[1.5] text-label-base">{block.text}</p>;

    case 'list':
      return (
        <ul className="flex list-disc flex-col gap-2 pl-5 text-4 leading-[1.8] text-label-body marker:text-label-caption">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );

    case 'orderedList':
      return (
        <ol className="flex list-decimal flex-col gap-2 pl-5 text-4 leading-[1.8] text-label-body marker:text-label-description">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      );

    case 'table': {
      // 열 수에 비례해 최소 폭을 잡는다. 560px 고정이면 국외이전 표(6열)에서
      // 열이 과하게 눌려 글자가 세로로 흐른다. 값이 동적이라 Tailwind 임의값 대신 인라인 스타일.
      const minWidth = Math.max(560, block.headers.length * 120);

      return (
        // 위탁·국외이전 표는 열이 많아 모바일에서 넘친다 → 가로 스크롤로 처리.
        // break-keep(word-break: keep-all)이 없으면 '보유·이용 기간'이 '기 간'처럼
        // 어절 중간에서 끊긴다. 줄바꿈을 공백 위치로만 제한한다.
        <div className="w-full overflow-x-auto rounded-lg border border-line-secondary">
          <table className="w-full break-keep border-collapse text-3" style={{ minWidth }}>
            <thead>
              <tr className="bg-neutral-50">
                {block.headers.map((header) => (
                  <th
                    key={header}
                    scope="col"
                    // 머리글은 줄바꿈 없이 한 줄로 둬서 열 제목의 높이를 맞춘다.
                    className="whitespace-nowrap border-b border-line-secondary px-4 py-4 text-left font-semibold text-label-base"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr
                  key={row.join('|')}
                  className={rowIndex > 0 ? 'border-t border-line-secondary' : undefined}
                >
                  {row.map((cell) => (
                    <td key={cell} className="px-4 py-3 align-top leading-[1.7] text-label-body">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  }
}

export function LegalDocument({ data }: LegalDocumentProps) {
  const tocItems = data.sections.map(({ id, title }) => ({ id, title }));

  return (
    <article className="mx-auto w-full max-w-[1120px] px-6 pb-10 pt-12">
      {/* 문서 머리말: 시행일은 제목 옆에 붙이고, 실선으로 본문과 끊는다 */}
      <header className="border-b border-line-secondary pb-7">
        <h1 className="text-12 font-semibold leading-[1.4] text-label-base">
          {data.title}
          <span className="ml-3 text-6 font-normal text-label-description">
            ({data.effectiveDate} 시행)
          </span>
        </h1>
        <p className="mt-5 text-4 leading-[1.8] text-label-body">{data.intro}</p>
      </header>

      {/* 데스크톱에서는 목차를 오른쪽에 고정하고, 그 아래 폭에서는 본문 위로 올린다.
          items-start가 있어야 aside가 늘어나지 않아 sticky가 동작한다. */}
      <div className="mt-10 flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-11">
        {/* top-[88px]: 고정 헤더 68px + 여백 20px. 이보다 작으면 목차가 헤더 밑으로 파고든다 */}
        <aside className="lg:sticky lg:top-[88px] lg:order-2 lg:w-[280px] lg:shrink-0">
          <TableOfContents items={tocItems} />
        </aside>

        {/* min-w-0이 없으면 가로 스크롤 표가 flex 아이템 폭을 밀어낸다 */}
        <div className="flex min-w-0 flex-1 flex-col gap-10 lg:order-1">
          {data.sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              // 목차 앵커로 이동했을 때 조문 제목이 고정 헤더(68px)에 가리지 않도록
              // 그보다 큰 값을 준다. 68px + 여백 20px.
              className="flex scroll-mt-[88px] flex-col gap-5"
            >
              <h2 className="text-8 font-semibold leading-[1.4] text-label-base">
                {section.title}
              </h2>
              {section.blocks.map((block, index) => (
                <Block key={`${section.id}-${index}`} block={block} />
              ))}
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}
