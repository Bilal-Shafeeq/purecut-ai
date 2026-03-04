import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(199_100%_53%/0.08),transparent_60%)]" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="glass-card rounded-3xl p-12 md:p-16 text-center max-w-3xl mx-auto neon-border"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
            Ready to Remove Backgrounds?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Join thousands of creators, marketers, and developers who trust PureCut AI.
          </p>
          <Link to="/workspace">
            <Button variant="hero" size="xl">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
