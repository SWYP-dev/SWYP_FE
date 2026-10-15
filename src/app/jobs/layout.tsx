import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// page.tsx가 클라이언트 컴포넌트라 metadata를 export할 수 없어서, 서버 컴포넌트인 layout에서
// 브라우저 탭 타이틀을 지정한다. (루트 layout의 title.template으로 "취합 | 채용 공고"이 된다)
export const metadata: Metadata = {
  title: '채용 공고',
};

export default function JobsLayout({ children }: { children: ReactNode }) {
  return children;
}
