import {
  BUILDING_FOOTPRINTS,
  BUILDING_MIN_DISTANCE,
  BUILDING_ROAD_PROXIMITY,
  CHUNK_PIXELS,
  CHUNK_SIZE,
  MAX_BUILDINGS_PER_CHUNK,
  TILE_SIZE,
  BuildingType,
} from '../config/constants';
import { Building, RoadSegment } from './TileMap';
import { TerrainGenerator } from './TerrainGenerator';

function cellRandom(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  }
  h = ((h ^ (h >>> 13)) * 1274126177) | 0;
  h = (h ^ (h >>> 16)) | 0;
  return ((h & 0x7fffffff) / 0x7fffffff);
}

function cellRandomRange(seed: string, min: number, max: number): number {
  return min + cellRandom(seed) * (max - min);
}

function cellRandomInt(seed: string, min: number, max: number): number {
  return Math.floor(cellRandomRange(seed, min, max + 1));
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export class BuildingGenerator {
  private generator: TerrainGenerator;
  private seed: number;

  constructor(generator: TerrainGenerator, seed: number) {
    this.generator = generator;
    this.seed = seed;
  }

  generateBuildingsForChunk(
    chunkX: number,
    chunkY: number,
    roads: RoadSegment[],
  ): Building[] {
    const rngSeed = `${this.seed}_buildings_${chunkX}_${chunkY}`;
    const chunkMinX = chunkX * CHUNK_PIXELS;
    const chunkMaxX = chunkMinX + CHUNK_PIXELS;
    const chunkMinY = chunkY * CHUNK_PIXELS;
    const chunkMaxY = chunkMinY + CHUNK_PIXELS;

    const buildings: Building[] = [];

    // Extract waypoint positions from roads (unique endpoints near this chunk)
    const waypoints = new Map<string, { x: number; y: number }>();
    for (const seg of roads) {
      for (const pt of [seg.startX, seg.startY, seg.endX, seg.endY]) {
        // We can't easily reconstruct the point here, so instead we'll use the endpoints
      }
    }

    // Actually, let's collect unique endpoints from the roads
    const endpointMap = new Map<string, { x: number; y: number }>();
    for (const seg of roads) {
      const k1 = `${seg.startX.toFixed(0)},${seg.startY.toFixed(0)}`;
      const k2 = `${seg.endX.toFixed(0)},${seg.endY.toFixed(0)}`;
      endpointMap.set(k1, { x: seg.startX, y: seg.startY });
      endpointMap.set(k2, { x: seg.endX, y: seg.endY });
    }
    const uniqueWaypoints = Array.from(endpointMap.values());

    // 1. Town buildings near road waypoints
    for (const wp of uniqueWaypoints) {
      if (buildings.length >= MAX_BUILDINGS_PER_CHUNK) break;

      // Only place if waypoint is reasonably close to this chunk
      if (wp.x < chunkMinX - CHUNK_PIXELS || wp.x > chunkMaxX + CHUNK_PIXELS) continue;
      if (wp.y < chunkMinY - CHUNK_PIXELS || wp.y > chunkMaxY + CHUNK_PIXELS) continue;

      const chance = cellRandom(`${rngSeed}_town_${wp.x.toFixed(0)}_${wp.y.toFixed(0)}`);
      if (chance > 0.55) continue; // ~45% chance per waypoint

      const angle = cellRandomRange(`${rngSeed}_angle_${wp.x.toFixed(0)}_${wp.y.toFixed(0)}`, 0, Math.PI * 2);
      const dist = cellRandomRange(`${rngSeed}_dist_${wp.x.toFixed(0)}_${wp.y.toFixed(0)}`, 40, BUILDING_ROAD_PROXIMITY);
      const pos = {
        x: wp.x + Math.cos(angle) * dist,
        y: wp.y + Math.sin(angle) * dist,
      };

      if (pos.x < chunkMinX || pos.x >= chunkMaxX || pos.y < chunkMinY || pos.y >= chunkMaxY) continue;

      const type = this.pickTownBuildingType(`${rngSeed}_type_${wp.x.toFixed(0)}_${wp.y.toFixed(0)}`);
      const building = this.tryPlaceBuilding(pos, type, buildings, rngSeed);
      if (building) {
        buildings.push(building);
      }
    }

    // 2. Isolated buildings
    const isolatedCount = cellRandomInt(`${rngSeed}_isolated_count`, 0, 2);
    for (let i = 0; i < isolatedCount; i++) {
      if (buildings.length >= MAX_BUILDINGS_PER_CHUNK) break;

      const pos = {
        x: cellRandomRange(`${rngSeed}_iso_x_${i}`, chunkMinX + 50, chunkMaxX - 50),
        y: cellRandomRange(`${rngSeed}_iso_y_${i}`, chunkMinY + 50, chunkMaxY - 50),
      };

      // Must be far from roads
      let nearRoad = false;
      for (const wp of uniqueWaypoints) {
        if (distance(pos, wp) < BUILDING_ROAD_PROXIMITY * 2) {
          nearRoad = true;
          break;
        }
      }
      if (nearRoad) continue;

      const building = this.tryPlaceBuilding(pos, BuildingType.SHRINE, buildings, rngSeed);
      if (building) {
        buildings.push(building);
      }
    }

    return buildings;
  }

  private pickTownBuildingType(seed: string): BuildingType {
    const r = cellRandom(seed);
    if (r < 0.45) return BuildingType.HOUSE;
    if (r < 0.70) return BuildingType.FARM;
    if (r < 0.88) return BuildingType.TAVERN;
    return BuildingType.WATCHTOWER;
  }

  private tryPlaceBuilding(
    pos: { x: number; y: number },
    type: BuildingType,
    existing: Building[],
    rngSeed: string,
  ): Building | null {
    const tileX = Math.floor(pos.x / TILE_SIZE);
    const tileY = Math.floor(pos.y / TILE_SIZE);

    if (!this.generator.isSuitableForBuilding(tileX, tileY)) {
      return null;
    }

    for (const b of existing) {
      if (distance(pos, { x: b.x, y: b.y }) < BUILDING_MIN_DISTANCE) {
        return null;
      }
    }

    const rotations: (0 | 90 | 180 | 270)[] = [0, 90, 180, 270];
    const rot = rotations[cellRandomInt(`${rngSeed}_rot_${pos.x.toFixed(0)}_${pos.y.toFixed(0)}`, 0, 3)];

    return {
      id: `${pos.x.toFixed(0)}_${pos.y.toFixed(0)}`,
      type,
      x: pos.x,
      y: pos.y,
      rotation: rot,
      footprint: BUILDING_FOOTPRINTS[type],
    };
  }
}
