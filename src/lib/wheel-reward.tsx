import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const STORAGE_KEY = "memma_wheel_v1";

export type FreePerfumeSelection = {
  id: string;
  slug: string;
  name: string;
  image: string;
};

type StoredWheelState = {
  hasSpun: boolean;
  wonFreePerfume: boolean;
  selectedPerfume: FreePerfumeSelection | null;
};

type WheelRewardContextValue = StoredWheelState & {
  hydrated: boolean;
  recordSpin: (wonFreePerfume: boolean) => void;
  selectFreePerfume: (product: FreePerfumeSelection | null) => void;
};

const WheelRewardContext = createContext<WheelRewardContextValue | null>(null);

function readStorage(): StoredWheelState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { hasSpun: false, wonFreePerfume: false, selectedPerfume: null };
}

export function WheelRewardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoredWheelState>({
    hasSpun: false,
    wonFreePerfume: false,
    selectedPerfume: null,
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(readStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const recordSpin = (wonFreePerfume: boolean) => {
    setState((prev) => ({ ...prev, hasSpun: true, wonFreePerfume }));
  };

  const selectFreePerfume = (product: FreePerfumeSelection | null) => {
    setState((prev) => ({ ...prev, selectedPerfume: product }));
  };

  return (
    <WheelRewardContext.Provider
      value={{ ...state, hydrated, recordSpin, selectFreePerfume }}
    >
      {children}
    </WheelRewardContext.Provider>
  );
}

export function useWheelReward() {
  const ctx = useContext(WheelRewardContext);
  if (!ctx) throw new Error("useWheelReward must be used within WheelRewardProvider");
  return ctx;
}
