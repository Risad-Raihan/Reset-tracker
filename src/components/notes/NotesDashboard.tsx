"use client";

import { useApp } from "@/lib/store";
import { NoteCard } from "./NoteCard";
import type { Note } from "@/types";
import { motion } from "framer-motion";

interface NotesDashboardProps {
  onEditNote: (note: Note | null, defaultDate?: string) => void;
}

export function NotesDashboard({ onEditNote }: NotesDashboardProps) {
  const { notes } = useApp();

  const sortedNotes = [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  if (notes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-surface/50 py-16"
      >
        <p className="text-lg text-white/60">No notes yet</p>
        <p className="mt-2 text-sm text-white/40">
          Create your first note to get started
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onEditNote(null)}
          className="mt-6 rounded-lg bg-mint/20 px-6 py-2.5 font-medium text-mint transition-colors hover:bg-mint/30"
        >
          Add Note
        </motion.button>
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
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {sortedNotes.map((note, i) => (
        <NoteCard
          key={note.id}
          note={note}
          onEdit={(n) => onEditNote(n)}
          index={i}
        />
      ))}
    </motion.div>
  );
}
