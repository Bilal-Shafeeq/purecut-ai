import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { getAndClearPendingUploadFile } from "@/lib/pending-upload";
import { X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import BeforeAfterSlider, { DEMO_BEFORE, DEMO_AFTER, DownloadFormat } from "@/components/landing/BeforeAfterSlider";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import PricingSection from "@/components/landing/PricingSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { removeBackground } from "@imgly/background-removal";

type ProcessingState = "idle" | "uploading" | "processing" | "done" | "error";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [state, setState] = useState<ProcessingState>("idle");
  const { toast } = useToast();

  // Check for pending file from Index (e.g. after drop/upload on landing)
  useEffect(() => {
    const pending = getAndClearPendingUploadFile();
    if (pending && validateFile(pending)) {
      if (preview) URL.revokeObjectURL(preview);
      if (processedImage) URL.revokeObjectURL(processedImage);
      const url = URL.createObjectURL(pending);
      setFile(pending);
      setPreview(url);
      setProcessedImage(null);
      setState("idle");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Revoke object URLs when component unmounts or dependencies change
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
      if (processedImage) URL.revokeObjectURL(processedImage);
    };
  }, [preview, processedImage]);

  const validateFile = (f: File): boolean => {
    if (!ALLOWED_TYPES.includes(f.type)) {
      toast({ title: "Invalid format", description: "Only JPG, PNG, WEBP allowed.", variant: "destructive" });
      return false;
    }
    if (f.size > MAX_SIZE) {
      toast({ title: "File too large", description: "Max size is 10 MB.", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleFileChange = useCallback((f: File) => {
    if (!validateFile(f)) return;
    // Revoke previous object URLs before creating new ones
    if (preview) URL.revokeObjectURL(preview);
    if (processedImage) URL.revokeObjectURL(processedImage);

    setFile(f);
    const newPreview = URL.createObjectURL(f);
    setPreview(newPreview);
    setProcessedImage(null); // Reset processed image on new upload
    setState("idle");
  }, [validateFile, preview, processedImage]);

  const handleUpload = async () => {
    if (!file || !preview) return;

    setState("processing");
    try {
      const imageBlob = await fetch(preview).then((res) => res.blob());
      const processedBlob = await removeBackground(imageBlob);
      const newProcessedImage = URL.createObjectURL(processedBlob);
      setProcessedImage(newProcessedImage);
      setState("done");
      toast({
        title: "Background removed!",
        description: "Your image is ready for download.",
      });
    } catch (error) {
      setState("error");
      toast({
        title: "Error",
        description: "Failed to remove background. Please try again.",
        variant: "destructive",
      });
    }
  };

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview);
    if (processedImage) URL.revokeObjectURL(processedImage);
    setFile(null);
    setPreview(null);
    setProcessedImage(null);
    setState("idle");
  };

  const handleDownload = useCallback((format: DownloadFormat) => {
    if (!processedImage || !file) return;

    try {
      const img = new Image();
      img.src = processedImage;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Could not get canvas context");
        // JPEG doesn't support transparency - fill with white first
        if (format === "jpeg") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);

        const mimeType = format === "jpeg" ? "image/jpeg" : `image/${format}`;
        canvas.toBlob((blob) => {
          if (!blob) {
            toast({
              title: "Error",
              description: "Failed to create image blob for download.",
              variant: "destructive",
            });
            return;
          }
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `purecut-ai-${file.name.split(".")[0]}.${format}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          toast({
            title: "Image downloaded!",
            description: `Your processed image has been downloaded as ${format.toUpperCase()}.`,
          });
        }, mimeType);
      };
      img.onerror = () => {
        toast({
          title: "Error",
          description: "Failed to load processed image for download.",
          variant: "destructive",
        });
      };
    } catch {
      toast({
        title: "Error",
        description: "Failed to download image. Please try again.",
        variant: "destructive",
      });
    }
  }, [processedImage, file, toast]);

  const isProcessing = state === "processing";
  const hasUserImage = file !== null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <div className="container mx-auto px-4 max-w-4xl">
        <BeforeAfterSlider
          beforeImageSrc={preview || undefined}
          afterImageSrc={processedImage || preview || undefined}
          defaultBeforeImageSrc={DEMO_BEFORE}
          defaultAfterImageSrc={DEMO_AFTER}
          onReset={hasUserImage ? reset : undefined}
          isLoading={isProcessing}
          onFileChange={handleFileChange}
          showDownloadButton={!!processedImage}
          onDownload={handleDownload}
          fileName={file ? file.name.split(".")[0] : "purecut-ai"}
        />

        {hasUserImage && (
          <div className="flex justify-center gap-4 mt-6 mb-12">
            <Button
              variant="outline"
              size="lg"
              onClick={reset}
              disabled={isProcessing}
            >
              <X className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              variant="cta"
              size="lg"
              onClick={handleUpload}
              disabled={isProcessing || processedImage !== null}
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ImageIcon className="w-4 h-4 mr-2" />
              )}
              Remove Background
            </Button>
          </div>
        )}
      </div>
      <FeaturesGrid />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;