import Phaser from 'phaser';
import { CHARACTERS, charDirectionFrameIndex } from '../entities/CharacterGenerator';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants';

const ROW_H = 120;
const LIST_TOP = 60;
const PREVIEW_SCALE = 4;

export class CharacterSelectScene extends Phaser.Scene {
  private selectedIndex = 0;
  private previewSprites: Phaser.GameObjects.Sprite[] = [];
  private highlightGraphics: Phaser.GameObjects.Graphics[] = [];
  private nameTexts: Phaser.GameObjects.Text[] = [];
  private descTexts: Phaser.GameObjects.Text[] = [];
  private animTimer = 0;
  private currentFrame = 0;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private enterKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: 'CharacterSelectScene' });
  }

  create(): void {
    this.selectedIndex = 0;
    this.previewSprites = [];
    this.highlightGraphics = [];
    this.nameTexts = [];
    this.descTexts = [];
    this.animTimer = 0;
    this.currentFrame = 0;

    const cx = GAME_WIDTH / 2;

    const title = this.add.text(cx, 20, 'Choose Your Character', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ffffff',
    });
    title.setOrigin(0.5, 0);

    CHARACTERS.forEach((char, i) => {
      const rowY = LIST_TOP + i * ROW_H + 60;

      const sprite = this.add.sprite(60, rowY + 16, char.spriteKey, 'f0');
      sprite.setScale(PREVIEW_SCALE);
      this.previewSprites.push(sprite);

      const hl = this.add.graphics();
      hl.lineStyle(2, 0x444444);
      hl.strokeRect(30, rowY - 10, 360, 52);
      this.highlightGraphics.push(hl);

      const nameText = this.add.text(100, rowY - 2, char.name, {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#cccccc',
      });
      this.nameTexts.push(nameText);

      const descText = this.add.text(100, rowY + 16, char.description, {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#888888',
      });
      this.descTexts.push(descText);
    });

    const hintText = this.add.text(cx, GAME_HEIGHT - 30, '\u2191\u2193 Navigate   Enter Select', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#666666',
    });
    hintText.setOrigin(0.5, 0.5);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    this.updateHighlight();
  }

  update(_time: number, delta: number): void {
    this.animTimer += delta;
    if (this.animTimer > 180) {
      this.animTimer = 0;
      this.currentFrame = (this.currentFrame + 1) % 4;
    }

    const dir = 0;
    this.previewSprites.forEach((sprite, i) => {
      const frameIndex = charDirectionFrameIndex(dir, this.currentFrame);
      sprite.setFrame(frameIndex);
      if (i === this.selectedIndex) {
        sprite.setScale(PREVIEW_SCALE + 0.2);
        sprite.setY(LIST_TOP + i * ROW_H + 60 + (this.currentFrame === 1 ? -1 : this.currentFrame === 2 ? 0 : 1));
      } else {
        sprite.setScale(PREVIEW_SCALE);
        sprite.setY(LIST_TOP + i * ROW_H + 60);
      }
    });

    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.selectedIndex = (this.selectedIndex - 1 + CHARACTERS.length) % CHARACTERS.length;
      this.updateHighlight();
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.selectedIndex = (this.selectedIndex + 1) % CHARACTERS.length;
      this.updateHighlight();
    }
    if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      this.selectCharacter();
    }
  }

  private updateHighlight(): void {
    this.highlightGraphics.forEach((hl, i) => {
      hl.clear();
      if (i === this.selectedIndex) {
        hl.lineStyle(3, 0x44cc44);
      } else {
        hl.lineStyle(2, 0x444444);
      }
      const rowY = LIST_TOP + i * ROW_H + 60;
      hl.strokeRect(30, rowY - 10, 360, 52);
    });

    this.nameTexts.forEach((t, i) => {
      t.setColor(i === this.selectedIndex ? '#44ff44' : '#cccccc');
    });
  }

  private selectCharacter(): void {
    const charId = this.selectedIndex;
    this.scene.start('GameScene', { characterId: charId });
  }
}
