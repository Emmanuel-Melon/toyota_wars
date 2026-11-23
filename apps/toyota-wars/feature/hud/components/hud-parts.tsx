import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

import styles from "./hud-parts.module.css";

export function HudPanel({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(styles.panel, className)} {...props}>
      {children}
    </div>
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
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "flex-1 border border-ui-secondary/40 bg-ui-panel/50 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase leading-[1.2] tracking-[0.08em] text-ui-text transition-all duration-150 hover:border-ui-primary/50 hover:bg-ui-primary/10 disabled:cursor-default disabled:opacity-45 disabled:hover:border-ui-secondary/40 disabled:hover:bg-ui-panel/50 max-[919px]:min-h-11 max-[919px]:px-1",
        active && "border-ui-primary bg-ui-primary text-ui-panel",
        className,
      )}
      {...props}
    />
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
