"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/lib/store";

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  editBookId?: string | null;
}

export function AddBookModal({
  isOpen,
  onClose,
  editBookId = null,
}: AddBookModalProps) {
  const { books, addBook, updateBook, completeBook } = useApp();
  const editing = books.find((b) => b.id === editBookId);

  const [title, setTitle] = useState(editing?.title ?? "");
  const [author, setAuthor] = useState(editing?.author ?? "");
  const [totalPages, setTotalPages] = useState(
    editing?.totalPages?.toString() ?? ""
  );
  const [currentPage, setCurrentPage] = useState(
    editing?.currentPage?.toString() ?? ""
  );
  const [pagesToday, setPagesToday] = useState("");
  const [rating, setRating] = useState(editing?.rating?.toString() ?? "");
  const [review, setReview] = useState(editing?.review ?? "");

  useEffect(() => {
    if (isOpen) {
      setTitle(editing?.title ?? "");
      setAuthor(editing?.author ?? "");
      setTotalPages(editing?.totalPages?.toString() ?? "");
      setCurrentPage(editing?.currentPage?.toString() ?? "");
      setPagesToday("");
      setRating(editing?.rating?.toString() ?? "");
      setReview(editing?.review ?? "");
    }
  }, [isOpen, editBookId, editing]);

  const reset = () => {
    setTitle("");
    setAuthor("");
    setTotalPages("");
    setCurrentPage("");
    setPagesToday("");
    setRating("");
    setReview("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;

    if (editing) {
      updateBook(editing.id, {
        title: title.trim(),
        author: author.trim(),
        totalPages: totalPages ? parseInt(totalPages, 10) : undefined,
        currentPage: currentPage ? parseInt(currentPage, 10) : undefined,
      });
      if (rating && parseInt(rating, 10) >= 1) {
        completeBook(editing.id, parseInt(rating, 10), review.trim() || undefined);
      }
    } else {
      addBook(
        {
          title: title.trim(),
          author: author.trim(),
          startDate: format(new Date(), "yyyy-MM-dd"),
          totalPages: totalPages ? parseInt(totalPages, 10) : undefined,
          currentPage: currentPage ? parseInt(currentPage, 10) : undefined,
        },
        pagesToday ? parseInt(pagesToday, 10) : undefined
      );
    }
    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editing ? "Edit Book" : "Add Book"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-white/60">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-lg border border-white/10 bg-surface-elevated px-4 py-2 text-white focus:border-mint/50 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-white/60">Author</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
            className="w-full rounded-lg border border-white/10 bg-surface-elevated px-4 py-2 text-white focus:border-mint/50 focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-white/60">
              Total pages
            </label>
            <input
              type="number"
              value={totalPages}
              onChange={(e) => setTotalPages(e.target.value)}
              min={1}
              className="w-full rounded-lg border border-white/10 bg-surface-elevated px-4 py-2 text-white focus:border-mint/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/60">
              Current page
            </label>
            <input
              type="number"
              value={currentPage}
              onChange={(e) => setCurrentPage(e.target.value)}
              min={0}
              className="w-full rounded-lg border border-white/10 bg-surface-elevated px-4 py-2 text-white focus:border-mint/50 focus:outline-none"
            />
          </div>
        </div>
        {!editing && (
          <div>
            <label className="mb-1 block text-sm text-white/60">
              Pages read today (optional)
            </label>
            <input
              type="number"
              value={pagesToday}
              onChange={(e) => setPagesToday(e.target.value)}
              min={0}
              className="w-full rounded-lg border border-white/10 bg-surface-elevated px-4 py-2 text-white focus:border-mint/50 focus:outline-none"
            />
          </div>
        )}
        {editing && editing.status === "reading" && (
          <>
            <div>
              <label className="mb-1 block text-sm text-white/60">
                Rating (1-5, when completing)
              </label>
              <input
                type="number"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                min={1}
                max={5}
                className="w-full rounded-lg border border-white/10 bg-surface-elevated px-4 py-2 text-white focus:border-mint/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-white/60">
                One-line review
              </label>
              <input
                type="text"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-surface-elevated px-4 py-2 text-white focus:border-mint/50 focus:outline-none"
              />
            </div>
          </>
        )}
        <div className="flex gap-2 pt-4">
          <button
            type="submit"
            className="rounded-lg bg-mint/20 px-4 py-2 font-medium text-mint transition-colors hover:bg-mint/30"
          >
            {editing ? "Update" : "Add"}
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-white/10 px-4 py-2 text-white/70 transition-colors hover:bg-white/5"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
