import { TileType, CHUNK_SIZE, BuildingType } from '../config/constants';

export interface RoadSegment {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface Building {
  id: string;
  type: BuildingType;
  x: number;
  y: number;
  rotation: 0 | 90 | 180 | 270;
  footprint: { width: number; height: number };
}

export interface ChunkData {
  x: number;
  y: number;
  tiles: TileType[][];
  roads: RoadSegment[];
  buildings: Building[];
}

export function createEmptyChunkData(x: number, y: number): ChunkData {
  const tiles: TileType[][] = [];
  for (let i = 0; i < CHUNK_SIZE; i++) {
    tiles.push(new Array(CHUNK_SIZE).fill(TileType.GRASS));
  }
  return { x, y, tiles, roads: [], buildings: [] };
}
