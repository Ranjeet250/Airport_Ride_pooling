import HeroSection from '../components/landing/HeroSection';
import StatsSection from '../components/landing/StatsSection';
import HowItWorks from '../components/landing/HowItWorks';
import FeaturesSection from '../components/landing/FeaturesSection';
import PricingPreview from '../components/landing/PricingPreview';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import CtaSection from '../components/landing/CtaSection';

export default function HomePage() {
    return (
        <>
            <HeroSection />
            <StatsSection />
            <HowItWorks />
            <FeaturesSection />
            <PricingPreview />
            <TestimonialsSection />
            <CtaSection />
        </>
    );
}
