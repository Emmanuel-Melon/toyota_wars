"use client";

import { Canvas } from "@react-three/fiber";
import { usePlayer } from "@/context/player-context";
import { useViewport } from "@/context/viewport-context";
import { useMissionSession } from "@/feature/missions/components/mission-session";
import { SceneContent } from "@/feature/scene/components/scene";
import { SceneProviders } from "@/feature/scene/scene-providers";

export function Render({ onSceneReady }: { onSceneReady: () => void }) {
  const { runner } = useMissionSession();
  const { paused } = usePlayer();
  const { isMobile } = useViewport();

  return (
    <div
      className="absolute inset-0 cursor-none touch-none [&_canvas]:block [&_canvas]:touch-none"
      aria-label="A quiet procedural Kordofan-inspired plain"
    >
      <Canvas shadows dpr={isMobile ? [1, 1.25] : [1, 1.5]}>
        <SceneProviders runner={runner} paused={paused} onReady={onSceneReady}>
          <SceneContent />
        </SceneProviders>
      </Canvas>
    </div>
  );
}
