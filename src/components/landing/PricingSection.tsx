import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Try it out with no commitment",
    features: ["5 images per day", "Standard quality", "JPG & PNG support", "Web download"],
    cta: "Start Free",
    variant: "neon" as const,
    popular: false,
  },
  {
    name: "Pro",
    price: "₹499",
    period: "/month",
    description: "For professionals and teams",
    features: ["Unlimited images", "HD quality output", "All formats (WEBP)", "Batch processing", "Priority processing", "API access"],
    cta: "Upgrade to Pro",
    variant: "hero" as const,
    popular: true,
  },
  {
    name: "Credits",
    price: "₹99",
    period: "/50 credits",
    description: "Pay as you go",
    features: ["50 images per pack", "HD quality output", "All formats", "Never expires", "No subscription"],
    cta: "Buy Credits",
    variant: "neon" as const,
    popular: false,
  },
];

const PricingSection = () => {
  return (
    <section className="py-24 relative" id="pricing">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-sm uppercase tracking-widest text-primary mb-3">Pricing</p>
          <h2 className="text-3xl md:text-5xl font-bold font-display">
            Simple, Transparent Pricing
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              className={`glass-card rounded-2xl p-8 relative ${plan.popular ? "border-primary/50 glow-primary" : ""}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-cta text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-bold font-display mb-1">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold font-display">{plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/register">
                <Button variant={plan.variant} className="w-full" size="lg">
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
