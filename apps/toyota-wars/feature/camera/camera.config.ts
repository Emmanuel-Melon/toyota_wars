// apps/toyota-wars/feature/camera/camera.config.ts
export const PLAYER_CAMERA_CONFIG = {
  offset: [0, 5.5, -9] as [number, number, number],
  lookAhead: 6,
  lookHeight: 1.2,
  positionDamping: 8,
  targetDamping: 10,
  fovDamping: 8,
  fov: 58,
  near: 1,
  far: 3200,
  terrainClearance: 1.5,
} as const;

export const WORLD_FOG_CONFIG = {
  near: 150,
  far: 2400,
} as const;

export const DRONE_CAMERA_CONFIG = {
  offset: [0, 30, -12] as [number, number, number],
  lookAhead: 4,
  lookHeight: 0,
  fov: 62,
  terrainClearance: 3,
} as const;

export const DRONE_ROAM_CONFIG = {
  initialAltitude: 80,
  minAltitude: 30,
  maxAltitude: 800,
  moveSpeed: 200,
  altitudeSpeed: 120,
  edgeMargin: 16,
  lookAhead: 120,
  lookHeight: 1,
  fov: 68,
} as const;

export const PLAYER_CAMERA_DAMAGE = {
  offsetPenalty: 0.28,
  fovPenalty: 0.18,
} as const;

export const PORTRAIT_CAMERA_FRAMING = {
  chaseDistance: 1.7,
  chaseHeight: 1.1,
  chaseLookAhead: 0.8,
  chaseFov: 1.12,
  droneDistance: 1.3,
  droneHeight: 1.05,
  droneLookAhead: 0.85,
  droneFov: 1.08,
} as const;

export const MOBILE_CAMERA_LOOK_CONFIG = {
  deadzonePx: 5,
  yawSensitivity: 0.0045,
  pitchSensitivity: 0.0035,
  yawDamping: 12,
  pitchDamping: 12,
  recenterDelay: 1.75,
  recenterYawDamping: 1.1,
  recenterPitchDamping: 1.1,
  minPitch: (10 * Math.PI) / 180,
  maxPitch: (65 * Math.PI) / 180,
  forwardSpeed: 0.5,
  forwardThrottle: 0.1,
} as const;
