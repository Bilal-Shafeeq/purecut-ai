import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { getAndClearPendingUploadFile } from "@/lib/pending-upload";
import { X, Image as ImageIcon, Loader2, User as UserIcon, Zap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import BeforeAfterSlider, { DEMO_BEFORE, DEMO_AFTER, DownloadFormat } from "@/components/landing/BeforeAfterSlider";
import { removeBackground } from "@imgly/background-removal";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";

type ProcessingState = "idle" | "uploading" | "processing" | "done" | "error";

const Tool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [state, setState] = useState<ProcessingState>("idle");
  const { toast } = useToast();
  const { user, useCredit, isLoggedIn } = useAuth();

  const MAX_SIZE = 10 * 1024 * 1024;
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

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
    if (preview) URL.revokeObjectURL(preview);
    if (processedImage) URL.revokeObjectURL(processedImage);

    setFile(f);
    const newPreview = URL.createObjectURL(f);
    setPreview(newPreview);
    setProcessedImage(null);
    setState("idle");
  }, [validateFile, preview, processedImage]);

  const handleUpload = async () => {
    if (!file || !preview) return;

    // Credit check
    if (!useCredit()) {
      toast({
        title: "Credits Exhausted",
        description: "Free credits finished. Please upgrade your plan.",
        variant: "destructive",
      });
      return;
    }

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

  const handleDownload = useCallback((format: DownloadFormat, imageUrl: string, fileName: string) => {
    if (!imageUrl) return;

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Could not get canvas context");
        
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar onLoginClick={() => {}} onRegisterClick={() => {}} />
      
      <div className="flex-grow container mx-auto px-4 max-w-6xl py-24 flex flex-col md:flex-row gap-8">
        
        {/* Account Info Panel */}
        <div className="w-full md:w-64 space-y-4 shrink-0">
          <Card className="glass-card border-border/50">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <UserIcon className="w-4 h-4" />
                  <span>User</span>
                </div>
                <p className="font-semibold">{user?.name || "Guest"}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="w-4 h-4" />
                  <span>Plan</span>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold capitalize">{user?.plan || "Free"}</p>
                  {user?.plan === 'paid' && <ShieldCheck className="w-4 h-4 text-primary" />}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="w-4 h-4" />
                  <span>Credits Remaining</span>
                </div>
                <p className="font-bold text-2xl text-primary">
                  {user?.plan === 'paid' ? "Unlimited" : (user?.credits ?? 0)}
                </p>
              </div>

              {user?.plan !== 'paid' && (
                <Button variant="cta" size="sm" className="w-full" asChild>
                  <a href="/pricing">Upgrade Plan</a>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tool Content */}
        <div className="flex-grow space-y-8">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold font-display mb-2">Background Remover</h1>
            <p className="text-muted-foreground">Upload an image to remove its background instantly.</p>
          </div>

          <BeforeAfterSlider
            beforeImageSrc={preview || undefined}
            afterImageSrc={processedImage || preview || undefined}
            defaultBeforeImageSrc={DEMO_BEFORE}
            defaultAfterImageSrc={DEMO_AFTER}
            onReset={file ? reset : undefined}
            isLoading={state === "processing"}
          />

          <div className="flex flex-col items-center justify-center gap-4">
            {!file ? (
              <div className="w-full max-w-xl">
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border/50 rounded-2xl cursor-pointer hover:bg-muted/50 transition-all group glass-card">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <ImageIcon className="w-6 h-6 text-primary" />
                    </div>
                    <p className="mb-2 text-sm font-semibold">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG or WEBP (MAX. 10MB)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileChange(f);
                    }}
                  />
                </label>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6 w-full">
                {state !== "done" ? (
                  <Button
                    size="lg"
                    className="w-full max-w-md h-14 text-lg font-semibold gradient-cta shadow-lg shadow-primary/20"
                    onClick={handleUpload}
                    disabled={state === "processing"}
                  >
                    {state === "processing" ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Remove Background"
                    )}
                  </Button>
                ) : (
                  <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-12"
                      onClick={() => handleDownload("png", processedImage!, file.name.split(".")[0])}
                    >
                      Download PNG
                    </Button>
                    <Button
                      variant="hero"
                      size="lg"
                      className="h-12"
                      onClick={() => handleDownload("jpeg", processedImage!, file.name.split(".")[0])}
                    >
                      Download JPG
                    </Button>
                  </div>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={reset}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel and start over
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tool;
