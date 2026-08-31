import { useState, useEffect, useRef } from "react";
import { useInView } from "framer-motion";
import { useReducedMotion } from "@/lib/motion";

interface TypewriterCodeProps {
  code: string;
  /** Milliseconds per character (default 25) */
  speed?: number;
  className?: string;
}

/**
 * Progressively reveals code characters when the element enters the viewport.
 * Shows a blinking cursor during typing, then stays fully revealed.
 * Falls back to static display when reduced motion is preferred.
 */
export default function TypewriterCode({
  code,
  speed = 25,
  className = "",
}: TypewriterCodeProps) {
  const ref = useRef<HTMLPreElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px 0px" });
  const reduced = useReducedMotion();
  const [displayedLength, setDisplayedLength] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [isDone, setIsDone] = useState(false);

  // Reset when code changes (e.g. tab switch)
  useEffect(() => {
    setDisplayedLength(0);
    setIsDone(false);
    setShowCursor(true);
  }, [code]);

  // Typing effect
  useEffect(() => {
    if (reduced || !isInView || isDone) return;

    if (displayedLength < code.length) {
      const timer = setTimeout(() => {
        setDisplayedLength((prev) => Math.min(prev + 1, code.length));
      }, speed);
      return () => clearTimeout(timer);
    } else {
      setIsDone(true);
    }
  }, [code, displayedLength, isInView, isDone, reduced, speed]);

  // Blinking cursor
  useEffect(() => {
    if (reduced || isDone) {
      setShowCursor(false);
      return;
    }
    const blink = setInterval(() => {
      setShowCursor((v) => !v);
    }, 530);
    return () => clearInterval(blink);
  }, [isDone, reduced]);

  if (reduced) {
    return (
      <pre ref={ref} className={className}>
        {code}
      </pre>
    );
  }

  return (
    <pre ref={ref} className={className}>
      {code.slice(0, displayedLength)}
      {!isDone && (
        <span
          style={{
            opacity: showCursor ? 1 : 0,
            transition: "opacity 0.1s",
          }}
        >
          ▌
        </span>
      )}
    </pre>
  );
}
