"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/context/player-context";
import layout from "@/feature/hud/components/hud-layout.module.css";
import { HudNotice, HudPanel } from "@/feature/hud/components/hud-parts";
import {
  cardinalBearing,
  distance2D,
  formatDistance,
} from "@/lib/missions/missions.navigation";
import { useMission } from "@/context/missions.context";
import type { MissionObjective } from "@/lib/missions/direction/mission.hud";
import { TUTORIAL_MISSION_ID } from "@/lib/missions/missions.data";
import { cn } from "@/lib/utils";
import {
  MenuActions,
  MenuHeading,
  MenuShell,
} from "@/feature/menu/components/menu-parts";

function formatSeconds(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

function ObjectiveNavReadout({
  objective,
}: {
  objective: MissionObjective | null;
}) {
  const { playerBody } = usePlayer();
  const distanceRef = useRef<HTMLSpanElement>(null);
  const bearingRef = useRef<HTMLSpanElement>(null);
  const objectiveRef = useRef(objective);
  objectiveRef.current = objective;

  useEffect(() => {
    let frame = 0;
    const update = () => {
      const target = objectiveRef.current?.targetPoint;
      if (target && distanceRef.current && bearingRef.current) {
        distanceRef.current.textContent = formatDistance(
          distance2D(playerBody.position.x, playerBody.position.z, target),
        );
        bearingRef.current.textContent = cardinalBearing(
          playerBody.position.x,
          playerBody.position.z,
          target,
        );
      }
      frame = requestAnimationFrame(update);
    };

    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [playerBody]);

  if (!objective?.targetPoint) return null;

  return (
    <div className="mb-2 flex justify-between gap-4 border-b border-ui-secondary/20 pb-[7px] font-mono text-[10px] font-semibold uppercase leading-[1.4] tracking-[0.16em]">
      <span>{objective.kind === "defend" ? "HOLD" : "OBJECTIVE"}</span>
      <span className="flex gap-2 text-ui-primary tabular-nums tracking-[0.08em]">
        <span ref={distanceRef}>—</span>
        <span ref={bearingRef} />
      </span>
    </div>
  );
}

export function MissionHud({ compact = false }: { compact?: boolean }) {
  const { status, mission, elapsed, objectives, activeObjective, notice } =
    useMission();
  if (
    !mission ||
    mission.id === TUTORIAL_MISSION_ID ||
    status === "idle" ||
    status === "success" ||
    status === "failed"
  )
    return null;

  const visible = objectives.filter((objective) => !objective.hidden);

  if (compact) {
    const completed = visible.filter(
      (objective) => objective.status === "complete",
    ).length;
    const activeProgress = activeObjective
      ? objectives.find((objective) => objective.id === activeObjective.id)
      : undefined;
    const progress = activeProgress
      ? `${activeProgress.current}/${activeProgress.target}`
      : `${completed}/${visible.length}`;

    return (
      <HudPanel
        className={`pointer-events-none ${layout.mobileMission}`}
        aria-label="Mission status"
      >
        <div className="flex items-center justify-center gap-3 font-mono text-[10px] font-semibold uppercase leading-none tracking-[0.1em]">
          <span className="max-w-[110px] truncate opacity-80">
            {mission.title}
          </span>
          <span className="tabular-nums text-ui-primary">
            {progress} | {formatSeconds(elapsed)}
          </span>
        </div>
      </HudPanel>
    );
  }

  return (
    <HudPanel
      className="pointer-events-none absolute left-1/2 top-8 z-[6] w-[min(420px,calc(100vw-48px))] -translate-x-1/2 px-[14px] py-3 max-[919px]:top-[136px] max-[919px]:w-[calc(100vw-16px)] max-[919px]:px-2 max-[919px]:py-2"
      aria-label="Mission status"
    >
      <div className="mb-2 flex justify-between gap-4 font-mono text-[11px] font-semibold uppercase leading-[1.4] tracking-[0.16em]">
        <span>{mission.title}</span>
        <span>{formatSeconds(elapsed)}</span>
      </div>
      {notice && (
        <HudNotice
          key={notice.id}
          className="mb-2 flex justify-between gap-3 border border-ui-primary/45 bg-ui-primary/15 px-2 py-1.5 font-mono text-[11px] font-bold uppercase leading-[1.4] tracking-[0.12em]"
        >
          <span>{notice.title}</span>
          <span className="text-right text-[10px] text-ui-primary">
            {notice.detail}
          </span>
        </HudNotice>
      )}
      <ObjectiveNavReadout objective={activeObjective} />
      <ul className="m-0 flex list-none flex-col gap-1 p-0 max-[919px]:max-h-[86px] max-[919px]:overflow-hidden">
        {visible.map((objective) => (
          <li
            key={objective.id}
            className={cn(
              "flex justify-between gap-4 font-mono text-[11px] leading-[1.5] tracking-[0.06em]",
              objective.status === "complete" && "text-[#b8d8a0]",
              objective.status === "failed" && "text-[#e79179]",
            )}
          >
            <span>{objective.title}</span>
            <span
              className={cn(
                "opacity-70",
                (objective.status === "complete" ||
                  objective.status === "failed") &&
                  "opacity-100",
              )}
            >
              {objective.status === "complete"
                ? "DONE"
                : objective.status === "failed"
                  ? "FAILED"
                  : `${objective.current}/${objective.target}`}
            </span>
          </li>
        ))}
      </ul>
    </HudPanel>
  );
}

export function MissionResultMenu({
  onRetry,
  onNext,
  onExit,
}: {
  onRetry: () => void;
  onNext?: () => void;
  onExit: () => void;
}) {
  const { result, mission } = useMission();
  if (!result || !mission) return null;

  const won = result.outcome === "success";

  return (
    <MenuShell label={won ? "Mission complete" : "Mission failed"}>
      <MenuHeading
        kicker={won ? "MISSION COMPLETE" : "MISSION FAILED"}
        title={mission.title}
        subtitle={won ? `${result.xp} XP earned` : "Try a different approach"}
        small
      />
      <ul className="m-0 flex list-none flex-col gap-1.5 p-0 font-mono text-[12px] leading-[1.5] tracking-[0.06em]">
        {result.objectives.map((objective) => (
          <li
            key={objective.id}
            className="flex justify-between gap-4 text-left"
          >
            <span>{objective.title}</span>
            <span className="opacity-70">{objective.status.toUpperCase()}</span>
          </li>
        ))}
      </ul>
      <MenuActions>
        <Button variant="game-primary" size="lg" onClick={onRetry}>
          {won ? "Replay" : "Retry"}
        </Button>
        {won && onNext ? (
          <Button variant="game-outline" size="lg" onClick={onNext}>
            Next Mission
          </Button>
        ) : null}
        <Button variant="game-outline" size="lg" onClick={onExit}>
          Menu
        </Button>
      </MenuActions>
    </MenuShell>
  );
}
