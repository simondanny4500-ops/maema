import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type WheelPrizeId =
  | "free_perfume"
  | "discount_10"
  | "discount_5"
  | "free_shipping"
  | "lost"
  | "discount_15";

export type WheelPrize = {
  id: WheelPrizeId;
  label: string;
  shortLabel: string;
  weight: number;
  color: string;
  isWin: boolean;
};

// L'ordre définit la position des segments sur la roue (sens horaire depuis midi).
export const WHEEL_PRIZES: WheelPrize[] = [
  { id: "discount_10", label: "-10% sur votre commande", shortLabel: "-10%", weight: 18, color: "oklch(0.72 0.10 80)", isWin: true },
  { id: "lost", label: "Pas de chance, retentez à la prochaine visite", shortLabel: "Perdu", weight: 22, color: "oklch(0.90 0.025 55)", isWin: false },
  { id: "free_perfume", label: "Un parfum offert pour tout achat", shortLabel: "Parfum offert", weight: 10, color: "oklch(0.60 0.11 75)", isWin: true },
  { id: "free_shipping", label: "Livraison offerte", shortLabel: "Livraison offerte", weight: 20, color: "oklch(0.93 0.035 25)", isWin: true },
  { id: "discount_5", label: "-5% sur votre commande", shortLabel: "-5%", weight: 20, color: "oklch(0.72 0.10 80)", isWin: true },
  { id: "discount_15", label: "-15% sur votre commande", shortLabel: "-15%", weight: 10, color: "oklch(0.60 0.11 75)", isWin: true },
];

export function drawPrize(): WheelPrize {
  const total = WHEEL_PRIZES.reduce((s, p) => s + p.weight, 0);
  let roll = Math.random() * total;
  for (const prize of WHEEL_PRIZES) {
    roll -= prize.weight;
    if (roll <= 0) return prize;
  }
  return WHEEL_PRIZES[WHEEL_PRIZES.length - 1];
}

type WheelState = {
  hasSpun: boolean;
  prizeId: WheelPrizeId | null;
  giftClaimed: boolean;
};

type WheelContextValue = {
  state: WheelState;
  hydrated: boolean;
  recordSpin: (prizeId: WheelPrizeId) => void;
  markGiftClaimed: () => void;
  resetGiftClaim: () => void;
  /** Vrai uniquement si le lot gagné est le parfum offert et qu'il n'a pas encore été récupéré. */
  hasUnclaimedPerfumeGift: boolean;
};

const WheelContext = createContext<WheelContextValue | null>(null);
const STORAGE_KEY = "memma_wheel_v1";

function readState(): WheelState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { hasSpun: false, prizeId: null, giftClaimed: false };
}

export function WheelProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WheelState>({ hasSpun: false, prizeId: null, giftClaimed: false });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(readState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state, hydrated]);

  const recordSpin = (prizeId: WheelPrizeId) => {
    setState({ hasSpun: true, prizeId, giftClaimed: false });
  };
  const markGiftClaimed = () => setState((s) => ({ ...s, giftClaimed: true }));
  const resetGiftClaim = () => setState((s) => ({ ...s, giftClaimed: false }));

  const hasUnclaimedPerfumeGift = state.prizeId === "free_perfume" && !state.giftClaimed;

  return (
    <WheelContext.Provider value={{ state, hydrated, recordSpin, markGiftClaimed, resetGiftClaim, hasUnclaimedPerfumeGift }}>
      {children}
    </WheelContext.Provider>
  );
}

export function useWheel() {
  const ctx = useContext(WheelContext);
  if (!ctx) throw new Error("useWheel must be used within WheelProvider");
  return ctx;
}
