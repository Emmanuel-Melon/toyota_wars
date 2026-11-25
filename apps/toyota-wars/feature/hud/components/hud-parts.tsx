"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

import styles from "./hud-parts.module.css";

type HudPanelProps = HTMLAttributes<HTMLDivElement> & {
  rust?: "small" | "medium" | "large";
  "data-collapsed"?: boolean;
};

const RUST_CLASSES = {
  small: "hud-rust-small",
  medium: "hud-rust-medium",
  large: "hud-rust-large",
} as const;

export function HudPanel({
  className,
  children,
  rust = "medium",
  ...props
}: HudPanelProps) {
  return (
    <div
      className={cn("hud-rusted", RUST_CLASSES[rust], styles.panel, className)}
      {...props}
    >
      {children}
    </div>
  );
}

type CollapsibleHudPanelProps = HudPanelProps & {
  title: string;
};

export function CollapsibleHudPanel({
  title,
  className,
  children,
  ...props
}: CollapsibleHudPanelProps) {
  const [open, setOpen] = useState(true);
  const bodyId = useId();

  return (
    <HudPanel
      {...props}
      data-collapsed={!open}
      className={cn(styles.collapsiblePanel, className)}
    >
      <button
        type="button"
        className={styles.collapsibleHeader}
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={() => setOpen((value) => !value)}
      >
        <span>{title}</span>
        <ChevronDown
          className={cn(styles.chevron, !open && styles.chevronCollapsed)}
          size={12}
          aria-hidden="true"
        />
      </button>
      <div id={bodyId} className={styles.collapsibleBody} hidden={!open}>
        {children}
      </div>
    </HudPanel>
  );
}

export function HudStatRow({
  label,
  value,
  tone,
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  tone?: "ally" | "enemy";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between font-mono text-[12px] font-semibold leading-[1.2] tracking-[0.12em]",
        className,
      )}
    >
      <span
        className={cn(
          "opacity-85",
          tone === "ally" && "text-[#d27a38]",
          tone === "enemy" && "text-[#c0392b]",
        )}
      >
        {label}
      </span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

export function HudButton({
  active = false,
  className,
  children,
  shortcut,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  shortcut?: string;
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap border border-ui-secondary/40 bg-ui-panel/50 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase leading-[1.2] tracking-[0.08em] text-ui-text transition-all duration-150 hover:border-ui-primary/50 hover:bg-ui-primary/10 disabled:cursor-default disabled:opacity-45 disabled:hover:border-ui-secondary/40 disabled:hover:bg-ui-panel/50 max-[919px]:min-h-11 max-[919px]:px-1",
        active && "border-ui-primary bg-ui-primary text-ui-panel",
        className,
      )}
      aria-keyshortcuts={shortcut}
      {...props}
    >
      {children}
      {shortcut && (
        <kbd className="rounded-[3px] border border-current/35 px-1 font-mono text-[9px] leading-[1.4] opacity-75">
          {shortcut}
        </kbd>
      )}
    </button>
  );
}

export function HudNotice({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(styles.notice, className)} {...props}>
      {children}
    </div>
  );
}
