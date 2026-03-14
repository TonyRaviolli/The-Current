export function buildSourceHistoryProfile(source) {
  const historyMode = inferHistoryMode(source);
  const retentionDays = inferRetentionDays(source, historyMode);
  return {
    id: source.id,
    name: source.name,
    tier: source.tier,
    enabled: Boolean(source.enabled),
    historyMode,
    backfillable: historyMode !== 'none',
    retentionDays,
    notes: describeHistoryMode(historyMode, source)
  };
}

export function summarizeSourceHistory(sources = []) {
  const profiles = sources.map(buildSourceHistoryProfile);
  return {
    total: profiles.length,
    backfillable: profiles.filter((p) => p.backfillable).length,
    byMode: profiles.reduce((acc, profile) => {
      acc[profile.historyMode] = (acc[profile.historyMode] || 0) + 1;
      return acc;
    }, {}),
    profiles
  };
}

function inferHistoryMode(source = {}) {
  if (source.historyMode) return source.historyMode;
  if (source.type !== 'rss') return 'none';
  if (source.sourceType === 'primary') return 'official-feed';
  if (source.contentType === 'cartoon') return 'rolling-rss';
  return 'rolling-rss';
}

function inferRetentionDays(source, historyMode) {
  if (typeof source.historyDays === 'number') return source.historyDays;
  if (historyMode === 'official-feed') return 365;
  if (historyMode === 'rolling-rss') return 180;
  return 0;
}

function describeHistoryMode(mode, source) {
  if (mode === 'official-feed') return 'Official feed; good candidate for recurring backfill sweeps.';
  if (mode === 'rolling-rss') return 'RSS-only rolling feed; history depth depends on publisher feed retention.';
  return `No supported historical adapter for ${source.name}.`;
}
