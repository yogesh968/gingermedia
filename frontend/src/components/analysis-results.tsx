import { AnalysisResults, ProcessingResponse } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertTriangle, XCircle, Search, Activity, ShieldCheck, Maximize, Fingerprint, FileText, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export function AnalysisResultsDisplay({ results, response }: { results: AnalysisResults, response?: ProcessingResponse }) {
  const getQualityColor = (score: number, threshold: number, higherIsBetter = true) => {
    if (higherIsBetter) return score >= threshold ? 'text-green-400' : 'text-amber-400';
    return score <= threshold ? 'text-green-400' : 'text-amber-400';
  };

  const getQualityProgressColor = (score: number, threshold: number, higherIsBetter = true) => {
    if (higherIsBetter) return score >= threshold ? 'bg-green-400' : 'bg-amber-400';
    return score <= threshold ? 'bg-green-400' : 'bg-amber-400';
  };

  const isClear = results.blurScore > 100;
  const isWellLit = results.brightnessScore > 50 && results.brightnessScore < 200;

  return (
    <div className="space-y-6">
      {/* Overview Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left Column: Image Preview */}
        <Card className="lg:col-span-1 p-4 border-border bg-card flex flex-col relative overflow-hidden min-h-[300px]">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Analyzed Media</h3>
          </div>
          
          <div className="relative flex-1 rounded-lg overflow-hidden bg-secondary border border-border flex items-center justify-center">
            {response?.imageUrl ? (
              <img 
                src={response.imageUrl} 
                alt="Analyzed vehicle" 
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-muted-foreground flex flex-col items-center gap-2 py-12">
                <ImageIcon className="w-8 h-8 opacity-40" />
                <span className="text-sm">Image preview unavailable</span>
              </div>
            )}
          </div>
        </Card>

        {/* Right Column: OCR & Metrics */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          
          {/* Main OCR Result */}
          <Card className="p-8 border-border bg-card flex-1 flex flex-col items-center justify-center">
            <Search className="w-6 h-6 text-muted-foreground mb-3" />
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-6">Extracted Number Plate</h3>
            
            {results.plateNumber ? (
              <motion.div 
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-mono font-bold text-foreground border border-border bg-secondary px-8 py-5 rounded-xl tracking-widest"
              >
                {results.plateNumber}
              </motion.div>
            ) : (
              <div className="flex items-center gap-3 text-destructive bg-destructive/10 px-5 py-3 rounded-lg border border-destructive/20">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">No valid plate detected</span>
              </div>
            )}
          </Card>

          {/* Deep Data */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-5 border-border bg-card space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <FileText className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Raw OCR Output</span>
              </div>
              <div className="bg-secondary rounded-lg p-3 font-mono text-xs text-muted-foreground overflow-hidden whitespace-pre-wrap h-24 overflow-y-auto border border-border">
                {results.ocrResult || "No text detected by engine."}
              </div>
            </Card>
            
            <Card className="p-5 border-border bg-card space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Fingerprint className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Perceptual Hash</span>
              </div>
              <div className="bg-secondary rounded-lg p-3 font-mono text-xs text-muted-foreground break-all flex items-center justify-center h-24 border border-border">
                {results.perceptualHash || "Hash unavailable"}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Integrity & Quality Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Integrity Analysis */}
        <Card className="p-6 border-border bg-card">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="w-5 h-5 text-muted-foreground" />
            <div>
              <h2 className="text-sm font-semibold">Integrity Analysis</h2>
              <p className="text-xs text-muted-foreground">Automated fraud detection</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary p-4 rounded-lg border border-border flex flex-col items-center justify-center text-center gap-3">
              <span className="text-xs text-muted-foreground uppercase font-medium">Screenshot</span>
              {results.isScreenshot ? (
                <Badge variant="destructive" className="flex items-center gap-1.5 px-3 py-1"><AlertTriangle className="w-3 h-3"/> Detected</Badge>
              ) : (
                <Badge variant="default" className="bg-green-500/10 text-green-400 hover:bg-green-500/15 border border-green-500/20 flex items-center gap-1.5 px-3 py-1"><CheckCircle2 className="w-3 h-3"/> Passed</Badge>
              )}
            </div>
            <div className="bg-secondary p-4 rounded-lg border border-border flex flex-col items-center justify-center text-center gap-3">
              <span className="text-xs text-muted-foreground uppercase font-medium">Tampering</span>
              {results.isTampered ? (
                <Badge variant="destructive" className="flex items-center gap-1.5 px-3 py-1"><AlertTriangle className="w-3 h-3"/> Detected</Badge>
              ) : (
                <Badge variant="default" className="bg-green-500/10 text-green-400 hover:bg-green-500/15 border border-green-500/20 flex items-center gap-1.5 px-3 py-1"><CheckCircle2 className="w-3 h-3"/> Passed</Badge>
              )}
            </div>
            <div className="bg-secondary p-4 rounded-lg border border-border flex flex-col items-center justify-center text-center gap-3">
              <span className="text-xs text-muted-foreground uppercase font-medium">Format Valid</span>
              {results.isPlateValid ? (
                <Badge variant="default" className="bg-green-500/10 text-green-400 hover:bg-green-500/15 border border-green-500/20 flex items-center gap-1.5 px-3 py-1"><CheckCircle2 className="w-3 h-3"/> Valid</Badge>
              ) : (
                <Badge variant="destructive" className="flex items-center gap-1.5 px-3 py-1"><XCircle className="w-3 h-3"/> Invalid</Badge>
              )}
            </div>
            <div className="bg-secondary p-4 rounded-lg border border-border flex flex-col items-center justify-center text-center gap-2">
              <span className="text-xs text-muted-foreground uppercase font-medium">Dimensions</span>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Maximize className="w-3.5 h-3.5 text-muted-foreground"/>
                {results.dimensions.width} x {results.dimensions.height}
              </div>
            </div>
          </div>
        </Card>

        {/* Quality Metrics */}
        <Card className="p-6 border-border bg-card space-y-8">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Quality Metrics</h3>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm font-medium">Sharpness (Laplacian)</p>
                <p className="text-xs text-muted-foreground mt-0.5">Threshold: 100+</p>
              </div>
              <span className={`text-2xl font-bold tracking-tight ${getQualityColor(results.blurScore, 100)}`}>
                {results.blurScore.toFixed(0)}
              </span>
            </div>
            <Progress 
              value={Math.min(results.blurScore, 1000) / 10} 
              className="h-2 bg-secondary" 
              indicatorClassName={getQualityProgressColor(results.blurScore, 100)} 
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm font-medium">Brightness Intensity</p>
                <p className="text-xs text-muted-foreground mt-0.5">Optimal: 50 – 200</p>
              </div>
              <span className={`text-2xl font-bold tracking-tight ${isWellLit ? 'text-green-400' : 'text-amber-400'}`}>
                {results.brightnessScore.toFixed(0)}
              </span>
            </div>
            <Progress 
              value={(results.brightnessScore / 255) * 100} 
              className="h-2 bg-secondary" 
              indicatorClassName={isWellLit ? 'bg-green-400' : 'bg-amber-400'} 
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
