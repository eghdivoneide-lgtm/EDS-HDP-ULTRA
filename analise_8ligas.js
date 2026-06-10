#!/usr/bin/env node
const fs = require('fs');

const LIGAS = [
  { id: 'BR',    nome: 'Brasileirão Série A',    file: 'brasileirao2026.js'   },
  { id: 'BR_B',  nome: 'Brasileirão Série B',    file: 'brasileiraoB2026.js'  },
  { id: 'ARG',   nome: 'Argentina Liga Pro',     file: 'argentina2026.js'     },
  { id: 'ARG_B', nome: 'Argentina B Nacional',   file: 'argentina_b2026.js'   },
  { id: 'MLS',   nome: 'MLS',                    file: 'mls2026.js'           },
  { id: 'USL',   nome: 'USL Championship',       file: 'usl2026.js'           },
  { id: 'CHI',   nome: 'Chile Primera División', file: 'chile2026.js'         },
  { id: 'ECU',   nome: 'Ecuador LigaPro',        file: 'equador2026.js'       },
];

function loadLeague(file) {
  const src = fs.readFileSync('/home/user/EDS-HDP-ULTRA/data/' + file, 'utf8');
  const m = src.match(/window\.\w+\s*=\s*(\{[\s\S]*\})\s*;?\s*$/);
  return JSON.parse(m[1]);
}

function classifyUSL(diff) {
  if (diff >= 2.0)   return 'G_STRONG';
  if (diff >= 0.75)  return 'G';
  if (diff >= -0.75) return 'N';
  if (diff >= -2.0)  return 'S';
  return 'S_STRONG';
}
function isG(p) { return p === 'G_STRONG' || p === 'G'; }
function isS(p) { return p === 'S_STRONG' || p === 'S'; }

function pct(n, d) { return d > 0 ? +((n / d) * 100).toFixed(1) : 0; }
function avg(arr) { return arr.length ? +(arr.reduce((s,v)=>s+v,0)/arr.length).toFixed(2) : 0; }

function buildProfiles(jogos) {
  const s = {};
  for (const j of jogos) {
    const pairs = [[j.mandante,j.cm,j.cv,'casa'],[j.visitante,j.cv,j.cm,'fora']];
    for (const [t,pro,sof,ctx] of pairs) {
      if (!t) continue;
      if (!s[t]) s[t] = {pro:0,sof:0,n:0,wins:0,casa:{pro:0,sof:0,n:0},fora:{pro:0,sof:0,n:0}};
      s[t].pro += pro; s[t].sof += sof; s[t].n++;
      if (pro > sof) s[t].wins++;
      s[t][ctx].pro += pro; s[t][ctx].sof += sof; s[t][ctx].n++;
    }
  }
  const out = {};
  for (const [t,v] of Object.entries(s)) {
    if (v.n < 3) continue;
    const diff = (v.pro - v.sof) / v.n;
    const casaDiff = v.casa.n > 0 ? (v.casa.pro - v.casa.sof) / v.casa.n : 0;
    const foraDiff = v.fora.n > 0 ? (v.fora.pro - v.fora.sof) / v.fora.n : 0;
    out[t] = {
      diff: +diff.toFixed(2),
      perfil: classifyUSL(diff),
      n: v.n,
      avgPro: +(v.pro/v.n).toFixed(2),
      avgSof: +(v.sof/v.n).toFixed(2),
      winPct: +pct(v.wins,v.n).toFixed(1),
      casaDiff: +casaDiff.toFixed(2),
      foraDiff: +foraDiff.toFixed(2),
    };
  }
  return out;
}

function analyzeMatchups(jogos, profiles) {
  const cats = {
    GS: {n:0,dSum:0,mW:0},
    SG: {n:0,dSum:0,mW:0},
    GG: {n:0,dSum:0,mW:0},
    SS: {n:0,dSum:0,mW:0},
    NN: {n:0,dSum:0,mW:0},
  };
  const bt = { FORTE: {n:0,w:0,l:0,e:0}, MEDIO: {n:0,w:0,l:0,e:0} };

  for (const j of jogos) {
    const pm = profiles[j.mandante];
    const pv = profiles[j.visitante];
    if (!pm || !pv) continue;
    const diff = j.cm - j.cv;
    const mWon = diff > 0, vWon = diff < 0;

    let key = 'NN';
    if (isG(pm.perfil) && isG(pv.perfil)) key = 'GG';
    else if (isG(pm.perfil) && isS(pv.perfil)) key = 'GS';
    else if (isS(pm.perfil) && isG(pv.perfil)) key = 'SG';
    else if (isS(pm.perfil) && isS(pv.perfil)) key = 'SS';
    cats[key].n++;
    cats[key].dSum += diff;
    if (mWon) cats[key].mW++;

    const sd = pm.diff - pv.diff;
    let sig = null, lado = null;
    if (Math.abs(sd) >= 2.0)  { sig = 'FORTE'; lado = sd > 0 ? 'M' : 'V'; }
    else if (Math.abs(sd) >= 0.75) { sig = 'MEDIO'; lado = sd > 0 ? 'M' : 'V'; }
    if (sig) {
      const b = bt[sig];
      b.n++;
      const ven = mWon ? 'M' : vWon ? 'V' : 'E';
      if (ven === lado) b.w++;
      else if (ven === 'E') b.e++;
      else b.l++;
    }
  }
  return { cats, bt };
}

function analyzeFormacoes(jogos) {
  const s = {};
  for (const j of jogos) {
    const pairs = [[j.formM, j.cm, j.cv], [j.formV, j.cv, j.cm]];
    for (const [form, pro, sof] of pairs) {
      if (!form || form === 'Desconhecida') continue;
      if (!s[form]) s[form] = {pro:0,sof:0,n:0,wins:0};
      s[form].pro += pro; s[form].sof += sof; s[form].n++;
      if (pro > sof) s[form].wins++;
    }
  }
  return Object.entries(s)
    .filter(function(e){ return e[1].n >= 6; })
    .map(function(e){
      const f=e[0], v=e[1];
      return { f, n:v.n, diff:+((v.pro-v.sof)/v.n).toFixed(2), winPct:+pct(v.wins,v.n).toFixed(1) };
    })
    .sort(function(a,b){ return b.diff - a.diff; });
}

function analyzeEquilibrio(jogos) {
  function calcEq(oM,oE,oV) {
    if (!oM||!oE||!oV) return null;
    const p1=1/oM, p2=1/oE, p3=1/oV, tot=p1+p2+p3;
    const d = Math.abs(p1/tot - p3/tot);
    if (d < 0.08) return 'EQ';
    if (d < 0.20) return 'LEV';
    if (d < 0.38) return 'DESEQ';
    return 'DOM';
  }
  const cats = { EQ:{n:0,ts:0,o95:0}, LEV:{n:0,ts:0,o95:0}, DESEQ:{n:0,ts:0,o95:0}, DOM:{n:0,ts:0,o95:0} };
  for (const j of jogos) {
    const cat = calcEq(j.oddM, j.oddE, j.oddV);
    if (!cat) continue;
    const t = j.cm + j.cv;
    cats[cat].n++;
    cats[cat].ts += t;
    if (t > 9.5) cats[cat].o95++;
  }
  return cats;
}

function calcROI(b, odd) {
  if (!odd) odd = 1.85;
  if (!b || b.n === 0) return null;
  const profit = b.w * (odd-1) * 100 - (b.l + b.e) * 100;
  return { n:b.n, wr:+pct(b.w,b.n).toFixed(1), roi:+(profit/(b.n*100)*100).toFixed(1) };
}

function pearsonR(xs, ys) {
  const n = xs.length;
  if (n < 5) return null;
  const mx = avg(xs), my = avg(ys);
  let num=0, dx2=0, dy2=0;
  for (let i=0;i<n;i++) {
    const dx=xs[i]-mx, dy=ys[i]-my;
    num+=dx*dy; dx2+=dx*dx; dy2+=dy*dy;
  }
  return (dx2>0 && dy2>0) ? +(num/Math.sqrt(dx2*dy2)).toFixed(3) : null;
}

// ─────────────────────────────────────────────────────────────
const SEP = '═'.repeat(74);
const LN  = '─'.repeat(74);
const results = [];

for (const liga of LIGAS) {
  const data = loadLeague(liga.file);
  const raw  = data.jogos || [];

  const jogos = raw.filter(function(j){ return j.cantos && j.cantos.ft && j.cantos.ft.m != null; })
    .map(function(j){
      return {
        mandante:  j.mandante,
        visitante: j.visitante,
        cm:  +j.cantos.ft.m,
        cv:  +j.cantos.ft.v,
        cmHT: j.cantos.ht && j.cantos.ht.m != null ? +j.cantos.ht.m : null,
        cvHT: j.cantos.ht && j.cantos.ht.v != null ? +j.cantos.ht.v : null,
        oddM: j.mercado && j.mercado.oddM ? +j.mercado.oddM : null,
        oddE: j.mercado && j.mercado.oddEmpate ? +j.mercado.oddEmpate : null,
        oddV: j.mercado && j.mercado.oddV ? +j.mercado.oddV : null,
        formM: j.formacao && j.formacao.m ? j.formacao.m : null,
        formV: j.formacao && j.formacao.v ? j.formacao.v : null,
        finM: j.stats_taticas && j.stats_taticas.finalizacoes ? j.stats_taticas.finalizacoes.m : null,
        finV: j.stats_taticas && j.stats_taticas.finalizacoes ? j.stats_taticas.finalizacoes.v : null,
      };
    });

  const profiles = buildProfiles(jogos);
  const ma       = analyzeMatchups(jogos, profiles);
  const formas   = analyzeFormacoes(jogos);
  const eq       = analyzeEquilibrio(jogos);
  const forteR   = calcROI(ma.bt.FORTE);
  const medioR   = calcROI(ma.bt.MEDIO);

  const totais   = jogos.map(function(j){ return j.cm+j.cv; });
  const avgFT    = avg(totais);
  const htJogos  = jogos.filter(function(j){ return j.cmHT != null; });
  const avgHT    = htJogos.length > 10 ? avg(htJogos.map(function(j){ return j.cmHT+j.cvHT; })) : null;
  const over95   = +pct(jogos.filter(function(j){ return j.cm+j.cv>9.5; }).length, jogos.length).toFixed(1);
  const over85   = +pct(jogos.filter(function(j){ return j.cm+j.cv>8.5; }).length, jogos.length).toFixed(1);
  const mandWin  = +pct(jogos.filter(function(j){ return j.cm>j.cv; }).length, jogos.length).toFixed(1);
  const homeAdv  = avg(jogos.map(function(j){ return j.cm-j.cv; }));

  // correlação finalizações × cantos
  const comFin = jogos.filter(function(j){ return j.finM != null && j.finV != null; });
  const finCorr = comFin.length > 20
    ? pearsonR(comFin.map(function(j){ return j.finM; }), comFin.map(function(j){ return j.cm; }))
    : null;

  const dist = {G_STRONG:0,G:0,N:0,S:0,S_STRONG:0};
  for (const p of Object.values(profiles)) dist[p.perfil]++;

  const topG = Object.entries(profiles).filter(function(e){ return isG(e[1].perfil); })
    .sort(function(a,b){ return b[1].diff-a[1].diff; }).slice(0,5);
  const topS = Object.entries(profiles).filter(function(e){ return isS(e[1].perfil); })
    .sort(function(a,b){ return a[1].diff-b[1].diff; }).slice(0,5);

  results.push({liga,jogos,profiles,ma,formas,eq,forteR,medioR,avgFT,avgHT,over95,over85,mandWin,homeAdv,dist,topG,topS,finCorr});
}

// ═════════════════════════════════════════════════════════════
// RELATÓRIO DETALHADO POR LIGA

for (const r of results) {
  const {liga,jogos,profiles,ma,formas,eq,forteR,medioR,avgFT,avgHT,over95,over85,mandWin,homeAdv,dist,topG,topS,finCorr} = r;

  console.log('\n'+SEP);
  console.log('  '+liga.nome+' ['+liga.id+']  —  '+jogos.length+' jogos analisados');
  console.log(SEP);

  // 1. Base
  console.log('\n■ 1. VOLUME DE CANTOS');
  var label = avgFT > 10 ? ' 🔴 ALTO' : avgFT > 9 ? ' 🟡 MÉDIO' : ' 🟢 BAIXO';
  console.log('  Média FT       : '+avgFT+label);
  if (avgHT) {
    var pHT = +(avgHT/avgFT*100).toFixed(0);
    console.log('  Média HT       : '+avgHT+' ('+pHT+'% dos cantos no 1ºT)');
  }
  console.log('  Over 9.5 FT    : '+over95+'%   |   Over 8.5 FT: '+over85+'%');
  console.log('  Mand vence     : '+mandWin+'%');
  var advLabel = homeAdv > 0.8 ? ' 🟢 FORTE' : homeAdv > 0.3 ? ' 🟡 LEVE' : ' ⚪ NEUTRO';
  console.log('  Vantagem casa  : '+(homeAdv>=0?'+':'')+homeAdv+' cantos/jogo'+advLabel);
  if (finCorr) {
    var corrLabel = finCorr > 0.4 ? ' ✅ forte' : finCorr > 0.25 ? ' 📊 moderada' : ' ⚠ fraca';
    console.log('  Fin×Cantos r   : '+finCorr+corrLabel);
  }

  // 2. Perfis
  console.log('\n■ 2. PERFIS USL ('+Object.keys(profiles).length+' times)');
  console.log('  G_STRONG='+dist.G_STRONG+' | G='+dist.G+' | N='+dist.N+' | S='+dist.S+' | S_STRONG='+dist.S_STRONG);
  if (topG.length > 0) {
    console.log('  GERADORES:');
    for (var i=0;i<topG.length;i++) {
      var t=topG[i][0], p=topG[i][1];
      console.log('    '+t.slice(0,22).padEnd(23)+'diff='+(p.diff>=0?'+':'')+p.diff+'  casa='+(p.casaDiff>=0?'+':'')+p.casaDiff+'  fora='+(p.foraDiff>=0?'+':'')+p.foraDiff+'  win='+p.winPct+'%');
    }
  }
  if (topS.length > 0) {
    console.log('  SOFREDORES:');
    for (var i=0;i<topS.length;i++) {
      var t=topS[i][0], p=topS[i][1];
      console.log('    '+t.slice(0,22).padEnd(23)+'diff='+p.diff+'  casa='+(p.casaDiff>=0?'+':'')+p.casaDiff+'  fora='+p.foraDiff+'  win='+p.winPct+'%');
    }
  }

  // 3. Matchups
  console.log('\n■ 3. MATCHUPS');
  var gs=ma.cats.GS, sg=ma.cats.SG, gg=ma.cats.GG, ss=ma.cats.SS;
  if (gs.n > 0) {
    var hr=+pct(gs.mW,gs.n).toFixed(1), ad=+(gs.dSum/gs.n).toFixed(2);
    var icon = hr >= 70 ? '🟢' : hr >= 55 ? '🟡' : '🔴';
    console.log('  G×S (n='+gs.n+')  diff=+'+ad+'  Mand='+hr+'%  '+icon);
  }
  if (sg.n > 0) {
    var hr=+pct(sg.mW,sg.n).toFixed(1), ad=+(sg.dSum/sg.n).toFixed(2);
    var visWin=+(100-hr).toFixed(1);
    var icon = visWin >= 65 ? '🟢' : '🟡';
    console.log('  S×G (n='+sg.n+')  diff='+ad+'  Mand='+hr+'%  Vis(Ger)='+visWin+'%  '+icon);
  }
  if (gg.n > 0) console.log('  G×G (n='+gg.n+')  diff='+(gg.dSum/gg.n).toFixed(2)+'  Mand='+pct(gg.mW,gg.n).toFixed(1)+'%');
  if (ss.n > 0) console.log('  S×S (n='+ss.n+')  diff='+(ss.dSum/ss.n).toFixed(2)+'  Mand='+pct(ss.mW,ss.n).toFixed(1)+'%');

  // 4. Backtest
  console.log('\n■ 4. BACKTEST (odd 1.85)');
  if (forteR) {
    var icon = forteR.roi > 15 ? '🟢🟢' : forteR.roi > 0 ? '🟢' : '🔴';
    console.log('  FORTE: n='+forteR.n+'  WR='+forteR.wr+'%  ROI='+(forteR.roi>=0?'+':'')+forteR.roi+'%  '+icon);
  }
  if (medioR) {
    var icon = medioR.roi > 10 ? '🟢' : medioR.roi > 0 ? '🟡' : '🔴';
    console.log('  MÉDIO: n='+medioR.n+'  WR='+medioR.wr+'%  ROI='+(medioR.roi>=0?'+':'')+medioR.roi+'%  '+icon);
  }

  // 5. Formações
  if (formas.length > 0) {
    console.log('\n■ 5. FORMAÇÕES × CANTOS');
    console.log('  Form          N    Diff    Win%   Classe');
    console.log('  '+LN.slice(0,52));
    for (var i=0;i<formas.length;i++) {
      var f=formas[i];
      var cl = f.diff >= 0.5 ? '✅ GERADORA' : f.diff <= -0.5 ? '🔴 SOFREDORA' : '➖ NEUTRA';
      var dStr = (f.diff>=0?'+':'')+f.diff.toFixed(2);
      console.log('  '+f.f.padEnd(14)+String(f.n).padEnd(5)+dStr.padEnd(8)+f.winPct+'%'.padEnd(8)+cl);
    }
  }

  // 6. Equilíbrio de odds
  var eqEntries = Object.entries(eq).filter(function(e){ return e[1].n > 0; });
  if (eqEntries.length > 0) {
    console.log('\n■ 6. EQUILÍBRIO ODDS × CANTOS');
    console.log('  Categoria       N    Avg FT   Over9.5%');
    console.log('  '+LN.slice(0,44));
    var labels = {EQ:'EQUILIBRADO',LEV:'LEVE DESEQ.',DESEQ:'DESEQUILIB.',DOM:'DOMÍNIO'};
    eqEntries.sort(function(a,b){ return b[1].n-a[1].n; }).forEach(function(e){
      var cat=e[0], v=e[1];
      var a=+(v.ts/v.n).toFixed(2), o95=+pct(v.o95,v.n).toFixed(1);
      console.log('  '+labels[cat].padEnd(16)+String(v.n).padEnd(5)+String(a).padEnd(9)+o95+'%');
    });
  }

  // 7. Alertas
  console.log('\n■ 7. ALERTAS E INSIGHTS PARA O ESTUDO');
  var ok = [];
  if (gs.n > 0 && pct(gs.mW,gs.n) >= 65) ok.push('✅ G×S CONFIRMADO — sinal operacional válido ('+pct(gs.mW,gs.n).toFixed(0)+'% hit rate)');
  if (forteR && forteR.roi > 20) ok.push('✅ BACKTEST FORTE: ROI '+(forteR.roi>0?'+':'')+forteR.roi+'% — edge estrutural detectado');
  else if (forteR && forteR.roi > 0) ok.push('🟡 BACKTEST positivo mas moderado: ROI '+forteR.roi+'%');
  if (avgFT > 10.2) ok.push('🔴 LIGA ALTO VOLUME: '+avgFT+' avg — mercado Over beneficiado');
  if (homeAdv > 0.8) ok.push('🏠 VANTAGEM CASA FORTE: +'+homeAdv+' — mando de campo pesa nos cantos');
  if (homeAdv < 0.15) ok.push('⚠ VANTAGEM CASA FRACA: +'+homeAdv+' — liga mais equilibrada territorialmente');
  var fG = formas.find(function(f){ return f.diff >= 1.0; });
  var fS = formas.find(function(f){ return f.diff <= -0.8; });
  if (fG) ok.push('📐 FORMAÇÃO GERADORA FORTE: '+fG.f+' (diff +'+fG.diff+', n='+fG.n+')');
  if (fS) ok.push('📐 FORMAÇÃO SOFREDORA: '+fS.f+' (diff '+fS.diff+', n='+fS.n+')');
  // Over 9.5 em EQUILIBRADO
  if (eq.EQ && eq.EQ.n > 5) {
    var o95eq = +pct(eq.EQ.o95,eq.EQ.n).toFixed(0);
    if (o95eq >= 55) ok.push('📊 EQUILIBRADO → Over 9.5: '+o95eq+'% — jogos disputados geram mais cantos');
    else ok.push('📊 EQUILIBRADO → Over 9.5: '+o95eq+'% — cautela em jogos muito equilibrados');
  }
  for (var i=0;i<ok.length;i++) console.log('  '+ok[i]);
  if (ok.length === 0) console.log('  Nenhum alerta relevante detectado com os dados atuais');
}

// ═════════════════════════════════════════════════════════════
// QUADRO COMPARATIVO FINAL

console.log('\n\n'+SEP);
console.log('  QUADRO COMPARATIVO — 8 LIGAS');
console.log(SEP);
console.log('Liga    AvgFT  Ov9.5%  MandW%  HomeAdv  G×S%  G×SDiff  FortROI%  MedROI%');
console.log(LN);
for (var ri=0;ri<results.length;ri++) {
  var r=results[ri];
  var gs=r.ma.cats.GS;
  var gsH = gs.n>0 ? +pct(gs.mW,gs.n).toFixed(0)+'%' : '—';
  var gsd = gs.n>0 ? '+'+(gs.dSum/gs.n).toFixed(1) : '—';
  var froi = r.forteR ? (r.forteR.roi>=0?'+':'')+r.forteR.roi+'%' : '—';
  var mroi = r.medioR ? (r.medioR.roi>=0?'+':'')+r.medioR.roi+'%' : '—';
  console.log(
    r.liga.id.padEnd(8)+
    String(r.avgFT).padEnd(7)+
    (r.over95+'%').padEnd(8)+
    (r.mandWin+'%').padEnd(8)+
    (r.homeAdv>=0?'+':'')+String(r.homeAdv).padEnd(9)+
    gsH.padEnd(6)+
    gsd.padEnd(9)+
    froi.padEnd(10)+
    mroi
  );
}
console.log(LN);

// Rankings cross-liga de formações
console.log('\n\n'+SEP);
console.log('  RANKING CROSS-LIGA — FORMAÇÕES (mínimo 3 ligas com dado)');
console.log(SEP);
var formGlobal = {};
for (var ri=0;ri<results.length;ri++) {
  var r=results[ri];
  var comForm = r.jogos.filter(function(j){ return j.formM && j.formV; });
  for (var i=0;i<comForm.length;i++) {
    var j=comForm[i];
    var pairs = [[j.formM,j.cm,j.cv],[j.formV,j.cv,j.cm]];
    for (var k=0;k<pairs.length;k++) {
      var form=pairs[k][0], pro=pairs[k][1], sof=pairs[k][2];
      if (!form||form==='Desconhecida') continue;
      if (!formGlobal[form]) formGlobal[form]={pro:0,sof:0,n:0,wins:0,ligas:[]};
      formGlobal[form].pro+=pro; formGlobal[form].sof+=sof; formGlobal[form].n++;
      if (pro>sof) formGlobal[form].wins++;
      if (formGlobal[form].ligas.indexOf(r.liga.id)<0) formGlobal[form].ligas.push(r.liga.id);
    }
  }
}
var globalRank = Object.entries(formGlobal)
  .filter(function(e){ return e[1].n>=15 && e[1].ligas.length>=3; })
  .map(function(e){
    var f=e[0],v=e[1];
    return {f,n:v.n,diff:+((v.pro-v.sof)/v.n).toFixed(2),winPct:+pct(v.wins,v.n).toFixed(1),nL:v.ligas.length,ligas:v.ligas.join(',')};
  })
  .sort(function(a,b){ return b.diff-a.diff; });

console.log('  Formação      N     nL  Diff    Win%   Ligas');
console.log(LN);
for (var i=0;i<globalRank.length;i++) {
  var f=globalRank[i];
  var cl = f.diff>=0.5?'✅':f.diff<=-0.5?'🔴':'➖';
  var dStr = (f.diff>=0?'+':'')+f.diff.toFixed(2);
  console.log('  '+f.f.padEnd(14)+String(f.n).padEnd(6)+String(f.nL).padEnd(4)+dStr.padEnd(8)+f.winPct+'%'.padEnd(8)+cl+'  '+f.ligas);
}
