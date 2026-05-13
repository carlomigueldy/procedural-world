export const TILE_SIZE = 32;
export const CHUNK_SIZE = 32;
export const CHUNK_PIXELS = CHUNK_SIZE * TILE_SIZE;
export const VIEW_RADIUS = 3;
export let GAME_WIDTH = window.innerWidth;
export let GAME_HEIGHT = window.innerHeight;

export function setGameSize(width: number, height: number): void {
  GAME_WIDTH = width;
  GAME_HEIGHT = height;
}
export const PLAYER_SPEED = 200;

export const SEED = 42;

export const MINIMAP_TILE_SIZE = 1;
export const MINIMAP_MARGIN = 12;

export enum TileType {
  WATER_DEEP = 0,
  WATER_SHALLOW = 1,
  SAND = 2,
  GRASS = 3,
  FOREST = 4,
  STONE = 5,
  SNOW = 6,
}

export enum Biome {
  TUNDRA = 0,
  TAIGA = 1,
  ALPINE_MEADOW = 2,
  GRASSLAND = 3,
  TEMPERATE_FOREST = 4,
  RAINFOREST = 5,
  DESERT = 6,
  SAVANNA = 7,
  TROPICAL_RAINFOREST = 8,
}

export function getTileColor(tileType: TileType, biome: Biome): number {
  switch (tileType) {
    case TileType.WATER_DEEP:
      switch (biome) {
        case Biome.TUNDRA:
        case Biome.TAIGA:
        case Biome.ALPINE_MEADOW:
          return 0x142e4a;
        case Biome.TROPICAL_RAINFOREST:
          return 0x1a5a6c;
        default:
          return 0x1a3a5c;
      }
    case TileType.WATER_SHALLOW:
      switch (biome) {
        case Biome.TUNDRA:
        case Biome.TAIGA:
        case Biome.ALPINE_MEADOW:
          return 0x1a4a6a;
        case Biome.TROPICAL_RAINFOREST:
          return 0x2a8a9c;
        default:
          return 0x2a6a9c;
      }
    case TileType.SNOW:
      return 0xe8e8f0;
    case TileType.SAND:
      switch (biome) {
        case Biome.DESERT: return 0xe8d48a;
        case Biome.TUNDRA: return 0xa8a08a;
        case Biome.TAIGA: return 0x8a8a7a;
        default: return 0xd4b87a;
      }
    case TileType.STONE:
      switch (biome) {
        case Biome.DESERT: return 0x8a7a5a;
        case Biome.TUNDRA: return 0x5a5a6a;
        default: return 0x7a7a7a;
      }
    case TileType.GRASS:
    case TileType.FOREST:
    default:
      switch (biome) {
        case Biome.TUNDRA: return 0x7a8a5a;
        case Biome.TAIGA: return 0x2a4a2a;
        case Biome.ALPINE_MEADOW: return 0x5a7a4a;
        case Biome.GRASSLAND: return 0x8aaa5a;
        case Biome.TEMPERATE_FOREST: return 0x3a6a2f;
        case Biome.RAINFOREST: return 0x1a5a2f;
        case Biome.DESERT: return 0xccbb88;
        case Biome.SAVANNA: return 0x7a8a3a;
        case Biome.TROPICAL_RAINFOREST: return 0x0a4a1a;
      }
  }
}

export function lightenColor(color: number, amount: number): number {
  const r = Math.min(255, ((color >> 16) & 0xff) + Math.round((255 - ((color >> 16) & 0xff)) * amount));
  const g = Math.min(255, ((color >> 8) & 0xff) + Math.round((255 - ((color >> 8) & 0xff)) * amount));
  const b = Math.min(255, (color & 0xff) + Math.round((255 - (color & 0xff)) * amount));
  return (r << 16) | (g << 8) | b;
}

export function darkenColor(color: number, amount: number): number {
  const r = Math.round(((color >> 16) & 0xff) * (1 - amount));
  const g = Math.round(((color >> 8) & 0xff) * (1 - amount));
  const b = Math.round((color & 0xff) * (1 - amount));
  return (r << 16) | (g << 8) | b;
}

export enum StructureType {
  TREE = 0,
  PINE = 1,
  ROCK = 2,
  BUSH = 3,
}

export const TILE_COLORS: Record<TileType, number> = {
  [TileType.WATER_DEEP]: 0x1a3a5c,
  [TileType.WATER_SHALLOW]: 0x2a6a9c,
  [TileType.SAND]: 0xd4b87a,
  [TileType.GRASS]: 0x4a8c3f,
  [TileType.FOREST]: 0x2d5a27,
  [TileType.STONE]: 0x7a7a7a,
  [TileType.SNOW]: 0xe8e8f0,
};
