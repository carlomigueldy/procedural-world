import Phaser from 'phaser';
import { PLAYER_SPEED } from '../config/constants';
import { CHARACTERS, charDirectionFrameIndex } from './CharacterGenerator';

const ANIM_SPEED = 150;

export class Player {
  public sprite: Phaser.GameObjects.Sprite;
  public characterId: number;
  private direction = 0;
  private animFrame = 0;
  private animTimer = 0;
  private moving = false;

  constructor(scene: Phaser.Scene, x: number, y: number, characterId: number) {
    this.characterId = characterId;
    const charDesign = CHARACTERS[characterId];
    this.sprite = scene.add.sprite(x, y, charDesign.spriteKey, 'f0');
    this.sprite.setDepth(10);
  }

  update(
    cursors: Phaser.Types.Input.Keyboard.CursorKeys,
    wasd: {
      W: Phaser.Input.Keyboard.Key;
      A: Phaser.Input.Keyboard.Key;
      S: Phaser.Input.Keyboard.Key;
      D: Phaser.Input.Keyboard.Key;
    },
    delta: number,
    speedMultiplier = 1,
  ): void {
    let vx = 0;
    let vy = 0;

    if (cursors.left.isDown || wasd.A.isDown) vx = -1;
    else if (cursors.right.isDown || wasd.D.isDown) vx = 1;

    if (cursors.up.isDown || wasd.W.isDown) vy = -1;
    else if (cursors.down.isDown || wasd.S.isDown) vy = 1;

    if (vx !== 0 && vy !== 0) {
      const len = Math.sqrt(vx * vx + vy * vy);
      vx /= len;
      vy /= len;
    }

    this.moving = vx !== 0 || vy !== 0;

    if (vy > 0) this.direction = 0;
    else if (vy < 0) this.direction = 3;
    else if (vx < 0) this.direction = 1;
    else if (vx > 0) this.direction = 2;

    if (this.moving) {
      this.animTimer += delta;
      if (this.animTimer > ANIM_SPEED) {
        this.animTimer = 0;
        this.animFrame = (this.animFrame + 1) % 4;
      }
    } else {
      this.animFrame = 0;
      this.animTimer = 0;
    }

    const frameIndex = charDirectionFrameIndex(this.direction, this.animFrame);
    this.sprite.setFrame(frameIndex);

    const dt = delta / 1000;
    this.sprite.x += vx * PLAYER_SPEED * speedMultiplier * dt;
    this.sprite.y += vy * PLAYER_SPEED * speedMultiplier * dt;
  }

  get x(): number {
    return this.sprite.x;
  }

  get y(): number {
    return this.sprite.y;
  }
}
