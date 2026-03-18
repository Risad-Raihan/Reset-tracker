"use client";

import { useState, useRef } from "react";
import { useApp } from "@/lib/store";
import { Modal } from "@/components/ui/Modal";

export function DataManagement() {
  const { exportData, importData, clearData } = useApp();
  const [showClearModal, setShowClearModal] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reset-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    setImportError(null);
    fileInputRef.current?.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = reader.result as string;
        importData(json);
      } catch (err) {
        setImportError(err instanceof Error ? err.message : "Import failed");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleClear = () => {
    clearData();
    setShowClearModal(false);
  };

  return (
    <div className="space-y-2 border-t border-white/10 pt-4">
      <p className="text-xs font-medium text-white/50">Data</p>
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={handleExport}
          className="rounded-lg px-3 py-2 text-left text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
        >
          Export JSON
        </button>
        <button
          type="button"
          onClick={handleImportClick}
          className="rounded-lg px-3 py-2 text-left text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
        >
          Import JSON
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImportFile}
        />
        <button
          type="button"
          onClick={() => setShowClearModal(true)}
          className="rounded-lg px-3 py-2 text-left text-sm text-coral transition-colors hover:bg-coral/10"
        >
          Clear all data
        </button>
      </div>
      {importError && (
        <p className="text-xs text-coral">{importError}</p>
      )}

      <Modal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="Clear all data?"
      >
        <p className="mb-4 text-white/80">
          This will permanently delete all your habits, tasks, books, and
          progress. Export a backup first if you want to restore later.
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleClear}
            className="rounded-lg bg-coral/20 px-4 py-2 font-medium text-coral transition-colors hover:bg-coral/30"
          >
            Yes, clear everything
          </button>
          <button
            onClick={() => setShowClearModal(false)}
            className="rounded-lg border border-white/10 px-4 py-2 text-white/70 transition-colors hover:bg-white/5"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
}
