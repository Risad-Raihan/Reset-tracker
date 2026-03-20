"use client";

import { format } from "date-fns";
import type { BlobFile } from "@/types/files";
import { motion } from "framer-motion";

interface FileCardProps {
  file: BlobFile;
  onOpen: (file: BlobFile) => void;
  onDelete: (file: BlobFile) => void;
  index?: number;
}

function getFileType(pathname: string): "md" | "txt" {
  const ext = pathname.toLowerCase().slice(pathname.lastIndexOf("."));
  return ext === ".md" ? "md" : "txt";
}

function getFilename(pathname: string): string {
  const parts = pathname.split("/");
  return parts[parts.length - 1] || pathname;
}

export function FileCard({ file, onOpen, onDelete, index = 0 }: FileCardProps) {
  const type = getFileType(file.pathname);
  const filename = getFilename(file.pathname);
  const isMd = type === "md";

  const accentColor = isMd ? "#3dffa0" : "#5b9dff";
  const badgeBg = isMd ? "bg-mint/20 text-mint" : "bg-blue/20 text-blue";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ scale: 1.02 }}
      className="group relative cursor-pointer rounded-xl border border-white/10 bg-surface p-4 transition-shadow hover:shadow-lg"
      style={{
        boxShadow: "0 0 0 0 transparent",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 4px 24px ${accentColor}20`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 0 0 0 transparent";
      }}
      onClick={() => onOpen(file)}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(file);
        }}
        className="absolute right-2 top-2 rounded p-1.5 text-white/40 opacity-0 transition-opacity hover:bg-coral/20 hover:text-coral group-hover:opacity-100"
        aria-label="Delete file"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
      </button>

      <h3 className="pr-8 font-display text-lg font-bold text-white line-clamp-2">
        {filename}
      </h3>
      <div className="mt-2 flex items-center gap-2">
        <span
          className={`rounded px-2 py-0.5 text-xs font-medium ${badgeBg}`}
        >
          {type.toUpperCase()}
        </span>
        <span className="text-xs text-white/50">
          {(file.size / 1024).toFixed(1)} KB
        </span>
      </div>
      <p className="mt-2 text-xs text-white/50">
        {format(new Date(file.uploadedAt), "MMM d, yyyy")}
      </p>
    </motion.div>
  );
}
