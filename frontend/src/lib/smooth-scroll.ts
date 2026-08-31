import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let lenisInstance: Lenis | null = null;
let rafId: number | null = null;

export function initSmoothScroll(): (() => void) | undefined {
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return undefined;
  }

  if (lenisInstance) return undefined;

  try {
    lenisInstance = new Lenis({
      duration: 0.9,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.2,
      prevent: (node: HTMLElement) => {
        return (
          node.hasAttribute("data-lenis-prevent") ||
          node.closest?.("[data-lenis-prevent]") !== null ||
          node.tagName === "TEXTAREA" ||
          node.tagName === "INPUT"
        );
      },
    });

    lenisInstance.on("scroll", ScrollTrigger.update);

    const rafLoop = (time: number) => {
      lenisInstance?.raf(time);
      rafId = requestAnimationFrame(rafLoop);
    };
    rafId = requestAnimationFrame(rafLoop);

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      lenisInstance?.destroy();
      lenisInstance = null;
    };
  } catch (err) {
    console.warn("Smooth scroll initialization fallback to native:", err);
    return undefined;
  }
}

export function getLenis(): Lenis | null {
  return lenisInstance;
}
