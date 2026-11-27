import * as THREE from "three";

/**
 * World-space canvas: wheels draw dark strokes into it,
 * the terrain material samples it to darken the ground.
 * Old tracks slowly fade via destination-out fills.
 */
export class TrackSystem {
  readonly texture: THREE.CanvasTexture;
  private ctx: CanvasRenderingContext2D;
  private last = new Map<string, { x: number; z: number }>();
  private scale: number;
  private fadeTimer = 0;

  constructor(
    private minX: number,
    private minZ: number,
    private span: number,
    private resolution = 2048,
    private halfWidth = 0.35, // wheel track half width in world units
  ) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = resolution;
    this.ctx = canvas.getContext("2d")!;
    this.scale = resolution / span;
    this.texture = new THREE.CanvasTexture(canvas);
    this.texture.wrapS = this.texture.wrapT = THREE.ClampToEdgeWrapping;
  }

  recordWheels(
    points: { id: string; x: number; z: number }[],
    intensity = 1,
  ) {
    const ctx = this.ctx;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = Math.max(2, this.halfWidth * 2 * this.scale);
    ctx.strokeStyle = `rgba(0,0,0,${0.4 * intensity})`;

    for (const p of points) {
      const last = this.last.get(p.id);
      this.last.set(p.id, { x: p.x, z: p.z });
      if (!last) continue;
      const dx = p.x - last.x, dz = p.z - last.z;
      if (dx * dx + dz * dz < 0.001) continue; // skip sub-centimeter jitter
      ctx.beginPath();
      ctx.moveTo(
        (last.x - this.minX) * this.scale,
        (last.z - this.minZ) * this.scale,
      );
      ctx.lineTo(
        (p.x - this.minX) * this.scale,
        (p.z - this.minZ) * this.scale,
      );
      ctx.stroke();
    }
    this.texture.needsUpdate = true;
  }

  update(dt: number) {
    this.fadeTimer += dt;
    if (this.fadeTimer < 2) return;
    this.fadeTimer = 0;
    this.ctx.globalCompositeOperation = "destination-out";
    this.ctx.fillStyle = "rgba(0,0,0,0.04)"; // ~fade out over a couple of minutes
    this.ctx.fillRect(0, 0, this.texture.image.width as number, this.texture.image.height as number);
    this.ctx.globalCompositeOperation = "source-over";
    this.texture.needsUpdate = true;
  }
}