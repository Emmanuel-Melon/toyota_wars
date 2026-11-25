import type { ReactNode } from "react";

export function Keycap({ children }: { children: ReactNode }) {
  return (
    <kbd className="hud-keycap hud-rust-small">
      {typeof children === "string" ? children.toUpperCase() : children}
    </kbd>
  );
}

type CommandButtonProps = {
  label: string;
  shortcut?: string;
  icon?: ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

export function CommandButton({
  label,
  shortcut,
  icon,
  active,
  disabled,
  onClick,
}: CommandButtonProps) {
  return (
    <button
      type="button"
      className="hud-command"
      data-active={Boolean(active)}
      aria-pressed={Boolean(active)}
      aria-keyshortcuts={shortcut}
      disabled={disabled}
      onClick={onClick}
    >
      {shortcut && <Keycap>{shortcut}</Keycap>}
      {icon && (
        <span className="hud-command-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span>{label}</span>
    </button>
  );
}
