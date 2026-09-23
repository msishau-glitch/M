const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const ffmpegPath = require('ffmpeg-static');

const rootDir = __dirname;
const assetsDir = path.join(rootDir, 'whatsapp-package', 'assets');
fs.mkdirSync(assetsDir, { recursive: true });

const staticUrl = 'http://127.0.0.1:3000/website.html';
const statusFile = path.join(rootDir, 'whatsapp-package', 'status-preview.html');

async function exportStaticPng() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto(staticUrl, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(assetsDir, 'Mutakulwa-Mubita-Robert-Singogo-Wedding-Invitation.png'), fullPage: true });
  await browser.close();
}

async function exportStatusPng() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto('file://' + statusFile, { waitUntil: 'load' });
  await page.screenshot({ path: path.join(assetsDir, 'Mutakulwa-Mubita-Robert-Singogo-Wedding-Status.png'), fullPage: true });
  await browser.close();
}

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const { spawn } = require('child_process');
    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`Command failed with exit code ${code}: ${command} ${args.join(' ')}`))));
    child.on('error', reject);
  });
}

async function exportMp4() {
  const input = path.join(assetsDir, 'Mutakulwa-Mubita-Robert-Singogo-Wedding-Invitation.png');
  const output = path.join(assetsDir, 'Mutakulwa-Mubita-Robert-Singogo-Wedding-Invitation.mp4');

  const ffmpegArgs = [
    '-y',
    '-loop', '1',
    '-framerate', '30',
    '-i', input,
    '-vf', 'scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,format=yuv420p',
    '-t', '35',
    '-r', '30',
    '-pix_fmt', 'yuv420p',
    '-c:v', 'libx264',
    '-movflags', '+faststart',
    output
  ];

  await runCommand(ffmpegPath, ffmpegArgs);
}

(async () => {
  try {
    await exportStaticPng();
    await exportStatusPng();
    await exportMp4();
    console.log('WhatsApp package exported successfully.');
  } catch (error) {
    console.error('Export failed:', error.message);
    process.exit(1);
  }
})();
