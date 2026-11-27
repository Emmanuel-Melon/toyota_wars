"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { getSnapshot, playerHeadingRef, subscribe } from "@toyota/combat";

const BAR_WIDTH = 80;
const BAR_HEIGHT = 6;

/**
 * Screen-space overlay. Must be rendered *outside* <Canvas>, in the DOM HUD.
 * Uses RAF + direct `style.transform` writes — no React re-renders per frame.
 */
export function DamageIndicatorHud() {
  const warnings = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const elRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const heading = playerHeadingRef.current;
      const now = performance.now();
      const radius = Math.min(window.innerWidth, window.innerHeight) * 0.22;
      const barWidth = Math.min(BAR_WIDTH, radius * 0.55);

      for (const w of getSnapshot()) {
        const el = elRefs.current.get(w.id);
        if (!el) continue;

        const age = now - w.createdAt;
        const progress = Math.min(1, age / w.durationMs);
        const fade = Math.max(0, 1 - progress);

        // screenAngle: 0 = up, +π/2 = right.
        const screenAngle = w.worldAngle - heading;
        const x = Math.sin(screenAngle) * radius;
        const y = -Math.cos(screenAngle) * radius;
        const deg = (screenAngle * 180) / Math.PI;

        el.style.transform = `translate(${x}px, ${y}px) rotate(${deg}deg)`;
        el.style.width = `${barWidth}px`;
        el.style.marginLeft = `${-barWidth / 2}px`;
        el.style.opacity = String(fade * w.intensity);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 50,
      }}
    >
      <div style={{ position: "absolute", left: "50%", top: "50%" }}>
        {warnings.map((w) => (
          <div
            key={w.id}
            ref={(el) => {
              if (el) elRefs.current.set(w.id, el);
              else elRefs.current.delete(w.id);
            }}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: BAR_WIDTH,
              height: BAR_HEIGHT,
              marginLeft: -BAR_WIDTH / 2,
              marginTop: -BAR_HEIGHT / 2,
              borderRadius: BAR_HEIGHT / 2,
              background:
                "linear-gradient(to right, transparent, #ff2a2a 30%, #ff2a2a 70%, transparent)",
              boxShadow: "0 0 12px 2px rgba(255, 40, 40, 0.75)",
              opacity: 0,
              willChange: "transform, opacity",
            }}
          />
        ))}
      </div>
    </div>
  );
}
