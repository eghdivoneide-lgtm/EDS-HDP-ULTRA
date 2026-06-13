const fs = require("fs"), vm = require("vm");
const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync("/home/user/EDS-HDP-ULTRA/data/brasileiraoB2026.js","utf8"), ctx);
vm.runInContext(fs.readFileSync("/home/user/EDS-HDP-ULTRA/data/usl2026.js","utf8"), ctx);
vm.runInContext(fs.readFileSync("/home/user/EDS-HDP-ULTRA/data/argentina_b2026.js","utf8"), ctx);
vm.runInContext(fs.readFileSync("/home/user/EDS-HDP-ULTRA/data/chile2026.js","utf8"), ctx);
vm.runInContext(fs.readFileSync("/home/user/EDS-HDP-ULTRA/data/memoria_usl.js","utf8"), ctx);

const LIGAS = {
  BR_B: ctx.window.DADOS_BR_B,
  USL:  ctx.window.DADOS_USL,
  ARG_B:ctx.window.DADOS_ARG_B,
  CHI:  ctx.window.DADOS_CHI,
};
const MEM = ctx.window.MEMORIA_USL;

const parse = s => { try { const [d]=s.split(" "); const [dd,mm,yy]=d.split("."); return new Date(yy,mm-1,dd).getTime(); } catch(e){return 0;} };
const sortJ = arr => arr.filter(j=>j.cantos&&j.cantos.ft).sort((a,b)=>parse(a.data_partida||a.data)-parse(b.data_partida||b.data));

// ---- profile adjustment (same matrix as engine) ----
const profileAdj=(h,v)=>{
  if(h==="G_STRONG"&&v==="S_STRONG")return 15;
  if(h==="G_STRONG"&&v==="S")return 10;
  if(h==="G_STRONG"&&v==="N")return 6;
  if(h==="G"&&v==="S_STRONG")return 12;
  if(h==="G"&&v==="S")return 7;
  if(h==="G"&&v==="N")return 3;
  if(v==="S_STRONG")return 12;      // Regra Interp #2: qualquer mandante x S_STRONG = +12
  if(h==="N"&&v==="N")return 0;
  if(h==="N"&&v==="G")return -3;
  if(h==="N"&&v==="G_STRONG")return -6;
  if(h==="S"&&v==="G")return -7;
  if(h==="S"&&v==="G_STRONG")return -10;
  if(h==="S_STRONG"&&v==="G")return -12;
  if(h==="S_STRONG"&&v==="G_STRONG")return -15;
  return 0;
};
const perfilDe = (liga, time) => {
  const sec = MEM && MEM[liga];
  if(!sec||!sec.perfis) return "N";
  const p = sec.perfis[time] || sec.perfis[Object.keys(sec.perfis).find(k=>k.toLowerCase()===String(time).toLowerCase())];
  return p ? p.perfil_usl : "N";
};

const baseRateOf = jogos => {
  let hw=0,tot=0;
  for(const j of jogos){const{m,v}=j.cantos.ft;if(m===v)continue;tot++;if(m>v)hw++;}
  return tot>0?(100*hw/tot):50;
};

// rolling helpers over a slice of past games
function homeStats(past, team){
  const casa = past.filter(j=>j.mandante===team);
  let w=0,n=0,wH=0,nH=0,gf=0,gc=0;
  for(const j of casa){
    const{m,v}=j.cantos.ft; gf+=m; gc+=v;
    if(m!==v){n++; if(m>v)w++;}
    if(j.cantos.ht){const{m:hm,v:hv}=j.cantos.ht; if(hm!==hv){nH++; if(hm>hv)wH++;}}
  }
  return {w,n,wH,nH,gf,gc,jogos:casa.length};
}
function awayStats(past, team){
  const fora = past.filter(j=>j.visitante===team);
  let w=0,n=0,gf=0,gc=0;
  for(const j of fora){
    const{m,v}=j.cantos.ft; gf+=v; gc+=m;
    if(m!==v){n++; if(v>m)w++;}
  }
  return {w,n,gf,gc,jogos:fora.length};
}
function l3home(past,team){
  const casa=past.filter(j=>j.mandante===team).slice(-3); let w=0;
  for(const j of casa){const{m,v}=j.cantos.ft; if(m>v)w++;}
  return casa.length<3?null:w;
}
// matchup % using past games with same formation pairing
function matchupPct(past, fm, fv){
  if(!fm||!fv) return null;
  let w=0,n=0;
  for(const j of past){
    if(!j.formacao) continue;
    if(j.formacao.m===fm && j.formacao.v===fv){
      const{m,v}=j.cantos.ft; if(m!==v){n++; if(m>v)w++;}
    }
  }
  return n>=3 ? {pct:100*w/n, n} : null;
}

const MIN_HOME=3, MIN_AWAY=3;

const tiers = c => c>=85?"TLF":c>=75?"TL":c>=65?"GS":c>=60?"MARG":"NEUTRO";

function runLeague(code, data){
  const jogos = sortJ(data.jogos);
  const baseRate = baseRateOf(jogos);
  const evals = [];
  for(let i=0;i<jogos.length;i++){
    const j = jogos[i];
    const past = jogos.slice(0,i);               // só jogos ANTERIORES
    const H = homeStats(past, j.mandante);
    const A = awayStats(past, j.visitante);
    if(H.n < MIN_HOME || A.jogos < MIN_AWAY) continue;   // amostra insuficiente -> não avalia

    const histCasa = 100*H.w/H.n;
    const formGlobal = A.n>0 ? 100*(1 - A.w/A.n) : 50;   // quão pouco o visitante vence fora
    const fm = j.formacao?j.formacao.m:null, fv = j.formacao?j.formacao.v:null;
    const mu = matchupPct(past, fm, fv);
    const matchupP = mu ? mu.pct : baseRate;

    const perfH = perfilDe(code, j.mandante);
    const perfV = perfilDe(code, j.visitante);
    const pAdj = profileAdj(perfH, perfV);

    const l3 = l3home(past, j.mandante);
    const l3adj = l3===null?0 : l3===3?2 : l3===2?1 : l3===0?-2 : -1;

    let confT = histCasa*0.40 + formGlobal*0.30 + matchupP*0.30 + pAdj + l3adj;
    confT = Math.min(98, Math.max(10, confT));

    // resultado REAL
    const {m,v} = j.cantos.ft;
    const decidedFT = m!==v;
    const mandWonFT = m>v;
    let decidedHT=false, mandWonHT=false;
    if(j.cantos.ht){const{m:hm,v:hv}=j.cantos.ht; decidedHT=hm!==hv; mandWonHT=hm>hv;}
    const diffFT = m - v;

    evals.push({
      liga:code, data:j.data_partida||j.data,
      mand:j.mandante, vis:j.visitante,
      confT, tier:tiers(confT),
      histCasa, formGlobal, matchupP, perfH, perfV, pAdj, l3,
      decidedFT, mandWonFT, decidedHT, mandWonHT, diffFT,
      cantosFT:`${m}-${v}`,
    });
  }
  return {baseRate, evals};
}

const ALL = [];
const perLiga = {};
for(const [code,data] of Object.entries(LIGAS)){
  const r = runLeague(code, data);
  perLiga[code] = r;
  ALL.push(...r.evals);
}

// ---- aggregate helpers ----
function agg(list){
  const decFT = list.filter(e=>e.decidedFT);
  const decHT = list.filter(e=>e.decidedHT);
  const mandFT = decFT.filter(e=>e.mandWonFT).length;
  const mandHT = decHT.filter(e=>e.mandWonHT).length;
  const avgDiff = list.reduce((s,e)=>s+e.diffFT,0)/(list.length||1);
  return {
    n:list.length,
    decFT:decFT.length, mandFT, mandFTpct: decFT.length?100*mandFT/decFT.length:0,
    decHT:decHT.length, mandHT, mandHTpct: decHT.length?100*mandHT/decHT.length:0,
    avgDiff,
  };
}
const fmt = a => `n=${a.n} | FT mand ${a.mandFT}/${a.decFT} = ${a.mandFTpct.toFixed(1)}% | HT mand ${a.mandHT}/${a.decHT} = ${a.mandHTpct.toFixed(1)}% | diff médio ${a.avgDiff>=0?"+":""}${a.avgDiff.toFixed(2)}`;

console.log("======================================================");
console.log(" BACKTEST ROLLING — TODAS AS LIGAS");
console.log(" (cada jogo avaliado só com dados anteriores à sua data)");
console.log("======================================================\n");

console.log("--- AMOSTRA TOTAL AVALIADA ---");
console.log(" "+fmt(agg(ALL)));
console.log("");

console.log("--- POR TIER (confT) — comportamento real do mandante ---");
for(const t of ["TLF","TL","GS","MARG","NEUTRO"]){
  const list = ALL.filter(e=>e.tier===t);
  if(list.length) console.log(` ${t.padEnd(7)}: ${fmt(agg(list))}`);
}
console.log("");

const NEU = ALL.filter(e=>e.tier==="NEUTRO");
console.log("======================================================");
console.log(` FOCO: JOGOS NEUTRO (confT < 60%) — n=${NEU.length}`);
console.log("======================================================\n");

console.log("--- NEUTRO por liga ---");
for(const code of Object.keys(LIGAS)){
  const list = NEU.filter(e=>e.liga===code);
  if(list.length) console.log(` ${code.padEnd(6)}: ${fmt(agg(list))}`);
}
console.log("");

console.log("--- NEUTRO por faixa de confT ---");
const faixas = [[10,40],[40,50],[50,55],[55,60]];
for(const [lo,hi] of faixas){
  const list = NEU.filter(e=>e.confT>=lo && e.confT<hi);
  if(list.length) console.log(` ${lo}-${hi}%: ${fmt(agg(list))}`);
}
console.log("");

console.log("--- NEUTRO por faixa de histCasa (chave do fator casa) ---");
const hc = [[0,40],[40,50],[50,60],[60,70],[70,200]];
for(const [lo,hi] of hc){
  const list = NEU.filter(e=>e.histCasa>=lo && e.histCasa<hi);
  if(list.length) console.log(` histCasa ${lo}-${hi}%: ${fmt(agg(list))}`);
}
console.log("");

console.log("--- NEUTRO por perfil Mandante × Visitante ---");
const byPerf = {};
for(const e of NEU){ const k=`${e.perfH}×${e.perfV}`; (byPerf[k]=byPerf[k]||[]).push(e); }
for(const [k,list] of Object.entries(byPerf).sort((a,b)=>b[1].length-a[1].length)){
  if(list.length>=5) console.log(` ${k.padEnd(20)}: ${fmt(agg(list))}`);
}
console.log("");

console.log("--- CONTROLE: mesmos NEUTRO, visão do VISITANTE FT ---");
const decFTneu = NEU.filter(e=>e.decidedFT);
const visWon = decFTneu.filter(e=>!e.mandWonFT).length;
console.log(` Visitante venceu o duelo FT em ${visWon}/${decFTneu.length} = ${(100*visWon/decFTneu.length).toFixed(1)}% dos NEUTRO decididos`);
console.log("");

// salva dump para inspeção
fs.writeFileSync("/tmp/backtest_neutro.json", JSON.stringify({
  totalAvaliado: ALL.length, neutroN: NEU.length,
  baseRates: Object.fromEntries(Object.entries(perLiga).map(([k,v])=>[k,v.baseRate.toFixed(1)])),
  neutro: NEU.map(e=>({liga:e.liga,data:e.data,jogo:`${e.mand} x ${e.vis}`,confT:+e.confT.toFixed(1),histCasa:+e.histCasa.toFixed(1),perf:`${e.perfH}×${e.perfV}`,cantosFT:e.cantosFT,mandWonFT:e.mandWonFT})),
}, null, 2));
console.log("JSON salvo: /tmp/backtest_neutro.json");
