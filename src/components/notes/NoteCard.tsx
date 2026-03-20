"use client";

import { format } from "date-fns";
import { getDayColor } from "@/types";
import type { Note } from "@/types";
import { motion } from "framer-motion";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  index?: number;
}

export function NoteCard({ note, onEdit, index = 0 }: NoteCardProps) {
  const color = getDayColor(note.date);
  const preview = note.content.slice(0, 120);
  const truncated = note.content.length > 120 ? preview + "…" : preview;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ scale: 1.02 }}
      className="cursor-pointer rounded-xl border-2 p-4 transition-shadow hover:shadow-lg"
      style={{
        backgroundColor: color.bg,
        borderColor: color.border,
        boxShadow: `0 4px 20px ${color.border}20`,
      }}
      onClick={() => onEdit(note)}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display text-lg font-bold text-white line-clamp-1">
          {note.title || "Untitled"}
        </h3>
        {note.pinned && (
          <span className="shrink-0 text-white/60" title="Pinned">
            📌
          </span>
        )}
      </div>
      <p className="mt-2 line-clamp-3 text-sm text-white/80">{truncated || "No content"}</p>
      <p
        className="mt-3 text-xs font-medium"
        style={{ color: color.border }}
      >
        {format(new Date(note.date), "EEE, MMM d")}
      </p>
    </motion.div>
  );
}
