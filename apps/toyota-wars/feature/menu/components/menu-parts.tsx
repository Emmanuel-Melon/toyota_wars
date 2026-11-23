import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import styles from "./menu-shell.module.css";

type MenuWidth = "default" | "wide" | "missions";

type MenuShellProps = {
  children: ReactNode;
  label?: string;
  width?: MenuWidth;
  panelClassName?: string;
};

const PANEL_WIDTHS: Record<MenuWidth, string> = {
  default: "max-w-[560px]",
  wide: "max-w-[920px]",
  missions: "max-w-[760px]",
};

export function MenuShell({
  children,
  label,
  width = "default",
  panelClassName,
}: MenuShellProps) {
  return (
    <div
      className={cn(
        styles.overlay,
        "absolute inset-0 z-10 flex items-center justify-center overflow-y-auto px-6 pt-[max(24px,env(safe-area-inset-top))] pb-[max(24px,env(safe-area-inset-bottom))] min-[920px]:px-8",
      )}
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <div
        className={cn(
          styles.panel,
          "w-full text-center",
          PANEL_WIDTHS[width],
          panelClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function MenuHeading({
  kicker,
  title,
  subtitle,
  small = false,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  small?: boolean;
}) {
  return (
    <>
      {kicker ? (
        <div className="font-mono text-[11px] font-semibold leading-[1.2] tracking-[0.22em] opacity-85">
          {kicker}
        </div>
      ) : null}
      <h1
        className={cn(
          "mb-1.5 mt-4 font-bold leading-[0.86] tracking-[-0.07em] text-[clamp(48px,9vw,104px)]",
          small && "text-[clamp(32px,5vw,52px)] tracking-[-0.04em]",
        )}
      >
        {title}
      </h1>
      {subtitle ? (
        <p className="mb-7 font-mono text-[13px] leading-[1.5] tracking-[0.16em] opacity-80">
          {subtitle}
        </p>
      ) : null}
    </>
  );
}

export function MenuActions({
  children,
  row = false,
}: {
  children: ReactNode;
  row?: boolean;
}) {
  return (
    <div
      className={cn(
        "mt-[26px] flex flex-col items-center gap-3",
        row && "flex-row flex-wrap justify-center",
      )}
    >
      {children}
    </div>
  );
}

export function MenuHint({ children }: { children: ReactNode }) {
  return (
    <div className="mt-[22px] font-mono text-[11px] leading-[1.6] tracking-[0.16em] opacity-60">
      {children}
    </div>
  );
}

export function StatBar({
  label,
  value,
  fill,
}: {
  label: string;
  value: string;
  fill: number;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 font-mono text-[10px] font-semibold leading-none tracking-[0.14em]">
        <span>{label}</span>
        <span className="tracking-[0.06em] opacity-85">{value}</span>
      </div>
      <div className="mt-[7px] h-1 bg-ui-secondary/25">
        <span
          className="block h-full bg-gradient-to-r from-ui-primary/80 to-ui-primary transition-[width] duration-[180ms] ease-out"
          style={{ width: `${fill * 100}%` }}
        />
      </div>
    </div>
  );
}
