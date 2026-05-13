import Phaser from 'phaser';
import {
  Biome,
  CHUNK_PIXELS,
  CHUNK_SIZE,
  getSmoothTileColor,
  StructureType,
  TILE_SIZE,
  VIEW_RADIUS,
} from '../config/constants';
import { TerrainGenerator, biomeFromValues, StructurePlacement } from './TerrainGenerator';
import { TREE_SPRITESHEET_KEY, TREE_FRAMES } from '../entities/TreeSpritesheetGenerator';

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
  private ignoreCamera?: Phaser.Cameras.Scene2D.Camera;

  constructor(
    scene: Phaser.Scene,
    generator: TerrainGenerator,
    ignoreCamera?: Phaser.Cameras.Scene2D.Camera,
  ) {
    this.scene = scene;
    this.generator = generator;
    this.ignoreCamera = ignoreCamera;
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

    const gridSize = CHUNK_SIZE + 1;
    const elevGrid = new Float32Array(gridSize * gridSize);
    const humidGrid = new Float32Array(gridSize * gridSize);
    const tempGrid = new Float32Array(gridSize * gridSize);

    for (let gy = 0; gy < gridSize; gy++) {
      for (let gx = 0; gx < gridSize; gx++) {
        const wtX = cx * CHUNK_SIZE + gx;
        const wtY = cy * CHUNK_SIZE + gy;
        const idx = gy * gridSize + gx;
        elevGrid[idx] = this.generator.getElevation(wtX, wtY);
        humidGrid[idx] = this.generator.getHumidity(wtX, wtY);
        tempGrid[idx] = this.generator.getTemperature(wtX, wtY);
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = CHUNK_PIXELS;
    canvas.height = CHUNK_PIXELS;
    const ctx = canvas.getContext('2d')!;

    const imgData = ctx.createImageData(CHUNK_PIXELS, CHUNK_PIXELS);
    const pixels = imgData.data;
    const samples = CHUNK_PIXELS / SAMPLE_RES;

    for (let sy = 0; sy < samples; sy++) {
      for (let sx = 0; sx < samples; sx++) {
        const fracX = (sx * SAMPLE_RES + SAMPLE_RES / 2) / TILE_SIZE;
        const fracY = (sy * SAMPLE_RES + SAMPLE_RES / 2) / TILE_SIZE;

        const gx = Math.min(Math.floor(fracX), gridSize - 2);
        const gy = Math.min(Math.floor(fracY), gridSize - 2);
        const tx = fracX - gx;
        const ty = fracY - gy;

        const i00 = gy * gridSize + gx;
        const i10 = i00 + 1;
        const i01 = i00 + gridSize;
        const i11 = i01 + 1;

        const e = elevGrid[i00]
          + (elevGrid[i10] - elevGrid[i00]) * tx
          + (elevGrid[i01] - elevGrid[i00]) * ty
          + (elevGrid[i00] - elevGrid[i10] - elevGrid[i01] + elevGrid[i11]) * tx * ty;

        const h = humidGrid[i00]
          + (humidGrid[i10] - humidGrid[i00]) * tx
          + (humidGrid[i01] - humidGrid[i00]) * ty
          + (humidGrid[i00] - humidGrid[i10] - humidGrid[i01] + humidGrid[i11]) * tx * ty;

        const t = tempGrid[i00]
          + (tempGrid[i10] - tempGrid[i00]) * tx
          + (tempGrid[i01] - tempGrid[i00]) * ty
          + (tempGrid[i00] - tempGrid[i10] - tempGrid[i01] + tempGrid[i11]) * tx * ty;

        const biome = biomeFromValues(h, t);
        const color = getSmoothTileColor(e, biome);
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
     if (this.ignoreCamera) {
       this.ignoreCamera.ignore(image);
     }

    const placements = this.generator.generateStructures(cx, cy, tileTypes, biomes);
    const sprites: Phaser.GameObjects.Image[] = [];

    for (const p of placements) {
      const sx = cx * CHUNK_PIXELS + p.tileX * TILE_SIZE + TILE_SIZE / 2 + p.offsetX;
      const sy = cy * CHUNK_PIXELS + p.tileY * TILE_SIZE + TILE_SIZE + p.offsetY;

      if (p.type === StructureType.TREE || p.type === StructureType.PINE) {
        const biome = biomes[p.tileY]?.[p.tileX] ?? Biome.GRASSLAND;
        const frame = this.structureFrame(p.type, biome, p.tileX, p.tileY);
        const sprite = this.scene.add.image(sx, sy, TREE_SPRITESHEET_KEY, frame);
        sprite.setOrigin(0.5, 1);
        sprite.setDepth(5);
        if (this.ignoreCamera) {
          this.ignoreCamera.ignore(sprite);
        }
        sprites.push(sprite);
      } else {
        const textureKey: Record<StructureType, string> = {
          [StructureType.TREE]: '',
          [StructureType.PINE]: '',
          [StructureType.ROCK]: 'structure-rock',
          [StructureType.BUSH]: 'structure-bush',
        };
        const sprite = this.scene.add.image(sx, sy, textureKey[p.type]);
        sprite.setOrigin(0.5, 1);
        sprite.setDepth(5);
        if (this.ignoreCamera) {
          this.ignoreCamera.ignore(sprite);
        }
        sprites.push(sprite);
      }
    }

    this.chunks.set(key, { image, textureKey, sprites });
  }

  private structureFrame(type: StructureType, biome: Biome, tileX: number, tileY: number): number {
    const h = ((tileX * 374761393 + tileY * 668265263 + 42) | 0) >>> 0;
    const variant = ((h ^ (h >>> 13)) & 0x7fffffff) % 4;

    if (type === StructureType.PINE) {
      return TREE_FRAMES.PINE_0 + variant;
    }

    let baseFrame: number;
    switch (biome) {
      case Biome.TAIGA:
      case Biome.TUNDRA:
      case Biome.ALPINE_MEADOW:
        baseFrame = TREE_FRAMES.DEAD_0;
        break;
      case Biome.DESERT:
      case Biome.SAVANNA:
        baseFrame = TREE_FRAMES.AUTUMN_0;
        break;
      case Biome.RAINFOREST:
      case Biome.TROPICAL_RAINFOREST:
        baseFrame = TREE_FRAMES.OAK_0;
        break;
      default:
        baseFrame = (h % 2 === 0) ? TREE_FRAMES.OAK_0 : TREE_FRAMES.AUTUMN_0;
        break;
    }

    return baseFrame + variant;
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
