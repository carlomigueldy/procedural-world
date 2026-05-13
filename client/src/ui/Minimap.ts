import Phaser from 'phaser';
import {
  CHUNK_SIZE,
  MINIMAP_MARGIN,
  MINIMAP_TILE_SIZE,
  getSmoothTileColor,
  TILE_SIZE,
  VIEW_RADIUS,
} from '../config/constants';
import { TerrainGenerator } from '../world/TerrainGenerator';

export class Minimap {
  private scene: Phaser.Scene;
  private generator: TerrainGenerator;
  private container: Phaser.GameObjects.Container;
  private bg: Phaser.GameObjects.Graphics;
  private terrainGfx: Phaser.GameObjects.Graphics;
  private playerMarker: Phaser.GameObjects.Graphics;
  private viewportGfx: Phaser.GameObjects.Graphics;

  private readonly tilesPerSide: number;
  private readonly minimapPixels: number;
  private lastChunkX = -999;
  private lastChunkY = -999;

  constructor(scene: Phaser.Scene, generator: TerrainGenerator) {
    this.scene = scene;
    this.generator = generator;

    const chunksPerSide = VIEW_RADIUS * 2 + 1;
    this.tilesPerSide = chunksPerSide * CHUNK_SIZE;
    this.minimapPixels = this.tilesPerSide * MINIMAP_TILE_SIZE;

    const x = scene.scale.width - this.minimapPixels - MINIMAP_MARGIN;
    const y = MINIMAP_MARGIN;

    this.container = scene.add.container(x, y);
    this.container.setScrollFactor(0);
    this.container.setDepth(100);

    this.bg = scene.add.graphics();
    this.bg.fillStyle(0x000000, 0.4);
    this.bg.fillRect(-2, -2, this.minimapPixels + 4, this.minimapPixels + 4);
    this.bg.lineStyle(1, 0xffffff, 0.4);
    this.bg.strokeRect(-2, -2, this.minimapPixels + 4, this.minimapPixels + 4);
    this.container.add(this.bg);

    this.terrainGfx = scene.add.graphics();
    this.container.add(this.terrainGfx);

    this.viewportGfx = scene.add.graphics();
    this.viewportGfx.lineStyle(1, 0xffffff, 0.7);
    this.container.add(this.viewportGfx);

    this.playerMarker = scene.add.graphics();
    this.playerMarker.fillStyle(0xff4444, 1);
    this.playerMarker.fillCircle(0, 0, 2);
    this.container.add(this.playerMarker);
  }

  update(playerWorldX: number, playerWorldY: number, cameraZoom = 1): void {
    const chunkX = Math.floor(playerWorldX / (CHUNK_SIZE * TILE_SIZE));
    const chunkY = Math.floor(playerWorldY / (CHUNK_SIZE * TILE_SIZE));

    if (chunkX !== this.lastChunkX || chunkY !== this.lastChunkY) {
      this.lastChunkX = chunkX;
      this.lastChunkY = chunkY;
      this.regenerate(playerWorldX, playerWorldY);
    }

    this.updateMarkers(playerWorldX, playerWorldY, cameraZoom);
  }

  private regenerate(playerWorldX: number, playerWorldY: number): void {
    this.terrainGfx.clear();

    const centerTileX = Math.floor(playerWorldX / TILE_SIZE);
    const centerTileY = Math.floor(playerWorldY / TILE_SIZE);
    const halfTiles = Math.floor(this.tilesPerSide / 2);

    for (let my = 0; my < this.tilesPerSide; my++) {
      for (let mx = 0; mx < this.tilesPerSide; mx++) {
        const tileX = centerTileX - halfTiles + mx;
        const tileY = centerTileY - halfTiles + my;
        const elevation = this.generator.getElevation(tileX, tileY);
        const biome = this.generator.getBiome(tileX, tileY);
        this.terrainGfx.fillStyle(getSmoothTileColor(elevation, biome), 1);
        this.terrainGfx.fillRect(
          mx * MINIMAP_TILE_SIZE,
          my * MINIMAP_TILE_SIZE,
          MINIMAP_TILE_SIZE,
          MINIMAP_TILE_SIZE,
        );
      }
    }
  }

  private updateMarkers(playerWorldX: number, playerWorldY: number, cameraZoom: number): void {
    const halfTiles = Math.floor(this.tilesPerSide / 2);
    const centerTileX = Math.floor(playerWorldX / TILE_SIZE);
    const centerTileY = Math.floor(playerWorldY / TILE_SIZE);
    const fx = ((playerWorldX / TILE_SIZE) - centerTileX) * MINIMAP_TILE_SIZE;
    const fy = ((playerWorldY / TILE_SIZE) - centerTileY) * MINIMAP_TILE_SIZE;

    const markerX = halfTiles * MINIMAP_TILE_SIZE + fx;
    const markerY = halfTiles * MINIMAP_TILE_SIZE + fy;
    this.playerMarker.setPosition(markerX, markerY);

    this.viewportGfx.clear();
    const vpW = (this.scene.scale.width / TILE_SIZE) * MINIMAP_TILE_SIZE / cameraZoom;
    const vpH = (this.scene.scale.height / TILE_SIZE) * MINIMAP_TILE_SIZE / cameraZoom;
    this.viewportGfx.strokeRect(
      markerX - vpW / 2,
      markerY - vpH / 2,
      vpW,
      vpH,
    );
  }

  reposition(): void {
    const x = this.scene.scale.width - this.minimapPixels - MINIMAP_MARGIN;
    this.container.setPosition(x, MINIMAP_MARGIN);
  }

  destroy(): void {
    this.container.destroy();
  }
}
