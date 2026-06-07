// auditor.js — Entry point CLI da auditoria DNA por time
// Uso:
//   node auditor.js validar              → gera _validacao_datasets.txt
//   node auditor.js liga BR               → processa uma liga (gera 3 arquivos + checkpoint na BR)
//   node auditor.js consolidar            → gera master JSON + sumário executivo + metodologia
//   node auditor.js todas-exceto-br       → roda as 6 ligas restantes + consolidar

const fs = require('fs');
const path = require('path');

const { LIGAS, carregarLiga, carregarDnaEscoteiro, carregarDataset, DATA_DIR } = require('./lib/carregador');
const { norm, acharTimeNoDna, r } = require('./lib/normalizadores');
const { calcularPowerRaw, normalizarParaLiga } = require('./lib/powerscore');
const { filtrarJogosValidos, calcularBaselines, calcularBaselineLiga } = require('./lib/baselines');
const { calcularBucketsLiga } = require('./lib/buckets');
const { NOMES: ASSINATURAS_NOMES, evalSign } = require('./lib/assinaturas');
const { gerarNarrativa } = require('./lib/narrativa');
const { gerarMatrizDnaCruzamentos, gerarInsightsLiga, montarMemoriaLiga } = require('./lib/memoria_writer');
const { renderRelatorioLiga } = require('./lib/html_renderer');
const { gerarCheckpoint, detectarDivergenciasDnaPerformance } = require('./lib/checkpoint');

const ROOT_AN = path.resolve(__dirname, '..');
const DATA_HOJE = new Date().toISOString().slice(0, 10);

const PASTA_LIGA = {
  BR: '01_BR', BR_B: '02_BR_B', ARG: '03_ARG', ARG_B: '04_ARG_B',
  MLS: '05_MLS', USL: '06_USL', BUN: '07_BUN',
  // v3.1 (2026-05-15) — Japão reativado
  J1: '08_J1', J2_J3: '09_J2_J3'
};

function logarParaArquivo(ligaId, linhas) {
  const dir = path.join(ROOT_AN, PASTA_LIGA[ligaId]);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `log_${ligaId}.txt`), linhas.join('\n'), 'utf8');
}

// ===========================================================================
// VALIDAR — Etapa 1
// ===========================================================================
function comandoValidar() {
  const linhas = [];
  linhas.push(`═══════════════════════════════════════════════`);
  linhas.push(`  VALIDAÇÃO DE DATASETS — ${DATA_HOJE}`);
  linhas.push(`═══════════════════════════════════════════════`);
  linhas.push('');

  const dna = carregarDnaEscoteiro();
  linhas.push(`DNA_ESCOTEIRO carregado. Ligas com entrada: ${Object.keys(dna).join(', ')}`);
  linhas.push('');

  for (const meta of LIGAS) {
    linhas.push(`┌─ ${meta.id} (${meta.nome}) ─────────────────────`);
    try {
      const dados = carregarDataset(meta.arq, meta.varDados);
      const jogos = dados.jogos || [];
      const validos = filtrarJogosValidos(jogos);
      const comPlacar = validos.filter(j => j.gols && j.gols.ft);
      const comStats = validos.filter(j => j.stats_taticas);
      const times = dados.times || [];
      const dnaLiga = dna[meta.varDna] || null;
      const timesDna = dnaLiga ? Object.keys(dnaLiga) : [];
      linhas.push(`│ Jogos totais: ${jogos.length}`);
      linhas.push(`│ Jogos com cantos válidos: ${validos.length} (${r((validos.length/Math.max(jogos.length,1))*100,1)}%)`);
      linhas.push(`│ Com placar: ${comPlacar.length} (${r((comPlacar.length/Math.max(validos.length,1))*100,1)}%)`);
      linhas.push(`│ Com stats_taticas: ${comStats.length} (${r((comStats.length/Math.max(validos.length,1))*100,1)}%)`);
      linhas.push(`│ Times no dataset: ${times.length}`);
      linhas.push(`│ DNA disponível: ${dnaLiga ? 'SIM' : 'NÃO ❌'}`);
      linhas.push(`│ Times no DNA: ${timesDna.length}`);
      // Gap analysis
      if (dnaLiga) {
        const semDna = times.filter(t => !acharTimeNoDna(t, dnaLiga));
        const semDataset = timesDna.filter(t => !times.some(tt => norm(tt) === norm(t)));
        if (semDna.length) linhas.push(`│ ⚠️ Times no dataset SEM DNA: ${semDna.join(', ')}`);
        if (semDataset.length) linhas.push(`│ ⚠️ Times no DNA SEM dataset: ${semDataset.join(', ')}`);
        if (!semDna.length && !semDataset.length) linhas.push(`│ ✅ Match completo dataset×DNA`);
      }
    } catch (e) {
      linhas.push(`│ ❌ ERRO: ${e.message}`);
    }
    linhas.push(`└──────────────────────────────────────────────`);
    linhas.push('');
  }

  const out = linhas.join('\n');
  fs.writeFileSync(path.join(ROOT_AN, '_validacao_datasets.txt'), out, 'utf8');
  console.log(out);
  console.log(`\n✅ Validação salva em ${path.join(ROOT_AN, '_validacao_datasets.txt')}`);
}

// ===========================================================================
// PROCESSAR UMA LIGA
// ===========================================================================
function processarLiga(ligaId) {
  const t0 = Date.now();
  const log = [];
  log.push(`═══ AUDITORIA — ${ligaId} — ${DATA_HOJE} ═══`);

  const { meta, dados, dna_liga } = carregarLiga(ligaId);
  const times = dados.times || [];
  const jogos = dados.jogos || [];
  const jogosValidos = filtrarJogosValidos(jogos);

  log.push(`Liga: ${meta.nome}`);
  log.push(`Total jogos: ${jogos.length} | Válidos: ${jogosValidos.length}`);
  log.push(`Times: ${times.length}`);
  log.push(`DNA disponível: ${dna_liga ? 'sim' : 'NÃO ❌'}`);

  // ── 1. PowerScore + categoria ─────────────────────────────
  log.push('');
  log.push('— Etapa 1: PowerScore + categoria —');
  const dnaPorTime = {};
  const powerRawPorTime = {};
  for (const time of times) {
    const found = dna_liga ? acharTimeNoDna(time, dna_liga) : null;
    dnaPorTime[time] = found ? found.dna : null;
    powerRawPorTime[time] = calcularPowerRaw(dnaPorTime[time]);
  }
  const identidadeRaw = normalizarParaLiga(powerRawPorTime);
  const categoriaPorTime = {};
  for (const time of times) categoriaPorTime[time] = identidadeRaw[time].categoria;

  // ── 2. Baselines por time + baseline liga ────────────────
  log.push('— Etapa 2: Baselines —');
  const baselinesPorTime = calcularBaselines(jogosValidos, times);
  const baselineLiga = calcularBaselineLiga(jogosValidos);
  log.push(`Baseline liga: ${baselineLiga.media_cantos_jogo_ft} cantos/jogo (HT=${baselineLiga.media_cantos_jogo_ht})`);

  // ── 3. Buckets ───────────────────────────────────────────
  log.push('— Etapa 3: Bucket Matrix —');
  const bucketsPorTime = calcularBucketsLiga(times, jogosValidos, categoriaPorTime, baselinesPorTime);

  // ── 4. Assinaturas ───────────────────────────────────────
  log.push('— Etapa 4: 12 Assinaturas —');
  const assinaturasPorTime = {};
  const contagens = {};
  ASSINATURAS_NOMES.forEach(n => contagens[n] = 0);
  for (const time of times) {
    const jogosTime = jogosValidos.filter(j => j.mandante === time || j.visitante === time);
    const ass = evalSign(
      time,
      baselinesPorTime[time],
      bucketsPorTime[time],
      jogosTime,
      baselineLiga,
      categoriaPorTime[time]
    );
    assinaturasPorTime[time] = ass;
    ass.forEach(a => { if (a.presente) contagens[a.nome]++; });
  }
  for (const [n, c] of Object.entries(contagens)) log.push(`  ${n}: ${c} times`);

  // ── 5. Narrativas ────────────────────────────────────────
  log.push('— Etapa 5: Narrativas —');
  const narrativasPorTime = {};
  for (const time of times) {
    narrativasPorTime[time] = gerarNarrativa(
      time,
      { ...identidadeRaw[time], perfil_dna: dnaPorTime[time]?.perfil || 'SEM_DNA', forma: dnaPorTime[time]?.forma || '?????' },
      baselinesPorTime[time],
      bucketsPorTime[time],
      assinaturasPorTime[time],
      baselineLiga
    );
  }

  // ── 6. Matriz DNA × DNA ──────────────────────────────────
  log.push('— Etapa 6: Matriz DNA × DNA —');
  const matrizDna = gerarMatrizDnaCruzamentos(jogosValidos, dnaPorTime);
  log.push(`Cruzamentos detectados: ${Object.keys(matrizDna).length}`);

  // ── 7. Montar estrutura de saída ─────────────────────────
  log.push('— Etapa 7: Montagem da memória —');
  const timesData = {};
  for (const time of times) {
    timesData[time] = {
      identidade: {
        powerScore: identidadeRaw[time].powerScore,
        powerPercentil: identidadeRaw[time].powerPercentil,
        powerRaw: identidadeRaw[time].powerRaw,
        categoria: identidadeRaw[time].categoria,
        perfil_dna: dnaPorTime[time]?.perfil || 'SEM_DNA',
        forma: dnaPorTime[time]?.forma || null,
        dna_indisponivel: !dnaPorTime[time],
        n_jogos: baselinesPorTime[time].n_jogos
      },
      baseline: baselinesPorTime[time],
      buckets: bucketsPorTime[time],
      assinaturas: assinaturasPorTime[time],
      narrativa: narrativasPorTime[time]
    };
  }

  const ranking = times.map(t => ({
    time: t,
    powerScore: identidadeRaw[t].powerScore,
    categoria: identidadeRaw[t].categoria,
    perfil_dna: dnaPorTime[t]?.perfil || 'SEM_DNA',
    forma: dnaPorTime[t]?.forma || null,
    n_jogos: baselinesPorTime[t].n_jogos
  })).sort((a, b) => (b.powerScore ?? -1) - (a.powerScore ?? -1));

  const insights = gerarInsightsLiga(matrizDna, ranking, baselineLiga, contagens);

  const memoria = montarMemoriaLiga({
    ligaMeta: meta,
    baselineLiga,
    dataAnalise: DATA_HOJE,
    ranking,
    timesData,
    matrizDna,
    insights,
    contagensAssinaturas: contagens,
    jogosValidos
  });

  // Detecta e injeta divergências DNA × Performance (consumível pelo SmartCoach)
  memoria.divergencias_dna_performance = detectarDivergenciasDnaPerformance(memoria, baselineLiga);
  log.push(`— Etapa 8: Divergências DNA × Performance: ${memoria.divergencias_dna_performance.length} detectadas`);

  // ── 8. Persistir ─────────────────────────────────────────
  const dir = path.join(ROOT_AN, PASTA_LIGA[ligaId]);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(path.join(dir, `memoria_${ligaId}.json`), JSON.stringify(memoria, null, 2), 'utf8');
  fs.writeFileSync(path.join(dir, `relatorio_${ligaId}.html`), renderRelatorioLiga(memoria), 'utf8');

  // Checkpoint gerado para TODAS as ligas (validação humana opcional)
  const checkpoint = gerarCheckpoint(memoria, jogosValidos, baselineLiga, contagens, dnaPorTime);
  fs.writeFileSync(path.join(dir, `CHECKPOINT_${ligaId}.md`), checkpoint, 'utf8');

  // Log: lista times com nao_avaliavel em assinaturas placar-dependentes
  const ASS_PLACAR = ['ATAQUE_ESTERIL', 'MURO_DEFENSIVO', 'DEFESA_PRECARIA', 'EFETIVIDADE_CLINICA'];
  const coberturaPlacar = baselineLiga.n_com_placar / Math.max(baselineLiga.n_jogos, 1);
  if (coberturaPlacar < 0.8) {
    log.push('');
    log.push('— ⚠️ AVISO: cobertura de placar baixa (' + (coberturaPlacar*100).toFixed(1) + '%) —');
    log.push('Assinaturas placar-dependentes com nao_avaliavel por time:');
    let algumImpactado = false;
    for (const nome of ASS_PLACAR) {
      const semDados = [];
      for (const t of times) {
        const ass = assinaturasPorTime[t].find(a => a.nome === nome);
        if (ass && ass.nao_avaliavel === 'sem_dados_placar') semDados.push(t);
      }
      if (semDados.length) {
        log.push('  ' + nome + ' (' + semDados.length + ' times sem dados):');
        log.push('    ' + semDados.join(', '));
        algumImpactado = true;
      }
    }
    if (!algumImpactado) {
      log.push('  Nenhum time com 0 jogos de placar — distribuição uniforme da cobertura.');
      // Mas reportar quantos jogos com placar cada time tem (qualidade fraca por amostra)
      log.push('  Mas amostra por time é pequena (cobertura geral: ' + baselineLiga.n_com_placar + '/' + baselineLiga.n_jogos + ' jogos):');
      const linhasQtde = [];
      for (const t of times) {
        const n = baselinesPorTime[t].n_com_placar;
        linhasQtde.push('    ' + t + ': ' + n + ' jogo(s) com placar');
      }
      // Lista até 10 primeiros
      log.push(...linhasQtde.slice(0, 10));
      if (linhasQtde.length > 10) log.push('    ... (' + (linhasQtde.length - 10) + ' times restantes)');
      log.push('  Consequência: assinaturas baseadas em gols têm confiabilidade muito baixa nesta liga.');
    }
  }

  const dt = ((Date.now() - t0) / 1000).toFixed(2);
  log.push('');
  log.push(`Tempo de processamento: ${dt}s`);
  log.push(`Arquivos gerados: memoria_${ligaId}.json, relatorio_${ligaId}.html, CHECKPOINT_${ligaId}.md`);
  fs.writeFileSync(path.join(dir, `log_${ligaId}.txt`), log.join('\n'), 'utf8');

  console.log(`✅ ${ligaId} processado em ${dt}s — ${dir}`);
  return { ligaId, tempo: dt, memoria, dir };
}

// ===========================================================================
// CONSOLIDAR — master JSON + sumário executivo + metodologia
// ===========================================================================
function consolidar() {
  const memorias = {};
  for (const meta of LIGAS) {
    const memPath = path.join(ROOT_AN, PASTA_LIGA[meta.id], `memoria_${meta.id}.json`);
    if (fs.existsSync(memPath)) memorias[meta.id] = JSON.parse(fs.readFileSync(memPath, 'utf8'));
  }
  const consolidador = require('./lib/consolidador');
  consolidador.consolidar(memorias, ROOT_AN, DATA_HOJE);
}

// ===========================================================================
// CLI dispatch
// ===========================================================================
const cmd = process.argv[2];
const arg = process.argv[3];

if (cmd === 'validar') {
  comandoValidar();
} else if (cmd === 'liga' && arg) {
  processarLiga(arg.toUpperCase());
} else if (cmd === 'consolidar') {
  consolidar();
} else if (cmd === 'todas-exceto-br') {
  for (const meta of LIGAS) {
    if (meta.id === 'BR') continue;
    processarLiga(meta.id);
  }
  consolidar();
} else {
  console.log(`Uso:
  node auditor.js validar
  node auditor.js liga <ID>          (ex: BR, BR_B, ARG, ARG_B, MLS, USL, BUN, J1, J2_J3)
  node auditor.js todas-exceto-br
  node auditor.js consolidar`);
}
