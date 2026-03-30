import Footer from '@/components/Footer';
import Header from '@/components/Header';

// Import Modular Sections
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import PricingSection from '@/components/landing/PricingSection';
import IntegrationsSection from '@/components/landing/IntegrationsSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import LeadershipSection from '@/components/landing/LeadershipSection';
import CtaSection from '@/components/landing/CtaSection';





export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <Header/>

      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <IntegrationsSection />
        <TestimonialsSection />
        <LeadershipSection />
        <PricingSection />
        <CtaSection />
      </main>

      <Footer/>
    </div>
  );
}