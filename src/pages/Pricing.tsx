import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import PricingSection from "@/components/landing/PricingSection";
import Footer from "@/components/Footer";

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <PricingSection />
      </div>
      <Footer />
    </div>
  );
};

export default Pricing;
