"use client";

import { useRef } from "react";
import type * as THREE from "three";

// local scene components
import { PlayerPresenter, PlayerUnit } from "./player-unit";
import { PositionTracker } from "./position-tracker";
import { ReticleUpdater } from "./scene-reticle";

// shared libs
import { COMBAT_CONFIG } from "@toyota/combat";
import { PLAYER_PALETTE } from "@/lib/palettes";

// contexts
import { useArena } from "@/context/arena-context";
import { BattleResetEffects } from "@/context/battle-context";
import { useCombat } from "@/context/combat-context";
import { usePlayer } from "@/context/player-context";
import { useViewport } from "@/context/viewport-context";
import { VehicleProvider } from "@/context/vehicle-context";

// features
import { PlayerCamera } from "@/feature/camera";
import { DroneRoamController } from "@/feature/camera/components/drone-roam-controller";
import { DamageWarningBridge } from "@/feature/combat/components/damage-warning-bridge";
import { FireDesignationMarker } from "@/feature/combat/components/fire-designation-marker";
import { EnemyMarkerUpdater } from "@/feature/combat/components/enemy-marker";
import { VehicleCollisionSystem } from "@/feature/combat/components/vehicle-collision-system";
import { WreckMarkers } from "@/feature/combat/components/wreck-markers";
import { WreckPickupSystem } from "@/feature/combat/components/wreck-pickup-system";
import { KeyboardNavigator } from "@/feature/controls/components/keyboard-navigator";
import { PlayerController } from "@/feature/controls/components/player-controller";
import { CutsceneSoldiers } from "@/feature/mission-flow/components/cutscene-soldiers";
import { FlowCameraController } from "@/feature/mission-flow/components/flow-camera-controller";
import { MissionObjectiveMarker } from "@/feature/missions/components/mission-objective-marker";
import { MissionPositionBridge } from "@/feature/missions/components/mission-position-bridge";
import { AllyVehicles } from "@/feature/vehciles/components/ally-vehicles";
import { OpponentVehicles } from "@/feature/vehciles/components/opponent-vehicles";
import { Vehicle } from "@/feature/vehciles/components/vehicle";
import { PlayerWeapon } from "@/feature/weapons/components/player-weapon";
import { ProjectileSystemLayer } from "@/feature/weapons/components/projectile-system-layer";

// hooks
import { useWreckVisual } from "@/feature/vehciles/hooks/use-wreck-visual";

export function SceneContent() {
  const vehicleRef = useRef<THREE.Group | null>(null);
  const { isMobile } = useViewport();
  const arena = useArena();
  const { health } = useCombat();
  const {
    playerPartHealth,
    playerMotion,
    playerBody,
    playerVehicle,
    playerWeapon,
    playerModel,
    aimTargetRef,
    aimAlignedRef,
    celebrationRef,
    recoilRef,
    muzzleRef,
    destroyed,
  } = usePlayer();
  const wrecked = useWreckVisual(destroyed);

  return (
    <>
      <MissionPositionBridge />
      <MissionObjectiveMarker />
      <BattleResetEffects />
      <PlayerUnit />
      <PositionTracker />
      <ProjectileSystemLayer />
      <DamageWarningBridge />
      <VehicleCollisionSystem />
      <WreckPickupSystem />
      <WreckMarkers />
      <FireDesignationMarker />
      <OpponentVehicles />
      <AllyVehicles />
      <PlayerPresenter vehicleRef={vehicleRef} />
      <VehicleProvider
        value={{
          unitId: COMBAT_CONFIG.PLAYER_ID,
          team: "ally",
          palette: PLAYER_PALETTE,
          model: playerModel,
          platform: playerVehicle.id,
          weapon: playerWeapon,
          health:
            health[COMBAT_CONFIG.PLAYER_ID] ?? COMBAT_CONFIG.PLAYER_MAX_HEALTH,
          maxHealth: COMBAT_CONFIG.PLAYER_MAX_HEALTH,
          partHealth: playerPartHealth,
          wrecked,
          destructionActive: destroyed,
          vehicleRef,
          muzzleRef,
          aimTargetRef,
          aimAlignedRef,
          celebrationRef,
          recoilRef,
          motionRef: playerMotion,
        }}
      >
        <Vehicle
          position={[
            arena.playerSpawn[0],
            arena.terrain.getVehicleHeight(
              arena.playerSpawn[0],
              arena.playerSpawn[1],
            ),
            arena.playerSpawn[1],
          ]}
          rotationY={arena.playerHeading}
          showHealthBar={false}
        />
      </VehicleProvider>
      <PlayerCamera />
      <DroneRoamController />
      <CutsceneSoldiers />
      <FlowCameraController />
      {!isMobile && <KeyboardNavigator />}
      <PlayerController />
      <PlayerWeapon />
      <ReticleUpdater />
      <EnemyMarkerUpdater />
    </>
  );
}
