import type { RefObject } from "react";

type Props = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
};

export function MinimapCanvas({ canvasRef }: Props) {
  return <canvas ref={canvasRef} className="block h-full w-full" />;
}
