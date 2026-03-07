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
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/AuthModal"; // Import AuthModal

type ProcessingState = "idle" | "uploading" | "processing" | "done" | "error";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [state, setState] = useState<ProcessingState>("idle");
  const { toast } = useToast();
  const { isLoggedIn, isPaidUser, login } = useAuth(); // Use auth context
  const [credits, setCredits] = useState<number>(3); // Placeholder for credits
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false); // State for auth modal

  // Batch processing states
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [batchPreviews, setBatchPreviews] = useState<string[]>([]);
  const [batchProcessedImages, setBatchProcessedImages] = useState<string[]>([]);
  const [batchProcessingStates, setBatchProcessingStates] = useState<ProcessingState[]>([]);

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
      batchPreviews.forEach(URL.revokeObjectURL);
      batchProcessedImages.forEach(URL.revokeObjectURL);
    };
  }, [preview, processedImage, batchPreviews, batchProcessedImages]);

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

  const handleBatchFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    files.forEach(f => {
      if (validateFile(f)) {
        validFiles.push(f);
        newPreviews.push(URL.createObjectURL(f));
      }
    });

    setBatchFiles(validFiles);
    setBatchPreviews(newPreviews);
    setBatchProcessedImages(Array(validFiles.length).fill(null));
    setBatchProcessingStates(Array(validFiles.length).fill("idle"));
    e.target.value = ""; // Clear input
  }, [validateFile]);

  const handleUpload = async () => {
    if (!file || !preview) return;

    // If not logged in, open auth modal
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }

    // Check credits for free users
    if (isLoggedIn && !isPaidUser && credits <= 0) {
      toast({
        title: "No credits remaining",
        description: "Please upgrade to a paid plan or wait for daily credits to reset.",
        variant: "destructive",
      });
      return;
    }

    setState("processing");
    try {
      const imageBlob = await fetch(preview).then((res) => res.blob());

      const response = await fetch("https://bilal000.app.n8n.cloud/webhook/remove-background", {
        method: "POST",
        body: imageBlob,
        headers: {
          "Content-Type": imageBlob.type,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      if (!responseData.url) {
        throw new Error("Webhook response did not contain a URL.");
      }
      const newProcessedImage = responseData.url;
      setProcessedImage(newProcessedImage);
      setState("done");
      toast({
        title: "Background removed!",
        description: "Your image is ready for download.",
      });

      // Decrement credits for free users
      if (isLoggedIn && !isPaidUser) {
        setCredits((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Background removal failed:", error);
      setState("error");
      toast({
        title: "Error",
        description: "Failed to remove background. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBatchProcess = async () => {
    if (batchFiles.length === 0) {
      toast({ title: "No files to process", description: "Please upload images for batch processing.", variant: "destructive" });
      return;
    }

    // If not logged in, open auth modal
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }

    // Check credits for free users (for batch, assume 1 credit per image)
    if (isLoggedIn && !isPaidUser && credits < batchFiles.length) {
      toast({
        title: "Insufficient credits",
        description: `You need ${batchFiles.length} credits for this batch, but only have ${credits}. Please upgrade or reduce batch size.`,
        variant: "destructive",
      });
      return;
    }

    // Only paid users can do batch processing
    if (!isPaidUser) {
      toast({
        title: "Batch processing is a paid feature",
        description: "Please upgrade to a paid plan for batch image removal.",
        variant: "destructive",
      });
      return;
    }

    const newBatchProcessingStates = [...batchProcessingStates];
    const newBatchProcessedImages = [...batchProcessedImages];
    let remainingCredits = credits;

    for (let i = 0; i < batchFiles.length; i++) {
      newBatchProcessingStates[i] = "processing";
      setBatchProcessingStates([...newBatchProcessingStates]);

      try {
        const imageBlob = await fetch(batchPreviews[i]).then((res) => res.blob());
        const response = await fetch("https://bilal000.app.n8n.cloud/webhook/remove-background", {
          method: "POST",
          body: imageBlob,
          headers: {
            "Content-Type": imageBlob.type,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        if (!responseData.url) {
          throw new Error("Webhook response did not contain a URL.");
        }
        newBatchProcessedImages[i] = responseData.url;
        newBatchProcessingStates[i] = "done";

        if (isLoggedIn && !isPaidUser) {
          remainingCredits--;
          setCredits(remainingCredits);
        }
      } catch (error) {
        console.error(`Batch processing failed for image ${i}:`, error);
        newBatchProcessingStates[i] = "error";
        toast({
          title: `Error processing image ${i + 1}`,
          description: "Failed to remove background. Please try again.",
          variant: "destructive",
        });
      }
      setBatchProcessingStates([...newBatchProcessingStates]);
      setBatchProcessedImages([...newBatchProcessedImages]);
    }
    toast({ title: "Batch processing complete!", description: "All images have been processed." });
  };

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview);
    if (processedImage) URL.revokeObjectURL(processedImage);
    batchPreviews.forEach(URL.revokeObjectURL);
    batchProcessedImages.forEach(URL.revokeObjectURL);

    setFile(null);
    setPreview(null);
    setProcessedImage(null);
    setState("idle");

    setBatchFiles([]);
    setBatchPreviews([]);
    setBatchProcessedImages([]);
    setBatchProcessingStates([]);
  };

  const handleDownload = useCallback((format: DownloadFormat, imageUrl: string, fileName: string) => {
    if (!imageUrl) return;

    try {
      const img = new Image();
      img.crossOrigin = "anonymous"; // Add this line for CORS
      img.src = imageUrl;
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
          link.download = `${fileName}.${format}`;
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
  }, [toast]);

  const isProcessing = state === "processing" || batchProcessingStates.some(s => s === "processing");
  const hasUserImage = file !== null;
  const hasBatchImages = batchFiles.length > 0;

  const handleLoginClick = () => {
    setIsAuthModalOpen(true);
  };

  const handleRegisterClick = () => {
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onLoginClick={handleLoginClick} onRegisterClick={handleRegisterClick} />
      <HeroSection />
      <div className="container mx-auto px-4 max-w-4xl">
        <BeforeAfterSlider
          beforeImageSrc={preview || undefined}
          afterImageSrc={processedImage || preview || undefined}
          defaultBeforeImageSrc={DEMO_BEFORE}
          defaultAfterImageSrc={DEMO_AFTER}
          onReset={hasUserImage ? reset : undefined}
          isLoading={state === "processing"}
          onFileChange={handleFileChange}
          showDownloadButton={!!processedImage}
          onDownload={(format) => handleDownload(format, processedImage!, file!.name.split(".")[0])}
          fileName={file ? file.name.split(".")[0] : "purecut-ai"}
        />

        {hasUserImage && (
          <div className="flex flex-col items-center gap-4 mt-6 mb-12">
            {isLoggedIn && !isPaidUser && (
              <p className="text-sm text-muted-foreground">
                {credits} credits remaining
              </p>
            )}
            {isLoggedIn && isPaidUser && (
              <p className="text-sm text-primary font-semibold">
                Unlimited usage
              </p>
            )}
            <div className="flex justify-center gap-4">
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
                disabled={isProcessing || processedImage !== null || (isLoggedIn && !isPaidUser && credits <= 0)}
              >
                {state === "processing" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ImageIcon className="w-4 h-4 mr-2" />
                )}
                Remove Background
              </Button>
            </div>
          </div>
        )}

        {/* Batch Processing Section */}
        <div className="mt-12 pt-12 border-t border-border/50">
          <h2 className="text-3xl font-bold font-display text-center mb-8">Batch Processing (Paid Feature)</h2>
          <div className="flex flex-col items-center gap-4">
            <input
              type="file"
              multiple
              accept="image/jpeg, image/png, image/webp"
              onChange={handleBatchFileChange}
              className="hidden"
              id="batch-upload-input"
            />
            <label htmlFor="batch-upload-input" className="cursor-pointer">
              <Button variant="outline" size="lg" disabled={isProcessing}>
                <ImageIcon className="w-4 h-4 mr-2" />
                Upload Multiple Images
              </Button>
            </label>

            {hasBatchImages && (
              <div className="w-full">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
                  {batchPreviews.map((previewUrl, index) => (
                    <div key={index} className="relative group rounded-lg overflow-hidden border border-border/50">
                      <img src={previewUrl} alt={`Batch ${index}`} className="w-full h-32 object-contain bg-background" />
                      {batchProcessingStates[index] === "processing" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                          <Loader2 className="w-6 h-6 text-primary animate-spin" />
                        </div>
                      )}
                      {batchProcessedImages[index] && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="cta"
                            size="sm"
                            onClick={() => handleDownload("png", batchProcessedImages[index], `purecut-ai-batch-${index}`)}
                          >
                            Download
                          </Button>
                        </div>
                      )}
                      {batchProcessingStates[index] === "error" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-destructive/80 text-destructive-foreground">
                          Error
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-center mt-8">
                  <Button
                    variant="cta"
                    size="lg"
                    onClick={handleBatchProcess}
                    disabled={isProcessing || !isPaidUser}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <ImageIcon className="w-4 h-4 mr-2" />
                    )}
                    Process Batch
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <FeaturesGrid />
      <PricingSection />
      <CTASection />
      <Footer />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

export default Index;