// FASE 4 — Veredito por liga × mercado: melhor regra DNA pra cada liga

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
function totalFT(j){return j.cantos.ft.m+j.cantos.ft.v;}
function totalHT(j){return j.cantos.ht?(j.cantos.ht.m||0)+(j.cantos.ht.v||0):0;}

const memMaster = JSON.parse(fs.readFileSync(path.join(ROOT, 'Auditoria Especialista em cantos/_AnaliseDNA/_MEMORIA_TIMES_MASTER.json'),'utf-8'));
function normNome(s){return (s||'').toLowerCase().replace(/[^a-z0-9]/g,'');}
function getDna(liga,nome){
  const m=memMaster[liga]; if(!m||!m.times)return null;
  if(m.times[nome])return m.times[nome];
  const alvo=normNome(nome);
  const k=Object.keys(m.times).find(x=>{const nx=normNome(x);return nx===alvo||nx.startsWith(alvo.slice(0,6))||alvo.startsWith(nx.slice(0,6));});
  return k?m.times[k]:null;
}
function temAss(dna,nome){if(!dna||!dna.assinaturas)return false;return dna.assinaturas.some(a=>a.nome===nome&&a.presente&&a.qualifier==='consolidado');}
function ps(dna){return dna&&dna.identidade?dna.identidade.powerScore:null;}

// Função genérica: aplica regra a uma liga específica
function testaRegraLiga(liga, predicado, linha, dir, mercadoNome) {
  const ds = carregaDataset(LIGAS_ARQS[liga]);
  let n=0, acertos=0;
  (ds.jogos||[]).filter(jogoValido).forEach(j=>{
    const dM = getDna(liga, j.mandante);
    const dV = getDna(liga, j.visitante);
    if (!predicado(j, dM, dV)) return;
    n++;
    let bate=false;
    if (mercadoNome === 'OverFT' || mercadoNome === 'UnderFT') {
      const t = totalFT(j);
      bate = dir==='OVER' ? t>linha : t<linha;
    } else if (mercadoNome === 'OverHT' || mercadoNome === 'UnderHT') {
      const t = totalHT(j);
      if (!j.cantos.ht || typeof j.cantos.ht.m !== 'number') return;
      bate = dir==='OVER' ? t>linha : t<linha;
    } else if (mercadoNome === 'HDP') {
      const diff = j.cantos.ft.m - j.cantos.ft.v;
      bate = diff >= Math.abs(linha) + 0.5; // HDP -2.5 = diff ≥ 3
    } else if (mercadoNome === 'HDP_AWAY') {
      const diff = j.cantos.ft.v - j.cantos.ft.m;
      bate = diff >= Math.abs(linha) + 0.5;
    }
    if (bate) acertos++;
  });
  return { liga, mercadoNome, dir, linha, n, acertos, wr: n>0 ? 100*acertos/n : 0 };
}

// REGRAS — biblioteca
const REGRAS = [
  // Linhas puras (sem filtro DNA)
  { id:'over_8_5', label:'Over 8.5 FT (baseline)', pred:()=>true, linha:8.5, dir:'OVER', mercado:'OverFT' },
  { id:'over_9_5', label:'Over 9.5 FT (baseline)', pred:()=>true, linha:9.5, dir:'OVER', mercado:'OverFT' },
  { id:'over_10_5', label:'Over 10.5 FT (baseline)', pred:()=>true, linha:10.5, dir:'OVER', mercado:'OverFT' },
  { id:'under_7_5', label:'Under 7.5 FT (baseline)', pred:()=>true, linha:7.5, dir:'UNDER', mercado:'UnderFT' },
  { id:'under_8_5', label:'Under 8.5 FT (baseline)', pred:()=>true, linha:8.5, dir:'UNDER', mercado:'UnderFT' },
  { id:'under_9_5', label:'Under 9.5 FT (baseline)', pred:()=>true, linha:9.5, dir:'UNDER', mercado:'UnderFT' },
  { id:'over_ht_3_5', label:'Over 3.5 HT (baseline)', pred:()=>true, linha:3.5, dir:'OVER', mercado:'OverHT' },
  { id:'over_ht_4_5', label:'Over 4.5 HT (baseline)', pred:()=>true, linha:4.5, dir:'OVER', mercado:'OverHT' },
  { id:'under_ht_4_5', label:'Under 4.5 HT (baseline)', pred:()=>true, linha:4.5, dir:'UNDER', mercado:'UnderHT' },
  // Com filtro DNA
  { id:'dna_def_prec_over95', label:'Mandante DEFESA_PRECARIA → Over 9.5', pred:(j,dM)=>temAss(dM,'DEFESA_PRECARIA'), linha:9.5, dir:'OVER', mercado:'OverFT' },
  { id:'dna_muro_def_under95', label:'Mandante MURO_DEFENSIVO → Under 9.5', pred:(j,dM)=>temAss(dM,'MURO_DEFENSIVO'), linha:9.5, dir:'UNDER', mercado:'UnderFT' },
  { id:'dna_blitz_overht35', label:'Mandante BLITZ_INICIAL → Over 3.5 HT', pred:(j,dM)=>temAss(dM,'BLITZ_INICIAL'), linha:3.5, dir:'OVER', mercado:'OverHT' },
  { id:'dna_blitz_overht45', label:'Mandante BLITZ_INICIAL → Over 4.5 HT', pred:(j,dM)=>temAss(dM,'BLITZ_INICIAL'), linha:4.5, dir:'OVER', mercado:'OverHT' },
  { id:'dna_efet_dupla_under95', label:'Dois EFETIVIDADE_CLINICA → Under 9.5', pred:(j,dM,dV)=>temAss(dM,'EFETIVIDADE_CLINICA')&&temAss(dV,'EFETIVIDADE_CLINICA'), linha:9.5, dir:'UNDER', mercado:'UnderFT' },
  { id:'dna_carrinho_over95', label:'Mandante CARRINHO_FACIL vs AZARÃO → Over 9.5', pred:(j,dM,dV)=>temAss(dM,'CARRINHO_FACIL')&&ps(dV)!=null&&ps(dV)<=30, linha:9.5, dir:'OVER', mercado:'OverFT' },
  { id:'dna_atq_ester_over95', label:'Mandante ATAQUE_ESTERIL → Over 9.5', pred:(j,dM)=>temAss(dM,'ATAQUE_ESTERIL'), linha:9.5, dir:'OVER', mercado:'OverFT' },
  { id:'dna_muro_duplo_under95', label:'Dois MURO_DUPLO → Under 9.5', pred:(j,dM,dV)=>{const a=dM&&dM.identidade?dM.identidade.perfil_dna:'';const b=dV&&dV.identidade?dV.identidade.perfil_dna:'';return a==='MURO_DUPLO'&&b==='MURO_DUPLO';}, linha:9.5, dir:'UNDER', mercado:'UnderFT' },
  { id:'dna_psdiff50_hdp', label:'PS_diff ≥ 50 → HDP -2.5 cantos casa', pred:(j,dM,dV)=>{const a=ps(dM),b=ps(dV);return a!=null&&b!=null&&(a-b)>=50;}, linha:-2.5, dir:'OVER', mercado:'HDP' },
  { id:'dna_eliteXazarao_over95', label:'ELITE (PS≥80) casa vs AZARÃO (PS≤30) → Over 9.5', pred:(j,dM,dV)=>{const a=ps(dM),b=ps(dV);return a!=null&&b!=null&&a>=80&&b<=30;}, linha:9.5, dir:'OVER', mercado:'OverFT' },
  { id:'dna_eliteXelite_under95', label:'ELITE×ELITE (ambos PS≥70) → Under 9.5', pred:(j,dM,dV)=>{const a=ps(dM),b=ps(dV);return a!=null&&b!=null&&a>=70&&b>=70;}, linha:9.5, dir:'UNDER', mercado:'UnderFT' }
];

// ============= MATRIZ liga × regra =============
console.log('═══════════════════════════════════════════════════════════════════');
console.log('  FASE 4 — MATRIZ liga × regra (WR%, N) — N≥10 destacado');
console.log('═══════════════════════════════════════════════════════════════════\n');

const matriz = {};
Object.keys(LIGAS_ARQS).forEach(liga => {
  matriz[liga] = {};
  REGRAS.forEach(r => {
    const res = testaRegraLiga(liga, r.pred, r.linha, r.dir, r.mercado);
    matriz[liga][r.id] = res;
  });
});

// Identificar TOP 3 regras OPERÁVEIS por liga (N≥10 e WR≥60%)
console.log('🏆 TOP REGRAS OPERÁVEIS POR LIGA (N≥10 + WR≥60%):\n');
Object.keys(LIGAS_ARQS).forEach(liga => {
  const candidatos = REGRAS.map(r => ({
    label: r.label,
    ...matriz[liga][r.id]
  })).filter(x => x.n >= 10 && x.wr >= 60).sort((a,b) => b.wr - a.wr);

  console.log(`\n📊 ${liga} (baseline geral):`);
  if (candidatos.length === 0) {
    console.log('   ⚠️ Nenhuma regra OPERÁVEL (N≥10 + WR≥60%) — liga sem edge claro');
    // Mostrar as 3 mais próximas (N≥10 + WR≥55%)
    const proximas = REGRAS.map(r => ({label:r.label, ...matriz[liga][r.id]}))
      .filter(x => x.n >= 10 && x.wr >= 50).sort((a,b) => b.wr - a.wr).slice(0,3);
    if (proximas.length) {
      console.log('   🔍 Mais próximas (N≥10, WR≥50%):');
      proximas.forEach(c => console.log(`     ${c.wr.toFixed(1)}% (N=${c.n}) — ${c.label}`));
    }
  } else {
    candidatos.slice(0, 5).forEach(c => {
      const tag = c.wr >= 70 ? '🟢🟢' : (c.wr >= 65 ? '🟢' : '🟡');
      console.log(`   ${tag} ${c.wr.toFixed(1)}% (N=${c.n}, ${c.acertos}/${c.n}) — ${c.label}`);
    });
  }
});

// ============= MELHOR LINHA POR LIGA (sem filtro DNA) =============
console.log('\n\n═══════════════════════════════════════════════════════════════════');
console.log('  📐 LINHA OPERÁVEL por liga (Over OU Under — qual paga mais)');
console.log('═══════════════════════════════════════════════════════════════════\n');
const linhasFT = [6.5, 7.5, 8.5, 9.5, 10.5, 11.5];
Object.keys(LIGAS_ARQS).forEach(liga => {
  const ds = carregaDataset(LIGAS_ARQS[liga]);
  const jogos = (ds.jogos||[]).filter(jogoValido);
  const n = jogos.length;
  const tots = jogos.map(totalFT);
  const candidatos = [];
  linhasFT.forEach(l => {
    const over = 100 * tots.filter(t=>t>l).length / n;
    candidatos.push({ linha: l, mercado: 'OVER', pct: over });
    candidatos.push({ linha: l, mercado: 'UNDER', pct: 100-over });
  });
  // Linha com WR MAIS ALTA (acima de 60%) que seja operável
  const operaveis = candidatos.filter(c => c.pct >= 60).sort((a,b)=>b.pct-a.pct);
  console.log(`${liga.padEnd(6)} (N=${n}):`);
  if (operaveis.length === 0) {
    console.log('  ⚠️ Nenhuma linha com WR ≥ 60% sem filtro DNA');
  } else {
    operaveis.slice(0, 3).forEach(c => {
      console.log(`  ${c.mercado} ${c.linha}: ${c.pct.toFixed(1)}% WR — operacional`);
    });
  }
});

fs.writeFileSync(path.join(__dirname, 'fase4_matriz.json'), JSON.stringify(matriz, null, 2));
console.log('\n💾 Fase 4 salva em fase4_matriz.json');
