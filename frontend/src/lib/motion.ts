import { useEffect, useState } from "react";
import type { Variants, Transition, BezierDefinition } from "framer-motion";

/* ─── Easing Presets ──────────────────────────────────────────────────────── */

/** Apple-style deceleration curve */
export const easeOut: BezierDefinition = [0.16, 1, 0.3, 1];

/** Smooth entrance with slight overshoot */
export const easeSpring: BezierDefinition = [0.34, 1.56, 0.64, 1];

/** Standard ease-in-out for ambient motion */
export const easeInOut: BezierDefinition = [0.45, 0, 0.55, 1];

/* ─── Default Transition ──────────────────────────────────────────────────── */

export const defaultTransition: Transition = {
  duration: 0.5,
  ease: easeOut,
};

/* ─── Variant Factories ───────────────────────────────────────────────────── */

type Direction = "up" | "down" | "left" | "right";

const directionOffset: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 30 },
  down: { x: 0, y: -30 },
  left: { x: 30, y: 0 },
  right: { x: -30, y: 0 },
};

export function fadeUpVariants(
  direction: Direction = "up",
  distance?: number
): Variants {
  const offset = directionOffset[direction];
  const mult = distance ? distance / 30 : 1;
  return {
    hidden: {
      opacity: 0,
      x: offset.x * mult,
      y: offset.y * mult,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
    },
  };
}

export function scaleRevealVariants(
  scale = 0.97,
  y = 30
): Variants {
  return {
    hidden: { opacity: 0, scale, y },
    visible: { opacity: 1, scale: 1, y: 0 },
  };
}

export function staggerContainerVariants(
  staggerMs = 80,
  delayMs = 0
): Variants {
  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerMs / 1000,
        delayChildren: delayMs / 1000,
      },
    },
  };
}

export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

/* ─── Reduced Motion Hook ─────────────────────────────────────────────────── */

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
}
