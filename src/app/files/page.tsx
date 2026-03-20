"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { BlobFile } from "@/types/files";
import { FileDashboard } from "@/components/files/FileDashboard";
import { FileViewer } from "@/components/files/FileViewer";
import { FileEditor } from "@/components/files/FileEditor";

type View = "dashboard" | "reading" | "editing";

export default function FilesPage() {
  const [view, setView] = useState<View>("dashboard");
  const [selectedFile, setSelectedFile] = useState<BlobFile | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);

  const fetchContent = async (file: BlobFile) => {
    setLoadingContent(true);
    try {
      const res = await fetch(file.url);
      const text = await res.text();
      setFileContent(text);
    } catch {
      setFileContent("");
    } finally {
      setLoadingContent(false);
    }
  };

  const openFile = (file: BlobFile) => {
    setSelectedFile(file);
    setView("reading");
    fetchContent(file);
  };

  const closeFile = () => {
    setSelectedFile(null);
    setFileContent(null);
    setView("dashboard");
  };

  const switchToEdit = () => {
    setView("editing");
  };

  const switchToReading = () => {
    setView("reading");
  };

  const handleDeleteFile = (file: BlobFile) => {
    if (selectedFile?.url === file.url) {
      closeFile();
    }
  };

  const handleSaveFromEditor = (newBlob: BlobFile, savedContent: string) => {
    setSelectedFile(newBlob);
    setFileContent(savedContent);
    setView("reading");
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="h-full"
    >
      <AnimatePresence mode="wait">
        {view === "dashboard" && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full"
          >
            <FileDashboard onOpenFile={openFile} onDeleteFile={handleDeleteFile} />
          </motion.div>
        )}

        {view === "reading" && selectedFile && (
          <motion.div
            key="reading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full"
          >
            {loadingContent ? (
              <p className="text-white/60">Loading…</p>
            ) : fileContent !== null ? (
              <FileViewer
                file={selectedFile}
                content={fileContent}
                onEdit={switchToEdit}
                onBack={closeFile}
              />
            ) : null}
          </motion.div>
        )}

        {view === "editing" && selectedFile && fileContent !== null && (
          <motion.div
            key="editing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full"
          >
            <FileEditor
              file={selectedFile}
              content={fileContent}
              onSave={handleSaveFromEditor}
              onDiscard={() => switchToReading()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
