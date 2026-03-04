import { useRef, useState, useCallback, useEffect } from "react";
import { Loader2, X, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// Import new demo images
import DEMO_BEFORE_IMG from "@/assets/1.png";
import DEMO_AFTER_IMG from "@/assets/2.png";

export type DownloadFormat = "png" | "jpeg" | "webp";

const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect fill='%23222' width='800' height='600'/%3E%3Ctext fill='%23666' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18'%3EDrop image here%3C/text%3E%3C/svg%3E";

// Demo images: same dimensions (800x600) - before (with bg) and after (transparent)
export const DEMO_BEFORE = DEMO_BEFORE_IMG;
export const DEMO_AFTER = DEMO_AFTER_IMG;

interface BeforeAfterSliderProps {
  beforeImageSrc?: string;
  afterImageSrc?: string;
  defaultBeforeImageSrc?: string;
  defaultAfterImageSrc?: string;
  onReset?: () => void;
  isLoading?: boolean;
  onFileChange?: (file: File) => void;
  /** Smaller size for landing page */
  compact?: boolean;
  /** When true, shows Download button (BG removed) */
  showDownloadButton?: boolean;
  onDownload?: (format: DownloadFormat) => void;
  fileName?: string;
  /** Ref to trigger file input (for Upload button) */
  fileInputRef?: React.RefObject<HTMLInputElement | null>;
}

const BeforeAfterSlider = ({
  beforeImageSrc,
  afterImageSrc,
  defaultBeforeImageSrc = PLACEHOLDER_IMAGE,
  defaultAfterImageSrc = PLACEHOLDER_IMAGE,
  onReset,
  isLoading = false,
  onFileChange,
  compact = false,
  showDownloadButton = false,
  onDownload,
  fileName = "purecut-ai",
  fileInputRef,
}: BeforeAfterSliderProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const internalFileInputRef = useRef<HTMLInputElement>(null);
  const fileInput = fileInputRef ?? internalFileInputRef;
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<DownloadFormat>("png");
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);

  const currentBefore = beforeImageSrc || defaultBeforeImageSrc;
  const currentAfter = afterImageSrc || defaultAfterImageSrc;
  const hasUserImage = !!beforeImageSrc;

  // When user uploads image, get its aspect ratio for dynamic sizing
  useEffect(() => {
    if (!hasUserImage) {
      setImageAspectRatio(null);
      return;
    }
    const img = new Image();
    img.onload = () => setImageAspectRatio(img.width / img.height);
    img.src = currentBefore;
  }, [currentBefore, hasUserImage]);

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

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/") && onFileChange) onFileChange(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(false);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes("Files")) setDragOver(true);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileChange) onFileChange(file);
    e.target.value = "";
  };

  const handleDownloadClick = () => {
    setSelectedFormat("png");
    setDownloadDialogOpen(true);
  };

  const handleDownloadConfirm = () => {
    onDownload?.(selectedFormat);
    setDownloadDialogOpen(false);
  };

  const FORMAT_OPTIONS: { value: DownloadFormat; label: string }[] = [
    { value: "png", label: "PNG (Transparent)" },
    { value: "jpeg", label: "JPEG" },
    { value: "webp", label: "WebP" },
  ];

  return (
    <div
      className={`relative rounded-2xl overflow-hidden transition-shadow duration-500 ${
        hasUserImage ? "max-h-[85vh]" : compact ? "max-h-[320px]" : ""
      } ${
        dragOver
          ? "ring-2 ring-primary shadow-[0_0_40px_-10px_hsl(199_100%_53%/0.5)]"
          : "neon-border shadow-[0_8px_40px_-12px_hsl(199_100%_53%/0.15)]"
      }`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleFileDrop}
    >
        <div
          ref={containerRef}
          className={`relative select-none touch-none overflow-hidden ${
            !hasUserImage && compact ? "max-h-[260px]" : ""
          } ${!hasUserImage || !imageAspectRatio ? "aspect-[4/3]" : ""}`}
          style={{
            ...(hasUserImage && imageAspectRatio ? { aspectRatio: imageAspectRatio } : {}),
            cursor: isDragging ? "grabbing" : "col-resize",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* After image (full, behind) */}
          <div className="absolute inset-0 bg-[hsl(217_33%_10%)]">
            {/* Checkered pattern for transparency */}
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
              className="absolute inset-0 w-full h-full object-cover object-center"
              draggable={false}
            />
          </div>

          {/* Before image (clipped from left) - identical size as after */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
          >
            <img
              src={currentBefore}
              alt="Before - original"
              className="absolute inset-0 w-full h-full object-cover object-center"
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

          {/* Drag overlay - visible when dragging file over */}
          {dragOver && onFileChange && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-primary/20 backdrop-blur-sm border-2 border-dashed border-primary rounded-xl m-2">
              <p className="text-lg font-semibold text-primary">Drop image here</p>
            </div>
          )}

          {/* Processing overlay */}
          {isLoading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
              <p className="text-sm font-medium text-foreground">Removing background…</p>
            </div>
          )}

          {/* Bottom action buttons */}
          {(onReset && beforeImageSrc) || (showDownloadButton && onDownload) ? (
            <div className="absolute bottom-3 right-3 z-20 flex items-center gap-2">
              {onReset && beforeImageSrc && !isLoading && (
                <button
                  onClick={(e) => { e.stopPropagation(); onReset(); }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="glass-card rounded-full p-2 hover:bg-destructive/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {showDownloadButton && onDownload && !isLoading && (
                <Button
                  variant="neon"
                  size="lg"
                  onClick={(e) => { e.stopPropagation(); handleDownloadClick(); }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="glass-card gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              )}
            </div>
          ) : null}
        </div>

        {/* Upload button - below slider (when onFileChange provided) */}
        {onFileChange && (
          <div className={`border-t border-border/50 flex justify-center ${compact ? "p-3" : "p-4"}`}>
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileInput}
            />
            <Button
              variant="outline"
              size="lg"
              onClick={() => fileInput.current?.click()}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Image
            </Button>
          </div>
        )}

        {/* Download format selection popup */}
        <Dialog open={downloadDialogOpen} onOpenChange={setDownloadDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Select Download Format</DialogTitle>
            </DialogHeader>
            <div className="grid gap-2 py-2">
              {FORMAT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedFormat(opt.value)}
                  className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                    selectedFormat === opt.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-accent/50"
                  }`}
                >
                  <span className="font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDownloadDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="neon" onClick={handleDownloadConfirm} className="gap-2">
                <Download className="w-4 h-4" />
                Download
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  );
};

export default BeforeAfterSlider;
