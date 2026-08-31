import type { ReactNode } from "react";
import { useReducedMotion } from "@/lib/motion";

interface AnimatedGradientTextProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wraps children with an extremely subtle animated gradient background-position shift.
 * Uses pure CSS animation — no JS runtime overhead.
 * Falls back to static gradient when reduced motion is preferred.
 */
export default function AnimatedGradientText({
  children,
  className = "",
}: AnimatedGradientTextProps) {
  const reduced = useReducedMotion();

  return (
    <span
      className={className}
      style={
        reduced
          ? undefined
          : {
              backgroundSize: "200% 100%",
              animation: "gradient-shift 8s ease-in-out infinite",
            }
      }
    >
      {children}
    </span>
  );
}
