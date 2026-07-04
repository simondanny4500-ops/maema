import { useEffect, useState } from "react";

interface Particle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  rotate: number;
  shape: "circle" | "diamond";
}

/**
 * A tasteful, gold-toned confetti burst — used for genuine celebration
 * moments (order confirmed), not scattered everywhere. Auto-dismisses.
 */
export function ConfettiBurst({ count = 40 }: { count?: number }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const items: Particle[] = Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 400,
      duration: 2200 + Math.random() * 1400,
      size: 5 + Math.random() * 6,
      rotate: Math.random() * 360,
      shape: Math.random() > 0.5 ? "circle" : "diamond",
    }));
    setParticles(items);
    const t = setTimeout(() => setParticles([]), 4200);
    return () => clearTimeout(t);
  }, [count]);

  if (particles.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[70] overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute top-[-5%]"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background:
              p.id % 3 === 0
                ? "oklch(0.72 0.10 80)"
                : p.id % 3 === 1
                ? "oklch(0.85 0.08 80)"
                : "oklch(0.55 0.08 60)",
            borderRadius: p.shape === "circle" ? "9999px" : "2px",
            transform: `rotate(${p.rotate}deg)`,
            animation: `confettiFall ${p.duration}ms cubic-bezier(0.22, 0.61, 0.36, 1) ${p.delay}ms forwards`,
          }}
        />
      ))}
    </div>
  );
}
