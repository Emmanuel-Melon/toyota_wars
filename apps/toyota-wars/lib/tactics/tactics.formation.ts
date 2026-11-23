// toyota-wars/lib/tactics/tactics.formation.ts
export type FormationType = "column" | "wedge" | "line";

export function getFormationOffset(
  index: number,
  type: FormationType,
  spacing = 8,
): [number, number] {
  if (index === 0) return [0, 0];

  let right = 0;
  let forward = 0;

  switch (type) {
    case "column":
      forward = -index * spacing;
      break;
    case "wedge": {
      const side = index % 2 === 0 ? 1 : -1;
      const row = Math.ceil(index / 2);
      forward = -row * spacing;
      right = side * row * spacing * 0.75;
      break;
    }
    case "line":
      right = (index % 2 === 0 ? 1 : -1) * Math.ceil(index / 2) * spacing;
      break;
  }

  return [right, forward];
}
