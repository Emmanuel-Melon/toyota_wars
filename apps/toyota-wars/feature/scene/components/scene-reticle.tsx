"use client";

import { useThree } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import { useGameFrame } from "@/render-loop";
import {
  projectWorldToScreen,
  type ScreenPosition,
} from "@/lib/combat/combat.hud";
import { usePlayer } from "@/context/player-context";
import { useAimControls } from "@/hooks/use-aim-controls";
import { cn } from "@/lib/utils";
import { EnemyMarkerLayer } from "../../combat/components/enemy-marker";
import styles from "./scene-reticle.module.css";

let reticleElement: HTMLDivElement | null = null;
const screenPosition: ScreenPosition = { x: 0, y: 0, visible: false };

export function SceneReticle({
  containerRef,
}: {
  containerRef: RefObject<HTMLElement | null>;
}) {
  const { aimRef, aimMode } = usePlayer();
  const reticleRef = useRef<HTMLDivElement>(null);
  useAimControls(aimRef, containerRef);
  return (
    <>
      <div
        ref={(element) => {
          reticleRef.current = element;
          reticleElement = element;
        }}
        className={cn(styles.reticle, aimMode === "auto" && styles.locked)}
        aria-hidden="true"
      />
      <EnemyMarkerLayer />
    </>
  );
}

export function ReticleUpdater() {
  const { camera, size } = useThree();
  const { aimTargetRef, destroyed } = usePlayer();

  useGameFrame(() => {
    const element = reticleElement;
    const aimTarget = aimTargetRef.current;
    if (!element) return;

    if (destroyed || !aimTarget) {
      element.style.display = "none";
      return;
    }

    camera.updateMatrixWorld();
    projectWorldToScreen(
      aimTarget,
      camera,
      size.width,
      size.height,
      screenPosition,
    );

    const margin = 16;
    const onScreen =
      screenPosition.visible &&
      screenPosition.x >= -margin &&
      screenPosition.x <= size.width + margin &&
      screenPosition.y >= -margin &&
      screenPosition.y <= size.height + margin;

    if (!onScreen) {
      element.style.display = "none";
      return;
    }

    element.style.display = "block";
    element.style.left = `${screenPosition.x}px`;
    element.style.top = `${screenPosition.y}px`;
  }, "reticles");

  return null;
}
