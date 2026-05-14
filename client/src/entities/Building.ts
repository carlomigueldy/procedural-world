import Phaser from 'phaser';
import { TILE_SIZE, BuildingType, BUILDING_COLORS } from '../config/constants';
import { Building } from '../world/TileMap';

export class BuildingEntity {
  public container: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, building: Building) {
    const { width, height } = building.footprint;
    const pixelW = width * TILE_SIZE;
    const pixelH = height * TILE_SIZE;

    this.container = scene.add.container(building.x, building.y);

    const colors = BUILDING_COLORS[building.type];

    // Building base (walls) — slightly smaller than footprint for visual padding
    const baseW = pixelW * 0.85;
    const baseH = pixelH * 0.65;
    const base = scene.add.rectangle(0, pixelH * 0.1, baseW, baseH, colors.base);
    base.setOrigin(0.5, 0.5);

    // Roof — overhangs the base
    const roofW = pixelW * 0.95;
    const roofH = pixelH * 0.45;
    const roof = scene.add.rectangle(0, -pixelH * 0.15, roofW, roofH, colors.roof);
    roof.setOrigin(0.5, 0.5);

    // Door
    const doorW = TILE_SIZE * 0.35;
    const doorH = TILE_SIZE * 0.55;
    const door = scene.add.rectangle(0, pixelH * 0.18, doorW, doorH, 0x3a2a1a);
    door.setOrigin(0.5, 0.5);

    this.container.add([base, door, roof]);

    // Rotate the entire container
    this.container.setRotation((building.rotation * Math.PI) / 180);
    this.container.setDepth(2);
  }

  destroy(): void {
    this.container.destroy();
  }
}
