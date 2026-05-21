'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileImage, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import api from '@/lib/api';
import { UploadResponse } from '@/types';

export function UploadZone() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadMutation = useMutation({
    mutationFn: async (uploadFile: File) => {
      const formData = new FormData();
      formData.append('image', uploadFile);

      const response = await api.post<UploadResponse>('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        },
      });

      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Upload complete!', { description: 'Redirecting to analysis status...' });
      // Redirect to status page
      router.push(`/status/${data.processingId}`);
    },
    onError: (error: any) => {
      setUploadProgress(0);
      toast.error('Upload failed', {
        description: error.response?.data?.error || error.message || 'Something went wrong',
      });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleUpload = () => {
    if (!file) return;
    uploadMutation.mutate(file);
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setPreview(null);
    setUploadProgress(0);
  };

  return (
    <div className="w-full max-w-2xl mx-auto relative group/card">
      {/* Premium animated glow behind the card */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl blur-xl opacity-20 group-hover/card:opacity-40 transition duration-1000 group-hover/card:duration-200"></div>
      
      <Card className="overflow-hidden glassmorphism border-white/10 shadow-2xl relative rounded-2xl bg-black/40 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 pointer-events-none" />
        
        <div className="p-6 md:p-10 relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 tracking-tight">
              Vehicle Intelligence
            </h2>
            <p className="text-muted-foreground/80 mt-3 text-sm font-medium tracking-wide">
              AI-POWERED ANALYSIS &bull; OCR EXTRACITON &bull; QUALITY CHECKS
            </p>
          </div>

          {!file ? (
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-500 flex flex-col items-center justify-center min-h-[320px] relative overflow-hidden group",
                isDragActive 
                  ? "border-blue-500 bg-blue-500/10 shadow-[0_0_40px_rgba(59,130,246,0.2)] scale-[1.02]" 
                  : "border-white/10 hover:border-white/30 hover:bg-white/5",
                isDragReject && "border-destructive bg-destructive/10"
              )}
            >
              <input {...getInputProps()} />
              
              {/* Background accent for drag area */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none" />
              
              <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-5 rounded-full mb-6 border border-white/10 shadow-inner group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all duration-500 relative">
                <div className="absolute inset-0 rounded-full bg-blue-400/20 animate-ping opacity-20" />
                <UploadCloud className="w-12 h-12 text-blue-400 group-hover:text-blue-300 transition-colors drop-shadow-md" />
              </div>
              
              {isDragActive ? (
                <p className="text-xl font-semibold text-white drop-shadow-md">Drop image to begin...</p>
              ) : isDragReject ? (
                <p className="text-xl font-semibold text-destructive drop-shadow-md">Unsupported format</p>
              ) : (
                <>
                  <p className="text-xl font-semibold text-white/90 mb-2 drop-shadow-md tracking-tight">Drag & drop your vehicle image</p>
                  <p className="text-sm text-muted-foreground font-medium">or click to browse from device</p>
                </>
              )}
              
              <div className="mt-8 flex items-center gap-3 text-xs font-medium text-muted-foreground/60 bg-black/40 px-4 py-2 rounded-full border border-white/5">
                <FileImage className="w-4 h-4" />
                <span>JPEG, PNG, WEBP &bull; Max 10MB</span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/60 shadow-inner aspect-video flex items-center justify-center group">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview!}
                  alt="Preview"
                  className={cn(
                    "max-w-full max-h-full object-contain relative z-10 transition-all duration-700",
                    uploadMutation.isPending && "scale-105 blur-[2px] opacity-50"
                  )}
                />
                
                {!uploadMutation.isPending && (
                  <button
                    onClick={clearFile}
                    className="absolute top-4 right-4 z-20 bg-black/50 backdrop-blur-md text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive hover:scale-110 border border-white/10 shadow-xl"
                    title="Remove image"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
                
                {uploadMutation.isPending && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 gap-6 backdrop-blur-sm bg-black/40">
                    <div className="relative">
                      <div className="absolute inset-0 border-t-2 border-blue-500 rounded-full animate-spin" />
                      <Loader2 className="w-14 h-14 text-blue-400 animate-spin opacity-20" />
                    </div>
                    
                    {uploadProgress < 100 ? (
                      <div className="w-full max-w-xs space-y-3 text-center">
                        <div className="flex justify-between text-sm font-medium">
                          <span className="text-white/80">Uploading securely...</span>
                          <span className="text-blue-400">{uploadProgress}%</span>
                        </div>
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out" 
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-3">
                        <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                          AI Analysis in Progress
                        </p>
                        <p className="text-sm text-white/60 font-medium">
                          Detecting blur, evaluating tampering & extracting OCR...
                        </p>
                        <div className="flex justify-center gap-2 mt-4">
                          {[0,1,2].map(i => (
                            <div key={i} className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce shadow-[0_0_10px_rgba(59,130,246,0.6)]" style={{ animationDelay: `${i * 0.15}s` }} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-md shadow-lg transition-all hover:bg-white/10">
                <div className="flex items-center gap-4 truncate">
                  <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400 shrink-0">
                    <FileImage className="w-6 h-6" />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-semibold text-white truncate drop-shadow-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <Button
                  onClick={handleUpload}
                  disabled={uploadMutation.isPending}
                  size="lg"
                  className={cn(
                    "shrink-0 relative overflow-hidden group/btn font-semibold tracking-wide shadow-lg",
                    uploadMutation.isPending ? "bg-white/10 text-white/50" : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0"
                  )}
                >
                  {/* Button hover effect overlay */}
                  {!uploadMutation.isPending && (
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    {uploadMutation.isPending ? 'Processing...' : 'Start AI Analysis'}
                  </span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
