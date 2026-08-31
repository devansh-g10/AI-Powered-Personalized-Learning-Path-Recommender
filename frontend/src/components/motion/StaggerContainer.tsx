import { useRef, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";
import { staggerContainerVariants, useReducedMotion } from "@/lib/motion";

interface StaggerContainerProps {
  children: ReactNode;
  staggerMs?: number;
  delayMs?: number;
  once?: boolean;
  className?: string;
}

export default function StaggerContainer({
  children,
  staggerMs = 80,
  delayMs = 0,
  once = true,
  className,
}: StaggerContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: "-60px 0px" });
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      variants={staggerContainerVariants(staggerMs, delayMs)}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}
