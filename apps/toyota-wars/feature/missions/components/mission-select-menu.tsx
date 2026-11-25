"use client";

import { useEffect, useRef, useState } from "react";

import {
  MenuActions,
  MenuButton,
  MenuHeading,
  MenuShell,
  StatBar,
} from "@/feature/menu/components/menu-parts";
import type { Mission } from "@toyota/missions";
import {
  allOrderedMissions,
  tutorialMissionId,
} from "@/lib/missions/missions.registry";
import { cn } from "@/lib/utils";

function selectableMissions(): Mission[] {
  const tutorialId = tutorialMissionId();
  return allOrderedMissions().filter((mission) => mission.id !== tutorialId);
}

function hostileCount(mission: Mission): number {
  return mission.squads
    .filter((squad) => squad.team === "enemy")
    .reduce((total, squad) => total + squad.units.length, 0);
}

export function MissionSelectMenu({
  onLaunch,
  onBack,
}: {
  onLaunch: (mission: Mission) => void;
  onBack: () => void;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const shouldFocusThumb = useRef(false);
  const missions = selectableMissions();
  const selected = missions[selectedIndex];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      shouldFocusThumb.current = true;
      setSelectedIndex(
        (current) => (current + direction + missions.length) % missions.length,
      );
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!shouldFocusThumb.current) return;
    shouldFocusThumb.current = false;
    thumbRefs.current[selectedIndex]?.focus();
  }, [selectedIndex]);

  if (!selected) return null;

  const hostiles = hostileCount(selected);
  const objectives = selected.objectives.filter(
    (objective) => !objective.hidden,
  );
  return (
    <MenuShell
      label="Mission selection"
      width="wide"
      panelClassName="max-h-[calc(100dvh-80px)] overflow-y-auto"
    >
      <MenuHeading
        kicker="Mission Select"
        title="Choose Mission"
        subtitle="Use ← / → or pick a mission below"
        small
      />

      <div className="sr-only" aria-live="polite">
        {`Selected mission: ${selected.title}`}
      </div>

      <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-[18px] text-left max-[919px]:grid-cols-1">
        <section
          aria-label="Selected mission"
          className="relative flex min-h-[300px] flex-col justify-between overflow-hidden border border-ui-secondary/30 bg-ui-panel/45 p-[18px] max-[919px]:min-h-[240px]"
        >
          <div>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-[24px] font-bold leading-[1.1] tracking-[0.04em]">
                {selected.title}
              </h2>
              <span className="shrink-0 border border-ui-primary/50 px-2 py-1 font-mono text-[11px] font-semibold text-ui-primary">
                D{selected.difficulty}
              </span>
            </div>
            <p className="mt-[18px] text-[14px] leading-[1.65] opacity-85">
              {selected.briefing}
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-4 gap-y-1 border-t border-ui-secondary/20 pt-3 font-mono text-[10px] font-semibold uppercase leading-[1.4] tracking-[0.14em] opacity-70">
            <span>{selected.arena.seed} seed</span>
            <span>{selected.arena.size} arena</span>
            <span>{selected.failConditions.length} fail conditions</span>
          </div>
        </section>

        <section
          aria-label="Mission stats"
          className="min-h-[300px] border border-ui-secondary/30 bg-ui-panel/50 p-[18px] max-[919px]:min-h-[220px]"
        >
          <h2 className="font-mono text-[11px] font-semibold uppercase leading-none tracking-[0.18em] text-ui-primary">
            Mission Intel
          </h2>
          <div className="mt-5 flex flex-col gap-4">
            <StatBar
              label="Difficulty"
              value={`${selected.difficulty} / 5`}
              fill={selected.difficulty / 5}
            />
            <StatBar
              label="Objectives"
              value={`${objectives.length}`}
              fill={Math.min(objectives.length / 4, 1)}
            />
            <StatBar
              label="Hostiles"
              value={`${hostiles}`}
              fill={Math.min(hostiles / 12, 1)}
            />
            <StatBar
              label="Reward"
              value={`${selected.rewards.xp} XP`}
              fill={Math.min(selected.rewards.xp / 500, 1)}
            />
          </div>
          <div className="mt-[22px] border-t border-ui-secondary/20 pt-3">
            <div className="font-mono text-[10px] font-semibold uppercase leading-none tracking-[0.16em] opacity-70">
              Objectives
            </div>
            <ul className="mt-2 flex flex-col gap-1.5">
              {objectives.length > 0 ? (
                objectives.map((objective) => (
                  <li
                    key={objective.id}
                    className="flex items-baseline justify-between gap-3 font-mono text-[11px] leading-[1.35]"
                  >
                    <span>{objective.title}</span>
                    <span className="shrink-0 opacity-65">
                      {objective.required ? "REQ" : "OPT"}
                    </span>
                  </li>
                ))
              ) : (
                <li className="font-mono text-[11px] opacity-65">
                  No mission objectives
                </li>
              )}
            </ul>
          </div>
        </section>
      </div>

      <div
        className="mt-[14px] grid grid-cols-3 gap-2.5 max-[919px]:grid-cols-2 max-[919px]:gap-1.5"
        role="group"
        aria-label="Choose mission"
      >
        {missions.map((mission, index) => {
          const active = index === selectedIndex;
          return (
            <button
              key={mission.id}
              ref={(element) => {
                thumbRefs.current[index] = element;
              }}
              type="button"
              aria-label={`Select ${mission.title}`}
              aria-pressed={active}
              data-active={active}
              className={cn(
                "hud-command hud-command-card hud-rust-medium grid grid-cols-[auto_1fr] items-center gap-x-3 p-[10px_12px] text-hud-bone transition duration-150 hover:-translate-y-0.5 max-[919px]:gap-x-1.5 max-[919px]:p-2",
                active && "text-hud-active-top",
              )}
              onClick={() => setSelectedIndex(index)}
            >
              <span
                className={cn(
                  "text-[16px] font-bold leading-none opacity-70 max-[919px]:text-[13px]",
                  active && "opacity-100",
                )}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[12px] font-semibold leading-[1.25] max-[919px]:text-[11px]">
                  {mission.title}
                </span>
                <span
                  className={cn(
                    "block text-[10px] leading-[1.3] opacity-65",
                    active && "opacity-90",
                  )}
                >
                  D{mission.difficulty}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <MenuActions row>
        <MenuButton rust active onClick={() => onLaunch(selected)}>
          Continue
        </MenuButton>
        <MenuButton onClick={onBack}>Back</MenuButton>
      </MenuActions>
    </MenuShell>
  );
}
