"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { VehiclePreview } from "@/feature/menu/components/weapon-preview";
import {
  MenuActions,
  MenuHeading,
  MenuHint,
  MenuShell,
  StatBar,
} from "@/feature/menu/components/menu-parts";
import type { Team } from "@/lib/combat/combat.types";
import {
  PLAYER_SELECTABLE_VEHICLE_MODEL_IDS,
  VEHICLE_MODELS,
  VEHICLE_PLATFORMS,
  resolveVehicleLoadout,
} from "@/lib/vehicles/vehicle.config";
import type {
  VehicleLoadout,
  VehiclePlatform,
} from "@/lib/vehicles/vehicle.types";
import { WEAPONS } from "@/lib/weapons/weapon.config";
import type { WeaponConfig } from "@/lib/weapons/weapon.types";
import { cn } from "@/lib/utils";

import shellStyles from "./menu-shell.module.css";

export type GameMenuMode = "menu" | "settings";

const CONTROL_TH_CLASS =
  "w-[120px] py-[10px] pr-4 align-top text-left font-mono text-[11px] font-semibold uppercase leading-[1.6] tracking-[0.18em] opacity-70";
const CONTROL_TD_CLASS =
  "py-[10px] text-left font-mono text-[12px] leading-[1.7] tracking-[0.08em]";
const CONTROL_KEY_CLASS =
  "mx-[4px] my-0.5 inline-block min-w-5 rounded-[3px] border border-ui-secondary/50 px-1.5 py-0.5 text-center font-mono text-[11px]";

type VehicleStat = {
  label: string;
  value: string;
  fill: number;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const titleCase = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

function getVehicleStats(
  weapon: WeaponConfig,
  platform: VehiclePlatform,
): VehicleStat[] {
  const rateOfFire = 1 / weapon.cooldown;

  return [
    {
      label: "Damage",
      value: String(weapon.projectile.damage),
      fill: clamp01(weapon.projectile.damage / 50),
    },
    {
      label: "Rate",
      value: `${rateOfFire.toFixed(1)}/s`,
      fill: clamp01(rateOfFire / 4.5),
    },
    {
      label: "Mobility",
      value: `${Math.round(platform.mobility * 100)}%`,
      fill: clamp01(platform.mobility),
    },
    {
      label: "Frontline",
      value: `${Math.round(platform.frontlineDurability * 100)}%`,
      fill: clamp01(platform.frontlineDurability),
    },
    {
      label: "Range",
      value: `${weapon.preferredRange}m`,
      fill: clamp01(weapon.preferredRange / 450),
    },
    {
      label: "Ammo",
      value: `${weapon.ammoCost}/shot`,
      fill: clamp01(weapon.ammoCost / 3),
    },
    {
      label: "Spread",
      value: weapon.spread.toFixed(3),
      fill: clamp01(1 - weapon.spread / 0.03),
    },
    {
      label: "Recoil",
      value: weapon.recoil.toFixed(1),
      fill: clamp01(1 - weapon.recoil / 6),
    },
  ];
}

export function GameMenu({
  mode,
  canResume,
  onPlay,
  onNewGame,
  onHowToPlay,
  onOpenSettings,
  onBack,
}: {
  mode: GameMenuMode;
  canResume: boolean;
  onPlay: () => void;
  onNewGame: () => void;
  onHowToPlay: () => void;
  onOpenSettings: () => void;
  onBack: () => void;
}) {
  return (
    <MenuShell label={mode === "menu" ? "Main menu" : "Settings"}>
      {mode === "menu" ? (
        <>
          <MenuHeading title="Toyota Wars" />
          <MenuActions>
            {canResume && (
              <Button variant="game-primary" size="lg" onClick={onPlay}>
                Resume
              </Button>
            )}
            <Button
              variant={canResume ? "game-outline" : "game-primary"}
              size="lg"
              onClick={onNewGame}
            >
              New Game
            </Button>
            <Button variant="game-outline" size="lg" onClick={onHowToPlay}>
              How to Play
            </Button>
            <Button variant="game-outline" size="lg" onClick={onOpenSettings}>
              Settings
            </Button>
          </MenuActions>
          {canResume && <MenuHint>Press Esc to Resume</MenuHint>}
        </>
      ) : (
        <>
          <MenuHeading kicker="Settings" title="Controls" small />
          <table className="mt-3 w-full border-collapse">
            <tbody>
              <tr>
                <th className={CONTROL_TH_CLASS}>Drive</th>
                <td className={CONTROL_TD_CLASS}>
                  <kbd className={CONTROL_KEY_CLASS}>W</kbd>
                  <kbd className={CONTROL_KEY_CLASS}>S</kbd> or{" "}
                  <kbd className={CONTROL_KEY_CLASS}>Arrows</kbd>
                </td>
              </tr>
              <tr>
                <th className={CONTROL_TH_CLASS}>Steer</th>
                <td className={CONTROL_TD_CLASS}>
                  <kbd className={CONTROL_KEY_CLASS}>A</kbd>
                  <kbd className={CONTROL_KEY_CLASS}>D</kbd> or{" "}
                  <kbd className={CONTROL_KEY_CLASS}>Arrows</kbd>
                </td>
              </tr>
              <tr>
                <th className={CONTROL_TH_CLASS}>Fire</th>
                <td className={CONTROL_TD_CLASS}>
                  Hold <kbd className={CONTROL_KEY_CLASS}>Space</kbd>
                </td>
              </tr>
              <tr>
                <th className={CONTROL_TH_CLASS}>Aim</th>
                <td className={CONTROL_TD_CLASS}>
                  Mouse or <kbd className={CONTROL_KEY_CLASS}>I</kbd>
                  <kbd className={CONTROL_KEY_CLASS}>J</kbd>
                  <kbd className={CONTROL_KEY_CLASS}>K</kbd>
                  <kbd className={CONTROL_KEY_CLASS}>L</kbd>
                </td>
              </tr>
              <tr>
                <th className={CONTROL_TH_CLASS}>Camera</th>
                <td className={CONTROL_TD_CLASS}>
                  <kbd className={CONTROL_KEY_CLASS}>V</kbd> to toggle chase /
                  drone
                </td>
              </tr>
            </tbody>
          </table>
          <MenuActions>
            <Button variant="game-outline" size="lg" onClick={onBack}>
              Back
            </Button>
          </MenuActions>
        </>
      )}
    </MenuShell>
  );
}

export function NewGameMenu({
  onCampaign,
  onSurvival,
  onBack,
}: {
  onCampaign: () => void;
  onSurvival: () => void;
  onBack: () => void;
}) {
  return (
    <MenuShell label="New game mode selection">
      <MenuHeading
        kicker="New Game"
        title="Choose Mode"
        subtitle="Pick Campaign or Survival"
        small
      />
      <div
        className="grid grid-cols-2 gap-3 max-[599px]:grid-cols-1"
        role="group"
        aria-label="Choose game mode"
      >
        <button
          type="button"
          className="flex min-h-[170px] flex-col border border-ui-primary bg-ui-primary/15 p-4 text-left font-mono text-ui-primary shadow-[inset_0_0_0_1px_rgb(var(--ui-primary-rgb)/0.55)] transition duration-150 hover:-translate-y-0.5 hover:bg-ui-primary/20 focus-visible:border-ui-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ui-primary/30"
          onClick={onCampaign}
        >
          <span className="text-[11px] font-semibold tracking-[0.22em] opacity-80">
            01
          </span>
          <span className="mt-6 text-[20px] font-semibold uppercase tracking-[0.06em]">
            Campaign
          </span>
          <span className="mt-2 text-[11px] leading-[1.6] opacity-75">
            Play authored missions and objectives.
          </span>
        </button>
        <button
          type="button"
          className="flex min-h-[170px] flex-col border border-ui-secondary/30 bg-ui-panel/45 p-4 text-left font-mono text-ui-text transition duration-150 hover:-translate-y-0.5 hover:border-ui-primary/70 hover:bg-ui-primary/10 focus-visible:border-ui-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ui-primary/30"
          onClick={onSurvival}
        >
          <span className="text-[11px] font-semibold tracking-[0.22em] text-ui-primary opacity-80">
            02
          </span>
          <span className="mt-6 text-[20px] font-semibold uppercase tracking-[0.06em]">
            Survival
          </span>
          <span className="mt-2 text-[11px] leading-[1.6] opacity-75">
            Hold the line against endless waves.
          </span>
        </button>
      </div>
      <MenuActions row>
        <Button variant="game-outline" size="lg" onClick={onBack}>
          Back
        </Button>
      </MenuActions>
    </MenuShell>
  );
}

export function SurvivalMenu({ onBack }: { onBack: () => void }) {
  return (
    <MenuShell label="Survival mode">
      <MenuHeading
        kicker="Survival"
        title="Coming Soon"
        subtitle="Wave-based survival is in development"
        small
      />
      <div className="border border-ui-secondary/30 bg-ui-panel/45 p-[18px] text-left font-mono text-[12px] leading-[1.7] tracking-[0.04em] opacity-85">
        <p>
          Survival mode will challenge you to hold the line against escalating
          waves.
        </p>
        <p className="mt-3">This mode is currently a placeholder.</p>
      </div>
      <MenuActions row>
        <Button variant="game-primary" size="lg" onClick={onBack}>
          Back
        </Button>
      </MenuActions>
    </MenuShell>
  );
}

export function VehicleSelectMenu({
  loadout,
  onConfirm,
  onBack,
}: {
  loadout: VehicleLoadout;
  onConfirm: (loadout: VehicleLoadout) => void;
  onBack: () => void;
}) {
  const initialIndex = Math.max(
    0,
    PLAYER_SELECTABLE_VEHICLE_MODEL_IDS.indexOf(loadout.model),
  );
  const [index, setIndex] = useState(initialIndex);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const selected = PLAYER_SELECTABLE_VEHICLE_MODEL_IDS[index];
  const selectedModel = VEHICLE_MODELS[selected];
  const chosen = resolveVehicleLoadout({ model: selected });
  const selectedWeapon = WEAPONS[selectedModel.weapon];
  const selectedPlatform = VEHICLE_PLATFORMS[selectedModel.platform];
  const stats = getVehicleStats(selectedWeapon, selectedPlatform);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const offset = event.key === "ArrowRight" ? 1 : -1;
      const next =
        (index + offset + PLAYER_SELECTABLE_VEHICLE_MODEL_IDS.length) %
        PLAYER_SELECTABLE_VEHICLE_MODEL_IDS.length;
      setIndex(next);
      thumbRefs.current[next]?.focus();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [index]);

  return (
    <MenuShell
      label="Vehicle selection"
      width="wide"
      panelClassName="max-h-[calc(100vh-64px)] overflow-y-auto"
    >
      <MenuHeading
        kicker="Deployment Loadout"
        title="Pick Your Vehicle"
        subtitle="Use ← / → or pick a vehicle below"
        small
      />

      <div className="mt-5 grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-[18px] text-left max-[919px]:grid-cols-1">
        <section
          className={cn(
            shellStyles.preview,
            "relative flex min-h-[300px] items-center justify-center overflow-hidden border border-ui-secondary/30 p-[18px] max-[919px]:min-h-[240px]",
          )}
          aria-label={`${selectedModel.label} preview`}
        >
          <VehiclePreview model={selectedModel} />
          <span className="absolute bottom-3 font-mono text-[10px] font-semibold tracking-[0.2em] text-ui-primary/90">
            {titleCase(selectedWeapon.mechanism)}
          </span>
        </section>

        <section
          className="min-h-[300px] border border-ui-secondary/30 bg-ui-panel/50 p-[18px] max-[919px]:min-h-[220px]"
          aria-label="Vehicle stats"
        >
          <div className="flex items-baseline justify-between gap-3 border-b border-ui-secondary/20 pb-3">
            <span className="font-mono text-[22px] font-bold leading-none tracking-[0.08em]">
              {selectedModel.label}
            </span>
            <span className="font-mono text-[10px] font-semibold leading-none tracking-[0.2em] opacity-70">
              {titleCase(selectedPlatform.id)}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3">
            {stats.map((stat) => (
              <StatBar key={stat.label} {...stat} />
            ))}
          </div>
        </section>
      </div>

      <p className="mt-4 font-mono text-[12px] leading-[1.6] tracking-[0.04em] opacity-85">
        {selectedModel.description}
      </p>

      <div
        className="mt-[14px] grid grid-cols-3 gap-2.5 max-[919px]:gap-1.5"
        role="group"
        aria-label="Choose vehicle"
      >
        {PLAYER_SELECTABLE_VEHICLE_MODEL_IDS.map((id, optionIndex) => {
          const model = VEHICLE_MODELS[id];
          const platform = VEHICLE_PLATFORMS[model.platform];
          const active = id === selected;

          return (
            <button
              key={id}
              ref={(node) => {
                thumbRefs.current[optionIndex] = node;
              }}
              type="button"
              className={cn(
                "grid grid-cols-[auto_1fr] items-center gap-x-3 border border-ui-secondary/30 bg-ui-panel/45 p-[10px_12px] text-left font-mono text-ui-text transition duration-150 hover:-translate-y-0.5 hover:bg-ui-primary/10 max-[919px]:gap-x-1.5 max-[919px]:p-2",
                active &&
                  "border-ui-primary bg-ui-primary/15 shadow-[inset_0_0_0_1px_rgb(var(--ui-primary-rgb)/0.55)]",
              )}
              aria-pressed={active}
              onClick={() => setIndex(optionIndex)}
            >
              <span className="row-span-2 font-mono text-[13px] font-bold leading-none tracking-[0.1em] opacity-55">
                {String(optionIndex + 1).padStart(2, "0")}
              </span>
              <span className="font-mono text-[13px] font-bold leading-none tracking-[0.08em] max-[919px]:text-[11px]">
                {model.label}
              </span>
              <span className="col-start-2 font-mono text-[9px] font-semibold leading-none tracking-[0.2em] opacity-65">
                {titleCase(platform.id)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-[14px] font-mono text-[11px] leading-[1.4] tracking-[0.16em] opacity-75">
        {selectedModel.label} · {selectedWeapon.label} /{" "}
        {titleCase(selectedPlatform.id)} · Frontline{" "}
        {Math.round(selectedPlatform.frontlineDurability * 100)}%
      </div>

      <MenuActions row>
        <Button
          variant="game-primary"
          size="lg"
          onClick={() => onConfirm(chosen)}
        >
          Select
        </Button>
        <Button variant="game-outline" size="lg" onClick={onBack}>
          Back
        </Button>
      </MenuActions>
    </MenuShell>
  );
}

export function GameOverMenu({
  winner,
  onReplay,
}: {
  winner: Team;
  onReplay: () => void;
}) {
  const allyWon = winner === "ally";

  return (
    <MenuShell label={allyWon ? "Victory" : "Defeat"}>
      <MenuHeading
        kicker={allyWon ? "Victory" : "Defeat"}
        title={allyWon ? "Allies Win" : "Enemies Win"}
        subtitle={allyWon ? "Enemy fleet destroyed" : "Allied fleet destroyed"}
        small
      />
      <MenuActions>
        <Button variant="game-primary" size="lg" onClick={onReplay}>
          Replay
        </Button>
      </MenuActions>
    </MenuShell>
  );
}
