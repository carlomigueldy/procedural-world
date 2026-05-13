import { createNoise2D, NoiseFunction2D } from 'simplex-noise';
import { CHUNK_SIZE, TileType } from '../config/constants';

function seededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return (s >>> 0) / 0x100000000;
  };
}

export class TerrainGenerator {
  private noise2D: NoiseFunction2D;

  constructor(seed: number) {
    this.noise2D = createNoise2D(seededRandom(seed));
  }

  private normalize(value: number): number {
    return (value + 1) / 2;
  }

  private getElevation(worldX: number, worldY: number): number {
    const scale1 = 0.03;
    const scale2 = 0.06;
    const scale3 = 0.015;

    const e1 = this.normalize(this.noise2D(worldX * scale1, worldY * scale1)) * 0.6;
    const e2 = this.normalize(this.noise2D(worldX * scale2, worldY * scale2)) * 0.3;
    const e3 = this.normalize(this.noise2D(worldX * scale3, worldY * scale3)) * 0.1;

    return Math.min(1, Math.max(0, e1 + e2 + e3));
  }

  getTileType(worldX: number, worldY: number): TileType {
    const elevation = this.getElevation(worldX, worldY);

    if (elevation < 0.25) return TileType.WATER_DEEP;
    if (elevation < 0.35) return TileType.WATER_SHALLOW;
    if (elevation < 0.40) return TileType.SAND;
    if (elevation < 0.60) return TileType.GRASS;
    if (elevation < 0.75) return TileType.FOREST;
    if (elevation < 0.85) return TileType.STONE;
    return TileType.SNOW;
  }

  generateChunk(chunkX: number, chunkY: number): TileType[][] {
    const data: TileType[][] = [];
    for (let y = 0; y < CHUNK_SIZE; y++) {
      const row: TileType[] = [];
      for (let x = 0; x < CHUNK_SIZE; x++) {
        const worldX = chunkX * CHUNK_SIZE + x;
        const worldY = chunkY * CHUNK_SIZE + y;
        row.push(this.getTileType(worldX, worldY));
      }
      data.push(row);
    }
    return data;
  }
}
