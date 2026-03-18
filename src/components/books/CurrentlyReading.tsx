"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useApp } from "@/lib/store";
import { motion } from "framer-motion";

interface CurrentlyReadingProps {
  onEditBook?: (id: string) => void;
}

export function CurrentlyReading({ onEditBook }: CurrentlyReadingProps) {
  const { books, logReading } = useApp();
  const reading = books.filter((b) => b.status === "reading");
  const [pagesInput, setPagesInput] = useState("");

  const handleLogPages = (bookId: string) => {
    const pages = parseInt(pagesInput, 10);
    if (pages > 0) {
      logReading(bookId, format(new Date(), "yyyy-MM-dd"), pages);
      setPagesInput("");
    }
  };

  if (reading.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-xl border border-white/10 bg-surface p-6"
      >
        <h2 className="mb-4 font-display text-lg font-bold text-white">
          Currently Reading
        </h2>
        <p className="text-white/60">No book in progress. Add one to get started.</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {reading.map((book) => (
        <motion.div
          key={book.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-white/10 bg-surface p-6"
        >
          <h2 className="mb-4 font-display text-lg font-bold text-white">
            Currently Reading
          </h2>
          <div className="space-y-2">
            <p className="text-xl font-semibold text-white">{book.title}</p>
            <p className="text-white/60">by {book.author}</p>
            <p className="font-mono text-sm text-white/50">
              Started {format(new Date(book.startDate), "MMM d, yyyy")}
            </p>
            {book.totalPages != null && book.totalPages > 0 && (
              <div className="mt-4">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-white/60">Progress</span>
                  <span className="font-mono text-white">
                    {book.currentPage ?? 0} / {book.totalPages} pages (
                    {Math.round(((book.currentPage ?? 0) / book.totalPages) * 100)}%)
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full bg-mint"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${((book.currentPage ?? 0) / book.totalPages) * 100}%`,
                    }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>
            )}
            {onEditBook && (
              <button
                type="button"
                onClick={() => onEditBook(book.id)}
                className="mb-2 text-sm text-mint hover:underline"
              >
                Edit / Complete
              </button>
            )}
            <div className="mt-4 flex gap-2">
              <input
                type="number"
                value={pagesInput}
                onChange={(e) => setPagesInput(e.target.value)}
                placeholder="Pages read today"
                min={1}
                className="flex-1 rounded-lg border border-white/10 bg-surface-elevated px-4 py-2 font-mono text-white placeholder:text-white/40 focus:border-mint/50 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleLogPages(book.id)}
                className="rounded-lg bg-mint/20 px-4 py-2 font-medium text-mint transition-colors hover:bg-mint/30"
              >
                Log
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
