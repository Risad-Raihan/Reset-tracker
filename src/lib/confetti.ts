import confetti from "canvas-confetti";

export function triggerMilestoneConfetti() {
  const count = 150;
  const defaults = {
    origin: { y: 0.6 },
    spread: 180,
    startVelocity: 45,
    colors: ["#3DFFA0", "#5B9DFF", "#A78BFA", "#FFB84D"],
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });
}
