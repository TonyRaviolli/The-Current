#!/usr/bin/env node

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

function getArg(name, fallback) {
  const idx = process.argv.indexOf(name);
  if (idx === -1 || idx + 1 >= process.argv.length) return fallback;
  return process.argv[idx + 1];
}

function hasFlag(name) {
  return process.argv.includes(name);
}

const url = getArg('--url', 'http://localhost:3000');
const out = getArg('--out', 'shots/home.png');
const width = Number(getArg('--width', '1440'));
const height = Number(getArg('--height', '900'));
const fullPage = hasFlag('--full');
const waitMs = Number(getArg('--wait', '1500'));
const selector = getArg('--selector', 'main');

const outPath = path.resolve(out);
fs.mkdirSync(path.dirname(outPath), { recursive: true });

const browser = await chromium.launch({
  args: [
    '--disable-dev-shm-usage',
    '--no-sandbox',
    '--disable-gpu',
    '--single-process',
    '--no-zygote'
  ]
});
const page = await browser.newPage({ viewport: { width, height } });
await page.goto(url, { waitUntil: 'networkidle' });
if (selector) {
  await page.waitForSelector(selector, { timeout: 15000 });
}
if (waitMs) {
  await page.waitForTimeout(waitMs);
}
await page.screenshot({ path: outPath, fullPage });
await browser.close();

console.log(`Saved screenshot to ${outPath}`);
