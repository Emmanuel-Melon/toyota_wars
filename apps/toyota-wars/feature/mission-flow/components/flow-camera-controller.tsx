// apps/toyota-wars/feature/mission-flow/components/flow-camera-controller.tsx
"use client";

import { useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useArena } from "@/context/arena-context";
import { usePlayer } from "@/context/player-context";
import { useGameFrame } from "@/render-loop";
import { useMissionFlowRunner } from "../mission-flow.context";

function easeInOut(value: number) {
  return value < 0.5 ? 2 * value * value : 1 - Math.pow(-2 * value + 2, 2) / 2;
}

export function FlowCameraController() {
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera;
  const arena = useArena();
  const { playerBody } = usePlayer();
  const runner = useMissionFlowRunner();
  const fromPosition = useRef(new THREE.Vector3());
  const toPosition = useRef(new THREE.Vector3());
  const fromTarget = useRef(new THREE.Vector3());
  const toTarget = useRef(new THREE.Vector3());
  const target = useRef(new THREE.Vector3());

  useGameFrame((_, delta) => {
    const runtime = runner.getRuntime();
    if (runtime.camera !== "scripted") return;

    const step = runner.getCurrentStep();
    if (!step) return;

    const position = playerBody.position;
    const shot = step.camera({
      playerPosition: {
        x: position.x,
        y: position.y,
        z: position.z,
      },
      playerHeading: playerBody.heading,
      terrainHeight: (x, z) => arena.terrain.getVehicleHeight(x, z),
    });

    const progress = Math.min(
      Math.max(runtime.elapsedMs / Math.max(1, step.durationMs), 0),
      1,
    );
    const eased = easeInOut(progress);

    fromPosition.current.set(...shot.from.position);
    toPosition.current.set(...shot.to.position);
    fromTarget.current.set(...shot.from.target);
    toTarget.current.set(...shot.to.target);

    camera.position.copy(fromPosition.current).lerp(toPosition.current, eased);
    target.current.copy(fromTarget.current).lerp(toTarget.current, eased);
    camera.lookAt(target.current);

    const fromFov = shot.from.fov ?? 55;
    const toFov = shot.to.fov ?? fromFov;
    const fov = THREE.MathUtils.lerp(fromFov, toFov, eased);
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  }, "camera");

  return null;
}
