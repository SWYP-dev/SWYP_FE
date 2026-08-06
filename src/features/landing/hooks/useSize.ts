'use client';

import * as React from 'react';

export interface ElementSize {
  width: number;
  height: number;
}

// 측정 전(첫 렌더)에는 undefined를 반환한다. 호출부에서 이 시점을 구분해야 함.
export function useSize(ref: React.RefObject<HTMLElement | null>): ElementSize | undefined {
  const [size, setSize] = React.useState<ElementSize>();

  // useLayoutEffect (not useEffect): the initial measurement must land before
  // the browser paints, so consumers can render their real content on the
  // very first painted frame instead of a guess. A ResizeObserver's first
  // callback arrives too late for that — by then an <img> src guess has
  // already been dispatched to the network.
  React.useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    setSize({ width: rect.width, height: rect.height });

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return size;
}
