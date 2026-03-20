"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useApp } from "@/lib/store";
import { getDayColor } from "@/types";
import type { Note } from "@/types";
import { SlideOver } from "@/components/ui/SlideOver";
import { motion } from "framer-motion";

interface NoteEditorProps {
  isOpen: boolean;
  onClose: () => void;
  editingNote: Note | null;
  defaultDate?: string;
}

export function NoteEditor({
  isOpen,
  onClose,
  editingNote,
  defaultDate,
}: NoteEditorProps) {
  const { addNote, updateNote, deleteNote } = useApp();
  const [date, setDate] = useState(defaultDate ?? format(new Date(), "yyyy-MM-dd"));
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pinned, setPinned] = useState(false);

  const color = getDayColor(date);
  const isNew = !editingNote;

  useEffect(() => {
    if (isOpen) {
      if (editingNote) {
        setDate(editingNote.date);
        setTitle(editingNote.title);
        setContent(editingNote.content);
        setPinned(editingNote.pinned);
      } else {
        setDate(defaultDate ?? format(new Date(), "yyyy-MM-dd"));
        setTitle("");
        setContent("");
        setPinned(false);
      }
    }
  }, [isOpen, editingNote, defaultDate]);

  const handleSave = () => {
    if (!title.trim()) return;
    if (isNew) {
      addNote({ date, title: title.trim(), content: content.trim(), pinned });
    } else {
      updateNote(editingNote.id, {
        date,
        title: title.trim(),
        content: content.trim(),
        pinned,
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (!isNew && editingNote && confirm("Delete this note?")) {
      deleteNote(editingNote.id);
      onClose();
    }
  };

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      title={isNew ? "New Note" : "Edit Note"}
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-white/60">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-surface-elevated px-4 py-2 font-mono text-white focus:border-mint/50 focus:outline-none"
          />
          <div
            className="mt-2 h-2 w-16 rounded-full"
            style={{ backgroundColor: color.border }}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-white/60">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title"
            className="w-full rounded-lg border border-white/10 bg-surface-elevated px-4 py-2 font-display text-lg font-bold text-white placeholder:text-white/40 focus:border-mint/50 focus:outline-none"
            style={{ color: color.border }}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-white/60">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note..."
            rows={8}
            className="w-full resize-none rounded-lg border border-white/10 bg-surface-elevated px-4 py-3 text-white placeholder:text-white/40 focus:border-mint/50 focus:outline-none"
          />
        </div>

        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={pinned}
            onChange={(e) => setPinned(e.target.checked)}
            className="rounded border-white/20 text-mint focus:ring-mint"
          />
          <span className="text-sm text-white/70">Pin to top</span>
        </label>

        <div className="flex gap-2 pt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="flex-1 rounded-lg bg-mint/20 py-2.5 font-medium text-mint transition-colors hover:bg-mint/30"
          >
            Save
          </motion.button>
          {!isNew && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDelete}
              className="rounded-lg bg-coral/20 py-2.5 px-4 font-medium text-coral transition-colors hover:bg-coral/30"
            >
              Delete
            </motion.button>
          )}
        </div>
      </div>
    </SlideOver>
  );
}
