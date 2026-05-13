import Phaser from 'phaser';
import {
  Biome,
  CHUNK_SIZE,
  CHUNK_PIXELS,
  StructureType,
  TILE_SIZE,
  VIEW_RADIUS,
  TileType,
} from '../config/constants';
import { TerrainGenerator, StructurePlacement } from './TerrainGenerator';

interface Chunk {
  tileTypes: TileType[][];
  biomes: Biome[][];
  layer: Phaser.Tilemaps.TilemapLayer;
  map: Phaser.Tilemaps.Tilemap;
  sprites: Phaser.GameObjects.Image[];
}

const TILESET_KEY = 'terrain-tileset';

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
        chunk.layer.destroy();
        chunk.map.destroy();
        for (const s of chunk.sprites) {
          s.destroy();
        }
        this.chunks.delete(key);
      }
    }
  }

  private createChunk(cx: number, cy: number, key: string): void {
    const tileTypes = this.generator.generateChunk(cx, cy);
    const biomes = this.generator.generateBiomeChunk(cx, cy);

    const originX = cx * CHUNK_PIXELS;
    const originY = cy * CHUNK_PIXELS;

    const map = this.scene.make.tilemap({
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
      width: CHUNK_SIZE,
      height: CHUNK_SIZE,
    });
    const tileset = map.addTilesetImage(TILESET_KEY)!;
    const layer = map.createBlankLayer('layer', tileset, originX, originY)!;
    layer.setDepth(0);

    for (let y = 0; y < CHUNK_SIZE; y++) {
      for (let x = 0; x < CHUNK_SIZE; x++) {
        const index = (tileTypes[y][x] as number) * 9 + (biomes[y][x] as number);
        layer.putTileAt(index, x, y);
      }
    }

    const placements = this.generator.generateStructures(cx, cy, tileTypes, biomes);
    const textureKey: Record<StructureType, string> = {
      [StructureType.TREE]: 'structure-tree',
      [StructureType.PINE]: 'structure-pine',
      [StructureType.ROCK]: 'structure-rock',
      [StructureType.BUSH]: 'structure-bush',
    };
    const sprites: Phaser.GameObjects.Image[] = [];

    for (const p of placements) {
      const sx = cx * CHUNK_PIXELS + p.tileX * TILE_SIZE + TILE_SIZE / 2 + p.offsetX;
      const sy = cy * CHUNK_PIXELS + p.tileY * TILE_SIZE + TILE_SIZE + p.offsetY;
      const sprite = this.scene.add.image(sx, sy, textureKey[p.type]);
      sprite.setOrigin(0.5, 1);
      sprite.setDepth(5);
      sprites.push(sprite);
    }

    this.chunks.set(key, { tileTypes, biomes, layer, map, sprites });
  }

  destroy(): void {
    for (const chunk of this.chunks.values()) {
      chunk.layer.destroy();
      chunk.map.destroy();
      for (const s of chunk.sprites) {
        s.destroy();
      }
    }
    this.chunks.clear();
  }
}
