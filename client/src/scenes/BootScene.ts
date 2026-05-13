import Phaser from 'phaser';
import { generateAllCharacterSpritesheets } from '../entities/CharacterGenerator';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
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

    generateAllCharacterSpritesheets(this);

    this.scene.start('CharacterSelectScene');
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
}
