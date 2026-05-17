import { UploadZone } from "@/components/upload-zone";
import { Activity, ShieldCheck, Zap, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-background">
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-16 md:py-32 flex flex-col items-center">
        
        {/* Header Section */}
        <div className="text-center mb-16 space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary/50 text-foreground text-xs font-semibold mb-2 border border-border">
            <Zap className="w-3.5 h-3.5" />
            <span>Enterprise Media Processing</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter lg:leading-[1.1] text-foreground">
            Intelligent Media <br className="hidden md:block" /> Pipeline
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
            Automated quality checks, blur detection, AI-powered OCR, and advanced tampering heuristics in milliseconds.
          </p>
        </div>

        {/* Upload Component */}
        <div className="w-full mb-24 z-10">
          <UploadZone />
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 w-full max-w-5xl">
          {[
            {
              icon: <Activity className="w-5 h-5" />,
              title: "Quality Metrics",
              desc: "Instant Laplacian blur detection and brightness analysis to ensure optimal image clarity."
            },
            {
              icon: <Zap className="w-5 h-5" />,
              title: "Plate Extraction",
              desc: "Advanced Tesseract-based text recognition tuned for Indian vehicle registration plates."
            },
            {
              icon: <ShieldCheck className="w-5 h-5" />,
              title: "Tamper Detection",
              desc: "Heuristics to identify screenshots, exact duplicates, and metadata tampering."
            }
          ].map((feature, i) => (
            <div key={i} className="group p-6 rounded-xl bg-card border border-border flex flex-col space-y-3 hover:border-foreground/30 transition-colors">
              <div className="w-10 h-10 bg-secondary text-foreground rounded-lg flex items-center justify-center mb-2 border border-border">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-lg tracking-tight text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              <div className="pt-2 flex items-center text-xs font-semibold text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                Learn more <ArrowRight className="w-3 h-3 ml-1" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
