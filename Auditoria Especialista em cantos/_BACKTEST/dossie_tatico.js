// DOSSIÊ TÁTICO POR TIME — gera 5 camadas novas por time, injeta no MEMORIA_DNA

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const LIGAS_ARQS = {
  BR:'data/brasileirao2026.js', BR_B:'data/brasileiraoB2026.js',
  ARG:'data/argentina2026.js', ARG_B:'data/argentina_b2026.js',
  MLS:'data/mls2026.js', USL:'data/usl2026.js',
  BUN:'data/bundesliga2026.js', J1:'data/j1league2026.js',
  J2_J3:'data/j2j3league2026.js'
};

function carregaDataset(arq) {
  const txt = fs.readFileSync(path.join(ROOT, arq), 'utf-8');
  return JSON.parse(txt.slice(txt.indexOf('{'), txt.lastIndexOf('}')+1));
}
function jogoValido(j) {
  return j.cantos && j.cantos.ft && typeof j.cantos.ft.m === 'number' &&
         typeof j.cantos.ft.v === 'number' && (j.cantos.ft.m + j.cantos.ft.v) > 0;
}
function dataParaIso(s){
  if(!s) return null;
  if(/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0,10);
  const m=s.match(/^(\d{2})\.(\d{2})\.(\d{4})/);
  return m?`${m[3]}-${m[2]}-${m[1]}`:null;
}

const memMaster = JSON.parse(fs.readFileSync(path.join(ROOT, 'Auditoria Especialista em cantos/_AnaliseDNA/_MEMORIA_TIMES_MASTER.json'),'utf-8'));

// Helpers
function mean(a){return a.length ? a.reduce((s,x)=>s+x,0)/a.length : 0;}
function stdDev(a){
  if(a.length<2) return 0;
  const m=mean(a);
  return Math.sqrt(a.reduce((s,x)=>s+(x-m)*(x-m),0)/(a.length-1));
}
function r2(n){return Math.round(n*100)/100;}

// ===== GERAR DOSSIÊ POR TIME =====
const dossies = {};
let totalTimes = 0;

Object.entries(LIGAS_ARQS).forEach(([liga, arq]) => {
  const ds = carregaDataset(arq);
  const jogos = (ds.jogos||[]).filter(jogoValido);
  if (!memMaster[liga] || !memMaster[liga].times) return;

  // Top 3 e Bottom 3 da liga por PS
  const ranking = (memMaster[liga].ranking_powerscore||[]).filter(r=>r.powerScore!=null);
  const top3 = new Set(ranking.slice(0,3).map(r=>r.time));
  const lant3 = new Set(ranking.slice(-3).map(r=>r.time));

  const times = Object.keys(memMaster[liga].times);
  dossies[liga] = {};
  totalTimes += times.length;

  times.forEach(nome => {
    const jogosTime = jogos.filter(j => j.mandante===nome || j.visitante===nome);
    if (jogosTime.length < 3) return;

    // Ordenar cronologicamente
    const ordenados = jogosTime.map(j => ({
      ...j,
      _iso: dataParaIso(j.data)
    })).filter(j => j._iso).sort((a,b)=>a._iso.localeCompare(b._iso));

    // === CAMADA 1: vs TOP-3 ===
    const vsTop = ordenados.filter(j => {
      const adv = j.mandante===nome ? j.visitante : j.mandante;
      return top3.has(adv);
    });
    const vsTopStats = (() => {
      if (vsTop.length === 0) return null;
      const cantosPro = vsTop.map(j => j.mandante===nome ? j.cantos.ft.m : j.cantos.ft.v);
      const cantosSof = vsTop.map(j => j.mandante===nome ? j.cantos.ft.v : j.cantos.ft.m);
      const dom = vsTop.filter(j => {
        const pro = j.mandante===nome ? j.cantos.ft.m : j.cantos.ft.v;
        const sof = j.mandante===nome ? j.cantos.ft.v : j.cantos.ft.m;
        return pro > sof;
      }).length;
      const diff = mean(cantosPro) - mean(cantosSof);
      let padrao = 'NEUTRO';
      if (diff <= -2) padrao = 'ENGOLIDO_PELO_TOP';
      else if (diff <= -0.5) padrao = 'CEDE_TERRENO';
      else if (diff >= 1) padrao = 'RESISTE_FORTE';
      else padrao = 'EQUILIBRADO';
      return {
        n: vsTop.length,
        cantos_pro: r2(mean(cantosPro)),
        cantos_sof: r2(mean(cantosSof)),
        diff: r2(diff),
        dom_pct: vsTop.length ? Math.round(100*dom/vsTop.length) : 0,
        padrao
      };
    })();

    // === CAMADA 2: vs LANTERNA-3 ===
    const vsLant = ordenados.filter(j => {
      const adv = j.mandante===nome ? j.visitante : j.mandante;
      return lant3.has(adv);
    });
    const vsLantStats = (() => {
      if (vsLant.length === 0) return null;
      const cantosPro = vsLant.map(j => j.mandante===nome ? j.cantos.ft.m : j.cantos.ft.v);
      const cantosSof = vsLant.map(j => j.mandante===nome ? j.cantos.ft.v : j.cantos.ft.m);
      const dom = vsLant.filter(j => {
        const pro = j.mandante===nome ? j.cantos.ft.m : j.cantos.ft.v;
        const sof = j.mandante===nome ? j.cantos.ft.v : j.cantos.ft.m;
        return pro > sof;
      }).length;
      const diff = mean(cantosPro) - mean(cantosSof);
      let padrao = 'NEUTRO';
      if (diff >= 3) padrao = 'DOMINA_FACIL';
      else if (diff >= 1) padrao = 'CONTROLA_NORMALMENTE';
      else if (diff >= -0.5) padrao = 'TROPECA_LEVE';
      else padrao = 'TROPECA_NA_LANTERNA';
      return {
        n: vsLant.length,
        cantos_pro: r2(mean(cantosPro)),
        cantos_sof: r2(mean(cantosSof)),
        diff: r2(diff),
        dom_pct: vsLant.length ? Math.round(100*dom/vsLant.length) : 0,
        padrao
      };
    })();

    // === CAMADA 3: TENDÊNCIA CRONOLÓGICA ===
    const prim5 = ordenados.slice(0, 5);
    const ult5 = ordenados.slice(-5);
    const cantosProArr = (lista) => lista.map(j => j.mandante===nome ? j.cantos.ft.m : j.cantos.ft.v);
    const cantosSofArr = (lista) => lista.map(j => j.mandante===nome ? j.cantos.ft.v : j.cantos.ft.m);
    const tendencia = (() => {
      if (ordenados.length < 8) return null;
      const proPrim = mean(cantosProArr(prim5));
      const proUlt = mean(cantosProArr(ult5));
      const sofPrim = mean(cantosSofArr(prim5));
      const sofUlt = mean(cantosSofArr(ult5));
      const diffPro = proUlt - proPrim;
      const diffSof = sofPrim - sofUlt; // queda = defesa melhorando
      let veredito = 'ESTAGNADO';
      if (diffPro >= 1.5 && diffSof >= 1) veredito = 'EM_EVOLUCAO_FORTE';
      else if (diffPro >= 1) veredito = 'ATAQUE_CRESCENTE';
      else if (diffSof >= 1) veredito = 'DEFESA_MELHORANDO';
      else if (diffPro <= -1) veredito = 'ATAQUE_DECLINANDO';
      else if (diffSof <= -1) veredito = 'DEFESA_DEGRADANDO';
      return {
        primeiros5: { cantos_pro: r2(proPrim), cantos_sof: r2(sofPrim) },
        ultimos5: { cantos_pro: r2(proUlt), cantos_sof: r2(sofUlt) },
        veredito
      };
    })();

    // === CAMADA 4: RITMO HT vs FT ===
    const ritmo = (() => {
      const validosHT = ordenados.filter(j => j.cantos.ht && typeof j.cantos.ht.m === 'number');
      if (validosHT.length === 0) return null;
      const cantosTotalHT = validosHT.map(j => j.mandante===nome ? j.cantos.ht.m : j.cantos.ht.v);
      const cantosTotalFT = validosHT.map(j => j.mandante===nome ? j.cantos.ft.m : j.cantos.ft.v);
      const totalHTMed = mean(cantosTotalHT);
      const totalFTMed = mean(cantosTotalFT);
      const pctHT = totalFTMed > 0 ? Math.round(100*totalHTMed/totalFTMed) : 50;
      let padrao = 'EQUILIBRADO';
      if (pctHT >= 50) padrao = 'PRESSIONA_CEDO';
      else if (pctHT >= 42) padrao = 'EQUILIBRADO';
      else if (pctHT >= 35) padrao = 'DECISAO_2T';
      else padrao = 'EXPLODE_NO_2T';
      return { pct_cantos_no_ht: pctHT, padrao };
    })();

    // === CAMADA 5: VOLATILIDADE REAL ===
    const cantosProTodos = cantosProArr(ordenados);
    const dp = stdDev(cantosProTodos);
    const extremos = cantosProTodos.filter(v => v >= 8 || v <= 1).length;
    const volatilidade = {
      desvio_padrao_cantos_pro: r2(dp),
      jogos_extremos_pct: ordenados.length ? Math.round(100*extremos/ordenados.length) : 0,
      classificacao: dp < 1.8 ? 'ESTAVEL' : (dp < 2.8 ? 'MODERADA' : 'VOLATIL_ALTO')
    };

    // === CAMADA 6: 3 MATCHUPS-CHAVE ===
    const cantosTotaisJogo = ordenados.map((j, i) => ({
      idx: i,
      adv: j.mandante===nome ? j.visitante : j.mandante,
      contexto: j.mandante===nome ? 'casa' : 'fora',
      cantos_pro: j.mandante===nome ? j.cantos.ft.m : j.cantos.ft.v,
      cantos_sof: j.mandante===nome ? j.cantos.ft.v : j.cantos.ft.m,
      data: j._iso
    }));
    // 3 mais ilustrativos: o melhor, o pior, e o mais recente extremo
    const ordPorDiff = [...cantosTotaisJogo].sort((a,b)=>(b.cantos_pro-b.cantos_sof)-(a.cantos_pro-a.cantos_sof));
    const matchups = [];
    if (ordPorDiff[0]) matchups.push({ ...ordPorDiff[0], veredito: 'maior_dominancia' });
    if (ordPorDiff[ordPorDiff.length-1] && ordPorDiff[ordPorDiff.length-1].idx !== ordPorDiff[0].idx)
      matchups.push({ ...ordPorDiff[ordPorDiff.length-1], veredito: 'maior_engolimento' });
    // mais recente
    const recente = cantosTotaisJogo[cantosTotaisJogo.length-1];
    if (recente && !matchups.some(m=>m.idx===recente.idx)) matchups.push({...recente, veredito:'mais_recente'});

    dossies[liga][nome] = {
      n_jogos_analisados: ordenados.length,
      vs_top3: vsTopStats,
      vs_lanterna3: vsLantStats,
      tendencia: tendencia,
      ritmo_ht_ft: ritmo,
      volatilidade,
      matchups_chave: matchups.map(m => ({
        adv: m.adv, contexto: m.contexto,
        cantos: `${m.cantos_pro}-${m.cantos_sof}`,
        veredito: m.veredito,
        data: m.data
      }))
    };
  });
});

console.log(`Dossiê tático gerado para ${totalTimes} times em 9 ligas`);
console.log(`Distribuição:`);
Object.entries(dossies).forEach(([l, t]) => {
  console.log(`  ${l}: ${Object.keys(t).length} times`);
});

// Salva o dossiê separado
fs.writeFileSync(path.join(__dirname, 'dossie_tatico.json'), JSON.stringify(dossies, null, 2), 'utf-8');
console.log('💾 Dossiê salvo em dossie_tatico.json');

// === MOSTRAR exemplos por liga ===
console.log('\n=== AMOSTRAS — Top 1 e Bottom 1 de cada liga ===\n');
Object.entries(dossies).forEach(([liga, times]) => {
  const ranking = (memMaster[liga].ranking_powerscore||[]).filter(r=>r.powerScore!=null);
  const topTime = ranking[0] && times[ranking[0].time];
  const bottomTime = ranking[ranking.length-1] && times[ranking[ranking.length-1].time];

  if (topTime) {
    console.log(`▶️  ${liga} TOPO: ${ranking[0].time} (PS ${ranking[0].powerScore})`);
    if (topTime.vs_top3) console.log(`   vs TOP3: ${topTime.vs_top3.cantos_pro}×${topTime.vs_top3.cantos_sof} (${topTime.vs_top3.padrao})`);
    if (topTime.vs_lanterna3) console.log(`   vs LANT3: ${topTime.vs_lanterna3.cantos_pro}×${topTime.vs_lanterna3.cantos_sof} (${topTime.vs_lanterna3.padrao})`);
    if (topTime.tendencia) console.log(`   tendência: ${topTime.tendencia.veredito}`);
    if (topTime.ritmo_ht_ft) console.log(`   ritmo: ${topTime.ritmo_ht_ft.pct_cantos_no_ht}% no HT (${topTime.ritmo_ht_ft.padrao})`);
    console.log(`   volatilidade: ${topTime.volatilidade.classificacao} (σ=${topTime.volatilidade.desvio_padrao_cantos_pro})`);
  }
  if (bottomTime) {
    console.log(`▶️  ${liga} LANTERNA: ${ranking[ranking.length-1].time} (PS ${ranking[ranking.length-1].powerScore})`);
    if (bottomTime.vs_top3) console.log(`   vs TOP3: ${bottomTime.vs_top3.cantos_pro}×${bottomTime.vs_top3.cantos_sof} (${bottomTime.vs_top3.padrao})`);
    if (bottomTime.vs_lanterna3) console.log(`   vs LANT3: ${bottomTime.vs_lanterna3.cantos_pro}×${bottomTime.vs_lanterna3.cantos_sof} (${bottomTime.vs_lanterna3.padrao})`);
    if (bottomTime.tendencia) console.log(`   tendência: ${bottomTime.tendencia.veredito}`);
  }
  console.log('');
});
