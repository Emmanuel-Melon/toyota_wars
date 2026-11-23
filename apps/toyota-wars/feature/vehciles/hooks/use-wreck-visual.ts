// apps/toyota-wars/feature/vehciles/hooks/use-wreck-visual.ts
import { useEffect, useState } from "react";

export type RecoilState = { pending: number; barrel: number };
export type RecoilRef = { current: RecoilState };
export const createRecoilState = (): RecoilState => ({ pending: 0, barrel: 0 });
export const kickRecoil = (ref: RecoilRef, strength = 1) => {
  ref.current.pending += strength;
};

export { hashUnitId } from "@/lib/vehicle-identity";

export const DESTRUCTION_DURATION = 3.2;

export function useWreckVisual(
  destructionActive: boolean,
  duration = DESTRUCTION_DURATION,
): boolean {
  const [wrecked, setWrecked] = useState(false);

  useEffect(() => {
    if (!destructionActive) {
      setWrecked(false);
      return;
    }
    setWrecked(false);
    const timer = setTimeout(() => setWrecked(true), duration * 1000);
    return () => clearTimeout(timer);
  }, [destructionActive, duration]);

  return wrecked;
}
