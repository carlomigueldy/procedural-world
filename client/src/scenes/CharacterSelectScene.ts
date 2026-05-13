import Phaser from 'phaser';
import { CHARACTERS, charDirectionFrameIndex } from '../entities/CharacterGenerator';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants';

const LIST_X = 25;
const LIST_W = 270;
const ENTRY_H = 78;
const LIST_TOP = 90;
const LIST_RIGHT = LIST_X + LIST_W;
const PREVIEW_CX = (LIST_RIGHT + GAME_WIDTH) / 2;
const PREVIEW_CY = GAME_HEIGHT / 2 - 20;
const PREVIEW_SCALE = 8;

export class CharacterSelectScene extends Phaser.Scene {
  private selectedIndex = 0;
  private animTimer = 0;
  private currentFrame = 0;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private enterKey!: Phaser.Input.Keyboard.Key;

  private previewSprite!: Phaser.GameObjects.Sprite;
  private previewName!: Phaser.GameObjects.Text;
  private previewDesc!: Phaser.GameObjects.Text;

  private entrySprites: Phaser.GameObjects.Sprite[] = [];
  private entryHighlights: Phaser.GameObjects.Graphics[] = [];
  private entryIndicators: Phaser.GameObjects.Graphics[] = [];
  private entryNameTexts: Phaser.GameObjects.Text[] = [];
  private entryDescTexts: Phaser.GameObjects.Text[] = [];

  private stars: { x: number; y: number; r: number; phase: number; speed: number }[] = [];
  private starGfx!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'CharacterSelectScene' });
  }

  create(): void {
    this.selectedIndex = 0;
    this.animTimer = 0;
    this.currentFrame = 0;
    this.entrySprites = [];
    this.entryHighlights = [];
    this.entryIndicators = [];
    this.entryNameTexts = [];
    this.entryDescTexts = [];
    this.stars = [];

    this.drawBackground();
    this.drawSpotlight();
    this.drawPlatform();
    this.buildList();
    this.buildPreview();
    this.setupInput();
    this.refreshSelected();
  }

  private drawBackground(): void {
    const bg = this.add.graphics().setDepth(-10);
    const steps = 48;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const r = Math.floor(8 + t * 14);
      const g = Math.floor(6 + t * 12);
      const b = Math.floor(28 + t * 24);
      bg.fillStyle(Phaser.Display.Color.GetColor(r, g, b));
      bg.fillRect(0, (i / steps) * GAME_HEIGHT, GAME_WIDTH, GAME_HEIGHT / steps + 1);
    }

    const floor = this.add.graphics().setDepth(-6);
    const fy = GAME_HEIGHT - 50;
    floor.fillStyle(0x10102a, 0.9);
    floor.fillRect(0, fy, GAME_WIDTH, 50);
    floor.lineStyle(1, 0x2a2a4e, 0.6);
    floor.lineBetween(0, fy, GAME_WIDTH, fy);
    for (let x = 0; x < GAME_WIDTH; x += 30) {
      floor.fillStyle(0x22224a, 0.3);
      floor.fillRect(x, fy, 1, 50);
    }

    this.starGfx = this.add.graphics().setDepth(-8);
    for (let i = 0; i < 70; i++) {
      this.stars.push({
        x: Math.random() * GAME_WIDTH,
        y: Math.random() * (GAME_HEIGHT - 60),
        r: 0.5 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
        speed: 0.8 + Math.random() * 1.5,
      });
    }
  }

  private drawSpotlight(): void {
    if (!this.textures.exists('spotlight')) {
      const size = 400;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      const cx = size / 2;
      const cy = size / 2;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, cx);
      g.addColorStop(0, 'rgba(255, 235, 180, 0.18)');
      g.addColorStop(0.25, 'rgba(255, 220, 150, 0.08)');
      g.addColorStop(0.55, 'rgba(180, 160, 120, 0.03)');
      g.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
      this.textures.addCanvas('spotlight', canvas);
    }
    this.add.image(PREVIEW_CX, PREVIEW_CY, 'spotlight').setDepth(-5).setAlpha(0.95);
  }

  private drawPlatform(): void {
    const g = this.add.graphics().setDepth(-4);
    const py = PREVIEW_CY + 65;

    g.fillStyle(0x4444aa, 0.12);
    g.fillEllipse(PREVIEW_CX, py, 200, 44);

    g.fillStyle(0x1a1a3a, 0.7);
    g.fillEllipse(PREVIEW_CX, py, 160, 30);

    g.lineStyle(2, 0x5555aa, 0.5);
    g.strokeEllipse(PREVIEW_CX, py, 160, 30);

    g.lineStyle(1, 0x8888cc, 0.25);
    g.strokeEllipse(PREVIEW_CX, py, 130, 20);
  }

  private buildList(): void {
    this.add.text(LIST_X + LIST_W / 2, 55, '— CHARACTERS —', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#7777aa',
    }).setOrigin(0.5).setDepth(-2);

    CHARACTERS.forEach((char, i) => {
      const ey = LIST_TOP + i * ENTRY_H;

      const sprite = this.add.sprite(LIST_X + 32, ey + ENTRY_H / 2 - 6, char.spriteKey, 'f0');
      sprite.setScale(2);
      this.entrySprites.push(sprite);

      const ind = this.add.graphics();
      this.entryIndicators.push(ind);

      const nameText = this.add.text(LIST_X + 58, ey + 14, char.name, {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#8888aa',
      });
      this.entryNameTexts.push(nameText);

      const descText = this.add.text(LIST_X + 58, ey + 32, char.description, {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#555577',
      });
      this.entryDescTexts.push(descText);

      const hl = this.add.graphics();
      this.entryHighlights.push(hl);
    });
  }

  private buildPreview(): void {
    const char = CHARACTERS[0];

    this.previewSprite = this.add.sprite(PREVIEW_CX, PREVIEW_CY - 10, char.spriteKey, 'f0');
    this.previewSprite.setScale(PREVIEW_SCALE);
    this.previewSprite.setDepth(1);

    this.previewName = this.add.text(PREVIEW_CX, PREVIEW_CY + 80, char.name, {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ddddff',
    }).setOrigin(0.5).setDepth(1);

    this.previewDesc = this.add.text(PREVIEW_CX, PREVIEW_CY + 100, char.description, {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#8888aa',
    }).setOrigin(0.5).setDepth(1);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 18, '\u2191\u2193 Navigate  \u23CE Select', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#555588',
    }).setOrigin(0.5).setDepth(1).setAlpha(0.7);
  }

  private setupInput(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
  }

  update(_time: number, delta: number): void {
    this.animTimer += delta;
    if (this.animTimer > 180) {
      this.animTimer = 0;
      this.currentFrame = (this.currentFrame + 1) % 4;
    }

    const frameName = charDirectionFrameIndex(0, this.currentFrame);

    this.entrySprites.forEach(s => s.setFrame(frameName));

    this.previewSprite.setFrame(frameName);
    this.previewSprite.setY(PREVIEW_CY - 10 + [0, -1, 0, 1][this.currentFrame]);

    const t = _time / 1000;
    this.starGfx.clear();
    this.stars.forEach(star => {
      const alpha = 0.2 + 0.8 * (0.5 + 0.5 * Math.sin(t * star.speed + star.phase));
      this.starGfx.fillStyle(0xffffff, alpha * 0.6);
      this.starGfx.fillCircle(star.x, star.y, star.r);
    });

    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.selectedIndex = (this.selectedIndex - 1 + CHARACTERS.length) % CHARACTERS.length;
      this.refreshSelected();
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.selectedIndex = (this.selectedIndex + 1) % CHARACTERS.length;
      this.refreshSelected();
    }
    if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      this.scene.start('GameScene', { characterId: this.selectedIndex });
    }
  }

  private refreshSelected(): void {
    const char = CHARACTERS[this.selectedIndex];

    this.previewSprite.setTexture(char.spriteKey);
    this.previewName.setText(char.name);
    this.previewDesc.setText(char.description);

    this.entryNameTexts.forEach((t, i) => {
      t.setColor(i === this.selectedIndex ? '#ddddff' : '#8888aa');
    });
    this.entryDescTexts.forEach((t, i) => {
      t.setColor(i === this.selectedIndex ? '#aaaacc' : '#555577');
    });

    this.entryIndicators.forEach((ind, i) => {
      ind.clear();
      if (i === this.selectedIndex) {
        ind.fillStyle(0x44dd44, 1);
        ind.fillRect(LIST_X + 5, LIST_TOP + i * ENTRY_H + 4, 3, ENTRY_H - 16);
      }
    });

    this.entryHighlights.forEach((hl, i) => {
      hl.clear();
      const ey = LIST_TOP + i * ENTRY_H;
      if (i === this.selectedIndex) {
        hl.lineStyle(1, 0x44dd44, 0.6);
      } else {
        hl.lineStyle(1, 0x222244, 1);
      }
      hl.strokeRect(LIST_X + 5, ey + 4, LIST_W - 25, ENTRY_H - 16);
    });
  }
}
