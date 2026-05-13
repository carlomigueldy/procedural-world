import Phaser from 'phaser';
import { generateAllCharacterSpritesheets } from '../entities/CharacterGenerator';
import { generateTreeSpritesheet } from '../entities/TreeSpritesheetGenerator';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    generateTreeSpritesheet(this);

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
