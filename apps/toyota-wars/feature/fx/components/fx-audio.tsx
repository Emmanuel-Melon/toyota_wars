// components/plains/three/fx/fx-audio.tsx
"use client";

import { useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { ProceduralGunshot } from "@/lib/audio/audio.gunshot";
import { ProceduralAudio } from "@/lib/audio/audio.procedural";
import { usePlayer } from "@/context/player-context";
import { useFxEvent } from "@/context/fx-context";

export function FxAudio() {
  const { playerBody, paused, destroyed, vehicleHalted } = usePlayer();

  useEffect(() => () => ProceduralAudio.stopVehicleAudio(), []);

  useFrame(() => {
    if (paused || destroyed || vehicleHalted) {
      ProceduralAudio.stopVehicleAudio();
      return;
    }

    const speed = Math.abs(playerBody.speed);
    if (speed <= 0.5) {
      ProceduralAudio.stopVehicleAudio();
      return;
    }

    ProceduralAudio.startVehicleAudio();
    ProceduralAudio.setVehicleAudioSpeed(speed);
  });

  useFxEvent("shot", (e) => {
    if (e.source === "player") {
      ProceduralGunshot.play(e.weapon);
    }
  });
  useFxEvent("explosion", () => ProceduralAudio.playExplosion());
  useFxEvent("vehicleDestroyed", () => ProceduralAudio.playVehicleExplosion());
  useFxEvent("impact", ({ part }) => {
    if (part !== "ground" && part !== "rock") {
      ProceduralAudio.playBulletImpact();
    }
  });
  useFxEvent("whizz", ({ point }) =>
    ProceduralAudio.playBulletWhizz((point.x - playerBody.position.x) / 8),
  );
  useFxEvent("obstacleHit", () => ProceduralAudio.playRockImpact());
  return null;
}
