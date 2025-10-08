import Hero from '@/components/landing/Hero';
import StatsSection from '@/components/landing/StatsSection';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import Pricing from '@/components/landing/Pricing';
import Testimonials from '@/components/landing/Testimonials';
import FAQ from '@/components/landing/FAQ';
import CTASection from '@/components/landing/CTASection';

export default function Home() {
  return (
    <div className="pt-20">
      <Hero />
      <StatsSection />
      <Features />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <FAQ />
      <CTASection />
    </div>
  );
}
