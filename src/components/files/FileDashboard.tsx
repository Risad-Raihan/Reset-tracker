"use client";

import { useState, useEffect } from "react";
import type { BlobFile } from "@/types/files";
import { FileCard } from "./FileCard";
import { FileUpload } from "./FileUpload";
import { motion } from "framer-motion";

interface FileDashboardProps {
  onOpenFile: (file: BlobFile) => void;
  onDeleteFile: (file: BlobFile) => void;
}

export function FileDashboard({ onOpenFile, onDeleteFile }: FileDashboardProps) {
  const [files, setFiles] = useState<BlobFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  const fetchFiles = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch("/api/files");
      const json = await res.json();
      if (!res.ok) {
        setFetchError(json.error ?? "Failed to load files");
        setFiles([]);
        return;
      }
      setFiles(
        (Array.isArray(json) ? json : []).map(
          (b: { url: string; pathname: string; size: number; uploadedAt: string }) => ({
            url: b.url,
            pathname: b.pathname,
            size: b.size,
            uploadedAt: b.uploadedAt,
          })
        )
      );
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : "Network error");
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleDelete = async (file: BlobFile) => {
    try {
      const res = await fetch(`/api/files/delete?pathname=${encodeURIComponent(file.pathname)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setFiles((prev) => prev.filter((f) => f.url !== file.url));
        onDeleteFile(file);
      }
    } catch {
      // ignore
    }
  };

  if (showUpload) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-white">Upload File</h2>
          <button
            onClick={() => setShowUpload(false)}
            className="rounded-lg px-3 py-1.5 text-sm text-white/60 transition-colors hover:text-white"
          >
            Back
          </button>
        </div>
        <FileUpload
          onUploaded={fetchFiles}
          onClose={() => setShowUpload(false)}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.04 } },
      }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-3xl font-bold text-white">Files</h1>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowUpload(true)}
          className="rounded-lg bg-mint/20 px-4 py-2 font-medium text-mint transition-colors hover:bg-mint/30"
        >
          Upload
        </motion.button>
      </div>

      {loading ? (
        <p className="text-white/60">Loading files…</p>
      ) : fetchError ? (
        <div className="rounded-xl border border-coral/20 bg-coral/5 p-4">
          <p className="text-sm font-medium text-coral">Failed to load files</p>
          <p className="mt-1 font-mono text-xs text-white/50">{fetchError}</p>
        </div>
      ) : files.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-surface/50 py-16"
        >
          <p className="text-lg text-white/60">No files yet</p>
          <p className="mt-2 text-sm text-white/40">
            Upload .md or .txt files to get started
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowUpload(true)}
            className="mt-6 rounded-lg bg-mint/20 px-6 py-2.5 font-medium text-mint transition-colors hover:bg-mint/30"
          >
            Upload File
          </motion.button>
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((file, i) => (
            <FileCard
              key={file.url}
              file={file}
              onOpen={onOpenFile}
              onDelete={handleDelete}
              index={i}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
