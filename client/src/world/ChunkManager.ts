import Phaser from 'phaser';
import {
  CHUNK_SIZE,
  CHUNK_PIXELS,
  TILE_SIZE,
  VIEW_RADIUS,
  TILE_COLORS,
  TileType,
} from '../config/constants';
import { TerrainGenerator } from './TerrainGenerator';

interface Chunk {
  tileTypes: TileType[][];
  graphics: Phaser.GameObjects.Graphics;
}

export class ChunkManager {
  private scene: Phaser.Scene;
  private generator: TerrainGenerator;
  private chunks: Map<string, Chunk> = new Map();
  private lastPlayerChunkX = -999;
  private lastPlayerChunkY = -999;

  constructor(scene: Phaser.Scene, generator: TerrainGenerator) {
    this.scene = scene;
    this.generator = generator;
  }

  update(playerWorldX: number, playerWorldY: number): void {
    const chunkX = Math.floor(playerWorldX / CHUNK_PIXELS);
    const chunkY = Math.floor(playerWorldY / CHUNK_PIXELS);

    if (chunkX === this.lastPlayerChunkX && chunkY === this.lastPlayerChunkY) {
      return;
    }

    this.lastPlayerChunkX = chunkX;
    this.lastPlayerChunkY = chunkY;

    const needed = new Set<string>();

    for (let dy = -VIEW_RADIUS; dy <= VIEW_RADIUS; dy++) {
      for (let dx = -VIEW_RADIUS; dx <= VIEW_RADIUS; dx++) {
        const cx = chunkX + dx;
        const cy = chunkY + dy;
        const key = `${cx},${cy}`;
        needed.add(key);

        if (!this.chunks.has(key)) {
          this.createChunk(cx, cy, key);
        }
      }
    }

    for (const [key, chunk] of this.chunks) {
      if (!needed.has(key)) {
        chunk.graphics.destroy();
        this.chunks.delete(key);
      }
    }
  }

  private createChunk(cx: number, cy: number, key: string): void {
    const tileTypes = this.generator.generateChunk(cx, cy);
    const gfx = this.scene.add.graphics();
    gfx.setDepth(0);

    const originX = cx * CHUNK_PIXELS;
    const originY = cy * CHUNK_PIXELS;

    for (let y = 0; y < CHUNK_SIZE; y++) {
      for (let x = 0; x < CHUNK_SIZE; x++) {
        const color = TILE_COLORS[tileTypes[y][x]];
        gfx.fillStyle(color, 1);
        gfx.fillRect(
          originX + x * TILE_SIZE,
          originY + y * TILE_SIZE,
          TILE_SIZE,
          TILE_SIZE,
        );
      }
    }

    this.chunks.set(key, { tileTypes, graphics: gfx });
  }

  destroy(): void {
    for (const chunk of this.chunks.values()) {
      chunk.graphics.destroy();
    }
    this.chunks.clear();
  }
}
