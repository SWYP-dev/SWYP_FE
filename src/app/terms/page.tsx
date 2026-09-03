import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/features/landing/components/Navbar';
import { termsOfService } from '@/features/policy/data/terms-of-service';

import { LegalDocument } from '@/features/policy/components/LegalDocument';

export const metadata: Metadata = {
  title: '이용약관 | 취합',
  description: '취합 서비스 이용에 관한 권리·의무 및 책임 사항을 안내합니다.',
};

export default function TermsOfServicePage() {
  return (
    // Navbar가 fixed라 본문이 헤더 아래로 들어간다 → 헤더 높이(68px)만큼 밀어준다
    <main className="min-h-full bg-base-white pt-[68px]">
      <Navbar variant="default" />
      {/* <ConsentModal isOpen onClose={() => {}} onConfirm={() => {}} /> */}
      <LegalDocument data={termsOfService} />

      {/* 원티드처럼 문서 끝에 '관련 문서' 색인을 둔다 */}
      <nav aria-label="관련 문서" className="mx-auto w-full max-w-[1120px] px-6 pb-12">
        <div className="border-t border-line-secondary pt-7">
          <p className="text-3 font-semibold text-label-base">관련 문서</p>
          <ul className="mt-4">
            <li>
              <Link
                href="/privacy"
                className="text-3 text-label-body underline-offset-4 hover:text-label-primary hover:underline"
              >
                개인정보 처리방침
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </main>
  );
}
