import { motion } from "framer-motion";
import { useRef, useState, useCallback } from "react";
import featureImage from "@/assets/feature-preview.png";

const BeforeAfterSlider = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updatePosition(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    updatePosition(e.clientX);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <section className="py-24 relative" id="features">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-sm uppercase tracking-widest text-primary mb-3">See the Magic in Action</p>
          <h2 className="text-3xl md:text-5xl font-bold font-display">
            Drag the Slider
          </h2>
        </motion.div>

        <motion.div
          className="max-w-2xl mx-auto rounded-2xl overflow-hidden neon-border"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <div
            ref={containerRef}
            className="relative aspect-[4/3] cursor-col-resize select-none touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {/* After (checkered bg + cutout) */}
            <div className="absolute inset-0">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `linear-gradient(45deg, hsl(217 20% 12%) 25%, transparent 25%), linear-gradient(-45deg, hsl(217 20% 12%) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, hsl(217 20% 12%) 75%), linear-gradient(-45deg, transparent 75%, hsl(217 20% 12%) 75%)`,
                  backgroundSize: "20px 20px",
                  backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                  backgroundColor: "hsl(217 33% 8%)",
                }}
              />
              <img src={featureImage} alt="After - background removed" className="absolute inset-0 w-full h-full object-cover" />
            </div>

            {/* Before (with bg) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPos}%` }}
            >
              <div className="absolute inset-0 bg-accent/20" />
              <img
                src={featureImage}
                alt="Before - with background"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ width: `${containerRef.current ? containerRef.current.clientWidth : 100}px`, maxWidth: "none" }}
              />
            </div>

            {/* Slider handle */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-foreground/80"
              style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-foreground/90 flex items-center justify-center shadow-lg">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-background">
                  <path d="M5 3L2 8L5 13M11 3L14 8L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            {/* Labels */}
            <div className="absolute top-3 left-3 glass-card rounded-full px-3 py-1 text-xs font-medium">Before</div>
            <div className="absolute top-3 right-3 glass-card rounded-full px-3 py-1 text-xs font-medium">After</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BeforeAfterSlider;
