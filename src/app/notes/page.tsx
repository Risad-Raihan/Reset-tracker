"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useApp } from "@/lib/store";
import { NotesDashboard } from "@/components/notes/NotesDashboard";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { NoteCard } from "@/components/notes/NoteCard";
import type { Note } from "@/types";
import { motion } from "framer-motion";

type ViewMode = "dashboard" | "day";

export default function NotesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
  const [selectedDate, setSelectedDate] = useState(() =>
    format(new Date(), "yyyy-MM-dd")
  );
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editorDefaultDate, setEditorDefaultDate] = useState<string | undefined>();

  const { notes } = useApp();

  const dayNotes = notes
    .filter((n) => n.date === selectedDate)
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const openNewNote = (defaultDate?: string) => {
    setEditingNote(null);
    setEditorDefaultDate(defaultDate ?? selectedDate);
    setEditorOpen(true);
  };

  const openEditNote = (note: Note | null, defaultDate?: string) => {
    setEditingNote(note);
    setEditorDefaultDate(defaultDate);
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditingNote(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-3xl font-bold text-white">Notes</h1>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-white/10 bg-surface-elevated p-1">
            <button
              onClick={() => setViewMode("dashboard")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === "dashboard"
                  ? "bg-mint/20 text-mint"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setViewMode("day")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === "day"
                  ? "bg-mint/20 text-mint"
                  : "text-white/60 hover:text-white"
              }`}
            >
              By Day
            </button>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openNewNote()}
            className="rounded-lg bg-mint/20 px-4 py-2 font-medium text-mint transition-colors hover:bg-mint/30"
          >
            Add Note
          </motion.button>
        </div>
      </div>

      {viewMode === "dashboard" ? (
        <NotesDashboard onEditNote={openEditNote} />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-4">
            <label className="text-sm text-white/60">View date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-lg border border-white/10 bg-surface-elevated px-4 py-2 font-mono text-white focus:border-mint/50 focus:outline-none"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => openNewNote(selectedDate)}
              className="rounded-lg bg-mint/20 px-4 py-2 text-sm font-medium text-mint transition-colors hover:bg-mint/30"
            >
              Add for this day
            </motion.button>
          </div>

          {dayNotes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-dashed border-white/20 bg-surface/50 py-12 text-center"
            >
              <p className="text-white/60">No notes for {format(new Date(selectedDate), "MMMM d")}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openNewNote(selectedDate)}
                className="mt-4 rounded-lg bg-mint/20 px-4 py-2 font-medium text-mint hover:bg-mint/30"
              >
                Add Note
              </motion.button>
            </motion.div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {dayNotes.map((note, i) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={(n) => openEditNote(n)}
                  index={i}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}

      <NoteEditor
        isOpen={editorOpen}
        onClose={closeEditor}
        editingNote={editingNote}
        defaultDate={editorDefaultDate}
      />
    </motion.div>
  );
}
