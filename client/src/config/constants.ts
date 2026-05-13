export const TILE_SIZE = 32;
export const CHUNK_SIZE = 16;
export const CHUNK_PIXELS = CHUNK_SIZE * TILE_SIZE;
export const VIEW_RADIUS = 3;
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;
export const PLAYER_SPEED = 200;

export const SEED = 42;

export enum TileType {
  WATER_DEEP = 0,
  WATER_SHALLOW = 1,
  SAND = 2,
  GRASS = 3,
  FOREST = 4,
  STONE = 5,
  SNOW = 6,
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
