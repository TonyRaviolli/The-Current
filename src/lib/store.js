import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';
import path from 'node:path';

export async function loadJson(filePath, fallback) {
  try {
    const data = await readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch {
    return fallback;
  }
}

/**
 * Atomically write JSON to filePath.
 * Writes to a .tmp sibling first, then renames — so a mid-write crash
 * leaves the original file intact rather than producing corrupt JSON.
 */
export async function saveJson(filePath, data) {
  await mkdir(path.dirname(filePath), { recursive: true });
  const tmp = `${filePath}.tmp`;
  await writeFile(tmp, JSON.stringify(data, null, 2));
  await rename(tmp, filePath);
}
