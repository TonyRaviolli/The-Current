/**
 * storyGraph.js — Lightweight force-directed story graph on Canvas.
 *
 * Renders stories as nodes colored by topic, with edges between stories
 * sharing a topic. Force simulation: nodes repel, edges attract.
 * Auto-pauses after convergence to save CPU.
 *
 * Usage:
 *   import { renderStoryGraph } from './storyGraph.js';
 *   renderStoryGraph(document.getElementById('storyGraphCanvas'), stories);
 */

// Topic palette — matches TOPIC_PASTEL from render.js
const PALETTE = {
  economy:     '#c9a24a',
  finance:     '#d4a849',
  uspolitics:  '#6366f1',
  geopolitics: '#6d9fcf',
  tech:        '#0ea5e9',
  defense:     '#7c8a5e',
  health:      '#8ab06d',
  law:         '#a08a6e',
  elections:   '#8b7fcc',
  climate:     '#4a9e8e',
  energy:      '#dba058',
  science:     '#5a9ecf',
  education:   '#b09060',
  ai:          '#7ec8e3',
  default:     '#b0b8c4',
};

function topicColor(topics) {
  for (const t of (topics || [])) {
    const k = String(t).toLowerCase();
    if (PALETTE[k]) return PALETTE[k];
  }
  return PALETTE.default;
}

/**
 * Render a force-directed story graph.
 * @param {HTMLCanvasElement} canvas
 * @param {Array} stories — array of story objects with { headline, slug, topics, score }
 */
export function renderStoryGraph(canvas, stories) {
  if (!canvas || !stories?.length) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const W = rect.width || 600;
  const H = rect.height || 360;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);

  // Build nodes from top stories (cap at 40 for performance)
  const items = stories.slice(0, 40);
  const nodes = items.map((s, i) => ({
    id: i,
    label: s.headline || s.title || '',
    slug: s.slug || '',
    topics: (s.topics || []).map((t) => String(t).toLowerCase()),
    color: topicColor(s.topics),
    r: Math.max(6, Math.min(16, (s.score || 0.5) * 20)),
    x: W * 0.15 + Math.random() * W * 0.7,
    y: H * 0.15 + Math.random() * H * 0.7,
    vx: 0,
    vy: 0,
  }));

  // Build edges: connect stories sharing at least one topic
  const edges = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const shared = nodes[i].topics.filter((t) => nodes[j].topics.includes(t));
      if (shared.length > 0) {
        edges.push({ source: i, target: j, strength: shared.length });
      }
    }
  }

  // Force simulation parameters
  const REPEL = 1200;
  const ATTRACT = 0.008;
  const DAMPING = 0.88;
  const CENTER_PULL = 0.002;
  const DT = 1;
  let tickCount = 0;
  const MAX_TICKS = reducedMotion ? 1 : 180; // 3 seconds at 60fps, or instant

  // For static layout (reduced motion), run simulation synchronously
  if (reducedMotion) {
    for (let i = 0; i < 120; i++) simulate();
    draw();
    setupInteraction();
    return;
  }

  let animId = null;

  function simulate() {
    // Repulsion between all node pairs
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x;
        const dy = nodes[j].y - nodes[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = REPEL / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        nodes[i].vx -= fx;
        nodes[i].vy -= fy;
        nodes[j].vx += fx;
        nodes[j].vy += fy;
      }
    }

    // Attraction along edges
    for (const e of edges) {
      const a = nodes[e.source];
      const b = nodes[e.target];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const force = ATTRACT * e.strength;
      a.vx += dx * force;
      a.vy += dy * force;
      b.vx -= dx * force;
      b.vy -= dy * force;
    }

    // Center pull & update positions
    const cx = W / 2;
    const cy = H / 2;
    for (const n of nodes) {
      n.vx += (cx - n.x) * CENTER_PULL;
      n.vy += (cy - n.y) * CENTER_PULL;
      n.vx *= DAMPING;
      n.vy *= DAMPING;
      n.x += n.vx * DT;
      n.y += n.vy * DT;
      // Clamp to bounds
      n.x = Math.max(n.r + 4, Math.min(W - n.r - 4, n.x));
      n.y = Math.max(n.r + 4, Math.min(H - n.r - 4, n.y));
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Edges
    ctx.lineWidth = 0.5;
    for (const e of edges) {
      const a = nodes[e.source];
      const b = nodes[e.target];
      ctx.strokeStyle = `rgba(180,180,180,${Math.min(0.3, 0.1 * e.strength)})`;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    // Nodes
    for (const n of nodes) {
      // Glow
      ctx.fillStyle = n.color + '18';
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r + 4, 0, Math.PI * 2);
      ctx.fill();

      // Solid
      ctx.fillStyle = n.color;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();

      // Border
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  function tick() {
    simulate();
    draw();
    tickCount++;
    if (tickCount < MAX_TICKS) {
      animId = requestAnimationFrame(tick);
    } else {
      drawLabels();
    }
  }

  function drawLabels() {
    // After settling, draw labels for larger nodes
    ctx.font = '10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    for (const n of nodes) {
      if (n.r >= 10) {
        const short = n.label.length > 28 ? n.label.slice(0, 26) + '…' : n.label;
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillText(short, n.x, n.y + n.r + 14);
      }
    }
  }

  function setupInteraction() {
    // Tooltip on hover
    let tooltip = canvas.parentElement?.querySelector('.story-graph-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.className = 'story-graph-tooltip';
      canvas.parentElement?.appendChild(tooltip);
    }

    canvas.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect();
      const mx = e.clientX - r.left;
      const my = e.clientY - r.top;
      let hit = null;
      for (const n of nodes) {
        const dx = mx - n.x;
        const dy = my - n.y;
        if (dx * dx + dy * dy <= (n.r + 4) * (n.r + 4)) { hit = n; break; }
      }
      if (hit) {
        canvas.style.cursor = 'pointer';
        tooltip.textContent = hit.label;
        tooltip.style.display = 'block';
        tooltip.style.left = `${hit.x}px`;
        tooltip.style.top = `${hit.y - hit.r - 24}px`;
      } else {
        canvas.style.cursor = '';
        tooltip.style.display = 'none';
      }
    });

    canvas.addEventListener('click', (e) => {
      const r = canvas.getBoundingClientRect();
      const mx = e.clientX - r.left;
      const my = e.clientY - r.top;
      for (const n of nodes) {
        const dx = mx - n.x;
        const dy = my - n.y;
        if (dx * dx + dy * dy <= (n.r + 4) * (n.r + 4)) {
          if (n.slug && window.openStory) window.openStory(n.slug);
          break;
        }
      }
    });

    canvas.addEventListener('mouseleave', () => {
      tooltip.style.display = 'none';
    });
  }

  // Start animation
  animId = requestAnimationFrame(tick);
  setupInteraction();

  // Expose cleanup for SPA navigation
  canvas._graphCleanup = () => {
    if (animId) cancelAnimationFrame(animId);
  };
}
