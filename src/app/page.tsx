import Audience from '@/features/landing/components/Audience';
import CtaSection from '@/features/landing/components/CtaSection';
import FeatureGrid from '@/features/landing/components/FeatureGrid';
import Footer from '@/features/landing/components/Footer';
import Hero from '@/features/landing/components/Hero';
import LandingAuthRedirect from '@/features/landing/components/LandingAuthRedirect';
import Navbar from '@/features/landing/components/Navbar';
import Problem from '@/features/landing/components/Problem';
import Solution from '@/features/landing/components/Solution';

export default function Landing() {
  return (
    // landing-root: globals.css의 html:has(.landing-root) 부드러운 스크롤 스코프용
    <div className="landing-root min-h-screen bg-white">
      {/* 로그인 상태(또는 hydration 완료 전)면 콘텐츠를 그리지 않고 /jobs로 이동시킨다 */}
      <LandingAuthRedirect>
        <Navbar />
        <main>
          <Hero />
          <Problem />
          <Solution />
          <FeatureGrid />
          <Audience />
          <CtaSection />
        </main>
        <Footer />
      </LandingAuthRedirect>
    </div>
  );
}
