/**
 * sanitize.js — Text sanitization for The UnderCurrent pipeline.
 *
 * Handles RSS/Atom content that may contain HTML markup, encoded entities,
 * control characters, and embedded scripts.
 *
 * Processing order matters:
 *   1. Strip <script>/<style> content (tags + inner content)
 *   2. Strip all remaining HTML tags
 *   3. Decode HTML entities (after tag removal to avoid false tag matches)
 *   4. Strip control characters
 *   5. Collapse whitespace
 */

const NAMED_ENTITIES = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#039;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
  '&ndash;': '–',
  '&mdash;': '—',
  '&hellip;': '…',
  '&lsquo;': '\u2018',
  '&rsquo;': '\u2019',
  '&ldquo;': '\u201C',
  '&rdquo;': '\u201D'
};

const SCRIPT_STYLE_RE = /<(script|style)[^>]*>[\s\S]*?<\/\1>/gi;
const TAG_RE = /<[^>]*>/g;
const NAMED_ENTITY_RE = /&[a-zA-Z]{2,8};/g;
const NUMERIC_ENTITY_RE = /&#(x[0-9a-fA-F]+|\d+);/g;
const CONTROL_RE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;
const WHITESPACE_RE = /\s+/g;

function decodeNumeric(_, code) {
  try {
    const cp = code.startsWith('x') || code.startsWith('X')
      ? parseInt(code.slice(1), 16)
      : parseInt(code, 10);
    // Reject dangerous control codepoints (keep tab 0x09, newline 0x0A)
    if (cp < 0x20 && cp !== 0x09 && cp !== 0x0A) return ' ';
    return String.fromCodePoint(cp);
  } catch {
    return ' ';
  }
}

export function stripHtml(input = '') {
  return String(input)
    // 1. Remove script/style blocks (tags + all inner content)
    .replace(SCRIPT_STYLE_RE, ' ')
    // 2. Strip all remaining HTML tags (must happen BEFORE entity decode)
    .replace(TAG_RE, ' ')
    // 3. Decode entities now that angle brackets are gone
    .replace(NAMED_ENTITY_RE, (m) => NAMED_ENTITIES[m] || ' ')
    .replace(NUMERIC_ENTITY_RE, decodeNumeric)
    // 4. Strip control characters
    .replace(CONTROL_RE, '')
    // 5. Collapse whitespace
    .replace(WHITESPACE_RE, ' ')
    .trim();
}

export function safeText(input = '', maxLength = 1000) {
  const cleaned = stripHtml(input);
  return cleaned.length > maxLength ? cleaned.slice(0, maxLength).trim() : cleaned;
}
