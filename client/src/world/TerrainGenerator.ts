import { createNoise2D, NoiseFunction2D } from 'simplex-noise';
import { Biome, CHUNK_SIZE, StructureType, TileType } from '../config/constants';

export interface StructurePlacement {
  tileX: number;
  tileY: number;
  type: StructureType;
  offsetX: number;
  offsetY: number;
}

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
    const scale1 = 0.004;
    const scale2 = 0.015;
    const scale3 = 0.040;

    const e1 = this.normalize(this.noise2D(worldX * scale1, worldY * scale1)) * 0.6;
    const e2 = this.normalize(this.noise2D(worldX * scale2, worldY * scale2)) * 0.3;
    const e3 = this.normalize(this.noise2D(worldX * scale3, worldY * scale3)) * 0.1;

    return Math.min(1, Math.max(0, e1 + e2 + e3));
  }

  private getHumidity(worldX: number, worldY: number): number {
    return this.normalize(this.noise2D(worldX * 0.008, worldY * 0.008));
  }

  private getTemperature(worldX: number, worldY: number): number {
    return this.normalize(this.noise2D(worldX * 0.006 + 1000, worldY * 0.006 + 1000));
  }

  getTileType(worldX: number, worldY: number): TileType {
    const elevation = this.getElevation(worldX, worldY);

    if (elevation < 0.45) return TileType.WATER_DEEP;
    if (elevation < 0.53) return TileType.WATER_SHALLOW;
    if (elevation < 0.59) return TileType.SAND;
    if (elevation < 0.70) return TileType.GRASS;
    if (elevation < 0.83) return TileType.FOREST;
    if (elevation < 0.92) return TileType.STONE;
    return TileType.SNOW;
  }

  getBiome(worldX: number, worldY: number): Biome {
    const humidity = this.getHumidity(worldX, worldY);
    const temperature = this.getTemperature(worldX, worldY);

    if (temperature < 0.33) {
      if (humidity < 0.33) return Biome.TUNDRA;
      if (humidity < 0.66) return Biome.TAIGA;
      return Biome.ALPINE_MEADOW;
    }

    if (temperature < 0.66) {
      if (humidity < 0.33) return Biome.GRASSLAND;
      if (humidity < 0.66) return Biome.TEMPERATE_FOREST;
      return Biome.RAINFOREST;
    }

    if (humidity < 0.33) return Biome.DESERT;
    if (humidity < 0.66) return Biome.SAVANNA;
    return Biome.TROPICAL_RAINFOREST;
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

  generateBiomeChunk(chunkX: number, chunkY: number): Biome[][] {
    const data: Biome[][] = [];
    for (let y = 0; y < CHUNK_SIZE; y++) {
      const row: Biome[] = [];
      for (let x = 0; x < CHUNK_SIZE; x++) {
        const worldX = chunkX * CHUNK_SIZE + x;
        const worldY = chunkY * CHUNK_SIZE + y;
        row.push(this.getBiome(worldX, worldY));
      }
      data.push(row);
    }
    return data;
  }

  generateStructures(
    chunkX: number,
    chunkY: number,
    tileTypes: TileType[][],
    biomes: Biome[][],
  ): StructurePlacement[] {
    const placements: StructurePlacement[] = [];

    for (let y = 0; y < CHUNK_SIZE; y++) {
      for (let x = 0; x < CHUNK_SIZE; x++) {
        const worldTileX = chunkX * CHUNK_SIZE + x;
        const worldTileY = chunkY * CHUNK_SIZE + y;
        const tileType = tileTypes[y][x];
        const biome = biomes[y][x];

        const h1 = this.placementHash(worldTileX, worldTileY, 1);
        const h2 = this.placementHash(worldTileX, worldTileY, 2);
        const offX = (this.placementHash(worldTileX, worldTileY, 3) - 0.5) * 8;
        const offY = (this.placementHash(worldTileX, worldTileY, 4) - 0.5) * 6;

        let type: StructureType | null = null;

        if (tileType === TileType.FOREST) {
          if (biome === Biome.TAIGA) {
            if (h1 > 0.55) type = StructureType.PINE;
          } else {
            if (h1 > 0.60) type = StructureType.TREE;
          }
        } else if (tileType === TileType.GRASS) {
          if (h1 > 0.88) {
            type = StructureType.TREE;
          } else if (h2 > 0.80) {
            type = StructureType.BUSH;
          }
        } else if (tileType === TileType.STONE) {
          if (h1 > 0.65) type = StructureType.ROCK;
        }

        if (type !== null) {
          placements.push({ tileX: x, tileY: y, type, offsetX: offX, offsetY: offY });
        }
      }
    }

    return placements;
  }

  private placementHash(tileX: number, tileY: number, seed: number): number {
    let h = (tileX * 374761393 + tileY * 668265263 + seed * 1274126177) | 0;
    h = ((h ^ (h >>> 13)) * 1274126177) | 0;
    h = (h ^ (h >>> 16)) | 0;
    return ((h & 0x7fffffff) / 0x7fffffff);
  }
}
