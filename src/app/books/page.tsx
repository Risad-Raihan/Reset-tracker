"use client";

import { useState } from "react";
import { format, startOfYear, startOfMonth } from "date-fns";
import { useApp } from "@/lib/store";
import { CurrentlyReading } from "@/components/books/CurrentlyReading";
import { BookList } from "@/components/books/BookList";
import { ReadingStreak } from "@/components/books/ReadingStreak";
import { AddBookModal } from "@/components/books/AddBookModal";
import { motion } from "framer-motion";

export default function BooksPage() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editBookId, setEditBookId] = useState<string | null>(null);
  const { books } = useApp();

  const yearStart = format(startOfYear(new Date()), "yyyy-MM-dd");
  const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
  const booksThisYear = books.filter(
    (b) => b.finishDate && b.finishDate >= yearStart
  ).length;
  const booksThisMonth = books.filter(
    (b) => b.finishDate && b.finishDate >= monthStart
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-3xl font-bold text-white">
          Book Tracker
        </h1>
        <button
          onClick={() => {
            setEditBookId(null);
            setAddModalOpen(true);
          }}
          className="rounded-lg bg-mint/20 px-4 py-2 font-medium text-mint transition-colors hover:bg-mint/30"
        >
          Add Book
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-white/10 bg-surface p-4"
        >
          <p className="text-sm text-white/60">This year</p>
          <p className="font-display text-2xl font-bold text-mint">
            {booksThisYear}
          </p>
          <p className="text-xs text-white/50">books completed</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-xl border border-white/10 bg-surface p-4"
        >
          <p className="text-sm text-white/60">This month</p>
          <p className="font-display text-2xl font-bold text-mint">
            {booksThisMonth}
          </p>
          <p className="text-xs text-white/50">books completed</p>
        </motion.div>
        <ReadingStreak />
      </div>

      <CurrentlyReading onEditBook={(id) => { setEditBookId(id); setAddModalOpen(true); }} />
      <BookList />

      <AddBookModal
        isOpen={addModalOpen}
        onClose={() => { setAddModalOpen(false); setEditBookId(null); }}
        editBookId={editBookId}
      />
    </motion.div>
  );
}
