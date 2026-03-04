import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, X, Download, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";

type ProcessingState = "idle" | "uploading" | "processing" | "done" | "error";

const Workspace = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [state, setState] = useState<ProcessingState>("idle");
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const MAX_SIZE = 10 * 1024 * 1024;
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

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

  const handleFile = useCallback((f: File) => {
    if (!validateFile(f)) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setState("idle");
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleProcess = () => {
    setState("uploading");
    // Simulate processing for now
    setTimeout(() => setState("processing"), 1000);
    setTimeout(() => setState("done"), 3000);
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setState("idle");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 container mx-auto px-4">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold font-display mb-2">
            Remove Background
          </h1>
          <p className="text-muted-foreground">Upload an image to get started</p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {!preview ? (
            <motion.div
              className={`glass-card rounded-2xl border-2 border-dashed transition-all duration-300 ${
                dragActive ? "border-primary glow-primary" : "border-border/50 hover:border-primary/30"
              }`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
            >
              <label className="flex flex-col items-center justify-center py-24 cursor-pointer">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <Upload className="w-10 h-10 text-primary" />
                </div>
                <p className="text-lg font-semibold font-display mb-2">
                  Drop your image here
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  or click to browse • JPG, PNG, WEBP • Max 10 MB
                </p>
                <Button variant="cta" size="lg">
                  <ImageIcon className="w-4 h-4" />
                  Choose Image
                </Button>
                <input
                  type="file"
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              </label>
            </motion.div>
          ) : (
            <motion.div
              className="glass-card rounded-2xl p-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <ImageIcon className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium truncate max-w-[200px]">{file?.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {file && (file.size / 1024 / 1024).toFixed(1)} MB
                  </span>
                </div>
                <Button variant="ghost" size="icon" onClick={reset}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="relative rounded-xl overflow-hidden bg-muted/30 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0.5">
                  <div className="relative">
                    <div className="absolute top-3 left-3 glass-card rounded-full px-3 py-1 text-xs font-medium z-10">
                      Original
                    </div>
                    <img src={preview} alt="Original" className="w-full aspect-square object-contain" />
                  </div>
                  <div className="relative">
                    <div className="absolute top-3 left-3 glass-card rounded-full px-3 py-1 text-xs font-medium z-10">
                      Result
                    </div>
                    <div
                      className="w-full aspect-square flex items-center justify-center"
                      style={{
                        backgroundImage: state === "done"
                          ? "none"
                          : `linear-gradient(45deg, hsl(217 20% 12%) 25%, transparent 25%), linear-gradient(-45deg, hsl(217 20% 12%) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, hsl(217 20% 12%) 75%), linear-gradient(-45deg, transparent 75%, hsl(217 20% 12%) 75%)`,
                        backgroundSize: "20px 20px",
                        backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                        backgroundColor: "hsl(217 33% 8%)",
                      }}
                    >
                      {state === "idle" && (
                        <p className="text-sm text-muted-foreground">Click process to start</p>
                      )}
                      {(state === "uploading" || state === "processing") && (
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="w-8 h-8 text-primary animate-spin" />
                          <p className="text-sm text-muted-foreground">
                            {state === "uploading" ? "Uploading..." : "Removing background..."}
                          </p>
                        </div>
                      )}
                      {state === "done" && (
                        <img src={preview} alt="Result" className="w-full h-full object-contain" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                {state === "idle" && (
                  <Button variant="hero" size="lg" onClick={handleProcess}>
                    Remove Background
                  </Button>
                )}
                {state === "done" && (
                  <>
                    <Button variant="hero" size="lg">
                      <Download className="w-4 h-4" />
                      Download HD
                    </Button>
                    <Button variant="neon" size="lg" onClick={reset}>
                      Upload Another
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Workspace;
