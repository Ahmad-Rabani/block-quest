import Phaser from 'phaser';
import { createGameConfig } from './game/config/gameConfig';

const root = document.getElementById('game-root');

if (!root) {
  throw new Error('Missing #game-root element');
}

const game = new Phaser.Game(createGameConfig(root));

// Helpful for debugging in browser console during development.
declare global {
  interface Window {
    __BLOCK_QUEST__?: Phaser.Game;
  }
}

window.__BLOCK_QUEST__ = game;
