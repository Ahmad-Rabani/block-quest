/**
 * Captures Play Store portrait frames via Playwright.
 * Usage: npm run store:shots
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'assets', 'store', 'screenshots', 'android');
const PORT = 4177;
const BASE = `http://127.0.0.1:${PORT}`;

const SHOTS = [
  { file: '01-menu.png', query: 'storeShot=menu' },
  { file: '02-classic-play.png', query: 'storeShot=play' },
  { file: '03-daily.png', query: 'storeShot=daily' },
  { file: '04-game-over.png', query: 'storeShot=gameover' },
];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, attempts = 40) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        return;
      }
    } catch {
      // retry
    }
    await wait(250);
  }
  throw new Error(`Preview server did not start at ${url}`);
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });

  const preview = spawn(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['vite', 'preview', '--host', '127.0.0.1', '--port', String(PORT), '--strictPort'],
    {
      cwd: root,
      stdio: 'pipe',
      shell: process.platform === 'win32',
    },
  );

  let previewLog = '';
  preview.stdout?.on('data', (d) => {
    previewLog += String(d);
  });
  preview.stderr?.on('data', (d) => {
    previewLog += String(d);
  });

  try {
    await waitForServer(BASE);
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
      viewport: { width: 1080, height: 1920 },
      deviceScaleFactor: 1,
    });

    await page.addInitScript(() => {
      const day = new Date();
      const y = day.getFullYear();
      const m = String(day.getMonth() + 1).padStart(2, '0');
      const d = String(day.getDate()).padStart(2, '0');
      localStorage.setItem('block-quest.bestScore', '12480');
      localStorage.setItem(`block-quest.dailyBest.${y}-${m}-${d}`, '3200');
      localStorage.setItem('block-quest.tutorialSeen', '1');
      localStorage.setItem('block-quest.muted', '1');
      localStorage.removeItem('block-quest.activeRun');
    });

    for (const shot of SHOTS) {
      const url = `${BASE}/?${shot.query}`;
      await page.goto(url, { waitUntil: 'networkidle' });
      await wait(1200);
      const dest = path.join(outDir, shot.file);
      await page.screenshot({ path: dest, type: 'png' });
      console.log(`Wrote ${path.relative(root, dest)}`);
    }

    await browser.close();
  } finally {
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', String(preview.pid), '/T', '/F'], {
        stdio: 'ignore',
        shell: true,
      });
    } else {
      preview.kill('SIGTERM');
      await wait(400);
      if (preview.exitCode === null) {
        preview.kill('SIGKILL');
      }
    }
    await wait(500);
  }

  if (previewLog.toLowerCase().includes('error')) {
    console.warn(previewLog.slice(-500));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
