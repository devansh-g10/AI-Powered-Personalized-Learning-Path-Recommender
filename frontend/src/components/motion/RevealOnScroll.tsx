import { useRef, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";
import {
  fadeUpVariants,
  scaleRevealVariants,
  defaultTransition,
  easeOut,
  useReducedMotion,
} from "@/lib/motion";

type Direction = "up" | "down" | "left" | "right";

interface RevealOnScrollProps {
  children: ReactNode;
  direction?: Direction;
  distance?: number;
  delay?: number;
  duration?: number;
  once?: boolean;
  /** Use scale + translate instead of directional slide */
  scale?: boolean;
  className?: string;
}

export default function RevealOnScroll({
  children,
  direction = "up",
  distance = 30,
  delay = 0,
  duration = 0.5,
  once = true,
  scale = false,
  className,
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: "-60px 0px" });
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  const variants = scale
    ? scaleRevealVariants(0.97, distance)
    : fadeUpVariants(direction, distance);

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={{
        ...defaultTransition,
        duration,
        delay,
        ease: easeOut,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
