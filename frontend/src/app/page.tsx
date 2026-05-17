import { UploadZone } from "@/components/upload-zone";
import { Activity, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background styling elements */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-primary/20 to-transparent pointer-events-none -z-10" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 blur-[100px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-40 -left-40 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      <main className="flex-1 container max-w-6xl mx-auto px-4 py-12 md:py-24 flex flex-col items-center">
        
        {/* Header Section */}
        <div className="text-center mb-16 space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 border border-primary/20">
            <Zap className="w-4 h-4" />
            <span>AI-Powered Pipeline</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight lg:leading-tight text-foreground">
            Intelligent Media <br className="hidden md:block" /> Processing
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Automated quality checks, blur detection, OCR, and tampering analysis for vehicle imagery in milliseconds.
          </p>
        </div>

        {/* Upload Component */}
        <div className="w-full mb-24 z-10">
          <UploadZone />
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 w-full max-w-5xl">
          <div className="p-6 rounded-2xl bg-card border border-border flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-2">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg">Quality Metrics</h3>
            <p className="text-sm text-muted-foreground">Instant Laplacian blur detection and brightness analysis to ensure optimal image clarity.</p>
          </div>
          
          <div className="p-6 rounded-2xl bg-card border border-border flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-2">
              <span className="font-bold font-mono">OCR</span>
            </div>
            <h3 className="font-semibold text-lg">Number Plate Extraction</h3>
            <p className="text-sm text-muted-foreground">Advanced Tesseract-based text recognition tuned specifically for vehicle registration plates.</p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-2">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg">Tamper Detection</h3>
            <p className="text-sm text-muted-foreground">Heuristics to identify screenshots, exact duplicates, and metadata tampering.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
