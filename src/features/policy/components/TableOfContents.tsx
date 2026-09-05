'use client';

import { useEffect, useState } from 'react';

/** 목차에 필요한 최소 정보만 받는다. 조문 본문(blocks)까지 넘기면 직렬화 비용만 커진다. */
export interface TableOfContentsItem {
  id: string;
  title: string;
}

interface TableOfContentsProps {
  items: TableOfContentsItem[];
}

/** 이 개수를 넘으면 나머지는 '더보기'로 접는다. 약관은 조문이 20개라 접지 않으면 목차가 화면을 독점한다. */
const COLLAPSE_THRESHOLD = 10;

export function TableOfContents({ items }: TableOfContentsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeId, setActiveId] = useState(items[0]?.id ?? '');

  useEffect(() => {
    // 화면 상단 근처에 걸린 조문을 현재 위치로 표시한다.
    // rootMargin 아래쪽을 -70%로 잡아 판정 구간을 화면 위쪽 30%로 좁혔다.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length === 0) return;

        // 판정 구간에 조문이 여럿 걸리면 화면에서 가장 위에 있는 것을 택한다.
        const topmost = visible.reduce((a, b) =>
          a.boundingClientRect.top <= b.boundingClientRect.top ? a : b,
        );
        setActiveId(topmost.target.id);
      },
      { rootMargin: '-80px 0px -70% 0px' },
    );

    for (const { id } of items) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  }, [items]);

  const isCollapsible = items.length > COLLAPSE_THRESHOLD;
  const visibleItems = isCollapsible && !isExpanded ? items.slice(0, COLLAPSE_THRESHOLD) : items;

  return (
    // 보이는 제목을 두지 않으므로 aria-label이 이 영역의 유일한 이름이다.
    // 본문 목차와 이름이 겹치지 않도록 다르게 붙였다.
    <nav
      aria-label="조문 바로가기"
      // 100vh에서 sticky 시작 위치(88px)와 아래 여백(24px)을 빼야 카드가 화면을 넘지 않는다
      className="rounded-xl border border-line-secondary bg-base-white shadow-normal-xsmall lg:max-h-[calc(100vh-112px)] lg:overflow-y-auto"
    >
      <ul className="flex flex-col py-3">
        {visibleItems.map(({ id, title }) => {
          const isActive = id === activeId;
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                aria-current={isActive ? 'true' : undefined}
                className={
                  isActive
                    ? 'block bg-neutral-50 px-5 py-3 text-1 font-medium leading-[1.5] text-label-primary'
                    : 'block px-5 py-3 text-1 leading-[1.5] text-label-body transition-colors hover:bg-neutral-50 hover:text-label-base'
                }
              >
                {title}
              </a>
            </li>
          );
        })}
      </ul>

      {isCollapsible && !isExpanded ? (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="w-full border-t border-line-secondary px-5 py-3 text-left text-1 text-label-primary transition-colors hover:bg-neutral-50"
        >
          더보기
        </button>
      ) : null}
    </nav>
  );
}
