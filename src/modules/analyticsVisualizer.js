/**
 * AURA Analytics Engine — Flowing Activity Field & Consistency Matrix
 * Renders smooth cubic bezier flowing curves, interactive hover inspection,
 * and multi-week consistency matrix cells.
 */

const TIMEFRAME_DATA = {
  '7d': {
    hours: '38.4 hrs',
    hoursDelta: '+14% vs last week',
    streak: '18 Days',
    velocity: '94%',
    lines: '1,420',
    points: [
      { day: 'Mon', val: 4.2, loc: 180 },
      { day: 'Tue', val: 5.8, loc: 320 },
      { day: 'Wed', val: 3.5, loc: 140 },
      { day: 'Thu', val: 6.8, loc: 410 },
      { day: 'Fri', val: 5.1, loc: 290 },
      { day: 'Sat', val: 7.2, loc: 520 },
      { day: 'Sun', val: 5.8, loc: 360 }
    ]
  },
  '30d': {
    hours: '154.2 hrs',
    hoursDelta: '+22% vs prev month',
    streak: '18 Days',
    velocity: '91%',
    lines: '6,180',
    points: [
      { day: 'Wk 1', val: 32.4, loc: 1420 },
      { day: 'Wk 2', val: 38.8, loc: 1680 },
      { day: 'Wk 3', val: 44.6, loc: 1940 },
      { day: 'Wk 4', val: 38.4, loc: 1140 }
    ]
  },
  '90d': {
    hours: '428.0 hrs',
    hoursDelta: '+34% across quarter',
    streak: '18 Days',
    velocity: '89%',
    lines: '18,450',
    points: [
      { day: 'Month 1', val: 122, loc: 5400 },
      { day: 'Month 2', val: 151, loc: 6870 },
      { day: 'Month 3', val: 155, loc: 6180 }
    ]
  }
};

export function initAnalyticsVisualizer() {
  initHeatmapMatrix();
  renderFlowingCurve('7d');
  initTimeframeControls();
}

/**
 * 1. Consistency Matrix Heatmap
 */
function initHeatmapMatrix() {
  const container = document.getElementById('consistency-grid-target');
  if (!container) return;

  const TOTAL_CELLS = 7 * 16; // 16 weeks of 7 days
  let html = '';

  for (let i = 0; i < TOTAL_CELLS; i++) {
    // Generate realistic distribution
    const rand = Math.random();
    let lvl = 'lvl-1';
    if (rand < 0.2) lvl = '';
    else if (rand < 0.5) lvl = 'lvl-1';
    else if (rand < 0.8) lvl = 'lvl-2';
    else if (rand < 0.94) lvl = 'lvl-3';
    else lvl = 'lvl-4';

    html += `<div class="heatmap-cell ${lvl}" title="Day ${i + 1}: ${lvl ? 'Active focus logged' : 'Rest day'}"></div>`;
  }

  container.innerHTML = html;
}

/**
 * 2. Dynamic Flowing SVG Chart
 */
function renderFlowingCurve(timeframe) {
  const svg = document.getElementById('flowing-svg-chart');
  if (!svg) return;

  const data = TIMEFRAME_DATA[timeframe];
  const points = data.points;
  const w = svg.clientWidth || 800;
  const h = svg.clientHeight || 220;

  const maxVal = Math.max(...points.map((p) => p.val)) * 1.25;
  const stepX = w / (points.length - 1);

  const coords = points.map((p, i) => {
    const x = i * stepX;
    const y = h - (p.val / maxVal) * (h - 40) - 20;
    return { x, y, day: p.day, val: p.val, loc: p.loc };
  });

  // Build smooth cubic bezier path
  let pathD = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[i];
    const p1 = coords[i + 1];
    const cp1x = p0.x + (p1.x - p0.x) / 2;
    const cp1y = p0.y;
    const cp2x = p0.x + (p1.x - p0.x) / 2;
    const cp2y = p1.y;
    pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
  }

  // Gradient Area Fill Path
  const areaD = `${pathD} L ${coords[coords.length - 1].x} ${h} L ${coords[0].x} ${h} Z`;

  svg.innerHTML = `
    <defs>
      <linearGradient id="curveGradient" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#6366F1" />
        <stop offset="60%" stop-color="#38BDF8" />
        <stop offset="100%" stop-color="#34D399" />
      </linearGradient>
      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(99, 102, 241, 0.35)" />
        <stop offset="60%" stop-color="rgba(56, 189, 248, 0.12)" />
        <stop offset="100%" stop-color="rgba(56, 189, 248, 0.0)" />
      </linearGradient>
    </defs>
    <path d="${areaD}" fill="url(#areaGradient)" />
    <path d="${pathD}" fill="none" stroke="url(#curveGradient)" stroke-width="3" stroke-linecap="round" />
    ${coords
      .map(
        (c) => `
      <circle cx="${c.x}" cy="${c.y}" r="4" fill="#FFFFFF" stroke="#38BDF8" stroke-width="2" class="chart-point" />
      <text x="${c.x}" y="${h - 6}" font-size="10" font-family="monospace" fill="#86868B" text-anchor="middle">${c.day}</text>
    `
      )
      .join('')}
  `;

  // Update big metrics
  const hEl = document.getElementById('stat-study-hours');
  const dEl = document.getElementById('stat-hours-delta');
  const vEl = document.getElementById('stat-velocity');
  const lEl = document.getElementById('stat-lines');

  if (hEl) hEl.textContent = data.hours;
  if (dEl) dEl.textContent = data.hoursDelta;
  if (vEl) vEl.textContent = data.velocity;
  if (lEl) lEl.textContent = data.lines;
}

/**
 * 3. Segmented Timeframe Switcher
 */
function initTimeframeControls() {
  const btns = document.querySelectorAll('[data-timeframe]');
  btns.forEach((btn) => {
    btn.addEventListener('click', () => {
      btns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const tf = btn.getAttribute('data-timeframe');
      renderFlowingCurve(tf);
    });
  });

  window.addEventListener('resize', () => {
    const active = document.querySelector('[data-timeframe].active');
    const tf = active ? active.getAttribute('data-timeframe') : '7d';
    renderFlowingCurve(tf);
  });
}
