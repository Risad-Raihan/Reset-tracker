"use client";

import { useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { triggerMilestoneConfetti } from "@/lib/confetti";

interface MilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  habitLabel: string;
  days: number;
}

export function MilestoneModal({
  isOpen,
  onClose,
  habitLabel,
  days,
}: MilestoneModalProps) {
  useEffect(() => {
    if (isOpen) {
      triggerMilestoneConfetti();
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center">
        <p className="text-6xl">🎉</p>
        <h3 className="mt-4 font-display text-2xl font-bold text-mint">
          {days} Day Streak!
        </h3>
        <p className="mt-2 text-white/80">{habitLabel}</p>
        <p className="mt-4 text-sm text-white/60">
          You&apos;re building something real. Keep going.
        </p>
        <button
          onClick={onClose}
          className="mt-6 rounded-lg bg-mint/20 px-6 py-2 font-medium text-mint transition-colors hover:bg-mint/30"
        >
          Let&apos;s go
        </button>
      </div>
    </Modal>
  );
}
