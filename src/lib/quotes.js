const LOCAL_QUOTES = [
  {
    text: 'Clarity is compound interest on attention.',
    source: 'Original'
  },
  {
    text: 'Precision beats volume when stakes are real.',
    source: 'Original'
  },
  {
    text: 'Policy moves slowly until it doesn’t.',
    source: 'Original'
  },
  {
    text: 'Signal lives where incentives are exposed.',
    source: 'Original'
  }
];

export function selectDailyInsight(topics = []) {
  const theme = topics[0] || 'intelligence';
  const quote = LOCAL_QUOTES[Math.floor(Math.random() * LOCAL_QUOTES.length)];
  return {
    text: `${quote.text} (${theme})`,
    source: quote.source
  };
}
