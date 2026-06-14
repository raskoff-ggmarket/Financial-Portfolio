'use strict';

/* ── DATA ──────────────────────────────────────────────── */
const HOLDINGS = [
  { sym:'NVDA',  name:'NVIDIA Corp.',          price:134.90, shares:410, cost:48.72,  chg:+2.61, rating:'BUY'  },
  { sym:'AAPL',  name:'Apple Inc.',             price:211.84, shares:185, cost:148.30, chg:+1.24, rating:'BUY'  },
  { sym:'MSFT',  name:'Microsoft Corp.',        price:442.57, shares:72,  cost:280.14, chg:+0.88, rating:'BUY'  },
  { sym:'META',  name:'Meta Platforms',         price:603.18, shares:38,  cost:210.80, chg:+1.52, rating:'BUY'  },
  { sym:'AMZN',  name:'Amazon.com',             price:223.50, shares:45,  cost:154.80, chg:+1.07, rating:'BUY'  },
  { sym:'GOOGL', name:'Alphabet Inc.',          price:186.42, shares:95,  cost:121.30, chg:-0.34, rating:'HOLD' },
  { sym:'JPM',   name:'JPMorgan Chase',         price:264.38, shares:55,  cost:184.20, chg:-0.76, rating:'HOLD' },
  { sym:'TSM',   name:'Taiwan Semiconductor',   price:192.74, shares:88,  cost:102.50, chg:+3.14, rating:'BUY'  },
  { sym:'BRK.B', name:'Berkshire Hathaway',     price:483.20, shares:28,  cost:348.50, chg:+0.21, rating:'HOLD' },
  { sym:'VTI',   name:'Vanguard Total Market',  price:268.30, shares:50,  cost:220.40, chg:+0.64, rating:'BUY'  },
];

const ALLOC = [
  { name:'Technology',   pct:46.2, color:'#f59e0b' },
  { name:'Semiconductor',pct:15.1, color:'#f43f5e' },
  { name:'Index / ETF',  pct:13.4, color:'#10b981' },
  { name:'Financials',   pct:11.7, color:'#3b82f6' },
  { name:'Consumer',     pct:9.6,  color:'#8b5cf6' },
  { name:'Other',        pct:4.0,  color:'#475569' },
];

const ACTIVITIES = [
  { type:'buy',  sym:'NVDA',  desc:'Bought 50 shares',    date:'Jun 12',  amt:'+$6,745', pos:true  },
  { type:'sell', sym:'TSLA',  desc:'Sold 30 shares',      date:'Jun 10',  amt:'-$5,312', pos:false },
  { type:'div',  sym:'AAPL',  desc:'Dividend received',   date:'Jun 8',   amt:'+$215',   pos:true  },
  { type:'buy',  sym:'META',  desc:'Bought 8 shares',     date:'Jun 5',   amt:'+$4,825', pos:true  },
  { type:'div',  sym:'JPM',   desc:'Dividend received',   date:'Jun 1',   amt:'+$138',   pos:true  },
];

const RISKS = [
  { label:'Max Drawdown', val:'-8.34%', cls:'dn', pct:34, color:'#f43f5e' },
  { label:'Volatility',   val:'12.7%',  cls:'',   pct:50, color:'#f59e0b' },
  { label:'Win Rate',     val:'67.3%',  cls:'up', pct:67, color:'#10b981' },
  { label:'Sortino',      val:'2.41',   cls:'up', pct:80, color:'#10b981' },
  { label:'VaR 95%',      val:'-2.18%', cls:'dn', pct:22, color:'#f43f5e' },
  { label:'Corr (SPX)',   val:'0.78',   cls:'',   pct:78, color:'#3b82f6' },
];

/* ── HELPERS ───────────────────────────────────────────── */
const $ = id => document.getElementById(id);
const fmt = (n, d=2) => n.toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});

/* ── CHART.JS DEFAULTS ─────────────────────────────────── */
Chart.defaults.color = '#94a3b8';
Chart.defaults.borderColor = 'rgba(255,255,255,0.05)';
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.font.size = 11;

/* ── PERFORMANCE CHART ─────────────────────────────────── */
function buildSeries(seed, n) {
  const d = [seed];
  for (let i = 1; i < n; i++) {
    d.push(+(d[d.length-1] * (1 + (Math.random()-.43)*.018)).toFixed(4));
  }
  return d;
}

const PERIODS = {
  '1W':  { pts:7,  label: i => ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i] },
  '1M':  { pts:30, label: i => `${i+1}` },
  '3M':  { pts:90, label: i => { const d=new Date(2026,5,14); d.setDate(d.getDate()-(89-i)); return d.toLocaleDateString('en-US',{month:'short',day:'numeric'}); }},
  '6M':  { pts:90, label: i => { const d=new Date(2026,5,14); d.setDate(d.getDate()-(89-i)); return d.toLocaleDateString('en-US',{month:'short'}); }},
  '1Y':  { pts:90, label: i => { const d=new Date(2026,5,14); d.setDate(d.getDate()-(89-i)); return d.toLocaleDateString('en-US',{month:'short'}); }},
  'ALL': { pts:90, label: i => { const d=new Date(2026,5,14); d.setDate(d.getDate()-(89-i)); return d.toLocaleDateString('en-US',{month:'short',year:'2-digit'}); }},
};

let perfChart;
function initPerfChart() {
  const el = $('perfChart');
  if (!el) return;
  const ctx = el.getContext('2d');

  const pts = 90;
  const port = buildSeries(.80, pts);
  const bench = buildSeries(.84, pts);
  port[pts-1] = 1.2108; bench[pts-1] = 1.0924;

  const grad = ctx.createLinearGradient(0,0,0,260);
  grad.addColorStop(0,'rgba(245,158,11,.2)');
  grad.addColorStop(1,'rgba(245,158,11,0)');

  const labels = Array.from({length:pts}, (_,i)=>{
    const d=new Date(2026,5,14); d.setDate(d.getDate()-(pts-1-i));
    return d.toLocaleDateString('en-US',{month:'short',day:'numeric'});
  });

  perfChart = new Chart(el, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Portfolio',
          data: port.map(v=>+(v*100-100).toFixed(2)),
          borderColor: '#f59e0b', borderWidth: 2,
          fill: true, backgroundColor: grad,
          pointRadius: 0, pointHoverRadius: 5,
          pointHoverBackgroundColor: '#f59e0b',
          tension: 0.45,
        },
        {
          label: 'S&P 500',
          data: bench.map(v=>+(v*100-100).toFixed(2)),
          borderColor: '#475569', borderWidth: 1.5,
          borderDash: [5,4],
          fill: false,
          pointRadius: 0, pointHoverRadius: 5,
          pointHoverBackgroundColor: '#475569',
          tension: 0.45,
        },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode:'index', intersect:false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f1929',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1, padding: 10,
          titleColor: '#94a3b8', bodyColor: '#f1f5f9',
          callbacks: {
            label: c => ` ${c.dataset.label}: ${c.parsed.y>=0?'+':''}${c.parsed.y.toFixed(2)}%`
          }
        }
      },
      scales: {
        x: {
          grid: { color:'rgba(255,255,255,0.04)' },
          ticks: { maxTicksLimit: 6 },
        },
        y: {
          grid: { color:'rgba(255,255,255,0.04)' },
          ticks: { callback: v => (v>=0?'+':'')+v.toFixed(0)+'%' }
        }
      }
    }
  });
}

/* ── DONUT CHART ───────────────────────────────────────── */
function initDonut() {
  const el = $('donutChart');
  if (!el) return;
  new Chart(el, {
    type: 'doughnut',
    data: {
      labels: ALLOC.map(a=>a.name),
      datasets: [{
        data: ALLOC.map(a=>a.pct),
        backgroundColor: ALLOC.map(a=>a.color),
        borderColor: '#131f30', borderWidth: 3, hoverOffset: 5,
      }]
    },
    options: {
      responsive: false, cutout: '74%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f1929',
          borderColor: 'rgba(255,255,255,0.1)', borderWidth:1, padding:10,
          callbacks: { label: c=>` ${c.label}: ${c.parsed.toFixed(1)}%` }
        }
      }
    }
  });

  const list = $('allocList');
  if (list) {
    list.innerHTML = ALLOC.map(a=>`
      <div class="al-row">
        <span class="al-dot" style="background:${a.color}"></span>
        <span class="al-name">${a.name}</span>
        <div class="al-bar"><div class="al-fill" style="width:${a.pct}%;background:${a.color}"></div></div>
        <span class="al-pct">${a.pct}%</span>
      </div>
    `).join('');
  }
}

/* ── HOLDINGS TABLE ────────────────────────────────────── */
function renderHoldings(q='') {
  const tbody = document.querySelector('#htable tbody');
  if (!tbody) return;
  const total = HOLDINGS.reduce((s,h)=>s+h.price*h.shares, 0);
  const rows = HOLDINGS.filter(h=>
    h.sym.toLowerCase().includes(q.toLowerCase()) ||
    h.name.toLowerCase().includes(q.toLowerCase())
  );
  tbody.innerHTML = rows.map(h=>{
    const val  = h.price*h.shares;
    const gain = (h.price-h.cost)*h.shares;
    const gp   = (h.price/h.cost-1)*100;
    const wt   = (val/total*100).toFixed(1);
    const cc   = h.chg>=0?'up':'dn';
    const gc   = gain>=0?'up':'dn';
    const rc   = h.rating==='BUY'?'r-buy':h.rating==='SELL'?'r-sell':'r-hold';
    return `
      <tr>
        <td>
          <span class="sym">${h.sym}</span>
          <span class="nm">${h.name}</span>
        </td>
        <td class="right">$${fmt(h.price)}</td>
        <td class="right ${cc}">${h.chg>=0?'+':''}${h.chg.toFixed(2)}%</td>
        <td class="right">$${fmt(val,0)}</td>
        <td class="right hide-sm ${gc}">${gain>=0?'+':'-'}$${fmt(Math.abs(gain),0)} <span style="font-size:10px;color:var(--t2)">${gp>=0?'+':''}${gp.toFixed(1)}%</span></td>
        <td class="right hide-sm">${wt}%</td>
      </tr>
    `;
  }).join('');
}

/* ── ACTIVITY ──────────────────────────────────────────── */
function renderActivity() {
  const el = $('activity');
  if (!el) return;
  el.innerHTML = ACTIVITIES.map(a=>{
    const bc = a.type==='buy'?'ab-buy':a.type==='sell'?'ab-sell':'ab-div';
    const ac = a.pos?'up':'dn';
    return `
      <div class="act-row">
        <div class="act-badge ${bc}">${a.type.toUpperCase()}</div>
        <div class="act-info">
          <div class="act-name">${a.sym}</div>
          <div class="act-date">${a.desc} · ${a.date}</div>
        </div>
        <div class="act-amt ${ac}">${a.amt}</div>
      </div>
    `;
  }).join('');
}

/* ── RISK ──────────────────────────────────────────────── */
function renderRisk() {
  const el = $('riskGrid');
  if (!el) return;
  el.innerHTML = RISKS.map(r=>`
    <div class="risk-item">
      <div class="ri-label">${r.label}</div>
      <div class="ri-val ${r.cls}">${r.val}</div>
      <div class="ri-bar"><div class="ri-fill" style="width:0%;background:${r.color}" data-w="${r.pct}"></div></div>
    </div>
  `).join('');
  setTimeout(()=>{
    el.querySelectorAll('.ri-fill').forEach(f=>{ f.style.width = f.dataset.w+'%'; });
  }, 300);
}

/* ── PERIOD TABS ───────────────────────────────────────── */
function initPeriodTabs() {
  document.querySelectorAll('.pt').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.pt').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

/* ── SIDEBAR ───────────────────────────────────────────── */
function initSidebar() {
  const sidebar  = $('sidebar');
  const overlay  = $('overlay');
  const menuBtn  = $('menuBtn');
  const closeBtn = $('closeSidebar');
  if (!sidebar) return;

  const open  = ()=>{ sidebar.classList.add('open'); overlay.classList.add('show'); document.body.style.overflow='hidden'; };
  const close = ()=>{ sidebar.classList.remove('open'); overlay.classList.remove('show'); document.body.style.overflow=''; };

  menuBtn?.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);
  overlay?.addEventListener('click', close);

  document.querySelectorAll('.nav-link').forEach(l=>{
    l.addEventListener('click',e=>{ e.preventDefault(); close(); });
  });
}

/* ── TICKER DUPLICATE ──────────────────────────────────── */
function initTicker() {
  const inner = $('tickerInner');
  if (inner) inner.innerHTML += inner.innerHTML;
}

/* ── CLOCK ─────────────────────────────────────────────── */
function initClock() {
  const tick = ()=>{
    const el = document.querySelector('.status-time');
    if (el) el.textContent = new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false});
  };
  tick(); setInterval(tick, 10000);
}

/* ── BOTTOM NAV ────────────────────────────────────────── */
function initBottomNav() {
  document.querySelectorAll('.bn').forEach(a=>{
    a.addEventListener('click',e=>{
      e.preventDefault();
      document.querySelectorAll('.bn').forEach(b=>b.classList.remove('active'));
      a.classList.add('active');
    });
  });
}

/* ── SEARCH ────────────────────────────────────────────── */
function initSearch() {
  const input = $('hSearch');
  input?.addEventListener('input',()=>renderHoldings(input.value));
}

/* ── INIT ──────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', ()=>{
  initSidebar();
  initTicker();
  initClock();
  initPeriodTabs();
  initBottomNav();
  initSearch();
  initPerfChart();
  initDonut();
  renderHoldings();
  renderActivity();
  renderRisk();
});
