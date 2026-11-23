import {
  FIRE_KEY_CODE,
  FORWARD_KEYS,
} from "@/feature/controls/keyboard-bindings";
import {
  ATTACK_KEY,
  DESIGNATION_KEYS,
  FORMATION_KEYS,
} from "@/feature/game/shortcut-bindings";

export type TutorialKey = {
  label: string;
  matches: (event: KeyboardEvent) => boolean;
};

export type TutorialStep = {
  id: "move" | "fire" | "command" | "formation";
  title: string;
  detail: string;
  keys: readonly TutorialKey[];
};

export type TutorialCapabilities = {
  forwardOnly: boolean;
  canFire: boolean;
  canCommand: boolean;
  canFormation: boolean;
};

export const TUTORIAL_STEP_MOVE = 0;
export const TUTORIAL_STEP_FIRE = 1;
export const TUTORIAL_STEP_COMMAND = 2;
export const TUTORIAL_STEP_FORMATION = 3;
export const TUTORIAL_SHOTS_REQUIRED = 3;
export const TUTORIAL_ADVANCE_DELAY_MS = 350;

const keyOf = (event: KeyboardEvent) => event.key.toLowerCase();

export const TUTORIAL_STEPS: readonly TutorialStep[] = [
  {
    id: "move",
    title: "Move forward",
    detail: "Press W or the up arrow to drive toward the training area.",
    keys: [
      { label: "W", matches: (event) => keyOf(event) === FORWARD_KEYS[0] },
      { label: "↑", matches: (event) => keyOf(event) === FORWARD_KEYS[1] },
    ],
  },
  {
    id: "fire",
    title: "Fire your weapon",
    detail: "Hold Space to fire three shots at the training targets.",
    keys: [
      { label: "SPACE", matches: (event) => event.code === FIRE_KEY_CODE },
    ],
  },
  {
    id: "command",
    title: "Command your squad",
    detail:
      "Press Z to attack, or F/G/T to designate a target for a weapon group.",
    keys: [
      { label: "Z", matches: (event) => keyOf(event) === ATTACK_KEY },
      ...["F", "G", "T"].map((label) => ({
        label,
        matches: (event: KeyboardEvent) =>
          Boolean(DESIGNATION_KEYS[label.toLowerCase()]) &&
          keyOf(event) === label.toLowerCase(),
      })),
    ],
  },
  {
    id: "formation",
    title: "Change formation",
    detail: "Press 1, 2, or 3 to switch your allies between formations.",
    keys: ["1", "2", "3"].map((label) => ({
      label,
      matches: (event: KeyboardEvent) =>
        Boolean(FORMATION_KEYS[label]) && keyOf(event) === label,
    })),
  },
];

export const TUTORIAL_STEP_COUNT = TUTORIAL_STEPS.length;

export const UNRESTRICTED_CAPABILITIES: TutorialCapabilities = {
  forwardOnly: false,
  canFire: true,
  canCommand: true,
  canFormation: true,
};

const STEP_CAPABILITIES: readonly TutorialCapabilities[] = [
  {
    forwardOnly: true,
    canFire: false,
    canCommand: false,
    canFormation: false,
  },
  {
    forwardOnly: true,
    canFire: true,
    canCommand: false,
    canFormation: false,
  },
  {
    forwardOnly: false,
    canFire: true,
    canCommand: true,
    canFormation: false,
  },
  UNRESTRICTED_CAPABILITIES,
];

export function getTutorialCapabilities(step: number): TutorialCapabilities {
  return STEP_CAPABILITIES[step] ?? UNRESTRICTED_CAPABILITIES;
}
