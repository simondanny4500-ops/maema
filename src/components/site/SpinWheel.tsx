import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Gift, Sparkles, X } from "lucide-react";
import { WHEEL_PRIZES, drawPrize, useWheel, type WheelPrize } from "@/lib/wheel";
import { ConfettiBurst } from "./ConfettiBurst";

const SESSION_DISMISS_KEY = "memma_wheel_popup_dismissed";
const OPEN_DELAY_MS = 1000;
const SPIN_DURATION_MS = 4600;
const SEGMENT_ANGLE = 360 / WHEEL_PRIZES.length;

function polarPoint(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) };
}

function segmentPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarPoint(cx, cy, r, startAngle);
  const end = polarPoint(cx, cy, r, endAngle);
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y} Z`;
}

export function SpinWheel() {
  const { state, hydrated, recordSpin } = useWheel();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<WheelPrize | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const isEligiblePage = !pathname.startsWith("/admin") && pathname !== "/auth" && pathname !== "/checkout";

  useEffect(() => {
    if (!hydrated || !isEligiblePage) return;
    if (state.hasSpun) return;
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem(SESSION_DISMISS_KEY) === "1";
    } catch {
      // ignore
    }
    if (dismissed) return;
    const t = window.setTimeout(() => setOpen(true), OPEN_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [hydrated, isEligiblePage, state.hasSpun]);

  useEffect(() => () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
  }, []);

  const dismiss = () => {
    setOpen(false);
    try {
      sessionStorage.setItem(SESSION_DISMISS_KEY, "1");
    } catch {
      // ignore
    }
  };

  const spin = () => {
    if (spinning || result) return;
    setSpinning(true);
    const prize = drawPrize();
    const index = WHEEL_PRIZES.findIndex((p) => p.id === prize.id);
    const center = index * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
    const jitter = (Math.random() - 0.5) * (SEGMENT_ANGLE * 0.5);
    const extraSpins = 6 * 360;
    const target = extraSpins + (360 - center) + jitter;
    setRotation(target);

    timeoutRef.current = window.setTimeout(() => {
      setSpinning(false);
      setResult(prize);
      recordSpin(prize.id);
      if (prize.isWin) setShowConfetti(true);
    }, SPIN_DURATION_MS);
  };

  const wheelSvg = useMemo(() => {
    const cx = 150;
    const cy = 150;
    const r = 145;
    return (
      <svg viewBox="0 0 300 300" className="w-full h-full drop-shadow-[0_10px_30px_rgba(120,90,50,0.35)]">
        <circle cx={cx} cy={cy} r={r + 4} fill="oklch(0.99 0.005 80)" stroke="oklch(0.72 0.10 80)" strokeWidth="3" />
        {WHEEL_PRIZES.map((prize, i) => {
          const start = i * SEGMENT_ANGLE;
          const end = start + SEGMENT_ANGLE;
          const mid = start + SEGMENT_ANGLE / 2;
          const labelPoint = polarPoint(cx, cy, r * 0.62, mid);
          return (
            <g key={prize.id}>
              <path d={segmentPath(cx, cy, r, start, end)} fill={prize.color} stroke="oklch(0.99 0.005 80)" strokeWidth="1.5" />
              <text
                x={labelPoint.x}
                y={labelPoint.y}
                transform={`rotate(${mid}, ${labelPoint.x}, ${labelPoint.y})`}
                textAnchor="middle"
                fontSize="11.5"
                fontWeight={prize.id === "free_perfume" ? 700 : 600}
                fill={prize.id === "lost" ? "oklch(0.48 0.02 50)" : "oklch(0.99 0.005 80)"}
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                {prize.shortLabel}
              </text>
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r={30} fill="oklch(0.99 0.005 80)" stroke="oklch(0.72 0.10 80)" strokeWidth="3" />
      </svg>
    );
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm animate-fade">
      {showConfetti && <ConfettiBurst />}
      <div className="relative w-full max-w-md bg-background rounded-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)] px-6 py-8 md:px-9 md:py-10 animate-scale-in">
        <button
          onClick={dismiss}
          aria-label="Fermer"
          className="absolute top-4 right-4 h-9 w-9 rounded-full bg-muted/70 hover:bg-muted flex items-center justify-center transition-colors z-10"
        >
          <X size={16} />
        </button>

        {!result ? (
          <>
            <div className="text-center mb-6">
              <p className="text-[10px] uppercase tracking-[0.3em] text-primary mb-2 flex items-center justify-center gap-1.5">
                <Sparkles size={12} /> Offre de bienvenue
              </p>
              <h2 className="font-serif text-3xl md:text-[2.1rem] leading-tight text-foreground">
                Tentez votre chance
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Tournez la roue et repartez avec une récompense exclusive.
              </p>
            </div>

            <div className="relative mx-auto w-64 h-64 md:w-72 md:h-72 select-none">
              <div
                className="absolute left-1/2 -top-2 -translate-x-1/2 z-10"
                style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.25))" }}
              >
                <div
                  className="w-0 h-0"
                  style={{
                    borderLeft: "11px solid transparent",
                    borderRight: "11px solid transparent",
                    borderTop: "18px solid oklch(0.60 0.11 75)",
                  }}
                />
              </div>
              <div
                className="w-full h-full"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: spinning ? `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.15, 0.85, 0.25, 1)` : undefined,
                }}
              >
                {wheelSvg}
              </div>
            </div>

            <button
              onClick={spin}
              disabled={spinning}
              className="mt-7 mx-auto flex items-center justify-center gap-2 w-full max-w-[220px] bg-primary text-primary-foreground py-3.5 rounded-full text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[color:var(--gold-deep)] active:scale-95 transition-all disabled:opacity-60 disabled:active:scale-100"
            >
              {spinning ? "Ça tourne…" : "Je tente ma chance"}
            </button>
          </>
        ) : (
          <div className="text-center py-4 animate-scale-in">
            <div className="mx-auto mb-5 h-16 w-16 rounded-full bg-[oklch(0.96_0.015_70)] flex items-center justify-center">
              <Gift size={26} className="text-primary" strokeWidth={1.5} />
            </div>
            {result.isWin ? (
              <>
                <p className="text-[10px] uppercase tracking-[0.3em] text-primary mb-2">Félicitations</p>
                <h2 className="font-serif text-2xl md:text-3xl text-foreground leading-snug">{result.label}</h2>
                {result.id === "free_perfume" ? (
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                    Votre cadeau est enregistré. Ajoutez vos produits au panier : vous pourrez y choisir
                    votre parfum offert (format 35 ml).
                  </p>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                    Votre récompense a été enregistrée et s'appliquera automatiquement à votre commande.
                  </p>
                )}
              </>
            ) : (
              <>
                <h2 className="font-serif text-2xl md:text-3xl text-foreground leading-snug">Pas de chance cette fois</h2>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  Revenez lors de votre prochaine visite pour retenter votre chance.
                </p>
              </>
            )}
            <Link
              to="/boutique"
              onClick={dismiss}
              className="mt-7 inline-flex items-center justify-center gap-2 w-full max-w-[240px] bg-primary text-primary-foreground py-3.5 rounded-full text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[color:var(--gold-deep)] active:scale-95 transition-all"
            >
              Découvrir la boutique
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
