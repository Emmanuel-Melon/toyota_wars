export const FORWARD_KEYS = ["w", "arrowup"] as const;
export const BACKWARD_KEYS = ["s", "arrowdown"] as const;
export const LEFT_KEYS = ["a", "arrowleft"] as const;
export const RIGHT_KEYS = ["d", "arrowright"] as const;
export const DRIVE_KEYS = [
  ...FORWARD_KEYS,
  ...BACKWARD_KEYS,
  ...LEFT_KEYS,
  ...RIGHT_KEYS,
] as const;
export const FIRE_KEY_CODE = "Space";
