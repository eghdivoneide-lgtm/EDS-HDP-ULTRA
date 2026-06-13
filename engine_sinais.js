#!/usr/bin/env node
// ============================================================
// EDS-HDP ULTRA — Motor de Sinais v4.2
// Uso: node engine_sinais.js [fixtures.json]
// confT v4.0 + Regras v4.1 + Resolvedor NEUTRO v4.2 (sem SKIP)
// ============================================================
"use strict";
const fs = require("fs"), vm = require("vm"), path = require("path");

const ROOT   = path.join(__dirname);
const INPUT  = process.argv[2] || path.join(ROOT, "fixtures.json");

// ── Carrega dados ────────────────────────────────────────────
const ctx = { window: {} };
vm.createContext(ctx);
const load = f => vm.runInContext(fs.readFileSync(path.join(ROOT,"data",f),"utf8"), ctx);
load("brasileiraoB2026.js");
load("usl2026.js");
load("argentina_b2026.js");
load("chile2026.js");
load("memoria_usl.js");

const DADOS = {
  BRB: ctx.window.DADOS_BR_B,
  USL: ctx.window.DADOS_USL,
  ARG: ctx.window.DADOS_ARG_B,
  CHI: ctx.window.DADOS_CHI,
};
const MEM = ctx.window.MEMORIA_USL;
const MEM_KEYS = { BRB:"BR_B", USL:"USL", ARG:"ARG_B", CHI:"CHI" };

// ── Utilitários ──────────────────────────────────────────────
const parseDate = s => {
  try { const [d]=s.split(" "); const [dd,mm,yy]=d.split("."); return new Date(yy,mm-1,dd).getTime(); }
  catch(e){ return 0; }
};

const sortJogos = arr =>
  arr.filter(j=>j.cantos&&j.cantos.ft)
     .sort((a,b)=>parseDate(a.data_partida||a.data)-parseDate(b.data_partida||b.data));

// Normaliza nome para encontrar no arquivo de dados
const findTeam = (names, query) => {
  if(!query) return null;
  if(names.has(query)) return query;
  const q = query.toLowerCase();
  for(const t of names){
    const tl = t.toLowerCase();
    if(tl===q || tl.includes(q) || q.includes(tl)) return t;
  }
  return null;
};

// ── Estatísticas rolling (temporada toda até hoje) ───────────
// Para o fluxo operacional, usamos a temporada COMPLETA (forward use case)
// Nota: o backtest usou rolling; aqui é forward — precisão adequada para jogar
function getTeamStats(jogos, team) {
  const casa  = jogos.filter(j => j.mandante  === team);
  const fora  = jogos.filter(j => j.visitante === team);

  const calcFT = (arr, side) => {
    let w=0,n=0,gf=0,gc=0;
    for(const j of arr){
      const {m,v}=j.cantos.ft;
      const my=side==="m"?m:v, op=side==="m"?v:m;
      gf+=my; gc+=op;
      if(my!==op){ n++; if(my>op) w++; }
    }
    return { w, n, j:arr.length, avgGen:arr.length?(gf/arr.length):0, avgCon:arr.length?(gc/arr.length):0 };
  };
  const calcHT = (arr, side) => {
    let w=0,n=0,gf=0,gc=0;
    for(const j of arr){
      if(!j.cantos.ht) continue;
      const {m,v}=j.cantos.ht;
      const my=side==="m"?m:v, op=side==="m"?v:m;
      gf+=my; gc+=op;
      if(my!==op){ n++; if(my>op) w++; }
    }
    return { w, n, j:arr.length, avgGen:arr.length?(gf/arr.length):0, avgCon:arr.length?(gc/arr.length):0 };
  };

  const cFT = calcFT(casa,"m"), cHT = calcHT(casa,"m");
  const fFT = calcFT(fora,"v"), fHT = calcHT(fora,"v");

  // L3 casa FT
  const l3 = casa.slice(-3);
  let l3w = 0;
  for(const j of l3){ const {m,v}=j.cantos.ft; if(m>v) l3w++; }

  // Formação principal
  const fm = {};
  for(const j of jogos){
    if(!j.formacao) continue;
    if(j.mandante===team)  fm[j.formacao.m]=(fm[j.formacao.m]||0)+1;
    if(j.visitante===team) fm[j.formacao.v]=(fm[j.formacao.v]||0)+1;
  }
  const mainForm = Object.entries(fm).sort((a,b)=>b[1]-a[1])[0]?.[0]||null;

  return { cFT, cHT, fFT, fHT, l3w, l3n: l3.length, mainForm };
}

// ── Matchup tático ────────────────────────────────────────────
function buildMatchupTable(jogos) {
  const mu = {};
  for(const j of jogos){
    if(!j.formacao) continue;
    const k = `${j.formacao.m}×${j.formacao.v}`;
    const {m,v}=j.cantos.ft;
    if(m===v) continue;
    if(!mu[k]) mu[k]={w:0,n:0};
    mu[k].n++;
    if(m>v) mu[k].w++;
  }
  return mu;
}

// ── Perfil USL v3.0 ───────────────────────────────────────────
function getPerfil(ligaKey, team) {
  const sec = MEM?.[ligaKey];
  if(!sec?.perfis) return null;
  const p = sec.perfis[team] || sec.perfis[
    Object.keys(sec.perfis).find(k=>k.toLowerCase()===team.toLowerCase())
  ];
  return p || null;
}

// ── Ajuste de perfil (confT v4.0, Regras v4.1 + Regra Interp #2) ─
function profileAdj(h, v) {
  // Regra de Interpretação #2: qualquer mandante vs S_STRONG = +12% automático
  if(v==="S_STRONG") return 12;
  if(h==="G_STRONG" && v==="S")       return 10;
  if(h==="G_STRONG" && v==="N")       return 6;
  if(h==="G_STRONG" && v==="G")       return 0;  // G_STRONG×G_STRONG desempate v4.1 #1
  if(h==="G"        && v==="S")       return 7;
  if(h==="G"        && v==="N")       return 3;
  if(h==="G"        && v==="G")       return 0;
  if(h==="G"        && v==="G_STRONG")return -6;
  if(h==="N"        && v==="N")       return 0;
  if(h==="N"        && v==="G")       return -3;
  if(h==="N"        && v==="G_STRONG")return -6;
  if(h==="S"        && v==="G")       return -7;
  if(h==="S"        && v==="G_STRONG")return -10;
  if(h==="S_STRONG" && v==="G")       return -12;
  if(h==="S_STRONG" && v==="G_STRONG")return -15;
  return 0;
}

// ── Base rate da liga ─────────────────────────────────────────
function baseRate(jogos) {
  let hw=0,tot=0;
  for(const j of jogos){ const {m,v}=j.cantos.ft; if(m===v) continue; tot++; if(m>v) hw++; }
  return tot>0?(100*hw/tot):50;
}

// ── Diff projetado ────────────────────────────────────────────
function diffProjected(hGenCasa, hConCasa, vGenFora, vConFora) {
  const pH = (hGenCasa + vConFora) / 2;
  const pV = (vGenFora + hConCasa) / 2;
  return { pH, pV, diff: pH - pV };
}

// ── Linha recomendada ─────────────────────────────────────────
function lineFT(diff) {
  const d = parseFloat(diff);
  if(d>=5.0) return "-2.5 (principal) / -1.5 (seg.)";
  if(d>=3.0) return "-1.5 (principal) / -0.5 (seg.)";
  if(d>=1.5) return "-0.5 / ML";
  return "ML";
}
function lineHT(diff) {
  const d = parseFloat(diff);
  if(d>=2.0) return "-1.0 / -0.5";
  if(d>=0.8) return "-0.5 / ML";
  return "ML";
}

// ── Tier ─────────────────────────────────────────────────────
function tierName(c) {
  if(c>=85) return "TRIPLE LOCK FORTE 🔒🔒";
  if(c>=75) return "TRIPLE LOCK 🔒";
  if(c>=65) return "G×S FORTE ★";
  if(c>=60) return "MARGINAL ⚠️";
  return "NEUTRO";
}

// ── Resolvedor NEUTRO v4.2 ────────────────────────────────────
const PISO = { BRB:"MAND", ARG:"MAND", USL:"VIS", CHI:"VIS" };
const isG = p => p==="G"||p==="G_STRONG";
const isS = p => p==="S"||p==="S_STRONG";

function resolverNeutro(perfH, perfV, liga) {
  // A — N×N → MANDANTE FORTE (90% backtest)
  if(perfH==="N" && perfV==="N")
    return { lado:"MAND", conf:72, regra:"A · N×N → mandante", forca:"FORTE" };
  // B — S×G → VISITANTE FORTE (83% backtest)
  if(isS(perfH) && isG(perfV))
    return { lado:"VIS", conf:70, regra:"B · inversão S×G → visitante", forca:"FORTE" };
  // E — piso de liga
  const piso = PISO[liga]||"MAND";
  return { lado:piso, conf: piso==="MAND"?58:57, regra:`E · piso ${liga}`, forca:"FRACO" };
}

// ── Motor principal ───────────────────────────────────────────
function calcSinal(fix, jogosLiga, mu, br, ligaKey) {
  const names = new Set([
    ...jogosLiga.map(j=>j.mandante),
    ...jogosLiga.map(j=>j.visitante),
  ]);

  const hn = findTeam(names, fix.mandante) || fix.mandante;
  const vn = findTeam(names, fix.visitante) || fix.visitante;

  const HS = getTeamStats(jogosLiga, hn);
  const VS = getTeamStats(jogosLiga, vn);

  // Perfis
  const pH = getPerfil(ligaKey, hn);
  const pV = getPerfil(ligaKey, vn);
  const perfH = pH?.perfil_usl||"N";
  const perfV = pV?.perfil_usl||"N";

  // histCasa FT (win rate decididos)
  const histCasaFT = HS.cFT.n>0 ? 100*HS.cFT.w/HS.cFT.n : br;

  // formGlobal: win_pct_cantos do perfil (representa a qualidade global do time)
  const formGlobal = pH ? 100*pH.win_pct_cantos : histCasaFT;

  // Matchup tático FT
  const mKey = HS.mainForm && VS.mainForm ? `${HS.mainForm}×${VS.mainForm}` : null;
  const muData = mKey ? mu[mKey] : null;
  const matchupPct = (muData && muData.n>=3) ? 100*muData.w/muData.n : br;

  // L3 ajuste
  const l3adj = HS.l3n<3 ? 0 :
    HS.l3w===3?2 : HS.l3w===2?1 : HS.l3w===0?-2 : -1;

  // Perfil ajuste
  const pAdj = profileAdj(perfH, perfV);

  // Viagem USL cross-conference
  let travAdj = 0;
  if(fix.cross_conf_km){
    if(fix.cross_conf_km>=4000)      travAdj = 9;
    else if(fix.cross_conf_km>=2500) travAdj = 6;
    else                              travAdj = 4;
  }

  // confT FT
  let cFT = histCasaFT*0.40 + formGlobal*0.30 + matchupPct*0.30 + pAdj + l3adj + travAdj;
  cFT = Math.min(98, Math.max(10, cFT));

  // v4.1 regra #4: matchup amostra pequena não veta histCasa ≥75%
  if(muData && muData.n<10 && histCasaFT>=75){
    const semMatchup = histCasaFT*0.40 + formGlobal*0.30 + br*0.30 + pAdj + l3adj + travAdj;
    cFT = Math.max(cFT, semMatchup);
  }

  // Diff projetado FT + HT
  const dpFT = diffProjected(HS.cFT.avgGen, HS.cFT.avgCon, VS.fFT.avgGen, VS.fFT.avgCon);
  const dpHT = diffProjected(HS.cHT.avgGen, HS.cHT.avgCon, VS.fHT.avgGen, VS.fHT.avgCon);

  // Tier e sinal
  let tier = tierName(cFT);
  let lado = "MAND";
  let conf = cFT;
  let regra = "confT v4.0";
  let forca = tier!=="NEUTRO" ? (cFT>=75?"FORTE":"MÉDIO") : null;

  // v4.1 regra #1: desempate mandante se histCasa>=70%
  if(tier==="NEUTRO" || (perfH===perfV && perfH.includes("G") && histCasaFT>=70)){
    if(histCasaFT>=70 && tier!=="NEUTRO"){
      lado="MAND"; regra="v4.1#1 desempate histCasa≥70%";
    }
  }

  // v4.2: resolvedor NEUTRO
  if(cFT<60){
    const res = resolverNeutro(perfH, perfV, fix.liga||"BRB");
    lado  = res.lado;
    conf  = res.conf;
    regra = res.regra;
    forca = res.forca;
    tier  = `NEUTRO → ${forca}`;
  } else {
    // v4.1 regra #2: sinal visitante USL cross-conf rebaixa 1 tier
    // (já embutido no travAdj positivo — não aplica rebaixamento aqui)
  }

  // Sinal final
  const sinalTime  = lado==="MAND" ? hn : vn;
  const sinalLabel = lado==="MAND" ? `MANDANTE: ${hn}` : `VISITANTE: ${vn}`;

  return {
    liga:   fix.liga,
    horario:fix.horario||"—",
    mand: hn, vis: vn,
    conf: parseFloat(cFT.toFixed(1)),
    confFinal: parseFloat(conf.toFixed(1)),
    tier, lado, sinalLabel, regra, forca,
    perfH, perfV,
    histCasaFT: parseFloat(histCasaFT.toFixed(1)),
    matchupPct: parseFloat(matchupPct.toFixed(1)), mKey, muN: muData?.n||0,
    l3w: HS.l3w, l3n: HS.l3n,
    dpFTdiff: parseFloat(dpFT.diff.toFixed(1)),
    dpHTdiff: parseFloat(dpHT.diff.toFixed(1)),
    lineFT:  lineFT(dpFT.diff),
    lineHT:  lineHT(dpHT.diff),
    cFT_raw: parseFloat(cFT.toFixed(1)),
    casaJ: HS.cFT.j,
    alertasH: pH?.alertas_usl||[],
    alertasV: pV?.alertas_usl||[],
  };
}

// ── Processar fixtures ────────────────────────────────────────
const fixtures = JSON.parse(fs.readFileSync(INPUT,"utf8"));

// Pré-computa por liga
const LIGAS_PREP = {};
for(const [code, data] of Object.entries(DADOS)){
  const jogos = sortJogos(data.jogos);
  LIGAS_PREP[code] = {
    jogos,
    mu: buildMatchupTable(jogos),
    br: baseRate(jogos),
    ligaKey: MEM_KEYS[code],
  };
}

// Calcula sinal para cada jogo
const resultados = fixtures.jogos.map(fix => {
  const prep = LIGAS_PREP[fix.liga];
  if(!prep){ return {...fix, erro:"Liga não encontrada: "+fix.liga}; }
  return calcSinal(fix, prep.jogos, prep.mu, prep.br, prep.ligaKey);
});

// ── Output formatado ──────────────────────────────────────────
const RESET="\x1b[0m",BOLD="\x1b[1m",DIM="\x1b[2m";
const GREEN="\x1b[32m",YELLOW="\x1b[33m",RED="\x1b[31m",CYAN="\x1b[36m",MAG="\x1b[35m",BLUE="\x1b[34m";

function corTier(t){
  if(t.includes("TRIPLE LOCK FORTE")) return GREEN+BOLD;
  if(t.includes("TRIPLE LOCK"))       return GREEN;
  if(t.includes("G×S"))               return YELLOW;
  if(t.includes("MARGINAL"))          return RED;
  if(t.includes("FORTE"))             return CYAN;   // NEUTRO FORTE
  if(t.includes("FRACO"))             return DIM;
  return RESET;
}

console.log("\n"+BOLD+"══════════════════════════════════════════════════════════════════════"+RESET);
console.log(BOLD+"  EDS-HDP ULTRA — SINAIS v4.2 | "+fixtures.rodada+RESET);
console.log(BOLD+"  confT v4.0 + Regras v4.1 + Resolvedor NEUTRO (sem SKIP)"+RESET);
console.log(BOLD+"══════════════════════════════════════════════════════════════════════"+RESET);

// Separa por liga
const porLiga = {};
for(const r of resultados){
  if(r.erro){ console.log(RED+"  ERRO: "+r.erro+RESET); continue; }
  (porLiga[r.liga]=porLiga[r.liga]||[]).push(r);
}

// Flag de ligas na ordem certa
const BANDEIRAS = {BRB:"🇧🇷 BR_B",USL:"🇺🇸 USL",ARG:"🇦🇷 ARG_B",CHI:"🇨🇱 CHI"};
const totalPicks = [];

for(const liga of ["BRB","USL","ARG","CHI"]){
  const list = porLiga[liga];
  if(!list) continue;

  // Ordena: confFinal decrescente
  list.sort((a,b)=>b.confFinal-a.confFinal);

  const picks = list.filter(r=>r.cFT_raw>=60 || r.tier.includes("NEUTRO"));
  const lockCount = list.filter(r=>r.tier.includes("LOCK")).length;

  console.log("\n"+BOLD+BLUE+"  "+BANDEIRAS[liga]+" ("+list.length+" jogos | "+picks.length+" picks)"+RESET);
  console.log("  "+DIM+"─".repeat(68)+RESET);
  console.log("  "+DIM+
    "Horário   Jogo".padEnd(34)+
    "Sinal".padEnd(26)+
    "Conf   Linha FT           Diff".padEnd(36)+
    RESET);
  console.log("  "+DIM+"─".repeat(68)+RESET);

  for(const r of list){
    const cor = corTier(r.tier);
    const tierShort = r.tier.replace(" 🔒🔒","🔒🔒").replace(" 🔒","🔒").replace(" ★","★").replace(" ⚠️","⚠️");
    const diffStr = r.dpFTdiff>=0?"+"+r.dpFTdiff.toFixed(1):r.dpFTdiff.toFixed(1);
    const jogo = (r.mand+" × "+r.vis).substring(0,30).padEnd(30);
    const sinal = r.sinalLabel.substring(0,24).padEnd(24);

    console.log("  "+
      (r.horario||"").padEnd(10)+
      jogo+
      cor+sinal+RESET+"  "+
      cor+BOLD+(r.confFinal+"%").padEnd(7)+RESET+
      (r.lineFT||"ML").padEnd(20)+
      diffStr.padEnd(8)+
      DIM+r.regra.substring(0,24)+RESET
    );
  }

  totalPicks.push(...picks);
}

// Resumo
console.log("\n"+BOLD+"══════════════════════════════════════════════════════════════════════"+RESET);
console.log(BOLD+"  RANKING GERAL — "+totalPicks.length+" sinais (ordenados por confiança)"+RESET);
console.log(BOLD+"══════════════════════════════════════════════════════════════════════"+RESET+"\n");

totalPicks.sort((a,b)=>b.confFinal-a.confFinal);
for(let i=0;i<totalPicks.length;i++){
  const r = totalPicks[i];
  const cor = corTier(r.tier);
  const diffStr = r.dpFTdiff>=0?"+"+r.dpFTdiff.toFixed(1):r.dpFTdiff.toFixed(1);
  console.log("  "+BOLD+(String(i+1)+".").padEnd(4)+RESET+
    (r.liga).padEnd(5)+
    (r.horario||"").padEnd(10)+
    (r.mand+" × "+r.vis).substring(0,30).padEnd(31)+
    cor+BOLD+r.sinalLabel.substring(0,26).padEnd(26)+RESET+
    cor+(r.confFinal+"%").padEnd(7)+RESET+
    r.lineFT.padEnd(22)+
    diffStr
  );
}

// Estatísticas por tier
const byTier = {};
for(const r of totalPicks) (byTier[r.tier]=byTier[r.tier]||[]).push(r);
console.log("\n"+DIM+"  Distribuição:");
for(const [t,list] of Object.entries(byTier).sort((a,b)=>b[1][0].confFinal-a[1][0].confFinal))
  console.log(DIM+"    "+t+": "+list.length+RESET);

// Salva JSON dos resultados para uso externo (relatórios Word, etc.)
const outPath = path.join(ROOT, "sinais_output.json");
fs.writeFileSync(outPath, JSON.stringify({
  rodada: fixtures.rodada,
  gerado_em: new Date().toISOString(),
  sinais: resultados.filter(r=>!r.erro),
  picks: totalPicks,
}, null, 2));
console.log("\n"+DIM+"  JSON salvo: sinais_output.json"+RESET+"\n");
