// apps/toyota-wars/feature/effects/quarks-provider.tsx
"use client";

import { useThree } from "@react-three/fiber";
import { BatchedRenderer, type ParticleSystem } from "three.quarks";
import { useGameFrame } from "@/render-loop";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type DependencyList,
  type ReactNode,
} from "react";

const QuarksContext = createContext<BatchedRenderer | null>(null);

export function useQuarksBatch() {
  return useContext(QuarksContext);
}

export function useQuarksSystem(
  factory: () => ParticleSystem | null,
  deps: DependencyList = [],
) {
  const renderer = useQuarksBatch();
  const system = useMemo(() => {
    const created = factory();
    created?.stop();
    return created;
  }, [renderer, ...deps]);

  useEffect(() => {
    if (!system || !renderer) return;
    renderer.addSystem(system);
    if (!system.emitter.parent) renderer.add(system.emitter);
    return () => {
      system.dispose();
      renderer.deleteSystem(system);
    };
  }, [renderer, system]);

  return system;
}

export function useQuarksSystemPool(
  size: number,
  factory: (index: number) => ParticleSystem,
  deps: DependencyList = [],
) {
  const renderer = useQuarksBatch();
  const systems = useMemo(
    () =>
      Array.from({ length: size }, (_, index) => {
        const created = factory(index);
        created.stop();
        return created;
      }),
    [renderer, size, ...deps],
  );

  useEffect(() => {
    if (!renderer) return;
    for (const system of systems) {
      renderer.addSystem(system);
      if (!system.emitter.parent) renderer.add(system.emitter);
    }
    return () => {
      for (const system of systems) {
        system.dispose();
        renderer.deleteSystem(system);
      }
    };
  }, [renderer, systems]);

  return systems;
}

export function QuarksProvider({
  children,
  paused = false,
}: {
  children: ReactNode;
  paused?: boolean;
}) {
  const batchRenderer = useMemo(() => new BatchedRenderer(), []);
  const scene = useThree((state) => state.scene);

  useGameFrame((_, delta) => {
    if (!paused) batchRenderer.update(delta);
  }, "vfx");

  useEffect(() => {
    scene.add(batchRenderer);
    return () => {
      for (const system of Array.from(
        batchRenderer.systemToBatchIndex.keys(),
      )) {
        batchRenderer.deleteSystem(system);
      }
      for (const batch of Array.from(batchRenderer.batches)) {
        batch.dispose();
      }
      batchRenderer.clear();
      scene.remove(batchRenderer);
    };
  }, [batchRenderer, scene]);

  return (
    <QuarksContext.Provider value={batchRenderer}>
      {children}
    </QuarksContext.Provider>
  );
}
