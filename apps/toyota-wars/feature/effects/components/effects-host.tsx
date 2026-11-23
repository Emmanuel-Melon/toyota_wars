// apps/toyota-wars/feature/effects/effects-host.tsx
"use client";

import { EFFECTS } from "../effects.registry";
import type { EffectProps } from "../effects.types";

export function EffectsHost(props: EffectProps) {
  return (
    <>
      {EFFECTS.map(({ id, Component }) => (
        <Component key={id} {...props} />
      ))}
    </>
  );
}
