import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    const text = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Loading...', {
      fontSize: '24px',
      color: '#ffffff',
    });
    text.setOrigin(0.5);

    this.time.delayedCall(100, () => {
      this.scene.start('GameScene');
    });
  }
}
