import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { TerrainGenerator } from '../world/TerrainGenerator';
import { ChunkManager } from '../world/ChunkManager';
import { Minimap } from '../ui/Minimap';
import { SEED, setGameSize, CAMERA_ZOOM_MIN, CAMERA_ZOOM_MAX, CAMERA_ZOOM_DEFAULT, CAMERA_ZOOM_STEP } from '../config/constants';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private chunkManager!: ChunkManager;
  private minimap!: Minimap;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private currentZoom = CAMERA_ZOOM_DEFAULT;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(data?: { characterId?: number }): void {
    const characterId = data?.characterId ?? 0;

    const generator = new TerrainGenerator(SEED);
    this.chunkManager = new ChunkManager(this, generator);
    this.minimap = new Minimap(this, generator);

    this.player = new Player(this, 0, 0, characterId);

    this.cameras.main.setBounds(-100000, -100000, 200000, 200000);
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
    this.cameras.main.setZoom(this.currentZoom);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _gameObjects: Phaser.GameObjects.GameObject[], _dx: number, dy: number) => {
      this.currentZoom += dy > 0 ? -CAMERA_ZOOM_STEP : CAMERA_ZOOM_STEP;
      this.currentZoom = Phaser.Math.Clamp(this.currentZoom, CAMERA_ZOOM_MIN, CAMERA_ZOOM_MAX);
      this.cameras.main.setZoom(this.currentZoom);
    });

    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      setGameSize(gameSize.width, gameSize.height);
      this.minimap.reposition();
    });

    setGameSize(this.scale.width, this.scale.height);
    this.chunkManager.update(this.player.x, this.player.y);
    this.minimap.update(this.player.x, this.player.y, this.currentZoom);
  }

  update(_time: number, delta: number): void {
    const speedMul = 1 / this.currentZoom;
    this.player.update(this.cursors, this.wasd, delta, speedMul);
    this.chunkManager.update(this.player.x, this.player.y);
    this.minimap.update(this.player.x, this.player.y, this.currentZoom);
  }
}
