import { useEffect, useState } from "react";
import logo from "@/assets/logo.png";

const STORAGE_KEY = "mm_intro_seen_v1";

export function IntroAnimation() {
  const [mounted, setMounted] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    setShow(true);
    setMounted(true);
    document.body.style.overflow = "hidden";

    const leaveT = setTimeout(() => setLeaving(true), 2200);
    const doneT = setTimeout(() => {
      setShow(false);
      document.body.style.overflow = "";
      sessionStorage.setItem(STORAGE_KEY, "1");
    }, 3100);

    return () => {
      clearTimeout(leaveT);
      clearTimeout(doneT);
      document.body.style.overflow = "";
    };
  }, []);

  if (!mounted || !show) return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden pointer-events-none
        ${leaving ? "intro-leave" : ""}`}
    >
      {/* Two curtain panels */}
      <div className={`intro-panel intro-panel-top ${leaving ? "leave" : ""}`} />
      <div className={`intro-panel intro-panel-bottom ${leaving ? "leave" : ""}`} />

      {/* Gold shimmer sweep */}
      <div className="intro-shimmer" />

      {/* Center mark */}
      <div className={`relative flex flex-col items-center ${leaving ? "intro-mark-leave" : "intro-mark-in"}`}>
        <div className="intro-ring">
          <img src={logo} alt="" className="h-24 md:h-32 w-auto intro-logo" />
        </div>
        <div className="mt-8 overflow-hidden">
          <p className="intro-tagline text-[10px] md:text-xs uppercase tracking-[0.55em] text-primary">
            Memma <span className="opacity-60">&amp;</span> Maman
          </p>
        </div>
        <div className="mt-3 h-px w-24 bg-gradient-to-r from-transparent via-primary to-transparent intro-line" />
      </div>
    </div>
  );
}
