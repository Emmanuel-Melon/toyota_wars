import type { RefObject } from "react";

type Props = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
};

export function MinimapCanvas({ canvasRef }: Props) {
  return (
    <canvas
      ref={canvasRef}
      className="mt-[9px] block aspect-square w-full rounded-[2px] border border-ui-secondary/30 bg-ui-panel/45 max-[919px]:mt-1.5"
    />
  );
}
