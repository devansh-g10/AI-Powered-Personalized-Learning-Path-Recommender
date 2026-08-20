import { useRef, useState, useCallback, type ReactNode } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { useReducedMotion } from "@/lib/motion";

interface MagneticButtonProps {
  children: ReactNode;
  /** Max displacement in pixels (default 4) */
  strength?: number;
  className?: string;
}

/**
 * Subtle magnetic hover effect for desktop CTA buttons.
 * Shifts the button transform toward the cursor by up to `strength` pixels.
 * Disabled on touch devices and when reduced motion is preferred.
 */
export default function MagneticButton({
  children,
  strength = 4,
  className,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [isTouch] = useState(() =>
    typeof window !== "undefined" && "ontouchstart" in window
  );

  const x = useSpring(0, { stiffness: 250, damping: 20 });
  const y = useSpring(0, { stiffness: 250, damping: 20 });

  // Slightly scale the movement to feel magnetic
  const moveX = useTransform(x, (val) => val * 0.5);
  const moveY = useTransform(y, (val) => val * 0.5);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current || isTouch || reduced) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) / (rect.width / 2);
      const deltaY = (e.clientY - centerY) / (rect.height / 2);
      x.set(deltaX * strength);
      y.set(deltaY * strength);
    },
    [isTouch, reduced, strength, x, y]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  if (reduced || isTouch) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      style={{ x: moveX, y: moveY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
}
