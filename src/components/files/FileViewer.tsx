"use client";

import { format } from "date-fns";
import type { BlobFile } from "@/types/files";
import { MarkdownViewer } from "./MarkdownViewer";
import { motion } from "framer-motion";

interface FileViewerProps {
  file: BlobFile;
  content: string;
  onEdit: () => void;
  onBack: () => void;
}

function getFileType(pathname: string): "md" | "txt" {
  const ext = pathname.toLowerCase().slice(pathname.lastIndexOf("."));
  return ext === ".md" ? "md" : "txt";
}

function getFilename(pathname: string): string {
  const parts = pathname.split("/");
  return parts[parts.length - 1] || pathname;
}

export function FileViewer({ file, content, onEdit, onBack }: FileViewerProps) {
  const type = getFileType(file.pathname);
  const filename = getFilename(file.pathname);
  const isMd = type === "md";
  const badgeBg = isMd ? "bg-mint/20 text-mint" : "bg-blue/20 text-blue";

  return (
    <motion.div
      initial={{ x: 24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -24, opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="flex h-full flex-col"
    >
      <div className="flex flex-col gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={onBack}
              className="shrink-0 rounded-lg p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Back"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <div className="min-w-0">
              <h1 className="truncate font-display text-xl font-bold text-white">
                {filename}
              </h1>
              <div className="mt-1 flex items-center gap-2">
                <span className={`rounded px-2 py-0.5 text-xs font-medium ${badgeBg}`}>
                  {type.toUpperCase()}
                </span>
                <span className="text-xs text-white/50">
                  {(file.size / 1024).toFixed(1)} KB · {format(new Date(file.uploadedAt), "MMM d, yyyy")}
                </span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <motion.a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-lg border border-white/10 bg-surface-elevated px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              Download
            </motion.a>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onEdit}
              className="rounded-lg bg-mint/20 px-3 py-2 text-sm font-medium text-mint transition-colors hover:bg-mint/30"
            >
              Edit
            </motion.button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex-1 overflow-y-auto">
        <MarkdownViewer content={content} isPlainText={!isMd} />
      </div>
    </motion.div>
  );
}
