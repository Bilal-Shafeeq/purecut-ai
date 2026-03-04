import { motion } from "framer-motion";
import { useRef, useState, useCallback, useEffect } from "react";
import { Upload, ImageIcon, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import beforeImage from "@/assets/before-image.jpg";
import afterImage from "@/assets/after-image.jpg";

const BeforeAfterSlider = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [uploadedBefore, setUploadedBefore] = useState<string | null>(null);
  const [uploadedAfter, setUploadedAfter] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const currentBefore = uploadedBefore || beforeImage;
  const currentAfter = uploadedAfter || afterImage;

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
    containerRef.current?.setPointerCapture(e.pointerId);
    updatePosition(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    updatePosition(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    containerRef.current?.releasePointerCapture(e.pointerId);
  };

  const processUpload = (file: File) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type) || file.size > 10 * 1024 * 1024) return;

    setIsProcessing(true);
    const url = URL.createObjectURL(file);
    setUploadedBefore(url);
    setSliderPos(50);

    // Simulate AI processing
    setTimeout(() => {
      // For demo, reuse same image as "after" with checkered bg implied
      setUploadedAfter(url);
      setIsProcessing(false);
    }, 2000);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processUpload(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processUpload(file);
  };

  const resetUpload = () => {
    if (uploadedBefore) URL.revokeObjectURL(uploadedBefore);
    setUploadedBefore(null);
    setUploadedAfter(null);
    setSliderPos(50);
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
          <p className="text-sm uppercase tracking-[0.2em] text-primary mb-3 font-medium">
            See the Magic in Action
          </p>
          <h2 className="text-3xl md:text-5xl font-bold font-display">
            Drag the Slider
          </h2>
        </motion.div>

        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          {/* Slider Container */}
          <div
            className={`relative rounded-2xl overflow-hidden transition-shadow duration-500 ${
              dragOver
                ? "ring-2 ring-primary shadow-[0_0_40px_-10px_hsl(199_100%_53%/0.5)]"
                : "neon-border shadow-[0_8px_40px_-12px_hsl(199_100%_53%/0.15)]"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
          >
            <div
              ref={containerRef}
              className="relative aspect-[4/3] select-none touch-none overflow-hidden"
              style={{ cursor: isDragging ? "grabbing" : "col-resize" }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              {/* After image (full, behind) */}
              <div className="absolute inset-0">
                {/* Checkered pattern background */}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `linear-gradient(45deg, hsl(217 20% 14%) 25%, transparent 25%), linear-gradient(-45deg, hsl(217 20% 14%) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, hsl(217 20% 14%) 75%), linear-gradient(-45deg, transparent 75%, hsl(217 20% 14%) 75%)`,
                    backgroundSize: "24px 24px",
                    backgroundPosition: "0 0, 0 12px, 12px -12px, -12px 0px",
                    backgroundColor: "hsl(217 33% 10%)",
                  }}
                />
                <img
                  src={currentAfter}
                  alt="After - background removed"
                  className="absolute inset-0 w-full h-full object-cover"
                  draggable={false}
                />
              </div>

              {/* Before image (clipped) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${sliderPos}%` }}
              >
                <img
                  src={currentBefore}
                  alt="Before - original"
                  className="absolute inset-0 h-full object-cover"
                  style={{ width: containerWidth > 0 ? `${containerWidth}px` : "100%" }}
                  draggable={false}
                />
              </div>

              {/* Slider line + handle */}
              <div
                className="absolute top-0 bottom-0 z-10"
                style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
              >
                {/* Line */}
                <div className={`absolute inset-0 w-[2px] mx-auto transition-colors duration-300 ${
                  isDragging ? "bg-primary" : "bg-foreground/70"
                }`} />

                {/* Handle */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 cursor-grab active:cursor-grabbing ${
                  isDragging
                    ? "bg-primary scale-110 shadow-[0_0_24px_-4px_hsl(199_100%_53%/0.6)]"
                    : isHovering
                      ? "bg-foreground/95 scale-105 shadow-[0_4px_20px_-4px_hsl(0_0%_0%/0.4)]"
                      : "bg-foreground/90 shadow-[0_4px_16px_-4px_hsl(0_0%_0%/0.3)]"
                }`}>
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M5 3L2 8L5 13M11 3L14 8L11 13"
                      stroke={isDragging ? "hsl(222, 47%, 3%)" : "hsl(222, 47%, 3%)"}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Labels */}
              <div className="absolute top-3 left-3 z-10">
                <span className="glass-card rounded-full px-3 py-1 text-xs font-semibold tracking-wide">
                  Before
                </span>
              </div>
              <div className="absolute top-3 right-3 z-10">
                <span className="glass-card rounded-full px-3 py-1 text-xs font-semibold tracking-wide">
                  After
                </span>
              </div>

              {/* Processing overlay */}
              {isProcessing && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
                  <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
                  <p className="text-sm font-medium text-foreground">Removing background…</p>
                </div>
              )}

              {/* Drag overlay */}
              {dragOver && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-primary/10 backdrop-blur-sm border-2 border-dashed border-primary rounded-2xl">
                  <Upload className="w-10 h-10 text-primary mb-2" />
                  <p className="text-sm font-semibold text-primary">Drop your image here</p>
                </div>
              )}

              {/* Reset button */}
              {uploadedBefore && !isProcessing && (
                <button
                  onClick={(e) => { e.stopPropagation(); resetUpload(); }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="absolute bottom-3 right-3 z-20 glass-card rounded-full p-2 hover:bg-destructive/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Upload button below */}
          <div className="flex justify-center mt-6">
            <label>
              <Button variant="neon" size="lg" asChild>
                <span className="cursor-pointer">
                  <ImageIcon className="w-4 h-4" />
                  Upload Your Image
                </span>
              </Button>
              <input
                type="file"
                className="hidden"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleFileInput}
              />
            </label>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-3">
            Drop an image or click to upload • JPG, PNG, WEBP • Max 10 MB
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default BeforeAfterSlider;
