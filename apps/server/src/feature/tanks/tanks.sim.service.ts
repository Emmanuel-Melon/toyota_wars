// src/modules/tanks/tanks.sim.service.ts
import { BTNode } from "@/lib/behavior-tree/behavior-tree.core";
import { buildUtilityTankTree } from "./tanks.builder";
import type { TankContext } from "./tanks.types";

interface ActiveTank {
  id: string;
  context: TankContext;
  tree: BTNode<TankContext>;
}

class TankSimulationService {
  private tanks = new Map<string, ActiveTank>();
  private intervalId: NodeJS.Timeout | null = null;
  private readonly TICK_RATE_MS = 50; // 20 ticks per second (dt = 0.05)
  private readonly DT = 0.05;

  /** Spawn or register a tank into the server simulation */
  public spawnTank(id: string, initialContext: TankContext) {
    const tree = buildUtilityTankTree(id);
    this.tanks.set(id, {
      id,
      context: initialContext,
      tree,
    });
  }

  /** Remove a tank when destroyed or out of bounds */
  public removeTank(id: string) {
    this.tanks.delete(id);
  }

  /** Start the authoritative server loop */
  public startSimulation() {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      this.tick();
    }, this.TICK_RATE_MS);

    console.log("[TankSim] Simulation loop started at 20Hz.");
  }

  public stopSimulation() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /** Main tick execution */
  private tick() {
    for (const [id, tank] of this.tanks.entries()) {
      // 1. Update context timers, scan for nearby targets in the world state
      tank.context.dt = this.DT;
      tank.context.time += this.DT;

      // 2. Evaluate the Behavior Tree / Utility Selector
      tank.tree.evaluate(tank.context);

      // 3. Execute resulting movement/actions (updates position, velocity, rotation)
      this.applyPhysics(tank.context);
    }

    // Optional: Broadcast state updates to clients via WebSockets here
  }

  private applyPhysics(context: TankContext) {
    // Example basic movement integration on the server
    if (context.velocity && context.position) {
      context.position.x += context.velocity.x * context.dt;
      context.position.y += context.velocity.y * context.dt;
    }
  }
}

export const tankSimService = new TankSimulationService();