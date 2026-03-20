"use client";

import { useState, useEffect, useCallback } from "react";
import type { BlobFile } from "@/types/files";
import { MarkdownViewer } from "./MarkdownViewer";
import { motion } from "framer-motion";

interface FileEditorProps {
  file: BlobFile;
  content: string;
  onSave: (newBlob: BlobFile, savedContent: string) => void;
  onDiscard: () => void;
}

function getFileType(pathname: string): "md" | "txt" {
  const ext = pathname.toLowerCase().slice(pathname.lastIndexOf("."));
  return ext === ".md" ? "md" : "txt";
}

function getFilename(pathname: string): string {
  const parts = pathname.split("/");
  return parts[parts.length - 1] || pathname;
}

export function FileEditor({ file, content, onSave, onDiscard }: FileEditorProps) {
  const [editedContent, setEditedContent] = useState(content);
  const [isSaving, setIsSaving] = useState(false);
  const type = getFileType(file.pathname);
  const filename = getFilename(file.pathname);
  const isMd = type === "md";
  const hasChanges = editedContent !== content;

  const handleSave = useCallback(async () => {
    if (!hasChanges) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/files/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pathname: file.pathname,
          content: editedContent,
        }),
      });
      if (res.ok) {
        const blob = await res.json();
        onSave(
          {
            url: blob.url,
            pathname: blob.pathname,
            size: blob.size ?? editedContent.length,
            uploadedAt: blob.uploadedAt ?? new Date().toISOString(),
          },
          editedContent
        );
      }
    } finally {
      setIsSaving(false);
    }
  }, [file.url, editedContent, filename, hasChanges, onSave]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleSave]);

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
              onClick={onDiscard}
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
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="truncate font-display text-xl font-bold text-white">
                {filename}
              </h1>
              {hasChanges && (
                <span
                  className="h-2 w-2 shrink-0 rounded-full bg-amber"
                  title="Unsaved changes"
                />
              )}
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onDiscard}
              disabled={isSaving}
              className="rounded-lg border border-white/10 bg-surface-elevated px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 disabled:opacity-50"
            >
              Discard
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="rounded-lg bg-mint/20 px-3 py-2 text-sm font-medium text-mint transition-colors hover:bg-mint/30 disabled:opacity-50"
            >
              {isSaving ? "Saving…" : "Save"}
            </motion.button>
          </div>
        </div>
      </div>

      <div className="mt-4 grid flex-1 gap-4 overflow-hidden lg:grid-cols-2">
        <div className="flex flex-col overflow-hidden">
          <label className="mb-2 text-xs font-medium text-white/50">Editor</label>
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="min-h-[300px] flex-1 resize-none rounded-lg border border-white/10 bg-surface-elevated px-4 py-3 font-mono text-sm text-white placeholder:text-white/40 focus:border-mint/50 focus:outline-none"
            placeholder="Write your content…"
            spellCheck={false}
            style={{
              lineHeight: 1.6,
            }}
          />
        </div>
        <div className="flex flex-col overflow-hidden">
          <label className="mb-2 text-xs font-medium text-white/50">Preview</label>
          <div className="min-h-[300px] flex-1 overflow-y-auto rounded-lg border border-white/10 bg-surface p-4">
            <MarkdownViewer content={editedContent} isPlainText={!isMd} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
