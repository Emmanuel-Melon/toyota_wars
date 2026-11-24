"use client";

import type { ReactNode } from "react";
import { Physics } from "@react-three/rapier";
import { FxProvider } from "@/context/fx-context";
import { MissionClock, MissionContext } from "@/context/missions.context";
import { QuarksProvider } from "@/context/quarks-provider";
import { MissionFlowClock } from "@/feature/mission-flow/mission-flow-clock";
import type { MissionRunner } from "@toyota/missions";
import { FrameLoopProvider, GameLoopDriver } from "@/render-loop";
import { BattleProvider } from "../../context/battle-context";
import { Mission2OpeningDirector } from "../missions/components/mission-2-opening-director";
import { PlainsEnvironment } from "../terrain/components/plains-environment";
import { SceneReadyProbe } from "./components/scene-ready-probe";

type Props = {
  children: ReactNode;
  runner: MissionRunner;
  paused: boolean;
  onReady: () => void;
};

export function SceneProviders({ children, runner, paused, onReady }: Props) {
  return (
    <MissionContext.Provider value={runner}>
      <FrameLoopProvider>
        <GameLoopDriver />
        <MissionFlowClock />
        <MissionClock paused={paused} />
        <Physics>
          <PlainsEnvironment />
          <QuarksProvider paused={paused}>
            <FxProvider>
              <BattleProvider>
                <Mission2OpeningDirector />
                <SceneReadyProbe onReady={onReady} />
                {children}
              </BattleProvider>
            </FxProvider>
          </QuarksProvider>
        </Physics>
      </FrameLoopProvider>
    </MissionContext.Provider>
  );
}
