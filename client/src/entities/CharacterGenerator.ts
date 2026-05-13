import Phaser from 'phaser';

const FRAME_W = 16;
const FRAME_H = 16;
const COLS = 4;
const ROWS = 4;
const SHEET_W = FRAME_W * COLS;
const SHEET_H = FRAME_H * ROWS;

export enum CharacterId {
  ADVENTURER = 0,
  HOODED = 1,
  KNIGHT = 2,
  WANDERER = 3,
}

export interface CharacterDesign {
  id: CharacterId;
  name: string;
  description: string;
  spriteKey: string;
}

export const CHARACTERS: CharacterDesign[] = [
  { id: CharacterId.ADVENTURER, name: 'Classic Adventurer', description: 'Pointy blue hat, red tunic, leather boots', spriteKey: 'char-adventurer' },
  { id: CharacterId.HOODED, name: 'Hooded Traveler', description: 'Green hood, earth-tone cloak, rugged boots', spriteKey: 'char-hooded' },
  { id: CharacterId.KNIGHT, name: 'Mini Knight', description: 'Silver helm, blue tabard, iron greaves', spriteKey: 'char-knight' },
  { id: CharacterId.WANDERER, name: 'Wanderer', description: 'Wide hat, weathered cloak, walking staff', spriteKey: 'char-wanderer' },
];

type PixelColor = string | null;

function p(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, ox: number, oy: number): void {
  ctx.fillStyle = color;
  ctx.fillRect(ox + x, oy + y, 1, 1);
}

function drawLegs(ctx: CanvasRenderingContext2D, ox: number, oy: number, frame: number, lc: string, rc: string, colorLeft: string, colorRight: string): void {
  const offsets: [number, number][] = [
    [0, 0],
    [1, -1],
    [0, 0],
    [-1, 1],
  ];
  const [lo, ro] = offsets[frame];
  const ly = oy + 11 + lo;
  const ry = oy + 11 + ro;

  p(ctx, lc.charCodeAt(0) - 97, ly, colorLeft, ox, 0);
  p(ctx, lc.charCodeAt(1) - 97, ly, colorLeft, ox, 0);
  p(ctx, rc.charCodeAt(0) - 97, ry, colorRight, ox, 0);
  p(ctx, rc.charCodeAt(1) - 97, ry, colorRight, ox, 0);
  p(ctx, lc.charCodeAt(0) - 97, ly + 1, colorLeft, ox, 0);
  p(ctx, lc.charCodeAt(1) - 97, ly + 1, colorLeft, ox, 0);
  p(ctx, rc.charCodeAt(0) - 97, ry + 1, colorRight, ox, 0);
  p(ctx, rc.charCodeAt(1) - 97, ry + 1, colorRight, ox, 0);
  p(ctx, lc.charCodeAt(2) - 97, ly + 2, colorLeft, ox, 0);
  p(ctx, rc.charCodeAt(3) - 97, ry + 2, colorRight, ox, 0);
}

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string, ox: number, oy: number): void {
  ctx.fillStyle = color;
  ctx.fillRect(ox + x, oy + y, w, h);
}

function drawAdventurerCell(ctx: CanvasRenderingContext2D, ox: number, oy: number, frame: number, direction: number): void {
  const skin = '#ffcc99';
  const hat = '#3355aa';
  const hatD = '#224488';
  const tunic = '#cc3333';
  const tunicD = '#aa2222';
  const boots = '#8B4513';
  const eyes = '#000000';

  if (direction === 0) {
    rect(ctx, 5, 0, 6, 1, hat, ox, oy);
    rect(ctx, 4, 1, 8, 1, hat, ox, oy);
    rect(ctx, 3, 2, 10, 1, hat, ox, oy);
    rect(ctx, 4, 3, 2, 1, hat, ox, oy);
    rect(ctx, 10, 3, 2, 1, hat, ox, oy);
    rect(ctx, 5, 0, 2, 1, hatD, ox, oy);

    rect(ctx, 5, 4, 6, 2, skin, ox, oy);
    p(ctx, 6, 5, eyes, ox, oy);
    p(ctx, 9, 5, eyes, ox, oy);

    rect(ctx, 4, 6, 8, 5, tunic, ox, oy);
    rect(ctx, 4, 6, 2, 5, tunicD, ox, oy);

    const offsets: [number, number][] = [[0, 0], [1, -1], [0, 0], [-1, 1]];
    const [lo, ro] = offsets[frame];
    rect(ctx, 5, 11 + lo, 2, 3, boots, ox, oy);
    rect(ctx, 9, 11 + ro, 2, 3, boots, ox, oy);
  } else if (direction === 1) {
    rect(ctx, 4, 0, 5, 1, hat, ox, oy);
    rect(ctx, 3, 1, 7, 1, hat, ox, oy);
    rect(ctx, 2, 2, 9, 1, hat, ox, oy);
    rect(ctx, 3, 3, 1, 1, hat, ox, oy);

    rect(ctx, 4, 4, 5, 2, skin, ox, oy);
    p(ctx, 7, 5, eyes, ox, oy);

    rect(ctx, 3, 6, 7, 5, tunic, ox, oy);
    rect(ctx, 9, 6, 2, 5, tunicD, ox, oy);

    const offsets: [number, number][] = [[0, 0], [1, -1], [0, 0], [-1, 1]];
    const [lo, ro] = offsets[frame];
    rect(ctx, 4, 11 + lo, 2, 3, boots, ox, oy);
    rect(ctx, 8, 11 + ro, 2, 3, boots, ox, oy);
  } else if (direction === 2) {
    rect(ctx, 7, 0, 5, 1, hat, ox, oy);
    rect(ctx, 6, 1, 7, 1, hat, ox, oy);
    rect(ctx, 5, 2, 9, 1, hat, ox, oy);
    rect(ctx, 12, 3, 1, 1, hat, ox, oy);

    rect(ctx, 7, 4, 5, 2, skin, ox, oy);
    p(ctx, 9, 5, eyes, ox, oy);

    rect(ctx, 6, 6, 7, 5, tunic, ox, oy);
    rect(ctx, 6, 6, 2, 5, tunicD, ox, oy);

    const offsets: [number, number][] = [[0, 0], [-1, 1], [0, 0], [1, -1]];
    const [lo, ro] = offsets[frame];
    rect(ctx, 6, 11 + lo, 2, 3, boots, ox, oy);
    rect(ctx, 10, 11 + ro, 2, 3, boots, ox, oy);
  } else {
    rect(ctx, 5, 0, 6, 1, hat, ox, oy);
    rect(ctx, 4, 1, 8, 1, hat, ox, oy);
    rect(ctx, 3, 2, 10, 1, hat, ox, oy);
    rect(ctx, 4, 3, 2, 1, hat, ox, oy);
    rect(ctx, 10, 3, 2, 1, hat, ox, oy);
    rect(ctx, 5, 0, 2, 1, hatD, ox, oy);

    rect(ctx, 5, 4, 6, 3, hat, ox, oy);
    rect(ctx, 8, 5, 1, 2, hatD, ox, oy);

    rect(ctx, 4, 7, 8, 4, tunic, ox, oy);
    rect(ctx, 4, 7, 2, 4, tunicD, ox, oy);

    const offsets: [number, number][] = [[0, 0], [1, -1], [0, 0], [-1, 1]];
    const [lo, ro] = offsets[frame];
    rect(ctx, 5, 11 + lo, 2, 3, boots, ox, oy);
    rect(ctx, 9, 11 + ro, 2, 3, boots, ox, oy);
  }
}

function drawHoodedCell(ctx: CanvasRenderingContext2D, ox: number, oy: number, frame: number, direction: number): void {
  const skin = '#d4a87a';
  const hood = '#4a6a3a';
  const hoodD = '#2a4a2a';
  const cloak = '#6a5a4a';
  const cloakD = '#4a3a2a';
  const boots = '#3a3a2a';
  const eyes = '#000000';

  if (direction === 0) {
    rect(ctx, 5, 0, 6, 1, hood, ox, oy);
    rect(ctx, 4, 1, 8, 1, hood, ox, oy);
    rect(ctx, 3, 2, 10, 2, hood, ox, oy);
    rect(ctx, 5, 3, 6, 1, hood, ox, oy);
    rect(ctx, 4, 4, 2, 1, hood, ox, oy);
    rect(ctx, 10, 4, 2, 1, hood, ox, oy);

    rect(ctx, 5, 5, 6, 1, skin, ox, oy);
    p(ctx, 6, 5, eyes, ox, oy);
    p(ctx, 9, 5, eyes, ox, oy);
    rect(ctx, 6, 6, 4, 1, skin, ox, oy);

    rect(ctx, 4, 7, 8, 4, cloak, ox, oy);
    rect(ctx, 4, 7, 2, 4, cloakD, ox, oy);

    const offsets: [number, number][] = [[0, 0], [1, -1], [0, 0], [-1, 1]];
    const [lo, ro] = offsets[frame];
    rect(ctx, 5, 11 + lo, 2, 3, boots, ox, oy);
    rect(ctx, 9, 11 + ro, 2, 3, boots, ox, oy);
  } else if (direction === 1) {
    rect(ctx, 4, 0, 5, 1, hood, ox, oy);
    rect(ctx, 3, 1, 8, 1, hood, ox, oy);
    rect(ctx, 2, 2, 9, 2, hood, ox, oy);
    rect(ctx, 4, 4, 1, 1, hood, ox, oy);

    rect(ctx, 5, 5, 4, 1, skin, ox, oy);
    p(ctx, 7, 5, eyes, ox, oy);
    rect(ctx, 5, 6, 4, 1, skin, ox, oy);

    rect(ctx, 3, 7, 8, 4, cloak, ox, oy);
    rect(ctx, 9, 7, 2, 4, cloakD, ox, oy);

    const offsets: [number, number][] = [[0, 0], [1, -1], [0, 0], [-1, 1]];
    const [lo, ro] = offsets[frame];
    rect(ctx, 4, 11 + lo, 2, 3, boots, ox, oy);
    rect(ctx, 8, 11 + ro, 2, 3, boots, ox, oy);
  } else if (direction === 2) {
    rect(ctx, 7, 0, 5, 1, hood, ox, oy);
    rect(ctx, 6, 1, 8, 1, hood, ox, oy);
    rect(ctx, 5, 2, 9, 2, hood, ox, oy);
    rect(ctx, 11, 4, 1, 1, hood, ox, oy);

    rect(ctx, 7, 5, 4, 1, skin, ox, oy);
    p(ctx, 9, 5, eyes, ox, oy);
    rect(ctx, 7, 6, 4, 1, skin, ox, oy);

    rect(ctx, 5, 7, 8, 4, cloak, ox, oy);
    rect(ctx, 5, 7, 2, 4, cloakD, ox, oy);

    const offsets: [number, number][] = [[0, 0], [-1, 1], [0, 0], [1, -1]];
    const [lo, ro] = offsets[frame];
    rect(ctx, 6, 11 + lo, 2, 3, boots, ox, oy);
    rect(ctx, 10, 11 + ro, 2, 3, boots, ox, oy);
  } else {
    rect(ctx, 5, 0, 6, 1, hood, ox, oy);
    rect(ctx, 4, 1, 8, 1, hood, ox, oy);
    rect(ctx, 3, 2, 10, 2, hood, ox, oy);
    rect(ctx, 5, 4, 6, 3, hood, ox, oy);
    rect(ctx, 8, 5, 1, 2, hoodD, ox, oy);

    rect(ctx, 4, 7, 8, 4, cloak, ox, oy);
    rect(ctx, 4, 7, 2, 4, cloakD, ox, oy);

    const offsets: [number, number][] = [[0, 0], [1, -1], [0, 0], [-1, 1]];
    const [lo, ro] = offsets[frame];
    rect(ctx, 5, 11 + lo, 2, 3, boots, ox, oy);
    rect(ctx, 9, 11 + ro, 2, 3, boots, ox, oy);
  }
}

function drawKnightCell(ctx: CanvasRenderingContext2D, ox: number, oy: number, frame: number, direction: number): void {
  const skin = '#ffcc99';
  const helm = '#c0c0c0';
  const helmD = '#808080';
  const tunic = '#3355aa';
  const tunicD = '#224488';
  const boots = '#666666';
  const eyes = '#000000';
  const accent = '#cc3333';

  if (direction === 0) {
    rect(ctx, 4, 0, 8, 1, helm, ox, oy);
    rect(ctx, 3, 1, 10, 1, helm, ox, oy);
    rect(ctx, 4, 2, 8, 2, helm, ox, oy);
    rect(ctx, 5, 2, 1, 1, helmD, ox, oy);
    rect(ctx, 10, 2, 1, 1, helmD, ox, oy);
    rect(ctx, 6, 3, 4, 1, helmD, ox, oy);

    rect(ctx, 6, 4, 4, 1, skin, ox, oy);
    p(ctx, 7, 4, eyes, ox, oy);
    p(ctx, 9, 4, eyes, ox, oy);
    rect(ctx, 5, 5, 6, 1, helm, ox, oy);
    rect(ctx, 5, 5, 1, 1, helmD, ox, oy);
    rect(ctx, 10, 5, 1, 1, helmD, ox, oy);

    rect(ctx, 4, 6, 8, 5, tunic, ox, oy);
    rect(ctx, 4, 6, 2, 5, tunicD, ox, oy);
    p(ctx, 7, 8, accent, ox, oy);
    p(ctx, 8, 8, accent, ox, oy);
    p(ctx, 7, 9, accent, ox, oy);
    p(ctx, 8, 9, accent, ox, oy);

    const offsets: [number, number][] = [[0, 0], [1, -1], [0, 0], [-1, 1]];
    const [lo, ro] = offsets[frame];
    rect(ctx, 5, 11 + lo, 2, 3, boots, ox, oy);
    rect(ctx, 9, 11 + ro, 2, 3, boots, ox, oy);
  } else if (direction === 1) {
    rect(ctx, 3, 0, 7, 1, helm, ox, oy);
    rect(ctx, 2, 1, 9, 1, helm, ox, oy);
    rect(ctx, 3, 2, 8, 2, helm, ox, oy);

    rect(ctx, 5, 4, 4, 1, skin, ox, oy);
    p(ctx, 7, 4, eyes, ox, oy);
    rect(ctx, 4, 5, 6, 1, helm, ox, oy);

    rect(ctx, 3, 6, 7, 5, tunic, ox, oy);
    rect(ctx, 3, 6, 2, 5, tunicD, ox, oy);
    p(ctx, 6, 8, accent, ox, oy);
    p(ctx, 7, 8, accent, ox, oy);
    p(ctx, 7, 9, accent, ox, oy);

    const offsets: [number, number][] = [[0, 0], [1, -1], [0, 0], [-1, 1]];
    const [lo, ro] = offsets[frame];
    rect(ctx, 4, 11 + lo, 2, 3, boots, ox, oy);
    rect(ctx, 8, 11 + ro, 2, 3, boots, ox, oy);
  } else if (direction === 2) {
    rect(ctx, 6, 0, 7, 1, helm, ox, oy);
    rect(ctx, 5, 1, 9, 1, helm, ox, oy);
    rect(ctx, 5, 2, 8, 2, helm, ox, oy);

    rect(ctx, 7, 4, 4, 1, skin, ox, oy);
    p(ctx, 9, 4, eyes, ox, oy);
    rect(ctx, 6, 5, 6, 1, helm, ox, oy);

    rect(ctx, 6, 6, 7, 5, tunic, ox, oy);
    rect(ctx, 6, 6, 2, 5, tunicD, ox, oy);
    p(ctx, 9, 8, accent, ox, oy);
    p(ctx, 9, 9, accent, ox, oy);

    const offsets: [number, number][] = [[0, 0], [-1, 1], [0, 0], [1, -1]];
    const [lo, ro] = offsets[frame];
    rect(ctx, 6, 11 + lo, 2, 3, boots, ox, oy);
    rect(ctx, 10, 11 + ro, 2, 3, boots, ox, oy);
  } else {
    rect(ctx, 4, 0, 8, 1, helm, ox, oy);
    rect(ctx, 3, 1, 10, 1, helm, ox, oy);
    rect(ctx, 4, 2, 8, 2, helm, ox, oy);
    rect(ctx, 5, 2, 1, 1, helmD, ox, oy);
    rect(ctx, 10, 2, 1, 1, helmD, ox, oy);
    rect(ctx, 6, 3, 4, 1, helmD, ox, oy);

    rect(ctx, 6, 4, 4, 2, helmD, ox, oy);
    rect(ctx, 8, 5, 1, 1, helm, ox, oy);

    rect(ctx, 4, 6, 8, 5, tunic, ox, oy);
    rect(ctx, 4, 6, 2, 5, tunicD, ox, oy);

    const offsets: [number, number][] = [[0, 0], [1, -1], [0, 0], [-1, 1]];
    const [lo, ro] = offsets[frame];
    rect(ctx, 5, 11 + lo, 2, 3, boots, ox, oy);
    rect(ctx, 9, 11 + ro, 2, 3, boots, ox, oy);
  }
}

function drawWandererCell(ctx: CanvasRenderingContext2D, ox: number, oy: number, frame: number, direction: number): void {
  const skin = '#e8c89a';
  const hat = '#8a6a3a';
  const hatD = '#6a4a2a';
  const cloak = '#b8966a';
  const cloakD = '#a07850';
  const boots = '#4a3a2a';
  const eyes = '#000000';
  const staff = '#6a4a2a';
  const staffL = '#8a6a4a';

  if (direction === 0) {
    rect(ctx, 3, 0, 10, 1, hat, ox, oy);
    rect(ctx, 2, 1, 12, 1, hat, ox, oy);
    rect(ctx, 3, 2, 2, 1, hat, ox, oy);
    rect(ctx, 11, 2, 2, 1, hat, ox, oy);
    rect(ctx, 5, 2, 6, 1, skin, ox, oy);
    rect(ctx, 4, 3, 8, 1, skin, ox, oy);
    rect(ctx, 2, 1, 2, 1, hatD, ox, oy);
    rect(ctx, 12, 1, 2, 1, hatD, ox, oy);

    p(ctx, 6, 4, eyes, ox, oy);
    p(ctx, 9, 4, eyes, ox, oy);
    rect(ctx, 5, 5, 6, 1, skin, ox, oy);

    rect(ctx, 4, 6, 8, 5, cloak, ox, oy);
    rect(ctx, 4, 6, 2, 5, cloakD, ox, oy);

    const offsets: [number, number][] = [[0, 0], [1, -1], [0, 0], [-1, 1]];
    const [lo, ro] = offsets[frame];
    rect(ctx, 5, 11 + lo, 2, 3, boots, ox, oy);
    rect(ctx, 9, 11 + ro, 2, 3, boots, ox, oy);
  } else if (direction === 1) {
    rect(ctx, 1, 0, 8, 1, hat, ox, oy);
    rect(ctx, 0, 1, 11, 1, hat, ox, oy);
    rect(ctx, 1, 2, 1, 1, hat, ox, oy);
    rect(ctx, 5, 2, 4, 1, skin, ox, oy);
    rect(ctx, 4, 3, 5, 1, skin, ox, oy);
    rect(ctx, 0, 1, 2, 1, hatD, ox, oy);

    p(ctx, 6, 4, eyes, ox, oy);
    rect(ctx, 5, 5, 4, 1, skin, ox, oy);

    rect(ctx, 3, 6, 8, 5, cloak, ox, oy);
    rect(ctx, 9, 6, 2, 5, cloakD, ox, oy);

    rect(ctx, 1, 3, 1, 9, staffL, ox, oy);
    rect(ctx, 1, 3, 1, 1, staff, ox, oy);
    rect(ctx, 1, 11, 1, 1, staff, ox, oy);

    const offsets: [number, number][] = [[0, 0], [1, -1], [0, 0], [-1, 1]];
    const [lo, ro] = offsets[frame];
    rect(ctx, 5, 11 + lo, 2, 3, boots, ox, oy);
    rect(ctx, 9, 11 + ro, 2, 3, boots, ox, oy);
  } else if (direction === 2) {
    rect(ctx, 7, 0, 8, 1, hat, ox, oy);
    rect(ctx, 5, 1, 11, 1, hat, ox, oy);
    rect(ctx, 14, 2, 1, 1, hat, ox, oy);
    rect(ctx, 7, 2, 4, 1, skin, ox, oy);
    rect(ctx, 7, 3, 5, 1, skin, ox, oy);
    rect(ctx, 14, 1, 2, 1, hatD, ox, oy);

    p(ctx, 10, 4, eyes, ox, oy);
    rect(ctx, 7, 5, 4, 1, skin, ox, oy);

    rect(ctx, 5, 6, 8, 5, cloak, ox, oy);
    rect(ctx, 5, 6, 2, 5, cloakD, ox, oy);

    rect(ctx, 14, 3, 1, 9, staffL, ox, oy);
    rect(ctx, 14, 3, 1, 1, staff, ox, oy);
    rect(ctx, 14, 11, 1, 1, staff, ox, oy);

    const offsets: [number, number][] = [[0, 0], [-1, 1], [0, 0], [1, -1]];
    const [lo, ro] = offsets[frame];
    rect(ctx, 6, 11 + lo, 2, 3, boots, ox, oy);
    rect(ctx, 10, 11 + ro, 2, 3, boots, ox, oy);
  } else {
    rect(ctx, 3, 0, 10, 1, hat, ox, oy);
    rect(ctx, 2, 1, 12, 1, hat, ox, oy);
    rect(ctx, 3, 2, 2, 1, hat, ox, oy);
    rect(ctx, 11, 2, 2, 1, hat, ox, oy);
    rect(ctx, 5, 2, 6, 2, hat, ox, oy);
    rect(ctx, 2, 1, 2, 1, hatD, ox, oy);
    rect(ctx, 12, 1, 2, 1, hatD, ox, oy);

    rect(ctx, 6, 4, 4, 1, hat, ox, oy);
    rect(ctx, 5, 5, 6, 1, skin, ox, oy);

    rect(ctx, 4, 6, 8, 5, cloak, ox, oy);
    rect(ctx, 4, 6, 2, 5, cloakD, ox, oy);

    rect(ctx, 13, 3, 1, 9, staffL, ox, oy);
    rect(ctx, 13, 3, 1, 1, staff, ox, oy);
    rect(ctx, 13, 11, 1, 1, staff, ox, oy);

    const offsets: [number, number][] = [[0, 0], [1, -1], [0, 0], [-1, 1]];
    const [lo, ro] = offsets[frame];
    rect(ctx, 5, 11 + lo, 2, 3, boots, ox, oy);
    rect(ctx, 9, 11 + ro, 2, 3, boots, ox, oy);
  }
}

type CellDrawFn = (ctx: CanvasRenderingContext2D, ox: number, oy: number, frame: number, direction: number) => void;

function generateSpriteSheet(scene: Phaser.Scene, key: string, drawCell: CellDrawFn): void {
  const tex = scene.textures.createCanvas(key, SHEET_W, SHEET_H);
  if (!tex) return;
  const canvas = tex.getSourceImage() as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  for (let dir = 0; dir < 4; dir++) {
    for (let f = 0; f < 4; f++) {
      const ox = f * FRAME_W;
      const oy = dir * FRAME_H;
      drawCell(ctx, ox, oy, f, dir);
    }
  }

  tex.refresh();

  for (let i = 0; i < 16; i++) {
    const dir = Math.floor(i / 4);
    const frame = i % 4;
    const fx = frame * FRAME_W;
    const fy = dir * FRAME_H;
    tex.add(`f${i}`, 0, fx, fy, FRAME_W, FRAME_H);
  }

  const texture = scene.textures.get(key);
  if (texture) texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
}

export function generateAllCharacterSpritesheets(scene: Phaser.Scene): void {
  generateSpriteSheet(scene, 'char-adventurer', drawAdventurerCell);
  generateSpriteSheet(scene, 'char-hooded', drawHoodedCell);
  generateSpriteSheet(scene, 'char-knight', drawKnightCell);
  generateSpriteSheet(scene, 'char-wanderer', drawWandererCell);
}

export function charDirectionFrameIndex(direction: number, frame: number): string {
  return `f${direction * 4 + frame}`;
}
