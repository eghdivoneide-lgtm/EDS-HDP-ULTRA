// DOSSIÊ INDIVIDUAL JOGO-A-JOGO POR TIME
// Sem atalhos. Sem médias agregadas. Análise narrativa cravada.

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
         typeof j.cantos.ft.v === 'number' && (j.cantos.ft.m + j.cantos.ft.v) >= 0;
}
function dataParaIso(s){
  if(!s) return null;
  if(/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0,10);
  const m=s.match(/^(\d{2})\.(\d{2})\.(\d{4})/);
  return m?`${m[3]}-${m[2]}-${m[1]}`:null;
}

const memMaster = JSON.parse(fs.readFileSync(path.join(ROOT, 'Auditoria Especialista em cantos/_AnaliseDNA/_MEMORIA_TIMES_MASTER.json'),'utf-8'));

function r2(n){return Math.round(n*100)/100;}

// ===== CLASSIFICAÇÕES =====
function categoriaPorPS(ps) {
  if (ps == null) return 'DESCONHECIDO';
  if (ps >= 80) return 'ELITE';
  if (ps >= 60) return 'MEDIO_FORTE';
  if (ps >= 40) return 'MEDIO';
  if (ps >= 20) return 'MEDIO_FRACO';
  return 'AZARAO';
}

function veredictoJogo(cantosPro, cantosSof) {
  const diff = cantosPro - cantosSof;
  if (diff >= 5)  return 'DOMINOU';
  if (diff >= 2)  return 'CONTROLOU';
  if (diff >= -1) return 'EQUILIBRADO';
  if (diff >= -4) return 'SOFREU';
  return 'ENGOLIDO';
}

function padraoHT(cantosHTPro, cantosFTPro) {
  if (!cantosFTPro || cantosFTPro === 0) return null;
  const pct = cantosHTPro / cantosFTPro;
  if (pct >= 0.55) return 'BLITZ_HT';
  if (pct >= 0.42) return 'EQUILIBRADO_HT';
  if (pct >= 0.30) return 'DECISAO_2T';
  return 'EXPLOSAO_2T';
}

function vitoriaPorGols(j, ehMandante) {
  if (!j.gols || !j.gols.ft || j.gols.ft.m == null) return null;
  const gp = ehMandante ? j.gols.ft.m : j.gols.ft.v;
  const gc = ehMandante ? j.gols.ft.v : j.gols.ft.m;
  if (gp > gc) return 'V';
  if (gp < gc) return 'D';
  return 'E';
}

// ============= ANÁLISE INDIVIDUAL =============
const dossiesIndividuais = {};
const dossiesResumo = {};
let totalJogosProcessados = 0;

Object.entries(LIGAS_ARQS).forEach(([liga, arq]) => {
  const ds = carregaDataset(arq);
  const jogosLiga = (ds.jogos||[]).filter(jogoValido);
  if (!memMaster[liga] || !memMaster[liga].times) return;

  const times = Object.keys(memMaster[liga].times);
  dossiesIndividuais[liga] = {};
  dossiesResumo[liga] = {};

  times.forEach(nome => {
    // Todos os jogos do time, em ordem cronológica
    const jogosTime = jogosLiga.filter(j => j.mandante===nome || j.visitante===nome);
    const ordenados = jogosTime
      .map(j => ({...j, _iso: dataParaIso(j.data)}))
      .filter(j => j._iso)
      .sort((a,b) => a._iso.localeCompare(b._iso));

    if (ordenados.length === 0) return;

    // ===== ANÁLISE JOGO A JOGO =====
    const historicoJogos = [];
    let formaCorrente = []; // V/E/D dos últimos 5 jogos pra contexto

    ordenados.forEach((j, idx) => {
      const ehMandante = j.mandante === nome;
      const adv = ehMandante ? j.visitante : j.mandante;
      const advDna = memMaster[liga].times[adv] || null;
      const advPS = advDna && advDna.identidade ? advDna.identidade.powerScore : null;
      const advCat = categoriaPorPS(advPS);

      const cantosPro = ehMandante ? j.cantos.ft.m : j.cantos.ft.v;
      const cantosSof = ehMandante ? j.cantos.ft.v : j.cantos.ft.m;
      const cantosHTPro = j.cantos.ht && typeof j.cantos.ht.m === 'number'
        ? (ehMandante ? j.cantos.ht.m : j.cantos.ht.v) : null;

      const ver = veredictoJogo(cantosPro, cantosSof);
      const padraoHT_ = cantosHTPro != null ? padraoHT(cantosHTPro, cantosPro) : null;

      // Resultado de gols (se disponível)
      const resGols = vitoriaPorGols(j, ehMandante);

      // Forma ANTES deste jogo (usa só os jogos passados, sem look-ahead)
      const formaAntes = formaCorrente.slice(-5).join('');

      // Total cantos do jogo
      const totalFT = cantosPro + cantosSof;
      const linha = totalFT > 9.5 ? 'OVER_9_5' : 'UNDER_9_5';

      const entrada = {
        rodada: j.rodada,
        data: j._iso,
        ctx: ehMandante ? 'casa' : 'fora',
        adv,
        adv_PS: advPS,
        adv_cat: advCat,
        cantos_pro: cantosPro,
        cantos_sof: cantosSof,
        cantos_diff: cantosPro - cantosSof,
        total_ft: totalFT,
        linha,
        cantos_ht_pro: cantosHTPro,
        veredito: ver,
        padrao_ht: padraoHT_,
        resultado_gols: resGols,
        forma_antes: formaAntes
      };

      historicoJogos.push(entrada);
      totalJogosProcessados++;

      // Atualiza forma corrente
      if (resGols) formaCorrente.push(resGols);
    });

    dossiesIndividuais[liga][nome] = historicoJogos;

    // ===== SÍNTESE TÁTICA PONDERADA =====
    // Separar por categoria do adversário + contexto
    const segmentos = {
      casa_vs_elite:   historicoJogos.filter(h => h.ctx==='casa' && h.adv_cat==='ELITE'),
      casa_vs_medio_forte: historicoJogos.filter(h => h.ctx==='casa' && h.adv_cat==='MEDIO_FORTE'),
      casa_vs_medio:   historicoJogos.filter(h => h.ctx==='casa' && (h.adv_cat==='MEDIO'||h.adv_cat==='MEDIO_FRACO')),
      casa_vs_azarao:  historicoJogos.filter(h => h.ctx==='casa' && h.adv_cat==='AZARAO'),
      fora_vs_elite:   historicoJogos.filter(h => h.ctx==='fora' && h.adv_cat==='ELITE'),
      fora_vs_medio_forte: historicoJogos.filter(h => h.ctx==='fora' && h.adv_cat==='MEDIO_FORTE'),
      fora_vs_medio:   historicoJogos.filter(h => h.ctx==='fora' && (h.adv_cat==='MEDIO'||h.adv_cat==='MEDIO_FRACO')),
      fora_vs_azarao:  historicoJogos.filter(h => h.ctx==='fora' && h.adv_cat==='AZARAO')
    };

    // Síntese por segmento
    const sintese = {};
    Object.entries(segmentos).forEach(([seg, lista]) => {
      if (lista.length === 0) return;
      const proMed = lista.reduce((s,h)=>s+h.cantos_pro,0)/lista.length;
      const sofMed = lista.reduce((s,h)=>s+h.cantos_sof,0)/lista.length;
      const totalMed = lista.reduce((s,h)=>s+h.total_ft,0)/lista.length;
      const overPct = 100*lista.filter(h=>h.linha==='OVER_9_5').length/lista.length;
      const veredictos = {};
      lista.forEach(h => veredictos[h.veredito] = (veredictos[h.veredito]||0)+1);
      const vereditoDominante = Object.entries(veredictos).sort((a,b)=>b[1]-a[1])[0];
      sintese[seg] = {
        n: lista.length,
        pro: r2(proMed),
        sof: r2(sofMed),
        total: r2(totalMed),
        over9_5_pct: r2(overPct),
        veredito_dominante: vereditoDominante ? vereditoDominante[0] : null,
        confiabilidade: lista.length >= 4 ? 'consolidado' : (lista.length >= 2 ? 'tendencia' : 'amostra_baixa')
      };
    });

    // Padrões repetidos (ocorrência ≥ 2)
    const padroesRepetidos = [];
    const veredictosTotal = {};
    historicoJogos.forEach(h => veredictosTotal[h.veredito] = (veredictosTotal[h.veredito]||0)+1);
    Object.entries(veredictosTotal).forEach(([v, n]) => {
      if (n >= Math.max(2, Math.floor(historicoJogos.length*0.25))) {
        padroesRepetidos.push(`${v} em ${n}/${historicoJogos.length} jogos (${Math.round(100*n/historicoJogos.length)}%)`);
      }
    });

    // PESO TÁTICO: jogos contra elite valem 2x; contra azarão 1x
    // Diferenciação de "força real"
    let pesoTotal = 0, ftMedioPonderado = 0;
    historicoJogos.forEach(h => {
      const peso = h.adv_cat==='ELITE' ? 2.0 : h.adv_cat==='MEDIO_FORTE' ? 1.5 : h.adv_cat==='AZARAO' ? 0.7 : 1.0;
      ftMedioPonderado += h.total_ft * peso;
      pesoTotal += peso;
    });
    const totalFTPonderado = pesoTotal > 0 ? r2(ftMedioPonderado / pesoTotal) : null;

    // Detecção de "fenômenos" — jogos extremos
    const jogosExtremos = historicoJogos.filter(h => h.veredito === 'DOMINOU' || h.veredito === 'ENGOLIDO');
    const fenomenos = jogosExtremos.slice(-3).map(h =>
      `${h.data} ${h.ctx==='casa'?'(C)':'(F)'} vs ${h.adv}[${h.adv_cat}]: ${h.cantos_pro}-${h.cantos_sof} ${h.veredito}`
    );

    dossiesResumo[liga][nome] = {
      n_jogos: historicoJogos.length,
      total_ft_ponderado: totalFTPonderado,
      sintese_segmentada: sintese,
      padroes_repetidos: padroesRepetidos,
      fenomenos_recentes: fenomenos
    };
  });
});

console.log(`📊 ${totalJogosProcessados} análises jogo-a-jogo geradas`);
console.log(`📊 ${Object.values(dossiesResumo).reduce((s,l)=>s+Object.keys(l).length,0)} times analisados`);

// Salvar
fs.writeFileSync(path.join(__dirname,'dossie_individual_completo.json'),
  JSON.stringify(dossiesIndividuais, null, 2), 'utf-8');
fs.writeFileSync(path.join(__dirname,'dossie_individual_resumo.json'),
  JSON.stringify(dossiesResumo, null, 2), 'utf-8');

console.log('💾 Arquivos salvos:');
console.log('   dossie_individual_completo.json (jogo a jogo)');
console.log('   dossie_individual_resumo.json (síntese ponderada)');

const sizeCompleto = (fs.statSync(path.join(__dirname,'dossie_individual_completo.json')).size/(1024*1024)).toFixed(2);
const sizeResumo = (fs.statSync(path.join(__dirname,'dossie_individual_resumo.json')).size/1024).toFixed(0);
console.log(`   Tamanhos: completo=${sizeCompleto}MB | resumo=${sizeResumo}KB`);

// === AMOSTRAS REVELADORAS ===
console.log('\n\n=== 🎭 AMOSTRAS — Comportamento jogo a jogo ===\n');

// Palmeiras
const palm = dossiesIndividuais.BR.Palmeiras;
if (palm) {
  console.log('▶️  PALMEIRAS — todos os jogos cronológicos:');
  palm.forEach(h => {
    console.log(`   ${h.data} ${h.ctx==='casa'?'C':'F'} vs ${h.adv.padEnd(20)} [PS ${(h.adv_PS||'?').toString().padStart(4)}|${h.adv_cat.padEnd(11)}] ${String(h.cantos_pro).padStart(2)}-${String(h.cantos_sof).padStart(2)} → ${h.veredito.padEnd(12)} | forma_antes:${h.forma_antes||'(início)'}`);
  });
  console.log('\n   📐 Síntese ponderada Palmeiras:');
  const sp = dossiesResumo.BR.Palmeiras;
  Object.entries(sp.sintese_segmentada).forEach(([seg, s]) => {
    console.log(`     ${seg.padEnd(20)} (n=${s.n}, ${s.confiabilidade}): pro ${s.pro}/sof ${s.sof} | ${s.veredito_dominante} | Over9.5: ${s.over9_5_pct}%`);
  });
  console.log(`     Padrões repetidos: ${sp.padroes_repetidos.join(' · ')}`);
  console.log(`     FT médio PONDERADO (vs elite=2x): ${sp.total_ft_ponderado} cantos`);
}
