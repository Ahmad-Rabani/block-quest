import Phaser from 'phaser';
import { createGameConfig } from './game/config/gameConfig';

const rootEl = document.getElementById('game-root');

if (!rootEl) {
  throw new Error('Missing #game-root element');
}

const root: HTMLElement = rootEl;

/**
 * Keep the game parent sized to the *visible* viewport on mobile browsers
 * (address bar show/hide), then ask Phaser to re-FIT.
 */
function syncViewportSize(): void {
  const vv = window.visualViewport;
  if (vv) {
    root.style.width = `${Math.round(vv.width)}px`;
    root.style.height = `${Math.round(vv.height)}px`;
    // Offset when the visual viewport is scrolled (iOS Safari quirk).
    root.style.transform = `translate(${Math.round(vv.offsetLeft)}px, ${Math.round(vv.offsetTop)}px)`;
  } else {
    root.style.width = '100%';
    root.style.height = '100%';
    root.style.transform = '';
  }
}

syncViewportSize();

const game = new Phaser.Game(createGameConfig(root));

const refreshScale = (): void => {
  syncViewportSize();
  game.scale.refresh();
};

window.addEventListener('resize', refreshScale);
window.visualViewport?.addEventListener('resize', refreshScale);
window.visualViewport?.addEventListener('scroll', refreshScale);
window.addEventListener('orientationchange', () => {
  window.setTimeout(refreshScale, 120);
});

// Helpful for debugging in browser console during development.
declare global {
  interface Window {
    __BLOCK_QUEST__?: Phaser.Game;
  }
}

window.__BLOCK_QUEST__ = game;
