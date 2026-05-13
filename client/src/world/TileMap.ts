import { TileType, CHUNK_SIZE } from '../config/constants';

export interface ChunkData {
  x: number;
  y: number;
  tiles: TileType[][];
}

export function createEmptyChunkData(x: number, y: number): ChunkData {
  const tiles: TileType[][] = [];
  for (let i = 0; i < CHUNK_SIZE; i++) {
    tiles.push(new Array(CHUNK_SIZE).fill(TileType.GRASS));
  }
  return { x, y, tiles };
}
