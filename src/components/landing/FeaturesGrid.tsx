import { motion } from "framer-motion";
import { Zap, Shield, ImageIcon, Download, Clock, Layers } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Remove backgrounds in under 5 seconds with our advanced AI engine.",
  },
  {
    icon: ImageIcon,
    title: "HD Quality Output",
    description: "Up to 5000×5000 resolution. Supports JPG, PNG, and WEBP formats.",
  },
  {
    icon: Layers,
    title: "Batch Processing",
    description: "Process multiple images at once with our Pro and API plans.",
  },
  {
    icon: Download,
    title: "Instant Download",
    description: "Download transparent PNGs instantly. No watermarks on paid plans.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Images auto-deleted after 24 hours. Your data never shared.",
  },
  {
    icon: Clock,
    title: "24/7 Available",
    description: "Always online, always ready. 99.5% uptime guarantee.",
  },
];

const FeaturesGrid = () => {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(270_70%_72%/0.04),transparent_70%)]" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-sm uppercase tracking-widest text-primary mb-3">Why Choose PureCut AI</p>
          <h2 className="text-3xl md:text-5xl font-bold font-display">
            Powerful Features
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="glass-card rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:glow-primary transition-shadow duration-300">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold font-display mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
