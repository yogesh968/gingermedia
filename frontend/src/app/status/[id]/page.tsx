'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ProcessingResponse } from '@/types';
import { Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnalysisResultsDisplay } from '@/components/analysis-results';
import { motion } from 'framer-motion';

export default function StatusPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['status', id],
    queryFn: async () => {
      const res = await api.get<ProcessingResponse>(`/status/${id}`);
      return res.data;
    },
    // Poll every 2 seconds if still pending or processing
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return (status === 'PENDING' || status === 'PROCESSING') ? 2000 : false;
    },
  });

  const isPending = isLoading || data?.status === 'PENDING' || data?.status === 'PROCESSING';

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/')}
          className="flex items-center gap-2 hover:bg-primary/10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Upload
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analysis Report</h1>
            <p className="text-muted-foreground mt-1 text-sm font-mono opacity-60">ID: {id}</p>
          </div>
          
          {!isPending && data?.status === 'COMPLETED' && (
            <div className="bg-green-500/10 text-green-500 border border-green-500/20 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg shadow-green-500/10">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              Processing Complete
            </div>
          )}
        </div>

        {isError && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive p-6 rounded-2xl flex flex-col items-center justify-center min-h-[300px]">
            <AlertCircle className="w-12 h-12 mb-4" />
            <h2 className="text-xl font-bold">Failed to load status</h2>
            <p className="text-sm mt-2 opacity-80">{(error as any)?.response?.data?.error || error.message}</p>
            <Button onClick={() => router.push('/')} className="mt-6" variant="outline">Try Again</Button>
          </div>
        )}

        {isPending && !isError && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center min-h-[400px] border border-white/10 bg-card/30 backdrop-blur-sm rounded-3xl shadow-2xl"
          >
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-primary/20 blur-[50px] rounded-full" />
              <Loader2 className="w-16 h-16 text-primary animate-spin relative z-10" />
            </div>
            <h2 className="text-2xl font-semibold">Analyzing Image</h2>
            <p className="text-muted-foreground mt-2 max-w-sm text-center">
              Our AI pipeline is currently running quality checks and extracting data. This usually takes a few seconds...
            </p>
          </motion.div>
        )}

        {data?.status === 'FAILED' && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive p-6 rounded-2xl flex flex-col items-center justify-center min-h-[300px] shadow-2xl">
            <AlertCircle className="w-12 h-12 mb-4" />
            <h2 className="text-xl font-bold">Analysis Failed</h2>
            <p className="text-sm mt-2 opacity-80">{data.error || 'The image could not be processed.'}</p>
            <Button onClick={() => router.push('/')} className="mt-6">Upload Different Image</Button>
          </div>
        )}

        {data?.status === 'COMPLETED' && data.analysis && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <AnalysisResultsDisplay results={data.analysis} />
          </motion.div>
        )}
      </div>
    </div>
  );
}
