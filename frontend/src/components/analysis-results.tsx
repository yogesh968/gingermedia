import { AnalysisResults } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertTriangle, XCircle, Search, Activity, ShieldCheck, Maximize } from 'lucide-react';
import { motion } from 'framer-motion';

export function AnalysisResultsDisplay({ results }: { results: AnalysisResults }) {
  const getQualityColor = (score: number, threshold: number, higherIsBetter = true) => {
    if (higherIsBetter) return score >= threshold ? 'text-green-500' : 'text-amber-500';
    return score <= threshold ? 'text-green-500' : 'text-amber-500';
  };

  const getQualityProgressColor = (score: number, threshold: number, higherIsBetter = true) => {
    if (higherIsBetter) return score >= threshold ? 'bg-green-500' : 'bg-amber-500';
    return score <= threshold ? 'bg-green-500' : 'bg-amber-500';
  };

  const isClear = results.blurScore > 100; // typical threshold
  const isWellLit = results.brightnessScore > 50 && results.brightnessScore < 200;

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card className="p-6 border-white/10 bg-card/50 backdrop-blur-sm shadow-2xl">
        <div className="flex items-center gap-4 mb-6">
          <ShieldCheck className="w-8 h-8 text-primary" />
          <div>
            <h2 className="text-xl font-semibold">Integrity Analysis</h2>
            <p className="text-sm text-muted-foreground">Automated tampering and duplicate detection</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-muted/30 p-4 rounded-xl border border-border flex flex-col items-center justify-center text-center gap-2">
            <span className="text-sm text-muted-foreground">Screenshot</span>
            {results.isScreenshot ? (
              <Badge variant="destructive" className="flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Yes</Badge>
            ) : (
              <Badge variant="default" className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> No</Badge>
            )}
          </div>
          <div className="bg-muted/30 p-4 rounded-xl border border-border flex flex-col items-center justify-center text-center gap-2">
            <span className="text-sm text-muted-foreground">Tampered</span>
            {results.isTampered ? (
              <Badge variant="destructive" className="flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Yes</Badge>
            ) : (
              <Badge variant="default" className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> No</Badge>
            )}
          </div>
          <div className="bg-muted/30 p-4 rounded-xl border border-border flex flex-col items-center justify-center text-center gap-2">
            <span className="text-sm text-muted-foreground">Plate Valid</span>
            {results.isPlateValid ? (
              <Badge variant="default" className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Yes</Badge>
            ) : (
              <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="w-3 h-3"/> No</Badge>
            )}
          </div>
          <div className="bg-muted/30 p-4 rounded-xl border border-border flex flex-col items-center justify-center text-center gap-2">
            <span className="text-sm text-muted-foreground">Dimensions</span>
            <div className="flex items-center gap-1 text-sm font-medium">
              <Maximize className="w-4 h-4 text-muted-foreground"/>
              {results.dimensions.width} x {results.dimensions.height}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* OCR Results */}
        <Card className="p-6 border-white/10 bg-card/50 backdrop-blur-sm shadow-2xl flex flex-col items-center justify-center min-h-[250px] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-[50px] pointer-events-none" />
          <Search className="w-10 h-10 text-primary mb-4 opacity-80" />
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Extracted Number Plate</h3>
          
          {results.plateNumber ? (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-4xl md:text-5xl font-mono font-bold text-foreground border-2 border-primary/30 bg-primary/10 px-8 py-5 rounded-2xl tracking-wider shadow-inner"
            >
              {results.plateNumber}
            </motion.div>
          ) : (
            <div className="flex items-center gap-2 text-destructive bg-destructive/10 px-4 py-2 rounded-lg mt-2">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">No valid plate detected</span>
            </div>
          )}
        </Card>

        {/* Quality Metrics */}
        <Card className="p-6 border-white/10 bg-card/50 backdrop-blur-sm shadow-2xl space-y-6">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-primary" />
            <h3 className="font-semibold text-lg">Image Quality</h3>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm font-medium">Sharpness (Laplacian Blur)</p>
                <p className="text-xs text-muted-foreground mt-1">Higher is sharper</p>
              </div>
              <span className={`text-2xl font-bold ${getQualityColor(results.blurScore, 100)}`}>
                {results.blurScore.toFixed(0)}
              </span>
            </div>
            <Progress 
              value={Math.min(results.blurScore, 1000) / 10} 
              className="h-3" 
              indicatorClassName={getQualityProgressColor(results.blurScore, 100)} 
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm font-medium">Brightness Intensity</p>
                <p className="text-xs text-muted-foreground mt-1">Optimal range: 50 - 200</p>
              </div>
              <span className={`text-2xl font-bold ${isWellLit ? 'text-green-500' : 'text-amber-500'}`}>
                {results.brightnessScore.toFixed(0)}
              </span>
            </div>
            <Progress 
              value={(results.brightnessScore / 255) * 100} 
              className="h-3" 
              indicatorClassName={isWellLit ? 'bg-green-500' : 'bg-amber-500'} 
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
