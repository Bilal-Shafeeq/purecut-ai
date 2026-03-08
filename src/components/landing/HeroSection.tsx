import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(199_100%_53%/0.08),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(270_70%_72%/0.06),transparent_60%)]" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(hsl(217_20%_16%/0.3)_1px,transparent_1px),linear-gradient(90deg,hsl(217_20%_16%/0.3)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-1.5 mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">AI-Powered Background Removal</span>
            </div>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-bold font-display leading-tight mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Remove Backgrounds{" "}
            <span className="gradient-text">Instantly</span>{" "}
            with AI
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Upload any image. Get a clean, transparent background in seconds.
            No design skills needed. Powered by cutting-edge AI.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link to="/tool">
              <Button variant="hero" size="xl">
                Remove Background Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/#features">
              <Button variant="neon" size="xl">
                See How It Works
              </Button>
            </Link>
          </motion.div>

          <motion.p
            className="text-sm text-muted-foreground mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            ✨ 5 free images per day • No signup required • HD quality
          </motion.p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
