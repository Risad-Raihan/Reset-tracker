"use client";

import { format } from "date-fns";
import { useApp } from "@/lib/store";
import { motion } from "framer-motion";

export function BookList() {
  const { books } = useApp();
  const completed = books.filter((b) => b.status === "completed");

  if (completed.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-xl border border-white/10 bg-surface p-6"
      >
        <h2 className="mb-4 font-display text-lg font-bold text-white">
          Completed Books
        </h2>
        <p className="text-white/60">No completed books yet.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-xl border border-white/10 bg-surface p-6"
    >
      <h2 className="mb-4 font-display text-lg font-bold text-white">
        Completed Books
      </h2>
      <div className="space-y-4">
        {completed.map((book, i) => (
          <motion.div
            key={book.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-lg border border-white/10 bg-surface-elevated p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-white">{book.title}</p>
                <p className="text-sm text-white/60">by {book.author}</p>
                <p className="mt-1 font-mono text-xs text-white/50">
                  {format(new Date(book.startDate), "MMM d")} –{" "}
                  {book.finishDate
                    ? format(new Date(book.finishDate), "MMM d, yyyy")
                    : "—"}
                </p>
                {book.review && (
                  <p className="mt-2 text-sm text-white/80">{book.review}</p>
                )}
              </div>
              {book.rating != null && (
                <div className="flex shrink-0 gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      className={n <= book.rating! ? "text-amber" : "text-white/20"}
                    >
                      ★
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
