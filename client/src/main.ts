import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { CharacterSelectScene } from './scenes/CharacterSelectScene';
import { GameScene } from './scenes/GameScene';
import { setGameSize } from './config/constants';

setGameSize(window.innerWidth, window.innerHeight);

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'game',
  backgroundColor: '#000000',
  scene: [BootScene, CharacterSelectScene, GameScene],
  scale: {
    mode: Phaser.Scale.RESIZE,
  },
};

new Phaser.Game(config);
