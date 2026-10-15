import type { Metadata } from 'next';
import { NotFoundView } from '@/components/ui/not-found-view';

// 루트 세그먼트에서는 layout의 title.template이 적용되지 않으므로 absolute로 전체 타이틀을 지정한다.
export const metadata: Metadata = {
  title: { absolute: '취합 | 페이지를 찾을 수 없어요' },
};

export default function NotFound() {
  return <NotFoundView />;
}
