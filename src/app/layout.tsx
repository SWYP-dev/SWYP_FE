import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/query-provider';
import { GlobalLoginModal } from '@/features/auth/components/GlobalLoginModal';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '취합',
  description: '취업 정보를 하나로 합쳐 관리를 더 편하게, 취합',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={{ fontFamily: 'Pretendard, sans-serif' }}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          {children}
          <GlobalLoginModal />
        </QueryProvider>
      </body>
    </html>
  );
}
