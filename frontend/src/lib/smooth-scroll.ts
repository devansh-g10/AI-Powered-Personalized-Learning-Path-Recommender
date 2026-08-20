import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let lenisInstance: Lenis | null = null;

export function initSmoothScroll(): (() => void) | undefined {
  // Respect reduced motion preference
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return undefined;
  }

  // Avoid double-init
  if (lenisInstance) return undefined;

  lenisInstance = new Lenis({
    duration: 1.1,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    touchMultiplier: 1.5,
  });

  // Sync Lenis scroll position with GSAP ScrollTrigger
  lenisInstance.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time: number) => {
    lenisInstance?.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  return () => {
    lenisInstance?.destroy();
    lenisInstance = null;
  };
}

export function getLenis(): Lenis | null {
  return lenisInstance;
}
