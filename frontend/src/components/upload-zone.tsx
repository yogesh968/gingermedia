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
    <Card className="w-full max-w-2xl mx-auto overflow-hidden glassmorphism border-white/10 shadow-2xl relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />
      <div className="p-6 md:p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground">Upload Vehicle Image</h2>
          <p className="text-muted-foreground mt-2">
            Upload an image for automated quality checks and OCR analysis. (Max 10MB)
          </p>
        </div>

        {!file ? (
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden group",
              isDragActive ? "border-blue-500/50 bg-blue-500/10 shadow-[0_0_30px_rgba(59,130,246,0.15)] scale-[1.02]" : "border-white/10 hover:border-white/20 hover:bg-white/5",
              isDragReject && "border-destructive bg-destructive/10"
            )}
          >
            <input {...getInputProps()} />
            <div className="bg-background/50 p-5 rounded-full mb-6 border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-300">
              <UploadCloud className="w-10 h-10 text-blue-400 group-hover:text-blue-300 transition-colors" />
            </div>
            {isDragActive ? (
              <p className="text-lg font-medium text-foreground">Drop the image here...</p>
            ) : isDragReject ? (
              <p className="text-lg font-medium text-destructive">Unsupported file type</p>
            ) : (
              <>
                <p className="text-lg font-medium text-foreground mb-1">Drag & drop your image here</p>
                <p className="text-sm text-muted-foreground">or click to browse from your computer</p>
              </>
            )}
            <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
              <FileImage className="w-4 h-4" />
              <span>Supports JPEG, PNG, WEBP</span>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative rounded-xl overflow-hidden border border-border bg-secondary aspect-video flex items-center justify-center group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview!}
                alt="Preview"
                className="max-w-full max-h-full object-contain"
              />
              {!uploadMutation.isPending && (
                <button
                  onClick={clearFile}
                  className="absolute top-3 right-3 bg-secondary text-foreground p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-white border border-border"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              
              {uploadMutation.isPending && (
                <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center p-8">
                  <Loader2 className="w-8 h-8 text-muted-foreground animate-spin mb-4" />
                  <p className="text-lg font-medium mb-4">Uploading... {uploadProgress}%</p>
                  <Progress value={uploadProgress} className="w-full max-w-xs h-2" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between bg-secondary p-4 rounded-lg border border-border">
              <div className="flex items-center gap-3 truncate">
                <FileImage className="w-5 h-5 text-muted-foreground shrink-0" />
                <div className="truncate">
                  <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
              <Button
                onClick={handleUpload}
                disabled={uploadMutation.isPending}
                size="lg"
                className="shrink-0"
              >
                {uploadMutation.isPending ? 'Processing...' : 'Analyze Image'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
