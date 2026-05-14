import { CHUNK_PIXELS, CHUNK_SIZE, ROAD_CELL_SIZE, TILE_SIZE } from '../config/constants';
import { RoadSegment } from './TileMap';
import { TerrainGenerator } from './TerrainGenerator';

interface Waypoint {
  x: number;
  y: number;
  cellX: number;
  cellY: number;
}

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

export class RoadGenerator {
  private generator: TerrainGenerator;
  private seed: number;
  private waypointCache: Map<string, Waypoint[]> = new Map();

  constructor(generator: TerrainGenerator, seed: number) {
    this.generator = generator;
    this.seed = seed;
  }

  generateRoadsForChunk(chunkX: number, chunkY: number): RoadSegment[] {
    const cellX = Math.floor(chunkX / ROAD_CELL_SIZE);
    const cellY = Math.floor(chunkY / ROAD_CELL_SIZE);

    // Collect waypoints from this cell and all 8 neighboring cells
    const allWaypoints: Waypoint[] = [];
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const waypoints = this.getWaypointsForCell(cellX + dx, cellY + dy);
        allWaypoints.push(...waypoints);
      }
    }

    if (allWaypoints.length < 2) {
      return [];
    }

    // Build edges: all pairs within a reasonable distance
    const maxEdgeDist = CHUNK_PIXELS * ROAD_CELL_SIZE * 1.5;
    interface Edge {
      a: number;
      b: number;
      dist: number;
    }
    const edges: Edge[] = [];

    for (let i = 0; i < allWaypoints.length; i++) {
      for (let j = i + 1; j < allWaypoints.length; j++) {
        const dx = allWaypoints[i].x - allWaypoints[j].x;
        const dy = allWaypoints[i].y - allWaypoints[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxEdgeDist) {
          edges.push({ a: i, b: j, dist });
        }
      }
    }

    edges.sort((a, b) => a.dist - b.dist);

    // Kruskal's MST with union-find
    const parent = new Int32Array(allWaypoints.length);
    for (let i = 0; i < parent.length; i++) parent[i] = i;

    function find(i: number): number {
      if (parent[i] !== i) parent[i] = find(parent[i]);
      return parent[i];
    }

    function union(a: number, b: number): void {
      const ra = find(a);
      const rb = find(b);
      if (ra !== rb) parent[ra] = rb;
    }

    const segments: RoadSegment[] = [];
    const addedEdges = new Set<string>();

    for (const edge of edges) {
      if (find(edge.a) !== find(edge.b)) {
        union(edge.a, edge.b);
        const key = `${edge.a},${edge.b}`;
        addedEdges.add(key);
        segments.push({
          startX: allWaypoints[edge.a].x,
          startY: allWaypoints[edge.a].y,
          endX: allWaypoints[edge.b].x,
          endY: allWaypoints[edge.b].y,
        });
      }
    }

    // Add a few random extra edges for loops (but keep it sparse)
    const extraCount = Math.min(3, Math.floor(edges.length * 0.05));
    for (const edge of edges) {
      if (segments.length >= allWaypoints.length - 1 + extraCount) break;
      const key = `${edge.a},${edge.b}`;
      if (!addedEdges.has(key)) {
        const seed = `${this.seed}_extra_${edge.a}_${edge.b}`;
        if (cellRandom(seed) < 0.3) {
          addedEdges.add(key);
          segments.push({
            startX: allWaypoints[edge.a].x,
            startY: allWaypoints[edge.a].y,
            endX: allWaypoints[edge.b].x,
            endY: allWaypoints[edge.b].y,
          });
        }
      }
    }

    // Filter to only segments that touch or pass near this chunk
    const chunkMinX = chunkX * CHUNK_PIXELS;
    const chunkMaxX = chunkMinX + CHUNK_PIXELS;
    const chunkMinY = chunkY * CHUNK_PIXELS;
    const chunkMaxY = chunkMinY + CHUNK_PIXELS;
    const padding = CHUNK_PIXELS;

    return segments.filter(seg => {
      const minX = Math.min(seg.startX, seg.endX) - padding;
      const maxX = Math.max(seg.startX, seg.endX) + padding;
      const minY = Math.min(seg.startY, seg.endY) - padding;
      const maxY = Math.max(seg.startY, seg.endY) + padding;
      return maxX >= chunkMinX && minX <= chunkMaxX && maxY >= chunkMinY && minY <= chunkMaxY;
    });
  }

  private getWaypointsForCell(cellX: number, cellY: number): Waypoint[] {
    const key = `${cellX},${cellY}`;
    if (this.waypointCache.has(key)) {
      return this.waypointCache.get(key)!;
    }

    const count = cellRandomInt(`${this.seed}_wp_${cellX}_${cellY}`, 1, 3);
    const waypoints: Waypoint[] = [];

    for (let i = 0; i < count; i++) {
      const seed = `${this.seed}_wp_${cellX}_${cellY}_${i}`;
      // Place within the cell but not too close to edges
      const margin = CHUNK_PIXELS;
      const cellMinX = cellX * ROAD_CELL_SIZE * CHUNK_PIXELS + margin;
      const cellMaxX = (cellX + 1) * ROAD_CELL_SIZE * CHUNK_PIXELS - margin;
      const cellMinY = cellY * ROAD_CELL_SIZE * CHUNK_PIXELS + margin;
      const cellMaxY = (cellY + 1) * ROAD_CELL_SIZE * CHUNK_PIXELS - margin;

      const wx = cellRandomRange(seed + '_x', cellMinX, cellMaxX);
      const wy = cellRandomRange(seed + '_y', cellMinY, cellMaxY);

      // Check terrain suitability
      const tileX = Math.floor(wx / TILE_SIZE);
      const tileY = Math.floor(wy / TILE_SIZE);
      if (this.generator.isSuitableForRoad(tileX, tileY)) {
        waypoints.push({ x: wx, y: wy, cellX, cellY });
      }
    }

    this.waypointCache.set(key, waypoints);
    return waypoints;
  }
}
