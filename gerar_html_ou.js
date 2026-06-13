#!/usr/bin/env node
// Gera EDS_OU_CANTOS_13_16_jun_2026.html a partir de ou_output.json
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = __dirname;
const D = JSON.parse(fs.readFileSync(path.join(ROOT, "ou_output.json"), "utf8"));

const BAND = {
  BRB: { flag: "🇧🇷", nome: "Brasileirão B", linha: "O/U 9.5" },
  USL: { flag: "🇺🇸", nome: "USL Championship", linha: "O/U 8.5" },
  ARG: { flag: "🇦🇷", nome: "Argentina B Nacional", linha: "O/U 8.5" },
  CHI: { flag: "🇨🇱", nome: "Liga Primera Chile", linha: "O/U 9.5" },
};

// todos os jogos da rodada, agrupados por liga, ordenados por |edge| desc
const todos = D.sinais;
const melhores = D.melhores;
const porLiga = {};
for (const r of todos) (porLiga[r.liga] = porLiga[r.liga] || []).push(r);

const nForte  = todos.filter(r => r.forcaFT === "FORTE").length;
const nMedio  = todos.filter(r => r.forcaFT === "MÉDIO").length;
const nLean   = todos.filter(r => r.forcaFT === "LEAN").length;
const nBase   = todos.filter(r => r.forcaFT === "BASE").length;
const nOver   = todos.filter(r => r.ladoFT === "OVER").length;
const nUnder  = todos.filter(r => r.ladoFT === "UNDER").length;

// classe de cor por lado+força
function ladoCls(r) {
  const f = r.forcaFT;
  if (r.ladoFT === "OVER") {
    if (f === "FORTE") return "ov-f";
    if (f === "MÉDIO") return "ov-m";
    if (f === "LEAN")  return "ov-l";
    return "ov-b";
  }
  if (f === "FORTE") return "un-f";
  if (f === "MÉDIO") return "un-m";
  if (f === "LEAN")  return "un-l";
  return "un-b";
}
function forcaBadge(f) {
  if (f === "FORTE") return '<span class="fb fb-f">FORTE</span>';
  if (f === "MÉDIO") return '<span class="fb fb-m">MÉDIO</span>';
  if (f === "LEAN")  return '<span class="fb fb-l">LEAN</span>';
  return '<span class="fb fb-b">BASE</span>';
}

function card(r) {
  const cls = ladoCls(r);
  const edgeStr = (r.edgeFT >= 0 ? "+" : "") + r.edgeFT + "%";
  const ht = (r.sinalHT && r.forcaHT !== "BASE")
    ? `<div class="ht">HT: <b>${r.ladoHT} ${r.lineHT}</b> · ${r.probHT}%</div>` : "";
  return `
  <div class="ou ${cls}">
    <div class="ou-hd">
      <span class="hor">${r.horario}</span>
      ${forcaBadge(r.forcaFT)}
    </div>
    <div class="ou-jogo">${r.mand} <span class="x">×</span> ${r.vis}</div>
    <div class="ou-sin">
      <span class="lado">${r.ladoFT} ${r.lineFT} FT</span>
      <span class="prob">${r.probFT}%</span>
    </div>
    <div class="ou-meta">
      <span class="combo">${r.perfH}×${r.perfV} · n=${r.nFT}</span>
      <span class="edge">edge ${edgeStr}</span>
    </div>
    ${ht}
  </div>`;
}

let secoes = "";
for (const liga of ["USL", "BRB", "ARG", "CHI"]) {
  const list = porLiga[liga];
  if (!list) continue;
  list.sort((a, b) => Math.abs(b.edgeFT) - Math.abs(a.edgeFT));
  const b = BAND[liga];
  const nF = list.filter(r => r.forcaFT === "FORTE").length;
  const nM = list.filter(r => r.forcaFT === "MÉDIO").length;
  const nL = list.filter(r => r.forcaFT === "LEAN").length;
  secoes += `
<div class="sec">
  <h2>${b.flag} ${b.nome}</h2>
  <span class="pill">${b.linha}</span>
  <span class="pill" style="background:#1B5E2020;color:#4ade80;border-color:#1B5E20">${nF} forte</span>
  <span class="pill" style="background:#1f4e7920;color:#9cc3e6;border-color:#1f4e79">${nM} médio</span>
  <span class="pill" style="background:#37414120;color:#9ca3af;border-color:#374141">${nL} lean</span>
  <span class="desc">${list.length} jogos · base OVER ${list[0].baseOverFT}%</span>
</div>
<div class="grid">
${list.map(card).join("")}
</div>`;
}

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>EDS HDP Ultra — Over/Under Cantos 13-16/jun/2026</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0d1117;color:#c9d1d9;font-family:'Segoe UI',system-ui,sans-serif;font-size:13px;line-height:1.4}
.container{max-width:1120px;margin:0 auto;padding:20px 14px}
.header{text-align:center;padding:28px 0 20px;border-bottom:1px solid #30363d;margin-bottom:22px}
.header .logo{font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:#58a6ff;font-weight:700;margin-bottom:8px}
.header h1{font-size:25px;font-weight:700;color:#fff}
.header h1 span{color:#58a6ff}
.header .sub{color:#8b949e;font-size:12px;margin-top:5px}
.tag-row{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-top:14px}
.tag{padding:3px 11px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:0.4px}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:9px;margin-bottom:24px}
.sc{background:#161b22;border:1px solid #30363d;border-radius:8px;padding:13px;text-align:center}
.sc .n{font-size:25px;font-weight:700}
.sc .l{font-size:10px;color:#8b949e;margin-top:3px;text-transform:uppercase;letter-spacing:0.4px}
.info{background:#161b22;border:1px solid #30363d;border-left:3px solid #58a6ff;border-radius:6px;padding:11px 14px;margin-bottom:22px;font-size:12px;color:#8b949e;line-height:1.6}
.info strong{color:#c9d1d9}
.sec{margin:26px 0 12px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.sec h2{font-size:16px;font-weight:700;color:#fff}
.pill{padding:2px 10px;border-radius:10px;font-size:10px;font-weight:700;background:#1f2937;color:#58a6ff;border:1px solid #374151}
.sec .desc{font-size:11px;color:#8b949e;margin-left:auto}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px}

/* OU card */
.ou{background:#161b22;border:1px solid #30363d;border-radius:10px;padding:0;overflow:hidden;border-left-width:4px}
.ou.ov-f{border-left-color:#4ade80}
.ou.ov-m{border-left-color:#86efac}
.ou.ov-l{border-left-color:#d1fae5}
.ou.ov-b{border-left-color:#374151}
.ou.un-f{border-left-color:#f87171}
.ou.un-m{border-left-color:#fca5a5}
.ou.un-l{border-left-color:#fee2e2}
.ou.un-b{border-left-color:#374151}
.ou-hd{display:flex;align-items:center;justify-content:space-between;padding:8px 12px 4px}
.hor{font-size:10px;color:#8b949e;font-weight:600}
.fb{font-size:8.5px;font-weight:700;padding:1px 6px;border-radius:4px}
.fb-f{background:#1B5E20;color:#a5d6a7}
.fb-m{background:#1f4e79;color:#9cc3e6}
.fb-l{background:#374151;color:#9ca3af}
.fb-b{background:#1c2128;color:#6b7280;border:1px solid #30363d}
.ou-jogo{font-size:12.5px;font-weight:600;color:#e6edf3;padding:2px 12px 7px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ou-jogo .x{color:#6b7280;font-weight:400;margin:0 2px}
.ou-sin{display:flex;align-items:center;justify-content:space-between;padding:0 12px 6px}
.ou-sin .lado{font-size:14px;font-weight:700}
.ou.ov-f .lado,.ou.ov-m .lado,.ou.ov-l .lado{color:#4ade80}
.ou.ov-b .lado{color:#6ee7b7}
.ou.un-f .lado,.ou.un-m .lado,.ou.un-l .lado{color:#f87171}
.ou.un-b .lado{color:#fca5a5}
.ou-sin .prob{font-size:15px;font-weight:700;color:#fff}
.ou-meta{display:flex;align-items:center;justify-content:space-between;padding:5px 12px;background:#0d1117;border-top:1px solid rgba(48,54,61,0.5);font-size:10px;color:#8b949e}
.ou-meta .edge{font-weight:700;color:#c9d1d9}
.ht{padding:4px 12px;font-size:10px;color:#8b949e;border-top:1px solid rgba(48,54,61,0.3)}
.ht b{color:#c9d1d9}

.legenda{background:#161b22;border:1px solid #30363d;border-radius:8px;padding:13px 16px;margin-top:26px;font-size:11px;color:#8b949e;line-height:1.7}
.legenda h3{font-size:12px;color:#c9d1d9;margin-bottom:7px}
.legenda b{color:#c9d1d9}
.footer{text-align:center;padding:18px 0;color:#8b949e;font-size:11px;border-top:1px solid #30363d;margin-top:28px}
</style>
</head>
<body>
<div class="container">

<div class="header">
  <div class="logo">EDS HDP Ultra · Mercado Over/Under Cantos</div>
  <h1>O/U Cantos <span>13–16 jun 2026</span></h1>
  <div class="sub">Todos os jogos da rodada · combo de perfil + diffSum · histórico próprio (1.324 jogos)</div>
  <div class="tag-row">
    <span class="tag" style="background:#1B5E20;color:#a5d6a7">FORTE · edge ≥ 15%</span>
    <span class="tag" style="background:#1f4e79;color:#9cc3e6">MÉDIO · edge 10–14%</span>
    <span class="tag" style="background:#374151;color:#9ca3af">LEAN · edge 6–9%</span>
    <span class="tag" style="background:#1c2128;color:#6b7280">BASE · edge &lt; 6%</span>
    <span class="tag" style="background:#143d2b;color:#4ade80">OVER</span>
    <span class="tag" style="background:#3d1717;color:#f87171">UNDER</span>
  </div>
</div>

<div class="stats">
  <div class="sc"><div class="n" style="color:#58a6ff">${todos.length}</div><div class="l">Total Jogos</div></div>
  <div class="sc"><div class="n" style="color:#4ade80">${nForte}</div><div class="l">Forte</div></div>
  <div class="sc"><div class="n" style="color:#9cc3e6">${nMedio}</div><div class="l">Médio</div></div>
  <div class="sc"><div class="n" style="color:#9ca3af">${nLean}</div><div class="l">Lean</div></div>
  <div class="sc"><div class="n" style="color:#6b7280">${nBase}</div><div class="l">Base</div></div>
  <div class="sc"><div class="n" style="color:#4ade80">${nOver}</div><div class="l">Over</div></div>
  <div class="sc"><div class="n" style="color:#f87171">${nUnder}</div><div class="l">Under</div></div>
</div>

<div class="info">
  <strong>Como ler:</strong> todos os ${todos.length} jogos da rodada estão listados, ordenados por |edge| dentro de cada liga.
  A borda lateral indica o lado (verde = OVER, vermelho = UNDER) e a intensidade indica a força.
  O badge no canto superior direito mostra a força: <strong>FORTE</strong> (jogar com confiança) ·
  <strong>MÉDIO</strong> (bom sinal) · <strong>LEAN</strong> (leve) · <strong>BASE</strong> (só aposta se tiver outro motivo externo).
  Linha FT: USL e ARG jogam <strong>O/U 8.5</strong> · BR_B e CHI jogam <strong>O/U 9.5</strong>.
</div>

${secoes}

<div class="legenda">
  <h3>Metodologia</h3>
  <b>Combo de perfil:</b> taxa histórica de Over para cada par perfil-mandante × perfil-visitante (G_STRONG/G/N/S/S_STRONG da memoria_usl.js).<br>
  <b>diffSum:</b> soma do diff_cantos dos dois times — confirma ou atenua o sinal do combo. Quando ambos concordam, o edge ganha +3%; quando divergem, o edge é atenuado em 40%.<br>
  <b>Força:</b> FORTE = edge ≥ 15% (ou ≥ 18% com n≥8) · MÉDIO = edge ≥ 10% · LEAN = edge ≥ 6%.<br>
  <b>Amostra mínima:</b> n ≥ 5 jogos no combo para gerar gatilho. Combos com n pequeno são direcionais — revalidar a cada rodada.
</div>

<div class="footer">
  EDS HDP Ultra — Motor O/U v1.0 · ${D.rodada} · todos os jogos da rodada<br>
  Dados: 1.324 jogos históricos · 8 ligas · linhas calibradas por média de cantos da liga
</div>

</div>
</body>
</html>`;

const out = path.join(ROOT, "EDS_OU_CANTOS_13_16_jun_2026.html");
fs.writeFileSync(out, html);
console.log("HTML salvo:", out, "(" + (html.length / 1024).toFixed(1) + " KB)");
