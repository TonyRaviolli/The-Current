import { refreshOnce } from './refresh.js';
import { loadArchive, summarizeArchive } from './lib/archive.js';
import { readFile } from 'node:fs/promises';
import { summarizeSourceHistory } from './lib/source-history.js';

const DATA_DIR = process.env.DATA_DIR || './data';
const SOURCES_CONFIG_PATH = new URL('../config/sources.json', import.meta.url);

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const startedAt = Date.now();
  const sourceConfig = JSON.parse(await readFile(SOURCES_CONFIG_PATH, 'utf8'));
  const allSources = Object.values(sourceConfig.tiers).flat();
  const sourceIds = resolveSourceIds(allSources, args);
  const passes = Math.max(1, args.passes);
  let lastStore = null;

  for (let pass = 0; pass < passes; pass++) {
    lastStore = await refreshOnce({
      force: true,
      sourceIds,
      tier: args.tier,
      maxSources: args.maxSources
    });
  }

  const archive = await loadArchive(DATA_DIR);
  const summary = summarizeArchive(archive);
  const payload = {
    ok: true,
    refreshOutcome: lastStore?.refreshOutcome || 'updated',
    stories: lastStore?.stories?.length || 0,
    passes,
    selectedSources: sourceIds.length || null,
    sourceHistory: summarizeSourceHistory(
      allSources.filter((source) => !sourceIds.length || sourceIds.includes(source.id))
    ),
    durationMs: Date.now() - startedAt,
    archive: summary
  };
  console.log(JSON.stringify(payload, null, 2));
}

run().catch((err) => {
  console.error(JSON.stringify({ ok: false, error: err.message }, null, 2));
  process.exit(1);
});

function parseArgs(argv = []) {
  const out = { passes: 1, tier: null, source: '', maxSources: null };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === '--passes' && next) out.passes = Number(next);
    if (arg === '--tier' && next) out.tier = Number(next);
    if (arg === '--source' && next) out.source = String(next);
    if (arg === '--max-sources' && next) out.maxSources = Number(next);
  }
  return out;
}

function resolveSourceIds(allSources, args) {
  if (!args.source) return [];
  const requested = new Set(String(args.source).split(',').map((value) => value.trim()).filter(Boolean));
  return allSources.filter((source) => requested.has(source.id)).map((source) => source.id);
}
