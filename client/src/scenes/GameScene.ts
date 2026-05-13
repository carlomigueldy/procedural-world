import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { TerrainGenerator } from '../world/TerrainGenerator';
import { ChunkManager } from '../world/ChunkManager';
import { SEED } from '../config/constants';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private chunkManager!: ChunkManager;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    const generator = new TerrainGenerator(SEED);
    this.chunkManager = new ChunkManager(this, generator);

    this.player = new Player(this, 0, 0);

    this.cameras.main.setBounds(-100000, -100000, 200000, 200000);
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    this.chunkManager.update(this.player.x, this.player.y);
  }

  update(_time: number, delta: number): void {
    this.player.update(this.cursors, this.wasd, delta);
    this.chunkManager.update(this.player.x, this.player.y);
  }
}
