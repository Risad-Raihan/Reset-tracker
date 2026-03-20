"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ACCEPTED_TYPES = [".md", ".txt"];
const ACCEPTED_MIME = ["text/markdown", "text/plain"];

interface FileUploadProps {
  onUploaded: () => void;
  onClose?: () => void;
}

export function FileUpload({ onUploaded, onClose }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isValidFile = (file: File) => {
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    return ACCEPTED_TYPES.includes(ext) || ACCEPTED_MIME.includes(file.type);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && isValidFile(file)) {
      setSelectedFile(file);
      setError(null);
    } else {
      setError("Only .md and .txt files are allowed");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isValidFile(file)) {
      setSelectedFile(file);
      setError(null);
    } else if (file) {
      setError("Only .md and .txt files are allowed");
    }
    e.target.value = "";
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      // Simulate progress for UX
      const progressInterval = setInterval(() => {
        setProgress((p) => Math.min(p + 15, 90));
      }, 100);

      const res = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Upload failed");
      }

      onUploaded();
      setSelectedFile(null);
      setProgress(0);
      onClose?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setError(null);
    setProgress(0);
    inputRef.current?.value && (inputRef.current.value = "");
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          isDragging
            ? "border-mint/50 bg-mint/5"
            : "border-white/20 bg-surface/50 hover:border-white/30 hover:bg-surface/70"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".md,.txt,text/markdown,text/plain"
          onChange={handleFileSelect}
          className="hidden"
        />
        {selectedFile ? (
          <p className="font-mono text-sm text-white">
            {selectedFile.name}
          </p>
        ) : (
          <>
            <p className="text-white/80">Drop .md or .txt files here</p>
            <p className="mt-1 text-sm text-white/50">or click to browse</p>
          </>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm text-coral"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {selectedFile && (
        <div className="space-y-2">
          {isUploading && (
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-elevated">
              <motion.div
                className="h-full bg-mint"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
          )}
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUpload}
              disabled={isUploading}
              className="rounded-lg bg-mint/20 px-4 py-2 text-sm font-medium text-mint transition-colors hover:bg-mint/30 disabled:opacity-50"
            >
              {isUploading ? "Uploading…" : "Upload"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleClear}
              disabled={isUploading}
              className="rounded-lg border border-white/10 bg-surface-elevated px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 disabled:opacity-50"
            >
              Clear
            </motion.button>
            {onClose && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                disabled={isUploading}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white/60 transition-colors hover:text-white disabled:opacity-50"
              >
                Cancel
              </motion.button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
