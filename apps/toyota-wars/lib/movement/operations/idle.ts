// lib/movement/operations/idle.ts
import {
  IDLE_DRIVE,
  type MovementHandler,
  type MovementOrders,
} from "../movement.types";

export const handleIdle: MovementHandler<typeof MovementOrders.Idle> = () =>
  IDLE_DRIVE;
