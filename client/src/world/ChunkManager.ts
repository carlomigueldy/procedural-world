import Phaser from 'phaser';
import {
  CHUNK_PIXELS,
  getSmoothTileColor,
  StructureType,
  TILE_SIZE,
  VIEW_RADIUS,
} from '../config/constants';
import { TerrainGenerator, biomeFromValues, StructurePlacement } from './TerrainGenerator';

const SAMPLE_RES = 4;

interface Chunk {
  image: Phaser.GameObjects.Image;
  textureKey: string;
  sprites: Phaser.GameObjects.Image[];
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
        chunk.image.destroy();
        this.scene.textures.remove(chunk.textureKey);
        for (const s of chunk.sprites) {
          s.destroy();
        }
        this.chunks.delete(key);
      }
    }
  }

  private tileHash(sx: number, sy: number, seed: number): number {
    let h = (sx * 374761393 + sy * 668265263 + seed * 1274126177) | 0;
    h = ((h ^ (h >>> 13)) * 1274126177) | 0;
    h = (h ^ (h >>> 16)) | 0;
    return ((h & 0x7fffffff) / 0x7fffffff);
  }

  private createChunkTexture(cx: number, cy: number, key: string): string {
    const texKey = `terrain_${key}`;

    if (this.scene.textures.exists(texKey)) {
      return texKey;
    }

    const canvas = document.createElement('canvas');
    canvas.width = CHUNK_PIXELS;
    canvas.height = CHUNK_PIXELS;
    const ctx = canvas.getContext('2d')!;

    const samples = CHUNK_PIXELS / SAMPLE_RES;
    const imgData = ctx.createImageData(CHUNK_PIXELS, CHUNK_PIXELS);
    const pixels = imgData.data;

    for (let sy = 0; sy < samples; sy++) {
      for (let sx = 0; sx < samples; sx++) {
        const worldX = cx * CHUNK_PIXELS + sx * SAMPLE_RES + SAMPLE_RES / 2;
        const worldY = cy * CHUNK_PIXELS + sy * SAMPLE_RES + SAMPLE_RES / 2;

        const elevation = this.generator.getElevation(worldX, worldY);
        const humidity = this.generator.getHumidity(worldX, worldY);
        const temperature = this.generator.getTemperature(worldX, worldY);
        const biome = biomeFromValues(humidity, temperature);

        const color = getSmoothTileColor(elevation, biome);
        const noise = (this.tileHash(sx, sy, 99) - 0.5) * 12;
        let r = ((color >> 16) & 0xff) + noise;
        let g = ((color >> 8) & 0xff) + noise;
        let b = (color & 0xff) + noise;
        r = Math.max(0, Math.min(255, r));
        g = Math.max(0, Math.min(255, g));
        b = Math.max(0, Math.min(255, b));

        const px = sx * SAMPLE_RES;
        const py = sy * SAMPLE_RES;
        for (let dy = 0; dy < SAMPLE_RES; dy++) {
          for (let dx = 0; dx < SAMPLE_RES; dx++) {
            const idx = ((py + dy) * CHUNK_PIXELS + (px + dx)) * 4;
            pixels[idx] = r;
            pixels[idx + 1] = g;
            pixels[idx + 2] = b;
            pixels[idx + 3] = 255;
          }
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
    this.scene.textures.addCanvas(texKey, canvas);
    return texKey;
  }

  private createChunk(cx: number, cy: number, key: string): void {
    const tileTypes = this.generator.generateChunk(cx, cy);
    const biomes = this.generator.generateBiomeChunk(cx, cy);
    const textureKey = this.createChunkTexture(cx, cy, key);

    const originX = cx * CHUNK_PIXELS + CHUNK_PIXELS / 2;
    const originY = cy * CHUNK_PIXELS + CHUNK_PIXELS / 2;

    const image = this.scene.add.image(originX, originY, textureKey);
    image.setOrigin(0.5, 0.5);
    image.setDepth(0);

    const placements = this.generator.generateStructures(cx, cy, tileTypes, biomes);
    const textureKeyMap: Record<StructureType, string> = {
      [StructureType.TREE]: 'structure-tree',
      [StructureType.PINE]: 'structure-pine',
      [StructureType.ROCK]: 'structure-rock',
      [StructureType.BUSH]: 'structure-bush',
    };
    const sprites: Phaser.GameObjects.Image[] = [];

    for (const p of placements) {
      const sx = cx * CHUNK_PIXELS + p.tileX * TILE_SIZE + TILE_SIZE / 2 + p.offsetX;
      const sy = cy * CHUNK_PIXELS + p.tileY * TILE_SIZE + TILE_SIZE + p.offsetY;
      const sprite = this.scene.add.image(sx, sy, textureKeyMap[p.type]);
      sprite.setOrigin(0.5, 1);
      sprite.setDepth(5);
      sprites.push(sprite);
    }

    this.chunks.set(key, { image, textureKey, sprites });
  }

  destroy(): void {
    for (const chunk of this.chunks.values()) {
      chunk.image.destroy();
      this.scene.textures.remove(chunk.textureKey);
      for (const s of chunk.sprites) {
        s.destroy();
      }
    }
    this.chunks.clear();
  }
}
