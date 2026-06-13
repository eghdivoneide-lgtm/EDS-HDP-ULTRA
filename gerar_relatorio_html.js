#!/usr/bin/env node
// Gera EDS_SINAIS_[rodada].html a partir de sinais_output.json
"use strict";
const fs   = require("fs");
const path = require("path");

const ROOT   = path.join(__dirname);
const dados  = JSON.parse(fs.readFileSync(path.join(ROOT,"sinais_output.json"),"utf8"));
const sinais = dados.sinais;
const rodada = dados.rodada;
const agora  = new Date().toLocaleString("pt-BR",{timeZone:"America/Sao_Paulo"});

// ── helpers ─────────────────────────────────────────────────
const TIER_META = {
  "TRIPLE LOCK FORTE 🔒🔒": { bg:"#1B5E20", text:"#A5D6A7", badge:"#2E7D32", label:"TRIPLE LOCK FORTE 🔒🔒" },
  "TRIPLE LOCK 🔒":          { bg:"#2E7D32", text:"#C8E6C9", badge:"#388E3C", label:"TRIPLE LOCK 🔒" },
  "G×S FORTE ★":             { bg:"#E65100", text:"#FFE0B2", badge:"#F57C00", label:"G×S FORTE ★" },
  "MARGINAL ⚠️":             { bg:"#BF360C", text:"#FFCCBC", badge:"#E64A19", label:"MARGINAL ⚠️" },
};
const NEUTRO_FORTE = { bg:"#4527A0", text:"#D1C4E9", badge:"#512DA8", label:"NEUTRO → FORTE" };
const NEUTRO_FRACO = { bg:"#263238", text:"#90A4AE", badge:"#37474F", label:"NEUTRO → FRACO" };

function tierMeta(tier) {
  if(TIER_META[tier]) return TIER_META[tier];
  if(tier && tier.includes("FORTE")) return NEUTRO_FORTE;
  return NEUTRO_FRACO;
}

const LADO_COLOR = { MAND:"#34d367", VIS:"#f59e0b" };

function confBar(conf) {
  const pct = Math.min(100, conf);
  const color = conf>=85?"#34d367":conf>=75?"#22c55e":conf>=65?"#f59e0b":conf>=60?"#f97316":"#64748b";
  return `<div style="margin-top:.3rem">
    <div style="display:flex;justify-content:space-between;font-size:.68rem;color:#6b8f79;margin-bottom:.2rem">
      <span>confT</span><span style="color:${color};font-weight:800">${conf}%</span>
    </div>
    <div style="height:5px;background:rgba(255,255,255,0.07);border-radius:3px;overflow:hidden">
      <div style="height:100%;width:${pct}%;background:${color};border-radius:3px;transition:width .6s"></div>
    </div>
  </div>`;
}

// ── agrupa por liga ──────────────────────────────────────────
const LIGAS_INFO = {
  BRB: { flag:"🇧🇷", nome:"Brasileirão Série B", cor:"#34d367" },
  USL: { flag:"🇺🇸", nome:"USL Championship",    cor:"#3b82f6" },
  ARG: { flag:"🇦🇷", nome:"ARG_B — Primera B Nacional", cor:"#f59e0b" },
  CHI: { flag:"🇨🇱", nome:"Chile — Liga de Primera",    cor:"#ef4444" },
};

const porLiga = { BRB:[], USL:[], ARG:[], CHI:[] };
for(const s of sinais) (porLiga[s.liga]||[]).push(s);

// totais para cards de resumo
const picks = sinais;
const nTLF  = picks.filter(s=>s.tier.includes("FORTE")&&s.tier.includes("LOCK")).length;
const nTL   = picks.filter(s=>s.tier==="TRIPLE LOCK 🔒").length;
const nGS   = picks.filter(s=>s.tier.includes("G×S")).length;
const nNF   = picks.filter(s=>s.tier&&s.tier.includes("NEUTRO")&&s.tier.includes("FORTE")).length;
const nMarg = picks.filter(s=>s.tier&&s.tier.includes("MARG")).length;
const nVis  = picks.filter(s=>s.lado==="VIS").length;

// ── tabela de uma liga ───────────────────────────────────────
function tabLiga(liga) {
  const list = (porLiga[liga]||[]).slice().sort((a,b)=>b.confFinal-a.confFinal);
  if(!list.length) return "<p style='color:#6b8f79;padding:1rem'>Sem jogos nesta liga.</p>";
  const rows = list.map(s=>{
    const tm = tierMeta(s.tier);
    const lc = LADO_COLOR[s.lado]||"#34d367";
    const sinalTime = s.lado==="MAND" ? s.mand : s.vis;
    const diffStr = s.dpFTdiff>=0?`+${s.dpFTdiff.toFixed(1)}`:s.dpFTdiff.toFixed(1);
    const diffColor = s.dpFTdiff>=3?"#34d367":s.dpFTdiff>=1.5?"#f59e0b":s.dpFTdiff>=0?"#94a3b8":"#ef4444";
    return `<tr>
      <td style="color:#6b8f79;font-size:.75rem;white-space:nowrap">${s.horario||"—"}</td>
      <td style="font-weight:700">${s.mand} <span style="color:#6b8f79;font-weight:400;font-size:.8rem">×</span> ${s.vis}</td>
      <td>
        <div style="font-weight:900;color:${lc};font-size:.85rem">${s.lado==="MAND"?"🏠":"✈️"} ${sinalTime}</div>
        <div style="font-size:.68rem;color:#6b8f79;margin-top:.15rem">${s.regra}</div>
      </td>
      <td style="text-align:center">
        <span style="background:${tm.bg};color:${tm.text};padding:.25rem .6rem;border-radius:6px;font-size:.72rem;font-weight:800;white-space:nowrap">${tm.label}</span>
      </td>
      <td style="text-align:center">
        <div style="font-size:1rem;font-weight:900;color:${lc}">${s.confFinal}%</div>
        <div style="height:4px;background:rgba(255,255,255,0.07);border-radius:2px;margin-top:.25rem;overflow:hidden">
          <div style="height:100%;width:${Math.min(100,s.confFinal)}%;background:${lc};border-radius:2px"></div>
        </div>
      </td>
      <td style="text-align:center;font-weight:800;color:#f59e0b;font-size:.85rem;white-space:nowrap">${s.lineFT||"ML"}</td>
      <td style="text-align:center;font-weight:700;color:#94a3b8;font-size:.82rem;white-space:nowrap">${s.lineHT||"ML"}</td>
      <td style="text-align:center;font-weight:800;color:${diffColor};font-size:.9rem">${diffStr}</td>
      <td style="text-align:center;color:#6b8f79;font-size:.7rem">${s.perfH}×${s.perfV}</td>
    </tr>`;
  }).join("\n");
  return `<div style="overflow-x:auto;border-radius:12px;border:1px solid rgba(52,211,103,0.12)">
  <table style="width:100%;border-collapse:collapse;font-size:.83rem">
    <thead>
      <tr style="background:#111a14;border-bottom:1px solid rgba(52,211,103,0.12)">
        <th style="padding:.65rem 1rem;text-align:left;color:#6b8f79;font-size:.72rem;text-transform:uppercase;letter-spacing:.5px;white-space:nowrap">Horário</th>
        <th style="padding:.65rem 1rem;text-align:left;color:#6b8f79;font-size:.72rem;text-transform:uppercase;letter-spacing:.5px">Partida</th>
        <th style="padding:.65rem 1rem;text-align:left;color:#6b8f79;font-size:.72rem;text-transform:uppercase;letter-spacing:.5px">Sinal</th>
        <th style="padding:.65rem 1rem;text-align:center;color:#6b8f79;font-size:.72rem;text-transform:uppercase;letter-spacing:.5px">Tier</th>
        <th style="padding:.65rem 1rem;text-align:center;color:#6b8f79;font-size:.72rem;text-transform:uppercase;letter-spacing:.5px">confT</th>
        <th style="padding:.65rem 1rem;text-align:center;color:#6b8f79;font-size:.72rem;text-transform:uppercase;letter-spacing:.5px">Linha FT</th>
        <th style="padding:.65rem 1rem;text-align:center;color:#6b8f79;font-size:.72rem;text-transform:uppercase;letter-spacing:.5px">Linha HT</th>
        <th style="padding:.65rem 1rem;text-align:center;color:#6b8f79;font-size:.72rem;text-transform:uppercase;letter-spacing:.5px">Δ Diff</th>
        <th style="padding:.65rem 1rem;text-align:center;color:#6b8f79;font-size:.72rem;text-transform:uppercase;letter-spacing:.5px">Perfil</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table></div>`;
}

// ── ranking geral (top 20) ───────────────────────────────────
const rankTop = [...picks].sort((a,b)=>b.confFinal-a.confFinal).slice(0,20);
const rankRows = rankTop.map((s,i)=>{
  const tm  = tierMeta(s.tier);
  const lc  = LADO_COLOR[s.lado]||"#34d367";
  const st  = s.lado==="MAND"? s.mand : s.vis;
  const lig = LIGAS_INFO[s.liga];
  const diffStr = s.dpFTdiff>=0?`+${s.dpFTdiff.toFixed(1)}`:s.dpFTdiff.toFixed(1);
  const medal = i<3?["🥇","🥈","🥉"][i]:`<span style="color:#6b8f79;font-size:.8rem">${i+1}</span>`;
  return `<tr style="border-bottom:1px solid rgba(52,211,103,0.05)">
    <td style="text-align:center;padding:.6rem .8rem">${medal}</td>
    <td style="padding:.6rem .8rem;white-space:nowrap">${lig?.flag||""} <span style="color:#6b8f79;font-size:.75rem">${s.liga}</span></td>
    <td style="padding:.6rem .8rem;font-size:.75rem;color:#6b8f79">${s.horario||"—"}</td>
    <td style="padding:.6rem .8rem;font-weight:700">${s.mand} × ${s.vis}</td>
    <td style="padding:.6rem .8rem"><span style="font-weight:900;color:${lc}">${s.lado==="MAND"?"🏠":"✈️"} ${st}</span></td>
    <td style="padding:.6rem .8rem;text-align:center"><span style="background:${tm.bg};color:${tm.text};padding:.2rem .55rem;border-radius:5px;font-size:.7rem;font-weight:800">${tm.label}</span></td>
    <td style="padding:.6rem .8rem;text-align:center;font-weight:900;color:${lc}">${s.confFinal}%</td>
    <td style="padding:.6rem .8rem;text-align:center;color:#f59e0b;font-weight:800;font-size:.82rem">${s.lineFT||"ML"}</td>
    <td style="padding:.6rem .8rem;text-align:center;color:#94a3b8;font-size:.8rem">${diffStr}</td>
  </tr>`;
}).join("\n");

// ── blocos de liga ───────────────────────────────────────────
const ligaSections = Object.entries(LIGAS_INFO).map(([code, info])=>{
  const list = porLiga[code]||[];
  const nPicks = list.filter(s=>s.cFT_raw>=60||s.tier.includes("FORTE")).length;
  return `
  <section style="margin-bottom:2.5rem">
    <div style="display:flex;align-items:center;gap:.75rem;margin-bottom:1rem">
      <span style="font-size:1.6rem">${info.flag}</span>
      <div>
        <h2 style="font-size:1.05rem;font-weight:800;color:${info.cor};margin:0">${info.nome}</h2>
        <div style="font-size:.73rem;color:#6b8f79;margin-top:.1rem">${list.length} jogos · ${nPicks} picks principais</div>
      </div>
    </div>
    ${tabLiga(code)}
  </section>`;
}).join("\n");

// ── HTML final ───────────────────────────────────────────────
const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>EDS-HDP ULTRA — Sinais ${rodada}</title>
<style>
  :root{--bg:#0a0f0d;--bg2:#111a14;--bg3:#162019;--border:rgba(52,211,103,0.13);--green:#34d367;--gold:#f59e0b;--text:#e8f5ee;--muted:#6b8f79;--card:rgba(22,32,25,0.85);}
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;}
  a{color:inherit;text-decoration:none;}
  /* scrollbar */
  ::-webkit-scrollbar{width:6px;height:6px}::-webkit-scrollbar-track{background:var(--bg2)}::-webkit-scrollbar-thumb{background:rgba(52,211,103,0.3);border-radius:3px}
  /* header */
  header{background:linear-gradient(135deg,#0a2e18,#0f1f13,#0a0f0d);border-bottom:1px solid var(--border);padding:1.2rem 2rem;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100;backdrop-filter:blur(12px);}
  .logo{display:flex;align-items:center;gap:.75rem;}
  .logo-icon{font-size:1.8rem;}
  .logo-text h1{font-size:1.05rem;font-weight:800;color:var(--green);letter-spacing:-.5px;}
  .logo-text p{font-size:.68rem;color:var(--muted);font-weight:500;letter-spacing:.5px;text-transform:uppercase;}
  .badge{background:linear-gradient(135deg,var(--gold),#fbbf24);color:#000;font-size:.62rem;font-weight:800;padding:.25rem .7rem;border-radius:99px;letter-spacing:.5px;}
  /* main */
  main{padding:1.5rem 2rem;max-width:1280px;margin:0 auto;}
  /* stat cards */
  .grid4{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:.9rem;margin-bottom:2rem;}
  .stat-card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:1.1rem;position:relative;overflow:hidden;transition:transform .2s,border-color .2s;}
  .stat-card:hover{transform:translateY(-2px);border-color:var(--green);}
  .stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--green),transparent);}
  .stat-card .lbl{font-size:.68rem;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:.35rem;}
  .stat-card .val{font-size:2rem;font-weight:900;line-height:1;}
  .stat-card .sub{font-size:.72rem;color:var(--muted);margin-top:.25rem;}
  .stat-card .ico{position:absolute;right:1rem;top:1rem;font-size:1.4rem;opacity:.25;}
  /* section title */
  .sec-title{font-size:.92rem;font-weight:700;color:var(--text);margin-bottom:1rem;padding-bottom:.5rem;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:.5rem;}
  /* table rows hover */
  tbody tr:hover td{background:rgba(52,211,103,0.04);}
  tbody td{padding:.65rem 1rem;color:var(--text);border-bottom:1px solid rgba(52,211,103,0.05);}
  tbody tr:last-child td{border-bottom:none;}
  /* legenda */
  .legenda{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:1.5rem;}
  .leg-pill{display:flex;align-items:center;gap:.35rem;padding:.3rem .75rem;border-radius:8px;font-size:.72rem;font-weight:700;}
  @media(max-width:640px){header{padding:1rem;}main{padding:1rem;}.grid4{grid-template-columns:1fr 1fr;}}
</style>
</head>
<body>

<header>
  <div class="logo">
    <div class="logo-icon">🎯</div>
    <div class="logo-text">
      <h1>EDS-HDP ULTRA</h1>
      <p>Motor de Sinais v4.2 · confT + Regras v4.1 + Resolvedor NEUTRO</p>
    </div>
  </div>
  <div style="display:flex;align-items:center;gap:.75rem;flex-wrap:wrap">
    <span class="badge">RODADA ${rodada}</span>
    <span style="font-size:.72rem;color:var(--muted)">${agora}</span>
  </div>
</header>

<main>

  <!-- CARDS RESUMO -->
  <div class="grid4">
    <div class="stat-card">
      <div class="ico">🎯</div>
      <div class="lbl">Total de Sinais</div>
      <div class="val" style="color:var(--green)">${picks.length}</div>
      <div class="sub">4 ligas · zero SKIPs</div>
    </div>
    <div class="stat-card">
      <div class="ico">🔒</div>
      <div class="lbl">Triple Lock Forte</div>
      <div class="val" style="color:#4ade80">${nTLF}</div>
      <div class="sub">confT ≥ 85%</div>
    </div>
    <div class="stat-card">
      <div class="ico">🔒</div>
      <div class="lbl">Triple Lock</div>
      <div class="val" style="color:#86efac">${nTL}</div>
      <div class="sub">confT 75–84%</div>
    </div>
    <div class="stat-card">
      <div class="ico">★</div>
      <div class="lbl">G×S Forte</div>
      <div class="val" style="color:var(--gold)">${nGS}</div>
      <div class="sub">confT 65–74%</div>
    </div>
    <div class="stat-card">
      <div class="ico">⚡</div>
      <div class="lbl">NEUTRO Resgatado</div>
      <div class="val" style="color:#a78bfa">${nNF}</div>
      <div class="sub">ex-SKIP · Regras v4.2</div>
    </div>
    <div class="stat-card">
      <div class="ico">✈️</div>
      <div class="lbl">Sinais Visitante</div>
      <div class="val" style="color:var(--gold)">${nVis}</div>
      <div class="sub">inversão / piso liga</div>
    </div>
  </div>

  <!-- LEGENDA -->
  <div class="legenda">
    <div class="leg-pill" style="background:#1B5E20;color:#A5D6A7">🔒🔒 Triple Lock Forte ≥85%</div>
    <div class="leg-pill" style="background:#2E7D32;color:#C8E6C9">🔒 Triple Lock 75-84%</div>
    <div class="leg-pill" style="background:#E65100;color:#FFE0B2">★ G×S Forte 65-74%</div>
    <div class="leg-pill" style="background:#BF360C;color:#FFCCBC">⚠️ Marginal 60-64%</div>
    <div class="leg-pill" style="background:#4527A0;color:#D1C4E9">⚡ NEUTRO FORTE (v4.2)</div>
    <div class="leg-pill" style="background:#263238;color:#90A4AE">· NEUTRO lean (v4.2)</div>
  </div>

  <!-- RANKING GERAL TOP 20 -->
  <div style="margin-bottom:2.5rem">
    <div class="sec-title">🏆 Ranking Geral — Top 20 por confiança</div>
    <div style="overflow-x:auto;border-radius:12px;border:1px solid var(--border)">
      <table style="width:100%;border-collapse:collapse;font-size:.82rem">
        <thead>
          <tr style="background:var(--bg3);border-bottom:1px solid var(--border)">
            <th style="padding:.65rem .8rem;text-align:center;color:var(--muted);font-size:.7rem;text-transform:uppercase;letter-spacing:.5px">#</th>
            <th style="padding:.65rem .8rem;text-align:left;color:var(--muted);font-size:.7rem;text-transform:uppercase;letter-spacing:.5px">Liga</th>
            <th style="padding:.65rem .8rem;text-align:left;color:var(--muted);font-size:.7rem;text-transform:uppercase;letter-spacing:.5px">Horário</th>
            <th style="padding:.65rem .8rem;text-align:left;color:var(--muted);font-size:.7rem;text-transform:uppercase;letter-spacing:.5px">Partida</th>
            <th style="padding:.65rem .8rem;text-align:left;color:var(--muted);font-size:.7rem;text-transform:uppercase;letter-spacing:.5px">Sinal</th>
            <th style="padding:.65rem .8rem;text-align:center;color:var(--muted);font-size:.7rem;text-transform:uppercase;letter-spacing:.5px">Tier</th>
            <th style="padding:.65rem .8rem;text-align:center;color:var(--muted);font-size:.7rem;text-transform:uppercase;letter-spacing:.5px">confT</th>
            <th style="padding:.65rem .8rem;text-align:center;color:var(--muted);font-size:.7rem;text-transform:uppercase;letter-spacing:.5px">Linha FT</th>
            <th style="padding:.65rem .8rem;text-align:center;color:var(--muted);font-size:.7rem;text-transform:uppercase;letter-spacing:.5px">Δ Diff</th>
          </tr>
        </thead>
        <tbody>${rankRows}</tbody>
      </table>
    </div>
  </div>

  <!-- SECOES POR LIGA -->
  ${ligaSections}

  <!-- RODAPÉ -->
  <div style="text-align:center;padding-top:2rem;margin-top:2rem;border-top:1px solid var(--border);color:var(--muted);font-size:.78rem;line-height:1.8">
    <div style="font-weight:700;color:var(--green);font-size:.85rem;margin-bottom:.3rem">EDS-HDP ULTRA · Motor de Sinais v4.2</div>
    confT v4.0 · Regras de Desempate e Linhas v4.1 · Resolvedor NEUTRO v4.2 (sem SKIP)<br>
    Base de dados: brasileiraoB2026.js · usl2026.js · argentina_b2026.js · chile2026.js · memoria_usl.js<br>
    <span style="opacity:.6">Backtest rolling 222 jogos · Resolvedor NEUTRO: 76.9% acerto · Padrão A (N×N): 90%</span>
  </div>

</main>
</body>
</html>`;

const rodadaSlug = rodada.replace(/[^a-z0-9]/gi,"_").replace(/_+/g,"_");
const outFile = path.join(ROOT, `EDS_SINAIS_${rodadaSlug}.html`);
fs.writeFileSync(outFile, html, "utf8");
console.log(`OK — relatório salvo: ${outFile}`);
console.log(`Picks: ${picks.length} sinais em 4 ligas`);
