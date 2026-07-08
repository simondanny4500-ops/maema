import { useCallback, useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Gift, Sparkles, X } from "lucide-react";
import { ConfettiBurst } from "@/components/site/ConfettiBurst";
import { useWheelReward } from "@/lib/wheel-reward";

const INTRO_KEY = "mm_intro_seen_v1";
const WHEEL_DELAY_AFTER_INTRO = 800;
const WHEEL_DELAY_NO_INTRO = 1500;

type Segment = {
  id: string;
  label: string;
  color: string;
  weight: number;
  isPrize: boolean;
};

const SEGMENTS: Segment[] = [
  { id: "free-perfume", label: "Parfum offert", color: "oklch(0.72 0.10 80)", weight: 22, isPrize: true },
  { id: "retry", label: "Réessayez !", color: "oklch(0.93 0.035 25)", weight: 22, isPrize: false },
  { id: "sample", label: "Échantillon", color: "oklch(0.90 0.025 55)", weight: 18, isPrize: false },
  { id: "shipping", label: "Livraison offerte", color: "oklch(0.85 0.06 75)", weight: 14, isPrize: false },
  { id: "discount5", label: "-5 %", color: "oklch(0.88 0.04 65)", weight: 12, isPrize: false },
  { id: "discount10", label: "-10 %", color: "oklch(0.78 0.08 78)", weight: 12, isPrize: false },
];

function pickSegment(): Segment {
  const total = SEGMENTS.reduce((s, seg) => s + seg.weight, 0);
  let r = Math.random() * total;
  for (const seg of SEGMENTS) {
    r -= seg.weight;
    if (r <= 0) return seg;
  }
  return SEGMENTS[0];
}

function segmentAngle(index: number, count: number) {
  return (360 / count) * index;
}

export function WheelOfFortune() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { hydrated, hasSpun, recordSpin } = useWheelReward();
  const [open, setOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<Segment | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);

  const isExcluded =
    pathname.startsWith("/admin") || pathname === "/auth" || pathname === "/checkout";

  useEffect(() => {
    if (!hydrated || hasSpun || isExcluded) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const introSeen = sessionStorage.getItem(INTRO_KEY);
    const delay = introSeen ? WHEEL_DELAY_NO_INTRO : 3100 + WHEEL_DELAY_AFTER_INTRO;

    const t = setTimeout(() => setOpen(true), delay);
    return () => clearTimeout(t);
  }, [hydrated, hasSpun, isExcluded]);

  const close = useCallback(() => {
    if (!hasSpun) recordSpin(result?.isPrize ?? false);
    setOpen(false);
  }, [hasSpun, result, recordSpin]);

  const spin = () => {
    if (spinning || result) return;
    const winner = pickSegment();
    const winIndex = SEGMENTS.findIndex((s) => s.id === winner.id);
    const slice = 360 / SEGMENTS.length;
    const spins = 5 + Math.floor(Math.random() * 3);
    const target =
      rotation +
      spins * 360 +
      (360 - winIndex * slice - slice / 2);

    setSpinning(true);
    setRotation(target);

    const onEnd = () => {
      setSpinning(false);
      setResult(winner);
      if (winner.isPrize) {
        setShowConfetti(true);
        recordSpin(true);
      } else {
        recordSpin(false);
      }
      wheelRef.current?.removeEventListener("transitionend", onEnd);
    };

    wheelRef.current?.addEventListener("transitionend", onEnd, { once: true });
  };

  if (!open) return null;

  const segmentLabels = SEGMENTS.map((seg, i) => {
    const angle = segmentAngle(i, SEGMENTS.length) + 360 / SEGMENTS.length / 2;
    return (
      <div
        key={seg.id}
        className="absolute inset-0 flex items-start justify-center pt-[12%] pointer-events-none"
        style={{ transform: `rotate(${angle}deg)` }}
      >
        <span
          className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-foreground/90 max-w-[4.5rem] text-center leading-tight"
          style={{ transform: `rotate(${-angle}deg)` }}
        >
          {seg.label}
        </span>
      </div>
    );
  });

  const gradientStops = SEGMENTS.map((seg, i) => {
    const start = (i / SEGMENTS.length) * 100;
    const end = ((i + 1) / SEGMENTS.length) * 100;
    return `${seg.color} ${start}% ${end}%`;
  }).join(", ");

  return (
    <>
      {showConfetti && <ConfettiBurst count={50} />}
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 animate-fade">
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={result ? close : undefined}
          aria-hidden
        />

        <div className="relative w-full max-w-md bg-background border border-border shadow-[0_30px_80px_-20px_rgba(0,0,0,0.4)] animate-scale-in overflow-hidden">
          <button
            type="button"
            onClick={close}
            disabled={spinning}
            className="absolute right-4 top-4 z-10 p-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>

          <div className="px-6 pt-8 pb-6 text-center">
            <div className="flex items-center justify-center gap-2 text-primary mb-2">
              <Sparkles size={16} className="animate-sparkle" />
              <p className="text-[10px] uppercase tracking-[0.35em] font-semibold">Roue de la chance</p>
              <Sparkles size={16} className="animate-sparkle" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl">Tentez votre chance !</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Faites tourner la roue et découvrez votre surprise.
            </p>
          </div>

          <div className="relative flex justify-center px-6 pb-4">
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
              <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[18px] border-l-transparent border-r-transparent border-t-primary drop-shadow-sm" />
            </div>

            <div className="relative w-[min(280px,75vw)] aspect-square">
              <div
                ref={wheelRef}
                className="w-full h-full rounded-full border-4 border-primary/30 shadow-[inset_0_0_30px_rgba(0,0,0,0.08)]"
                style={{
                  background: `conic-gradient(${gradientStops})`,
                  transform: `rotate(${rotation}deg)`,
                  transition: spinning
                    ? "transform 4.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)"
                    : "none",
                }}
              >
                {segmentLabels}
              </div>

              {/* Center hub */}
              <button
                type="button"
                onClick={spin}
                disabled={spinning || !!result}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem] rounded-full bg-primary text-primary-foreground text-[10px] uppercase tracking-widest font-bold shadow-lg hover:bg-[color:var(--gold-deep)] transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {spinning ? "…" : result ? "✓" : "Tourner"}
              </button>
            </div>
          </div>

          {result && (
            <div className="px-6 pb-8 animate-fade-up">
              {result.isPrize ? (
                <div className="bg-primary/10 border border-primary/30 p-5 text-center">
                  <Gift size={28} className="mx-auto text-primary mb-3" />
                  <p className="font-serif text-xl text-primary">Félicitations !</p>
                  <p className="mt-2 text-sm text-foreground/80 leading-relaxed">
                    Vous avez gagné <strong>un parfum offert pour tout achat</strong>.
                    Rendez-vous dans votre panier pour choisir votre parfum en format{" "}
                    <strong>35 ml</strong>.
                  </p>
                </div>
              ) : (
                <div className="bg-muted/50 border border-border p-5 text-center">
                  <p className="font-serif text-lg">Pas de chance cette fois…</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Merci d'avoir participé. Profitez de notre boutique !
                  </p>
                </div>
              )}
              <button
                type="button"
                onClick={close}
                className="mt-5 w-full bg-primary text-primary-foreground py-3.5 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[color:var(--gold-deep)] transition-colors"
              >
                {result.isPrize ? "Découvrir la boutique" : "Continuer"}
              </button>
            </div>
          )}

          {!result && (
            <p className="px-6 pb-6 text-center text-[10px] text-muted-foreground uppercase tracking-widest">
              Un tour par visite · Offre valable sur cette session
            </p>
          )}
        </div>
      </div>
    </>
  );
}
