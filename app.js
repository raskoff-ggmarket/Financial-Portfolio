/* ============================================================
   QuantEdge — Portfolio Application Logic
   ============================================================ */

'use strict';

// ── DATA ──────────────────────────────────────────────────
const HOLDINGS = [
  { sym: 'AAPL', name: 'Apple Inc.',           price: 211.84, shares: 185, cost: 148.30, chg: +1.24, rating: 'BUY',  weight: 16.4, logo: 'A' },
  { sym: 'MSFT', name: 'Microsoft Corp.',       price: 442.57, shares: 72,  cost: 280.14, chg: +0.88, rating: 'BUY',  weight: 13.3, logo: 'M' },
  { sym: 'NVDA', name: 'NVIDIA Corp.',          price: 134.90, shares: 410, cost:  48.72, chg: +2.61, rating: 'BUY',  weight: 23.1, logo: 'N' },
  { sym: 'GOOGL', name: 'Alphabet Inc.',        price: 186.42, shares: 95,  cost: 121.30, chg: -0.34, rating: 'HOLD', weight: 7.4, logo: 'G' },
  { sym: 'META',  name: 'Meta Platforms',       price: 603.18, shares: 38,  cost: 210.80, chg: +1.52, rating: 'BUY',  weight: 9.6, logo: 'M' },
  { sym: 'BRK.B', name: 'Berkshire Hathaway',  price: 483.20, shares: 28,  cost: 348.50, chg: +0.21, rating: 'HOLD', weight: 5.6, logo: 'B' },
  { sym: 'JPM',   name: 'JPMorgan Chase',       price: 264.38, shares: 55,  cost: 184.20, chg: -0.76, rating: 'HOLD', weight: 6.1, logo: 'J' },
  { sym: 'TSM',   name: 'Taiwan Semiconductor', price: 192.74, shares: 88,  cost: 102.50, chg: +3.14, rating: 'BUY',  weight: 7.1, logo: 'T' },
  { sym: 'VTI',   name: 'Vanguard Total Mkt',  price:  268.30, shares: 50, cost: 220.40, chg: +0.64, rating: 'BUY',  weight: 5.6, logo: 'V' },
  { sym: 'AMZN',  name: 'Amazon.com Inc.',      price: 223.50, shares: 45,  cost: 154.80, chg: +1.07, rating: 'BUY',  weight: 5.8, logo: 'A' },
];

const ACTIVITIES = [
  { type: 'buy',  sym: 'NVDA',  name: 'Bought 50 shares',      date: 'Jun 12, 2026', amount: '+$6,745.00' },
  { type: 'sell', sym: 'TSLA',  name: 'Sold 30 shares',        date: 'Jun 10, 2026', amount: '-$5,312.20' },
  { type: 'div',  sym: 'AAPL',  name: 'Dividend received',     date: 'Jun 08, 2026', amount: '+$214.75' },
  { type: 'buy',  sym: 'META',  name: 'Bought 8 shares',       date: 'Jun 05, 2026', amount: '+$4,825.44' },
  { type: 'div',  sym: 'JPM',   name: 'Dividend received',     date: 'Jun 01, 2026', amount: '+$137.50' },
];

const ALLOC = [
  { name: 'Technology',   pct: 46.2, val: '$391,400', color: '#f0b429' },
  { name: 'Financials',   pct: 11.7, val: '$99,100',  color: '#3b82f6' },
  { name: 'Consumer',     pct: 9.6,  val: '$81,200',  color: '#8b5cf6' },
  { name: 'Index / ETF',  pct: 13.4, val: '$113,500', color: '#00d97e' },
  { name: 'Semiconductor',pct: 15.1, val: '$127,900', color: '#f43f5e' },
  { name: 'Other',        pct: 4.0,  val: '$33,800',  color: '#64748b' },
];

// ── HELPERS ───────────────────────────────────────────────
const fmt = (n, dec = 2) =>
  n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });

const fmtUSD = n =>
  '$' + fmt(Math.abs(n));

function sparklePath(data, w, h) {
  const mn = Math.min(...data), mx = Math.max(...data);
  const xStep = w / (data.length - 1);
  return data.map((v, i) => {
    const x = i * xStep;
    const y = h - ((v - mn) / (mx - mn || 1)) * h;
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

// ── CHART.JS DEFAULTS ─────────────────────────────────────
Chart.defaults.color = '#64748b';
Chart.defaults.borderColor = 'rgba(255,255,255,0.05)';
Chart.defaults.font.family = "'Inter', sans-serif";

// ── SPARKLINES ────────────────────────────────────────────
function drawSparkline(canvasId, data, color) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const mn = Math.min(...data), mx = Math.max(...data);
  const pts = data.map((v, i) => ({
    x: i * (w / (data.length - 1)),
    y: h - ((v - mn) / (mx - mn || 1)) * (h - 4) - 2
  }));

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, color + '40');
  grad.addColorStop(1, color + '00');

  ctx.beginPath();
  pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.lineJoin = 'round';
  ctx.stroke();

  ctx.lineTo(pts[pts.length - 1].x, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
}

const sparkData = {
  s1: [720, 735, 728, 750, 762, 758, 780, 790, 786, 810, 830, 847],
  s2: [100, 108, 115, 112, 118, 124, 128, 132, 130, 138, 143, 147],
  s3: [6.1, 6.8, 7.2, 7.0, 7.5, 7.8, 8.1, 7.9, 8.3, 8.5, 8.6, 8.74],
  s4: [1.4, 1.5, 1.6, 1.55, 1.62, 1.70, 1.75, 1.78, 1.80, 1.83, 1.85, 1.87],
};

function initSparklines() {
  drawSparkline('sparkline1', sparkData.s1, '#f0b429');
  drawSparkline('sparkline2', sparkData.s2, '#00d97e');
  drawSparkline('sparkline3', sparkData.s3, '#3b82f6');
  drawSparkline('sparkline4', sparkData.s4, '#8b5cf6');
}

// ── PERFORMANCE CHART ─────────────────────────────────────
const PERF_LABELS_3M = (() => {
  const labels = [];
  const now = new Date(2026, 5, 14); // June 14, 2026
  for (let i = 90; i >= 0; i -= 3) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  }
  return labels;
})();

function makePortfolioData(seed) {
  const data = [seed];
  for (let i = 1; i < 31; i++) {
    const chg = (Math.random() - 0.42) * 0.018;
    data.push(+(data[data.length - 1] * (1 + chg)).toFixed(4));
  }
  return data;
}

const portfolioSeries = makePortfolioData(0.82);
const benchmarkSeries = makePortfolioData(0.86);
portfolioSeries[portfolioSeries.length - 1] = 1.2108;
benchmarkSeries[benchmarkSeries.length - 1] = 1.0924;

let perfChart;
function initPerfChart() {
  const ctx = document.getElementById('perfChart');
  if (!ctx) return;

  const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 240);
  gradient.addColorStop(0, 'rgba(240,180,41,0.18)');
  gradient.addColorStop(1, 'rgba(240,180,41,0)');

  perfChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: PERF_LABELS_3M,
      datasets: [
        {
          label: 'Portfolio',
          data: portfolioSeries.map(v => +(v * 100 - 100).toFixed(2)),
          borderColor: '#f0b429',
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: '#f0b429',
          fill: true,
          backgroundColor: gradient,
          tension: 0.4,
        },
        {
          label: 'S&P 500',
          data: benchmarkSeries.map(v => +(v * 100 - 100).toFixed(2)),
          borderColor: '#475569',
          borderWidth: 1.5,
          borderDash: [4, 4],
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: '#475569',
          fill: false,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#111d2e',
          borderColor: 'rgba(255,255,255,0.08)',
          borderWidth: 1,
          padding: 10,
          titleColor: '#94a3b8',
          bodyColor: '#e2e8f0',
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y >= 0 ? '+' : ''}${ctx.parsed.y.toFixed(2)}%`,
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.03)' },
          ticks: { maxTicksLimit: 8, font: { size: 10.5 } },
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: {
            font: { size: 10.5, family: 'JetBrains Mono' },
            callback: v => (v >= 0 ? '+' : '') + v.toFixed(1) + '%',
          },
        }
      }
    }
  });
}

// ── ALLOCATION CHART ──────────────────────────────────────
function initAllocChart() {
  const ctx = document.getElementById('allocChart');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ALLOC.map(a => a.name),
      datasets: [{
        data: ALLOC.map(a => a.pct),
        backgroundColor: ALLOC.map(a => a.color),
        borderColor: '#111d2e',
        borderWidth: 3,
        hoverOffset: 6,
      }]
    },
    options: {
      responsive: false,
      cutout: '72%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#111d2e',
          borderColor: 'rgba(255,255,255,0.08)',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: ctx => ` ${ctx.label}: ${ctx.parsed.toFixed(1)}%`,
          }
        }
      }
    }
  });

  const legend = document.getElementById('allocLegend');
  if (legend) {
    legend.innerHTML = ALLOC.map(a => `
      <div class="alloc-item">
        <span class="alloc-dot" style="background:${a.color}"></span>
        <span class="alloc-name">${a.name}</span>
        <span class="alloc-pct">${a.pct}%</span>
      </div>
    `).join('');
  }
}

// ── HOLDINGS TABLE ────────────────────────────────────────
function renderHoldings(filter = '') {
  const tbody = document.querySelector('#holdingsTable tbody');
  if (!tbody) return;

  const filtered = HOLDINGS.filter(h =>
    h.sym.toLowerCase().includes(filter.toLowerCase()) ||
    h.name.toLowerCase().includes(filter.toLowerCase())
  );

  tbody.innerHTML = filtered.map(h => {
    const value   = h.price * h.shares;
    const gain    = (h.price - h.cost) * h.shares;
    const gainPct = ((h.price / h.cost) - 1) * 100;
    const chgCls  = h.chg >= 0 ? 'pos' : 'neg';
    const gainCls = gain >= 0 ? 'pos' : 'neg';
    const ratingCls = h.rating === 'BUY' ? 'rating-buy' : h.rating === 'SELL' ? 'rating-sell' : 'rating-hold';

    return `
      <tr>
        <td>
          <span class="holding-sym">${h.sym}</span>
          <span class="holding-name">${h.name}</span>
        </td>
        <td style="font-family:'JetBrains Mono',monospace">$${fmt(h.price)}</td>
        <td style="color:var(--text-secondary)">${h.shares}</td>
        <td style="font-family:'JetBrains Mono',monospace;font-weight:600">$${fmt(value, 0)}</td>
        <td class="${chgCls}" style="font-family:'JetBrains Mono',monospace">${h.chg >= 0 ? '+' : ''}${h.chg.toFixed(2)}%</td>
        <td>
          <span class="${gainCls}" style="font-family:'JetBrains Mono',monospace">
            ${gain >= 0 ? '+' : '-'}$${fmt(Math.abs(gain), 0)}
          </span>
          <span style="font-size:10.5px;color:var(--text-secondary);margin-left:4px">
            ${gainPct >= 0 ? '+' : ''}${gainPct.toFixed(1)}%
          </span>
        </td>
        <td>
          <div class="weight-bar-wrap">
            <div class="weight-bar">
              <div class="weight-bar-fill" style="width:${Math.min(h.weight * 3.5, 100)}%"></div>
            </div>
            <span class="weight-val">${h.weight}%</span>
          </div>
        </td>
        <td><span class="rating ${ratingCls}">${h.rating}</span></td>
      </tr>
    `;
  }).join('');
}

// ── ACTIVITY LIST ─────────────────────────────────────────
function renderActivity() {
  const list = document.getElementById('activityList');
  if (!list) return;

  list.innerHTML = ACTIVITIES.map(a => {
    const typeLabel = a.type === 'buy' ? 'BUY' : a.type === 'sell' ? 'SELL' : 'DIV';
    const typeCls   = `activity-${a.type}`;
    const amtCls    = a.type === 'sell' || (a.type !== 'buy' && !a.amount.startsWith('+')) ? 'neg' : 'pos';

    return `
      <div class="activity-item">
        <div class="activity-icon ${typeCls}">${typeLabel}</div>
        <div class="activity-info">
          <div class="activity-title">${a.sym} — ${a.name}</div>
          <div class="activity-date">${a.date}</div>
        </div>
        <div class="activity-amount ${amtCls}">${a.amount}</div>
      </div>
    `;
  }).join('');
}

// ── CLOCK ─────────────────────────────────────────────────
function updateClock() {
  const el = document.getElementById('topbarTime');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  }) + ' EST';
}

// ── PERIOD BUTTONS ────────────────────────────────────────
function initPeriodButtons() {
  document.querySelectorAll('.period-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (perfChart) {
        const period = btn.dataset.period;
        const lengths = { '1W': 5, '1M': 21, '3M': 31, '1Y': 31, 'ALL': 31 };
        const n = lengths[period] || 31;
        perfChart.data.labels = PERF_LABELS_3M.slice(0, n);
        perfChart.data.datasets[0].data = portfolioSeries.slice(0, n).map(v => +(v * 100 - 100).toFixed(2));
        perfChart.data.datasets[1].data = benchmarkSeries.slice(0, n).map(v => +(v * 100 - 100).toFixed(2));
        perfChart.update('active');
      }
    });
  });
}

// ── SIDEBAR TOGGLE ────────────────────────────────────────
function initSidebarToggle() {
  const btn = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  if (!btn || !sidebar) return;
  btn.addEventListener('click', () => sidebar.classList.toggle('collapsed'));
}

// ── NAV ITEMS ─────────────────────────────────────────────
function initNav() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      const page = item.dataset.page;
      const bc = document.getElementById('breadcrumbCurrent');
      if (bc) bc.textContent = item.textContent.trim();
    });
  });
}

// ── HOLDINGS SEARCH ───────────────────────────────────────
function initSearch() {
  const input = document.getElementById('holdingsSearch');
  if (!input) return;
  input.addEventListener('input', () => renderHoldings(input.value));
}

// ── INIT ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initSparklines();
  initPerfChart();
  initAllocChart();
  renderHoldings();
  renderActivity();
  initPeriodButtons();
  initSidebarToggle();
  initNav();
  initSearch();
  updateClock();
  setInterval(updateClock, 1000);

  // Duplicate ticker items for seamless loop
  const tickerItems = document.querySelector('.ticker-items');
  if (tickerItems) {
    tickerItems.innerHTML += tickerItems.innerHTML;
  }

  // Animate risk bars
  setTimeout(() => {
    document.querySelectorAll('.risk-fill').forEach(el => {
      const w = el.style.width;
      el.style.width = '0';
      requestAnimationFrame(() => { el.style.width = w; });
    });
  }, 400);
});
