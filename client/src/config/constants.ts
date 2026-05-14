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

export const CAMERA_ZOOM_MIN = 0.5;
export const CAMERA_ZOOM_MAX = 5;
export const CAMERA_ZOOM_DEFAULT = 3;
export const CAMERA_ZOOM_STEP = 0.25;

export const SEED = 42;

export const MINIMAP_TILE_SIZE = 1;
export const MINIMAP_MARGIN = 12;

export const ROAD_CELL_SIZE = 4;
export const ROAD_WIDTH = 2;
export const ROAD_COLOR = 0x8a7a6a;
export const MAX_BUILDINGS_PER_CHUNK = 6;
export const BUILDING_MIN_DISTANCE = 200;
export const BUILDING_ROAD_PROXIMITY = 150;

export enum BuildingType {
  HOUSE = 0,
  FARM = 1,
  TAVERN = 2,
  SHRINE = 3,
  WATCHTOWER = 4,
}

export const BUILDING_COLORS: Record<BuildingType, { base: number; roof: number }> = {
  [BuildingType.HOUSE]: { base: 0x8a7a5a, roof: 0x6a4a3a },
  [BuildingType.FARM]: { base: 0x7a6a4a, roof: 0x5a4a3a },
  [BuildingType.TAVERN]: { base: 0x9a6a4a, roof: 0x5a3a2a },
  [BuildingType.SHRINE]: { base: 0x9a9a8a, roof: 0x6a6a5a },
  [BuildingType.WATCHTOWER]: { base: 0x7a7a7a, roof: 0x5a3a2a },
};

export const BUILDING_FOOTPRINTS: Record<BuildingType, { width: number; height: number }> = {
  [BuildingType.HOUSE]: { width: 2, height: 2 },
  [BuildingType.FARM]: { width: 4, height: 3 },
  [BuildingType.TAVERN]: { width: 3, height: 3 },
  [BuildingType.SHRINE]: { width: 2, height: 2 },
  [BuildingType.WATCHTOWER]: { width: 2, height: 2 },
};

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

export function lerpColor(a: number, b: number, t: number): number {
  const ar = (a >> 16) & 0xff;
  const ag = (a >> 8) & 0xff;
  const ab = a & 0xff;
  const br = (b >> 16) & 0xff;
  const bg = (b >> 8) & 0xff;
  const bb = b & 0xff;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return (r << 16) | (g << 8) | bl;
}

export function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

export function getSmoothTileColor(elevation: number, biome: Biome): number {
  const stops: { pos: number; type: TileType }[] = [
    { pos: 0.00, type: TileType.WATER_DEEP },
    { pos: 0.45, type: TileType.WATER_DEEP },
    { pos: 0.49, type: TileType.WATER_SHALLOW },
    { pos: 0.53, type: TileType.WATER_SHALLOW },
    { pos: 0.56, type: TileType.SAND },
    { pos: 0.59, type: TileType.SAND },
    { pos: 0.645, type: TileType.GRASS },
    { pos: 0.70, type: TileType.GRASS },
    { pos: 0.765, type: TileType.FOREST },
    { pos: 0.83, type: TileType.FOREST },
    { pos: 0.875, type: TileType.STONE },
    { pos: 0.92, type: TileType.STONE },
    { pos: 1.00, type: TileType.SNOW },
  ];

  for (let i = 0; i < stops.length - 1; i++) {
    if (elevation >= stops[i].pos && elevation <= stops[i + 1].pos) {
      if (stops[i].type === stops[i + 1].type) {
        return getTileColor(stops[i].type, biome);
      }
      const range = stops[i + 1].pos - stops[i].pos;
      if (range === 0) return getTileColor(stops[i].type, biome);
      const t = (elevation - stops[i].pos) / range;
      return lerpColor(
        getTileColor(stops[i].type, biome),
        getTileColor(stops[i + 1].type, biome),
        smoothstep(t),
      );
    }
  }

  return getTileColor(TileType.SNOW, biome);
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
