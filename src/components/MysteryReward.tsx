"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/CartProvider";

// Watches the cart's earned mystery-set count. Whenever it goes UP (the
// customer just unlocked a new free mystery set), it fires a confetti /
// party-popper celebration and shows a short toast.
export function MysteryReward() {
  const { mysteryCount, hydrated } = useCart();
  const prev = useRef<number | null>(null);
  const [show, setShow] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    // First run after hydration: record the baseline, don't celebrate.
    if (prev.current === null) {
      prev.current = mysteryCount;
      return;
    }
    if (mysteryCount > prev.current) {
      celebrate();
      setShow(true);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setShow(false), 4500);
    }
    prev.current = mysteryCount;
  }, [mysteryCount, hydrated]);

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  if (!show) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4">
      <div className="animate-fade-up pointer-events-auto flex items-center gap-3 rounded-2xl border border-royal/20 bg-white px-5 py-4 shadow-xl">
        <span className="text-2xl">🎁</span>
        <div>
          <p className="font-display text-lg leading-tight text-navy">
            You unlocked a FREE Mystery Set!
          </p>
          <p className="text-sm text-ink/60">
            A surprise hand-picked set — revealed when your order arrives. 🎉
          </p>
        </div>
      </div>
    </div>
  );
}

// Party-popper style confetti burst.
async function celebrate() {
  try {
    const confetti = (await import("canvas-confetti")).default;
    const colors = ["#16256b", "#2647cf", "#ffffff", "#f5c542"];
    // Center pop
    confetti({ particleCount: 130, spread: 75, origin: { y: 0.7 }, colors });
    // Streams from the two bottom corners
    const end = Date.now() + 900;
    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.9 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.9 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  } catch {
    /* confetti is a nice-to-have; never let it break the flow */
  }
}
