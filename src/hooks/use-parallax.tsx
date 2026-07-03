import { useEffect, useRef } from "react";

/**
 * Returns a ref to attach to an element whose transform will be updated
 * on scroll to create a subtle parallax effect (element moves slower
 * than the page scroll). `speed` < 1 makes it lag behind (classic parallax).
 */
export function useParallax<T extends HTMLElement>(speed = 0.35) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let ticking = false;

    const update = () => {
      ticking = false;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // Only animate while the element is near/within the viewport.
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const offset = rect.top * speed;
      el.style.transform = `translate3d(0, ${offset * -1}px, 0) scale(1.15)`;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [speed]);

  return ref;
}
