import Phaser from 'phaser';
import { Biome, darkenColor, getTileColor, lightenColor, TileType } from '../config/constants';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    this.generateTerrainTileset();

    this.makeTexture('structure-tree', 36, 48, (g) => {
      g.fillStyle(0x5a3a1a);
      g.fillRect(16, 34, 4, 14);
      g.fillStyle(0x4a2a0a);
      g.fillRect(16, 34, 2, 14);

      g.fillStyle(0x1a4a1a);
      g.fillEllipse(18, 30, 32, 22);
      g.fillStyle(0x2d6a27);
      g.fillEllipse(18, 26, 28, 20);
      g.fillStyle(0x3a7a2f);
      g.fillEllipse(18, 20, 22, 18);
      g.fillStyle(0x4a8a3f);
      g.fillEllipse(18, 14, 16, 14);
      g.fillStyle(0x5a9a4f);
      g.fillEllipse(18, 8, 10, 10);
    });

    this.makeTexture('structure-pine', 28, 48, (g) => {
      g.fillStyle(0x4a2a0a);
      g.fillRect(13, 32, 2, 16);

      g.fillStyle(0x142e14);
      g.fillTriangle(0, 40, 14, 16, 28, 40);
      g.fillTriangle(2, 34, 14, 10, 26, 34);
      g.fillTriangle(4, 28, 14, 4, 24, 28);
      g.fillTriangle(6, 22, 14, 0, 22, 22);

      g.fillStyle(0x1a3a1a);
      g.fillTriangle(2, 36, 14, 16, 26, 36);
      g.fillTriangle(4, 30, 14, 10, 24, 30);
      g.fillTriangle(6, 24, 14, 4, 22, 24);

      g.fillStyle(0x2a4a2a);
      g.fillTriangle(4, 32, 14, 16, 24, 32);
      g.fillTriangle(6, 26, 14, 8, 22, 26);
    });

    this.makeTexture('structure-rock', 28, 16, (g) => {
      g.fillStyle(0x2a2a2a);
      g.fillEllipse(14, 10, 26, 12);
      g.fillStyle(0x5a5a5a);
      g.fillEllipse(14, 9, 24, 10);
      g.fillStyle(0x6a6a6a);
      g.fillEllipse(14, 9, 22, 9);
      g.fillStyle(0x8a8a8a);
      g.fillEllipse(10, 6, 10, 6);
      g.fillStyle(0x7a7a7a);
      g.fillEllipse(18, 7, 8, 5);
      g.fillStyle(0x4a4a4a);
      g.fillRect(4, 12, 6, 2);
      g.fillRect(18, 11, 5, 2);
    });

    this.makeTexture('structure-bush', 24, 16, (g) => {
      g.fillStyle(0x1a3a1a);
      g.fillEllipse(12, 9, 22, 12);
      g.fillStyle(0x2a5a1a);
      g.fillEllipse(12, 8, 20, 10);
      g.fillStyle(0x3a6a2a);
      g.fillEllipse(12, 7, 18, 9);
      g.fillStyle(0x4a7a3a);
      g.fillEllipse(8, 5, 10, 7);
      g.fillEllipse(16, 5, 10, 7);
      g.fillStyle(0x5a8a4a);
      g.fillEllipse(8, 4, 6, 5);
      g.fillEllipse(16, 4, 6, 5);
    });

    this.scene.start('GameScene');
  }

  private makeTexture(
    key: string,
    width: number,
    height: number,
    draw: (g: Phaser.GameObjects.Graphics) => void,
  ): void {
    const g = this.add.graphics();
    draw(g);
    g.generateTexture(key, width, height);
    g.destroy();
  }

  private tileHash(tt: number, bm: number, sub: number): number {
    let h = (tt * 374761393 + bm * 668265263 + sub * 1274126177) | 0;
    h = ((h ^ (h >>> 13)) * 1274126177) | 0;
    h = (h ^ (h >>> 16)) | 0;
    return ((h & 0x7fffffff) / 0x7fffffff);
  }

  private drawTileDetail(
    g: Phaser.GameObjects.Graphics,
    tx: number,
    ty: number,
    tileType: TileType,
    biome: Biome,
    baseColor: number,
  ): void {
    const h = (s: number) => this.tileHash(tileType as number, biome as number, s);

    switch (tileType) {
      case TileType.WATER_DEEP: {
        const waveColor = lightenColor(baseColor, 0.2);
        g.fillStyle(waveColor, 0.3);
        for (let i = 0; i < 3; i++) {
          g.fillEllipse(tx + 16, ty + 6 + i * 10, 26, 2);
        }
        g.fillStyle(lightenColor(baseColor, 0.4), 0.25);
        for (let i = 0; i < 6; i++) {
          g.fillCircle(tx + 2 + h(i * 3) * 28, ty + 2 + h(i * 3 + 1) * 28, 0.5 + h(i * 3 + 2));
        }
        break;
      }

      case TileType.WATER_SHALLOW: {
        const waveColor = lightenColor(baseColor, 0.2);
        g.fillStyle(waveColor, 0.25);
        for (let i = 0; i < 4; i++) {
          g.fillEllipse(tx + 16, ty + 4 + i * 7, 28, 2);
        }
        g.fillStyle(lightenColor(baseColor, 0.3), 0.2);
        for (let i = 0; i < 5; i++) {
          g.fillCircle(tx + 2 + h(i * 5) * 28, ty + 2 + h(i * 5 + 1) * 28, 1 + h(i * 5 + 2) * 2);
        }
        break;
      }

      case TileType.SAND: {
        const grainColor = darkenColor(baseColor, 0.15);
        g.fillStyle(grainColor, 0.4);
        for (let i = 0; i < 14; i++) {
          g.fillRect(tx + 1 + h(i * 2) * 30, ty + 1 + h(i * 2 + 1) * 30, 1 + h(i * 4) * 2, 1);
        }
        g.fillStyle(darkenColor(baseColor, 0.1), 0.2);
        for (let i = 0; i < 2; i++) {
          g.fillEllipse(tx + 16, ty + 8 + i * 15, 28, 3);
        }
        break;
      }

      case TileType.GRASS: {
        const bladeColor = darkenColor(baseColor, 0.25);
        g.fillStyle(bladeColor, 0.5);
        for (let i = 0; i < 6; i++) {
          const gx = tx + 3 + i * 5;
          const bladeH = 5 + h(i) * 10;
          g.fillRect(gx, ty + 32 - bladeH, 1, bladeH);
        }
        g.fillStyle(lightenColor(baseColor, 0.15), 0.3);
        for (let i = 0; i < 3; i++) {
          g.fillEllipse(
            tx + 3 + h(i * 3) * 26,
            ty + 3 + h(i * 3 + 1) * 26,
            4 + h(i * 3 + 2) * 4,
            3 + h(i * 3) * 3,
          );
        }
        g.fillStyle(0xffff88, 0.2);
        g.fillCircle(tx + 4 + h(100) * 24, ty + 4 + h(101) * 24, 0.8);
        break;
      }

      case TileType.FOREST: {
        g.fillStyle(lightenColor(baseColor, 0.2), 0.3);
        for (let i = 0; i < 3; i++) {
          g.fillEllipse(
            tx + 8 + h(i * 4) * 16,
            ty + 8 + h(i * 4 + 1) * 16,
            10 + h(i * 4 + 2) * 8,
            8 + h(i * 4 + 3) * 6,
          );
        }
        g.fillStyle(darkenColor(baseColor, 0.2), 0.2);
        for (let i = 0; i < 2; i++) {
          g.fillEllipse(
            tx + 8 + h(12 + i * 4) * 16,
            ty + 8 + h(13 + i * 4) * 16,
            8 + h(14 + i * 4) * 6,
            6 + h(15 + i * 4) * 4,
          );
        }
        g.fillStyle(0x4a3a1a, 0.25);
        for (let i = 0; i < 4; i++) {
          g.fillCircle(
            tx + 2 + h(30 + i * 2) * 28,
            ty + 2 + h(31 + i * 2) * 28,
            0.8 + h(32 + i) * 0.8,
          );
        }
        break;
      }

      case TileType.STONE: {
        g.lineStyle(1, darkenColor(baseColor, 0.3), 0.4);
        g.lineBetween(
          tx + 5 + h(0) * 8, ty + 3 + h(1) * 5,
          tx + 12 + h(2) * 10, ty + 20 + h(3) * 8,
        );
        g.lineBetween(
          tx + 12 + h(4) * 10, ty + 20 + h(5) * 8,
          tx + 20 + h(6) * 10, ty + 28 + h(7) * 4,
        );
        g.lineBetween(
          tx + 20 + h(8) * 10, ty + 5 + h(9) * 8,
          tx + 28 + h(10) * 4, ty + 15 + h(11) * 10,
        );
        g.fillStyle(0x5a7a3a, 0.2);
        for (let i = 0; i < 3; i++) {
          g.fillCircle(
            tx + 2 + h(20 + i * 2) * 28,
            ty + 2 + h(21 + i * 2) * 28,
            1.5 + h(22 + i) * 2,
          );
        }
        g.fillStyle(lightenColor(baseColor, 0.2), 0.15);
        g.fillEllipse(tx + 6 + h(30) * 10, ty + 4 + h(31) * 10, 6, 4);
        g.fillEllipse(tx + 18 + h(32) * 10, ty + 12 + h(33) * 10, 5, 3);
        break;
      }

      case TileType.SNOW: {
        g.fillStyle(darkenColor(baseColor, 0.08), 0.3);
        g.fillEllipse(tx + 5 + h(0) * 10, ty + 5 + h(1) * 10, 8 + h(2) * 6, 6 + h(3) * 4);
        g.fillEllipse(
          tx + 14 + h(4) * 12, ty + 16 + h(5) * 10,
          10 + h(6) * 8, 6 + h(7) * 4,
        );
        g.fillStyle(lightenColor(baseColor, 0.4), 0.25);
        for (let i = 0; i < 6; i++) {
          g.fillCircle(
            tx + 2 + h(10 + i * 2) * 28,
            ty + 2 + h(11 + i * 2) * 28,
            0.5 + h(12 + i) * 1.5,
          );
        }
        break;
      }
    }
  }

  private generateTerrainTileset(): void {
    const g = this.add.graphics();
    const TW = 32;
    const cols = 9;
    const rows = 7;

    for (let tt = 0; tt < rows; tt++) {
      for (let b = 0; b < cols; b++) {
        const tx = b * TW;
        const ty = tt * TW;
        const tileType = tt as TileType;
        const biome = b as Biome;
        const baseColor = getTileColor(tileType, biome);

        g.fillStyle(baseColor, 1);
        g.fillRect(tx, ty, TW, TW);

        this.drawTileDetail(g, tx, ty, tileType, biome, baseColor);
      }
    }

    g.generateTexture('terrain-tileset', cols * TW, rows * TW);
    g.destroy();
  }
}
