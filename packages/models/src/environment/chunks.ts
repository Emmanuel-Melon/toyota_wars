export type ChunkCoord = {
  x: number;
  z: number;
};

export function worldToChunk(
  x: number,
  z: number,
  chunkSize: number,
): ChunkCoord {
  return {
    x: Math.floor((x + chunkSize / 2) / chunkSize),
    z: Math.floor((z + chunkSize / 2) / chunkSize),
  };
}

export function chunkKey(x: number, z: number): string {
  return `${x},${z}`;
}

export function parseChunkKey(key: string): ChunkCoord {
  const [x, z] = key.split(",").map(Number);
  return { x, z };
}

export function chunksAround(
  centerX: number,
  centerZ: number,
  renderRadius: number,
): string[] {
  const chunks: string[] = [];
  for (let dx = -renderRadius; dx <= renderRadius; dx++) {
    for (let dz = -renderRadius; dz <= renderRadius; dz++) {
      chunks.push(chunkKey(centerX + dx, centerZ + dz));
    }
  }
  return chunks;
}

export function chunksInBounds(bound: number, chunkSize: number): string[] {
  const min = worldToChunk(-bound, -bound, chunkSize);
  const max = worldToChunk(bound, bound, chunkSize);
  const chunks: string[] = [];
  for (let x = min.x; x <= max.x; x++) {
    for (let z = min.z; z <= max.z; z++) {
      chunks.push(chunkKey(x, z));
    }
  }
  return chunks;
}
