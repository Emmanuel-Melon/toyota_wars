import type { RefObject } from "react";

type Props = {
  title: string;
  distanceRef: RefObject<HTMLSpanElement | null>;
  bearingRef: RefObject<HTMLSpanElement | null>;
};

export function MinimapHeader({ title, distanceRef, bearingRef }: Props) {
  return (
    <div className="flex justify-between gap-[10px] font-mono text-[10px] font-semibold uppercase leading-[1.4] tracking-[0.12em] text-hud-bone max-[919px]:text-[9px]">
      <span className="truncate">{title}</span>
      <span className="flex shrink-0 gap-1.5 text-hud-active-top tabular-nums tracking-[0.04em]">
        <span ref={distanceRef}>—</span>
        <span ref={bearingRef} />
      </span>
    </div>
  );
}
