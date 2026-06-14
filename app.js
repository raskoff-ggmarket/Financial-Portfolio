'use strict';

/* ── DATA ────────────────────────────────────────────────── */
const HOLDINGS = [
  { sym:'NVDA',  name:'NVIDIA Corp.',         price:134.90, shares:410, cost:48.72,  chg:+2.61 },
  { sym:'AAPL',  name:'Apple Inc.',            price:211.84, shares:185, cost:148.30, chg:+1.24 },
  { sym:'MSFT',  name:'Microsoft Corp.',       price:442.57, shares:72,  cost:280.14, chg:+0.88 },
  { sym:'META',  name:'Meta Platforms',        price:603.18, shares:38,  cost:210.80, chg:+1.52 },
  { sym:'AMZN',  name:'Amazon.com',            price:223.50, shares:45,  cost:154.80, chg:+1.07 },
  { sym:'GOOGL', name:'Alphabet Inc.',         price:186.42, shares:95,  cost:121.30, chg:-0.34 },
  { sym:'JPM',   name:'JPMorgan Chase',        price:264.38, shares:55,  cost:184.20, chg:-0.76 },
  { sym:'TSM',   name:'Taiwan Semiconductor',  price:192.74, shares:88,  cost:102.50, chg:+3.14 },
  { sym:'BRK.B', name:'Berkshire Hathaway',    price:483.20, shares:28,  cost:348.50, chg:+0.21 },
  { sym:'VTI',   name:'Vanguard Total Market', price:268.30, shares:50,  cost:220.40, chg:+0.64 },
];

const ALLOC = [
  { name:'Technology',    pct:46.2, color:'#f59e0b' },
  { name:'Semiconductor', pct:15.1, color:'#f43f5e' },
  { name:'Index / ETF',   pct:13.4, color:'#10b981' },
  { name:'Financials',    pct:11.7, color:'#3b82f6' },
  { name:'Consumer',      pct:9.6,  color:'#8b5cf6' },
  { name:'Other',         pct:4.0,  color:'#475569' },
];

const ACTS = [
  { type:'buy',  sym:'NVDA',  desc:'Bought 50 shares',  date:'Jun 12', amt:'+$6,745', pos:true  },
  { type:'sell', sym:'TSLA',  desc:'Sold 30 shares',    date:'Jun 10', amt:'−$5,312', pos:false },
  { type:'div',  sym:'AAPL',  desc:'Dividend',          date:'Jun 8',  amt:'+$215',   pos:true  },
  { type:'buy',  sym:'META',  desc:'Bought 8 shares',   date:'Jun 5',  amt:'+$4,825', pos:true  },
  { type:'div',  sym:'JPM',   desc:'Dividend',          date:'Jun 1',  amt:'+$138',   pos:true  },
];

const RISKS = [
  { lbl:'Max Drawdown', val:'−8.34%', cls:'r', pct:34, color:'#f43f5e' },
  { lbl:'Volatility',   val:'12.7%',  cls:'',  pct:50, color:'#f59e0b' },
  { lbl:'Win Rate',     val:'67.3%',  cls:'g', pct:67, color:'#10b981' },
  { lbl:'Sortino',      val:'2.41',   cls:'g', pct:80, color:'#10b981' },
  { lbl:'VaR 95%',      val:'−2.18%', cls:'r', pct:22, color:'#f43f5e' },
  { lbl:'Corr SPX',     val:'0.78',   cls:'',  pct:78, color:'#3b82f6' },
];

/* ── HELPERS ─────────────────────────────────────────────── */
const fmt = (n, d=2) => n.toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});

/* ── CHART.JS DEFAULTS ───────────────────────────────────── */
Chart.defaults.color = '#94a3b8';
Chart.defaults.borderColor = 'rgba(255,255,255,0.05)';
Chart.defaults.font.family = "'Inter',sans-serif";
Chart.defaults.font.size = 10;

/* ── PERFORMANCE CHART ───────────────────────────────────── */
function makeSeries(seed, n) {
  const d = [seed];
  for (let i=1; i<n; i++) d.push(+(d[d.length-1]*(1+(Math.random()-.43)*.018)).toFixed(4));
  return d;
}

let perfChart;
function initPerf() {
  const el = document.getElementById('perfChart');
  if (!el) return;
  const ctx = el.getContext('2d');
  const n = 30;
  const port  = makeSeries(.80, n); port[n-1]  = 1.2108;
  const bench = makeSeries(.84, n); bench[n-1] = 1.0924;

  const grad = ctx.createLinearGradient(0,0,0,180);
  grad.addColorStop(0,'rgba(245,158,11,.22)');
  grad.addColorStop(1,'rgba(245,158,11,0)');

  const labels = Array.from({length:n},(_,i)=>{
    const d=new Date(2026,5,14); d.setDate(d.getDate()-(n-1-i));
    return d.toLocaleDateString('en-US',{month:'short',day:'numeric'});
  });

  perfChart = new Chart(el, {
    type:'line',
    data:{
      labels,
      datasets:[
        { label:'Portfolio', data:port.map(v=>+(v*100-100).toFixed(2)),
          borderColor:'#f59e0b', borderWidth:2, fill:true, backgroundColor:grad,
          pointRadius:0, pointHoverRadius:4, pointHoverBackgroundColor:'#f59e0b', tension:.45 },
        { label:'S&P 500', data:bench.map(v=>+(v*100-100).toFixed(2)),
          borderColor:'#475569', borderWidth:1.5, borderDash:[5,4], fill:false,
          pointRadius:0, pointHoverRadius:4, tension:.45 },
      ]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      interaction:{ mode:'index', intersect:false },
      plugins:{
        legend:{ display:false },
        tooltip:{
          backgroundColor:'#111d2e', borderColor:'rgba(255,255,255,.1)', borderWidth:1,
          padding:10, titleColor:'#94a3b8', bodyColor:'#f1f5f9',
          callbacks:{ label:c=>` ${c.dataset.label}: ${c.parsed.y>=0?'+':''}${c.parsed.y.toFixed(2)}%` }
        }
      },
      scales:{
        x:{ grid:{color:'rgba(255,255,255,.04)'}, ticks:{maxTicksLimit:5} },
        y:{ grid:{color:'rgba(255,255,255,.04)'}, ticks:{callback:v=>(v>=0?'+':'')+v.toFixed(0)+'%'} }
      }
    }
  });
}

/* ── DONUT ───────────────────────────────────────────────── */
function initDonut() {
  const el = document.getElementById('donut');
  if (!el) return;
  new Chart(el,{
    type:'doughnut',
    data:{
      labels:ALLOC.map(a=>a.name),
      datasets:[{ data:ALLOC.map(a=>a.pct), backgroundColor:ALLOC.map(a=>a.color),
        borderColor:'#111d2e', borderWidth:3, hoverOffset:4 }]
    },
    options:{
      responsive:false, cutout:'72%',
      plugins:{
        legend:{display:false},
        tooltip:{
          backgroundColor:'#111d2e', borderColor:'rgba(255,255,255,.1)', borderWidth:1, padding:10,
          callbacks:{ label:c=>` ${c.label}: ${c.parsed.toFixed(1)}%` }
        }
      }
    }
  });

  const rows = document.getElementById('allocRows');
  if (rows) rows.innerHTML = ALLOC.map(a=>`
    <div class="al-row">
      <span class="al-dot" style="background:${a.color}"></span>
      <span class="al-name">${a.name}</span>
      <div class="al-bar"><div class="al-fill" style="width:${a.pct}%;background:${a.color}"></div></div>
      <span class="al-pct">${a.pct}%</span>
    </div>
  `).join('');
}

/* ── HOLDINGS ────────────────────────────────────────────── */
function renderHoldings(q='') {
  const tbody = document.querySelector('#htbl tbody');
  if (!tbody) return;
  const list = HOLDINGS.filter(h=>
    h.sym.toLowerCase().includes(q.toLowerCase()) ||
    h.name.toLowerCase().includes(q.toLowerCase())
  );
  tbody.innerHTML = list.map(h=>{
    const val = h.price * h.shares;
    const cc  = h.chg >= 0 ? 'g' : 'r';
    return `
      <tr>
        <td><span class="sym">${h.sym}</span><span class="nm">${h.name}</span></td>
        <td class="tr">$${fmt(h.price)}</td>
        <td class="tr" style="color:var(--${cc==='g'?'green':'red'})">${h.chg>=0?'+':''}${h.chg.toFixed(2)}%</td>
        <td class="tr">$${fmt(val,0)}</td>
      </tr>
    `;
  }).join('');
}

/* ── ACTIVITY ────────────────────────────────────────────── */
function renderActs() {
  const el = document.getElementById('acts');
  if (!el) return;
  el.innerHTML = ACTS.map(a=>{
    const bc = a.type==='buy'?'ab-buy':a.type==='sell'?'ab-sell':'ab-div';
    const ac = a.pos ? 'color:var(--green)' : 'color:var(--red)';
    return `
      <div class="act">
        <div class="act-badge ${bc}">${a.type.toUpperCase()}</div>
        <div class="act-info">
          <div class="act-sym">${a.sym}</div>
          <div class="act-desc">${a.desc} · ${a.date}</div>
        </div>
        <div class="act-amt" style="${ac}">${a.amt}</div>
      </div>
    `;
  }).join('');
}

/* ── RISK ────────────────────────────────────────────────── */
function renderRisk() {
  const el = document.getElementById('riskGrid');
  if (!el) return;
  el.innerHTML = RISKS.map(r=>`
    <div class="ri">
      <div class="ri-lbl">${r.lbl}</div>
      <div class="ri-val ${r.cls}">${r.val}</div>
      <div class="ri-bar"><div class="ri-fill" data-w="${r.pct}" style="background:${r.color}"></div></div>
    </div>
  `).join('');
  setTimeout(()=>{
    el.querySelectorAll('.ri-fill').forEach(f=>{ f.style.width = f.dataset.w + '%'; });
  }, 350);
}

/* ── PERIOD TABS ─────────────────────────────────────────── */
function initPeriodTabs() {
  document.querySelectorAll('.per').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.per').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

/* ── TICKER ──────────────────────────────────────────────── */
function initTicker() {
  const el = document.getElementById('ticker');
  if (el) el.innerHTML += el.innerHTML;
}

/* ── BOTTOM NAV ──────────────────────────────────────────── */
function initBottomNav() {
  document.querySelectorAll('.bn').forEach(a=>{
    a.addEventListener('click',e=>{
      e.preventDefault();
      document.querySelectorAll('.bn').forEach(b=>b.classList.remove('active'));
      a.classList.add('active');
    });
  });
}

/* ── SEARCH ──────────────────────────────────────────────── */
function initSearch() {
  const inp = document.getElementById('hsearch');
  inp?.addEventListener('input',()=>renderHoldings(inp.value));
}

/* ── INIT ────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded',()=>{
  initTicker();
  initPeriodTabs();
  initBottomNav();
  initSearch();
  initPerf();
  initDonut();
  renderHoldings();
  renderActs();
  renderRisk();
});
