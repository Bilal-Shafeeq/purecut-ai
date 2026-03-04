import Navbar from "@/components/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import BeforeAfterSlider from "@/components/landing/BeforeAfterSlider";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import PricingSection from "@/components/landing/PricingSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <BeforeAfterSlider />
      <FeaturesGrid />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
