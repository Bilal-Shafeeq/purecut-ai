import { motion } from "framer-motion";
import { useRef, useState, useCallback, useEffect } from "react";
import beforeImage from "@/assets/before-image.jpg";
import afterImage from "@/assets/after-image.jpg";

const BeforeAfterSlider = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.getBoundingClientRect().width);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
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
            className="relative aspect-[4/3] cursor-col-resize select-none touch-none overflow-hidden"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {/* After image (full width, shown behind) */}
            <img
              src={afterImage}
              alt="After - background removed"
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
            />

            {/* Before image (clipped by slider position) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPos}%` }}
            >
              <img
                src={beforeImage}
                alt="Before - with background"
                className="absolute inset-0 h-full object-cover"
                style={{ width: `${containerWidth}px` }}
                draggable={false}
              />
            </div>

            {/* Slider line */}
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-foreground/80 z-10"
              style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
            >
              {/* Handle circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-foreground/90 flex items-center justify-center shadow-lg z-20 cursor-grab active:cursor-grabbing">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M5 3L2 8L5 13M11 3L14 8L11 13" stroke="hsl(222 47% 3%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            {/* Labels */}
            <div className="absolute top-3 left-3 glass-card rounded-full px-3 py-1 text-xs font-semibold z-10">Before</div>
            <div className="absolute top-3 right-3 glass-card rounded-full px-3 py-1 text-xs font-semibold z-10">After</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BeforeAfterSlider;
