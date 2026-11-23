"use client";

import { useEffect } from "react";

import { cn } from "@/lib/utils";

import styles from "./loading-screen.module.css";

export function LoadingScreen() {
  useEffect(() => {
    const blockKeyboard = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopImmediatePropagation();
    };

    window.addEventListener("keydown", blockKeyboard, true);
    return () => window.removeEventListener("keydown", blockKeyboard, true);
  }, []);

  return (
    <div
      className={cn(
        styles.root,
        "absolute inset-0 z-40 grid place-items-center p-8 text-ui-text",
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading Battlefield"
    >
      <div className="w-full max-w-[420px] text-center">
        <div className="font-sans text-[clamp(38px,8vw,68px)] font-bold leading-[0.9] tracking-[-0.06em]">
          Toyota Wars
        </div>
        <p className="mb-[14px] mt-[18px] font-mono text-[11px] font-semibold leading-[1.4] tracking-[0.2em] opacity-80">
          Loading Battlefield
        </p>
        <div className="relative h-[3px] overflow-hidden bg-ui-secondary/25">
          <span
            className={cn(
              styles.fill,
              "absolute inset-y-0 left-0 w-[35%] bg-gradient-to-r from-ui-primary/80 to-ui-primary",
            )}
          />
        </div>
      </div>
    </div>
  );
}
