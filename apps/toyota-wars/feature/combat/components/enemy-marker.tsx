"use client";

import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useGameFrame } from "@/render-loop";
import { useBattle } from "@/context/battle-context";
import { usePlayer } from "@/context/player-context";
import { useTargets } from "@/context/targets-context";
import {
  projectWorldToScreen,
  type ScreenPosition,
} from "@/lib/combat/combat.hud";
import styles from "./enemy-marker.module.css";

const ENEMY_MARKER_HEIGHT = 3.2;
const OFFSCREEN_MARGIN = 16;

const enemyMarkerElements = new Map<string, HTMLDivElement>();
const markerPosition = new THREE.Vector3();
const screenPosition: ScreenPosition = { x: 0, y: 0, visible: false };

export function EnemyMarkerLayer() {
  const { enemies } = useTargets();

  return (
    <div className={styles.layer} aria-hidden="true">
      {enemies.map((enemy) => (
        <div
          key={enemy.id}
          ref={(element) => {
            if (element) enemyMarkerElements.set(enemy.id, element);
            else enemyMarkerElements.delete(enemy.id);
          }}
          className={styles.marker}
        />
      ))}
    </div>
  );
}

export function EnemyMarkerUpdater() {
  const { camera, size } = useThree();
  const { destroyed } = usePlayer();
  const { enemies } = useTargets();
  const { registry } = useBattle();

  useGameFrame(() => {
    if (destroyed) {
      enemyMarkerElements.forEach((element) => {
        element.style.display = "none";
      });
      return;
    }

    camera.updateMatrixWorld();

    for (const enemy of enemies) {
      const element = enemyMarkerElements.get(enemy.id);
      if (!element) continue;

      const unit = registry.get(enemy.id);
      if (!unit) {
        element.style.display = "none";
        continue;
      }

      markerPosition.set(
        enemy.position[0],
        enemy.position[1] + ENEMY_MARKER_HEIGHT,
        enemy.position[2],
      );
      projectWorldToScreen(
        markerPosition,
        camera,
        size.width,
        size.height,
        screenPosition,
      );

      const onScreen =
        screenPosition.visible &&
        screenPosition.x >= -OFFSCREEN_MARGIN &&
        screenPosition.x <= size.width + OFFSCREEN_MARGIN &&
        screenPosition.y >= -OFFSCREEN_MARGIN &&
        screenPosition.y <= size.height + OFFSCREEN_MARGIN;

      if (!onScreen) {
        element.style.display = "none";
        continue;
      }

      element.style.display = "block";
      element.style.transform = `translate(${screenPosition.x}px, ${screenPosition.y}px) translate(-50%, -50%)`;
    }
  }, "reticles");

  return null;
}
