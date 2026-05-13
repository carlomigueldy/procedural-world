import Phaser from 'phaser';

const FRAME_W = 48;
const FRAME_H = 48;
const COLS = 4;
const ROWS = 4;
const SHEET_W = FRAME_W * COLS;
const SHEET_H = FRAME_H * ROWS;

export const TREE_SPRITESHEET_KEY = 'tree-spritesheet';

export const TREE_FRAMES = {
  OAK_0: 0,
  OAK_1: 1,
  OAK_2: 2,
  OAK_3: 3,
  PINE_0: 4,
  PINE_1: 5,
  PINE_2: 6,
  PINE_3: 7,
  AUTUMN_0: 8,
  AUTUMN_1: 9,
  AUTUMN_2: 10,
  AUTUMN_3: 11,
  DEAD_0: 12,
  DEAD_1: 13,
  DEAD_2: 14,
  DEAD_3: 15,
};

function drawTrunk(ctx: CanvasRenderingContext2D, cx: number, by: number, w: number, h: number): void {
  const half = Math.floor(w / 2);
  ctx.fillStyle = '#4a2a0a';
  ctx.fillRect(cx - half, by - h, w, h);
  ctx.fillStyle = '#3a1a00';
  ctx.fillRect(cx - half, by - h, Math.max(1, half), h);
}

function drawPixelCircle(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string): void {
  ctx.fillStyle = color;
  const rr = r * r;
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      if (dx * dx + dy * dy <= rr) {
        ctx.fillRect(cx + dx, cy + dy, 1, 1);
      }
    }
  }
}

function drawOakCell(ctx: CanvasRenderingContext2D, ox: number, oy: number, variant: number): void {
  const cx = ox + 24;
  const base = oy + 42;
  const canopyCenter = oy + 28;

  drawTrunk(ctx, cx, base, 5, 10);

  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  drawPixelCircle(ctx, cx, oy + 46, 14, 'rgba(0,0,0,0.12)');

  const dark = '#1a4a1a';
  const mid = '#2d6a27';
  const light = '#3a7a2f';
  const highlight = '#4a8a3f';
  const top = '#5a9a4f';

  switch (variant) {
    case 0:
      drawPixelCircle(ctx, cx, canopyCenter + 6, 20, dark);
      drawPixelCircle(ctx, cx, canopyCenter + 4, 18, mid);
      drawPixelCircle(ctx, cx, canopyCenter + 2, 15, light);
      drawPixelCircle(ctx, cx, canopyCenter, 11, highlight);
      drawPixelCircle(ctx, cx, canopyCenter - 4, 6, top);
      break;
    case 1:
      drawPixelCircle(ctx, cx, canopyCenter + 4, 17, dark);
      drawPixelCircle(ctx, cx, canopyCenter + 2, 15, mid);
      drawPixelCircle(ctx, cx, canopyCenter, 12, light);
      drawPixelCircle(ctx, cx, canopyCenter - 2, 8, highlight);
      drawPixelCircle(ctx, cx, canopyCenter - 6, 4, top);
      break;
    case 2:
      drawPixelCircle(ctx, cx, canopyCenter + 2, 13, dark);
      drawPixelCircle(ctx, cx, canopyCenter, 11, mid);
      drawPixelCircle(ctx, cx, canopyCenter - 2, 8, light);
      drawPixelCircle(ctx, cx, canopyCenter - 4, 5, highlight);
      break;
    case 3:
      drawPixelCircle(ctx, cx, canopyCenter + 8, 22, dark);
      drawPixelCircle(ctx, cx, canopyCenter + 6, 20, mid);
      drawPixelCircle(ctx, cx, canopyCenter + 4, 17, light);
      drawPixelCircle(ctx, cx, canopyCenter + 2, 13, highlight);
      drawPixelCircle(ctx, cx, canopyCenter - 2, 7, top);
      break;
  }
}

function drawPineCell(ctx: CanvasRenderingContext2D, ox: number, oy: number, variant: number): void {
  const cx = ox + 24;
  const base = oy + 42;

  drawTrunk(ctx, cx, base, 4, 10);

  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  drawPixelCircle(ctx, cx, oy + 46, 12, 'rgba(0,0,0,0.10)');

  const dark = '#0e2e0e';
  const mid = '#142e14';
  const light = '#1a3a1a';
  const highlight = '#2a4a2a';

  function drawTriangleLayer(y: number, baseW: number, color: string): void {
    const half = Math.floor(baseW / 2);
    for (let row = 0; row < 8; row++) {
      const w = Math.max(1, baseW - Math.floor(row * baseW / 8));
      const hw = Math.floor(w / 2);
      for (let dx = -hw; dx <= hw; dx++) {
        const rowFade = Math.floor(row / 2);
        if (rowFade > 0 && (dx === -hw || dx === hw)) continue;
        ctx.fillStyle = color;
        ctx.fillRect(cx + dx, y - row, 1, 1);
      }
    }
  }

  switch (variant) {
    case 0:
      drawTriangleLayer(oy + 38, 22, dark);
      drawTriangleLayer(oy + 34, 18, mid);
      drawTriangleLayer(oy + 28, 14, light);
      drawTriangleLayer(oy + 22, 10, highlight);
      break;
    case 1:
      drawTriangleLayer(oy + 38, 26, dark);
      drawTriangleLayer(oy + 34, 22, mid);
      drawTriangleLayer(oy + 28, 18, light);
      drawTriangleLayer(oy + 22, 14, highlight);
      break;
    case 2:
      drawTriangleLayer(oy + 36, 16, dark);
      drawTriangleLayer(oy + 32, 13, mid);
      drawTriangleLayer(oy + 26, 10, light);
      drawTriangleLayer(oy + 20, 7, highlight);
      break;
    case 3:
      drawTriangleLayer(oy + 40, 20, dark);
      drawTriangleLayer(oy + 36, 16, mid);
      drawTriangleLayer(oy + 30, 12, light);
      drawTriangleLayer(oy + 24, 8, highlight);
      drawTriangleLayer(oy + 18, 5, highlight);
      break;
  }
}

function drawAutumnCell(ctx: CanvasRenderingContext2D, ox: number, oy: number, variant: number): void {
  const cx = ox + 24;
  const base = oy + 42;
  const canopyCenter = oy + 28;

  drawTrunk(ctx, cx, base, 5, 10);

  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  drawPixelCircle(ctx, cx, oy + 46, 14, 'rgba(0,0,0,0.12)');

  const dark = '#6a3a1a';
  const mid = '#8a4a1a';
  const light = '#aa6a1a';
  const highlight = '#cc8833';
  const top = '#dd9944';

  switch (variant) {
    case 0:
      drawPixelCircle(ctx, cx, canopyCenter + 6, 20, dark);
      drawPixelCircle(ctx, cx, canopyCenter + 4, 18, mid);
      drawPixelCircle(ctx, cx, canopyCenter + 2, 15, light);
      drawPixelCircle(ctx, cx, canopyCenter, 11, highlight);
      drawPixelCircle(ctx, cx, canopyCenter - 4, 6, top);
      break;
    case 1:
      drawPixelCircle(ctx, cx, canopyCenter + 4, 17, dark);
      drawPixelCircle(ctx, cx, canopyCenter + 2, 15, mid);
      drawPixelCircle(ctx, cx, canopyCenter, 12, light);
      drawPixelCircle(ctx, cx, canopyCenter - 2, 8, highlight);
      break;
    case 2:
      drawPixelCircle(ctx, cx, canopyCenter + 6, 20, '#5a1a0a');
      drawPixelCircle(ctx, cx, canopyCenter + 4, 18, '#7a2a0a');
      drawPixelCircle(ctx, cx, canopyCenter + 2, 15, '#9a3a1a');
      drawPixelCircle(ctx, cx, canopyCenter, 11, '#bb4a2a');
      drawPixelCircle(ctx, cx, canopyCenter - 4, 6, '#cc5a3a');
      break;
    case 3:
      drawPixelCircle(ctx, cx, canopyCenter + 4, 16, '#5a5a1a');
      drawPixelCircle(ctx, cx, canopyCenter + 2, 14, '#7a7a2a');
      drawPixelCircle(ctx, cx, canopyCenter, 11, '#9a9a3a');
      drawPixelCircle(ctx, cx, canopyCenter - 2, 8, '#bbbb4a');
      break;
  }
}

function drawDeadTreeCell(ctx: CanvasRenderingContext2D, ox: number, oy: number, variant: number): void {
  const cx = ox + 24;
  const base = oy + 42;

  const dark = '#2a2a2a';
  const mid = '#3a3a3a';
  const light = '#4a4a4a';

  drawTrunk(ctx, cx, base, 4, 14);

  function drawBranch(angle: number, length: number, color: string): void {
    const endX = Math.round(cx + Math.cos(angle) * length);
    const endY = Math.round((base - 6) + Math.sin(angle) * length);
    const steps = Math.max(Math.abs(endX - cx), Math.abs(endY - (base - 6)));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const bx = Math.round(cx + (endX - cx) * t);
      const by = Math.round((base - 6) + (endY - (base - 6)) * t);
      ctx.fillStyle = color;
      ctx.fillRect(bx, by, 1, 1);
    }
  }

  switch (variant) {
    case 0:
      drawBranch(-2.0, 14, dark);
      drawBranch(-1.2, 10, mid);
      drawBranch(-0.5, 12, dark);
      drawBranch(0.5, 12, mid);
      drawBranch(1.2, 10, dark);
      drawBranch(2.0, 14, mid);
      drawBranch(-1.6, 8, light);
      drawBranch(1.6, 8, light);
      break;
    case 1:
      drawBranch(-1.8, 18, dark);
      drawBranch(-1.0, 14, mid);
      drawBranch(0.0, 16, dark);
      drawBranch(1.0, 14, mid);
      drawBranch(1.8, 18, dark);
      drawBranch(-2.2, 12, light);
      drawBranch(2.2, 12, light);
      break;
    case 2:
      drawBranch(-1.5, 10, dark);
      drawBranch(-0.8, 8, mid);
      drawBranch(0.8, 8, mid);
      drawBranch(1.5, 10, dark);
      drawBranch(-1.0, 6, light);
      drawBranch(1.0, 6, light);
      ctx.fillStyle = '#2a2a2a';
      ctx.fillRect(cx - 1, base - 14, 3, 4);
      break;
    case 3:
      drawBranch(-1.8, 8, dark);
      drawBranch(1.8, 8, dark);
      drawBranch(-1.0, 5, mid);
      drawBranch(1.0, 5, mid);
      break;
  }
}

type CellDrawFn = (ctx: CanvasRenderingContext2D, ox: number, oy: number, variant: number) => void;

function generateSpriteSheet(scene: Phaser.Scene): void {
  const tex = scene.textures.createCanvas(TREE_SPRITESHEET_KEY, SHEET_W, SHEET_H);
  if (!tex) return;
  const canvas = tex.getSourceImage() as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const drawers: CellDrawFn[] = [
    drawOakCell, drawOakCell, drawOakCell, drawOakCell,
    drawPineCell, drawPineCell, drawPineCell, drawPineCell,
    drawAutumnCell, drawAutumnCell, drawAutumnCell, drawAutumnCell,
    drawDeadTreeCell, drawDeadTreeCell, drawDeadTreeCell, drawDeadTreeCell,
  ];

  for (let i = 0; i < 16; i++) {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const ox = col * FRAME_W;
    const oy = row * FRAME_H;
    const variant = i % 4;
    drawers[i](ctx, ox, oy, variant);
  }

  tex.refresh();

  for (let i = 0; i < 16; i++) {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const fx = col * FRAME_W;
    const fy = row * FRAME_H;
    tex.add(`tree-${i}`, 0, fx, fy, FRAME_W, FRAME_H);
  }

  const texture = scene.textures.get(TREE_SPRITESHEET_KEY);
  if (texture) texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
}

export function generateTreeSpritesheet(scene: Phaser.Scene): void {
  generateSpriteSheet(scene);
}
