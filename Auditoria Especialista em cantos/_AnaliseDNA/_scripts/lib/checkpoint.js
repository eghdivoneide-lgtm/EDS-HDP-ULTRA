// checkpoint.js — Gera CHECKPOINT_BR.md (relatório executivo para validação rápida)
const { r } = require('./normalizadores');

function gerarCheckpoint(memoria, jogosValidos, baselineLiga, contagens, dnaPorTime) {
  const linhas = [];
  const lig = memoria.liga;
  linhas.push(`# 🚦 CHECKPOINT — ${memoria.ligaNome} (${lig})`);
  linhas.push('');
  linhas.push(`Gerado em **${memoria.data_analise}** · Validação rápida em 5 min`);
  linhas.push('');
  linhas.push('---');
  linhas.push('');

  // 1. Sanity check: contagens
  linhas.push('## 1. Sanity Check — Contagens');
  linhas.push('');
  linhas.push(`- **Jogos processados:** ${memoria.n_jogos_analisados}`);
  linhas.push(`- **Times no dataset:** ${memoria.n_times}`);
  linhas.push(`- **Times com DNA Escoteiro:** ${memoria.ranking_powerscore.filter(r => r.categoria !== 'SEM_DNA').length}`);
  linhas.push(`- **Baseline da liga:** ${baselineLiga.media_cantos_jogo_ft} cantos/jogo (σ=${baselineLiga.desvio_cantos_jogo_ft})`);
  linhas.push(`- **Cobertura placar:** ${baselineLiga.n_com_placar}/${baselineLiga.n_jogos} (${r((baselineLiga.n_com_placar/baselineLiga.n_jogos)*100,1)}%)`);
  linhas.push('');

  // 2. Distribuição de categorias
  const elites = memoria.ranking_powerscore.filter(r => r.categoria === 'ELITE');
  const medios = memoria.ranking_powerscore.filter(r => r.categoria === 'MÉDIO');
  const azaroes = memoria.ranking_powerscore.filter(r => r.categoria === 'AZARÃO');
  linhas.push('## 2. Distribuição de Categorias');
  linhas.push('');
  linhas.push(`| Categoria | Quantidade | Times |`);
  linhas.push(`|---|---|---|`);
  linhas.push(`| **ELITE** | ${elites.length} | ${elites.map(r => r.time).join(', ')} |`);
  linhas.push(`| **MÉDIO** | ${medios.length} | ${medios.map(r => r.time).join(', ')} |`);
  linhas.push(`| **AZARÃO** | ${azaroes.length} | ${azaroes.map(r => r.time).join(', ')} |`);
  linhas.push('');

  // 3. Top 5 / Bottom 5
  const rk = memoria.ranking_powerscore;
  linhas.push('## 3. Top 5 e Bottom 5 PowerScore (sanity visual)');
  linhas.push('');
  linhas.push(`### 🥇 Top 5 (maior PowerScore)`);
  linhas.push('');
  linhas.push(`| # | Time | PowerScore | Categoria | Perfil DNA | Forma | n |`);
  linhas.push(`|---|---|---|---|---|---|---|`);
  rk.slice(0, 5).forEach((r, i) => {
    linhas.push(`| ${i+1} | ${r.time} | ${r.powerScore} | ${r.categoria} | ${r.perfil_dna || '—'} | \`${r.forma || '?????'}\` | ${r.n_jogos} |`);
  });
  linhas.push('');
  linhas.push(`### 🪨 Bottom 5 (menor PowerScore)`);
  linhas.push('');
  linhas.push(`| # | Time | PowerScore | Categoria | Perfil DNA | Forma | n |`);
  linhas.push(`|---|---|---|---|---|---|---|`);
  rk.slice(-5).forEach((r, i) => {
    linhas.push(`| ${rk.length - 4 + i} | ${r.time} | ${r.powerScore} | ${r.categoria} | ${r.perfil_dna || '—'} | \`${r.forma || '?????'}\` | ${r.n_jogos} |`);
  });
  linhas.push('');

  // 4. Contagem das 12 assinaturas
  linhas.push('## 4. Frequência das 12 Assinaturas');
  linhas.push('');
  linhas.push(`| Assinatura | Times c/ presença | % times |`);
  linhas.push(`|---|---|---|`);
  Object.entries(contagens).sort((a, b) => b[1] - a[1]).forEach(([nome, c]) => {
    linhas.push(`| ${nome} | ${c} | ${r((c/memoria.n_times)*100,0)}% |`);
  });
  linhas.push('');

  // 5. Histograma de sample size por bucket
  linhas.push('## 5. Sample Size dos 6 Buckets (qualidade da matriz)');
  linhas.push('');
  const bks = ['casa_vs_elite', 'casa_vs_medio', 'casa_vs_azarao', 'fora_vs_elite', 'fora_vs_medio', 'fora_vs_azarao'];
  linhas.push(`| Bucket | Consolidado (n≥5) | Sugestivo (n=3-4) | Insuficiente (n<3) | Padrão detectado |`);
  linhas.push(`|---|---|---|---|---|`);
  for (const bk of bks) {
    let cons = 0, sug = 0, ins = 0, pad = 0;
    for (const t of Object.values(memoria.times)) {
      const b = t.buckets[bk];
      if (!b || b.n === 0) { ins++; continue; }
      if (b.qualifier === 'consolidado') cons++;
      else if (b.qualifier === 'sugestivo') sug++;
      else ins++;
      if (b.padrao_detectado) pad++;
    }
    linhas.push(`| ${bk} | ${cons} | ${sug} | ${ins} | **${pad}** |`);
  }
  linhas.push('');

  // 6. Top 3 surpresas
  linhas.push('## 6. Surpresas detectadas (top 3 para revisão visual)');
  linhas.push('');
  const surpresas = detectarSurpresas(memoria, dnaPorTime);
  if (surpresas.length === 0) {
    linhas.push(`> Nenhuma divergência grande encontrada — DNA Escoteiro e PowerScore estão alinhados.`);
  } else {
    surpresas.slice(0, 3).forEach((s, i) => {
      linhas.push(`${i+1}. **${s.time}** — ${s.descricao}`);
    });
  }
  linhas.push('');

  // 7. Cálculo manual visível (3 times-amostra)
  linhas.push('## 7. Cálculo manual visível — 3 times para conferência');
  linhas.push('');
  linhas.push(`> Pegue uma calculadora. Os 3 times abaixo têm o PowerScore decomposto + 1 bucket detalhado. Se bater = metodologia consistente.`);
  linhas.push('');
  const amostras = [rk[0], rk[Math.floor(rk.length / 2)], rk[rk.length - 1]];
  for (const am of amostras) {
    if (!am) continue;
    const td = memoria.times[am.time];
    if (!td) continue;
    const dna = dnaPorTime[am.time];
    linhas.push(`### ${am.time} (${am.categoria})`);
    linhas.push('');
    if (dna) {
      const formaArr = (dna.forma || 'EEEEE').split('').slice(0, 5);
      const formaVals = formaArr.map(c => c === 'V' ? 1 : c === 'E' ? 0.5 : 0);
      const fs = formaVals.reduce((s, n) => s + n, 0) / formaVals.length;
      const vPctGeral = ((dna.casa_v_pct || 0) + (dna.fora_v_pct || 0)) / 2;
      const powerRawCalc = (dna.gp_jogo * 30) + ((2 - dna.gc_jogo) * 20) + (fs * 25) + (vPctGeral * 0.25);
      linhas.push(`**PowerScore decomposto:**`);
      linhas.push('');
      linhas.push(`- gp_jogo = ${dna.gp_jogo} → ${dna.gp_jogo} × 30 = **${r(dna.gp_jogo * 30, 2)}**`);
      linhas.push(`- gc_jogo = ${dna.gc_jogo} → (2 - ${dna.gc_jogo}) × 20 = **${r((2 - dna.gc_jogo) * 20, 2)}**`);
      linhas.push(`- forma = \`${dna.forma}\` → valores [${formaVals.join(', ')}] → média = **${r(fs, 3)}** × 25 = **${r(fs * 25, 2)}**`);
      linhas.push(`- v_pct = (casa ${dna.casa_v_pct}% + fora ${dna.fora_v_pct}%) / 2 = **${r(vPctGeral, 1)}** × 0.25 = **${r(vPctGeral * 0.25, 2)}**`);
      linhas.push(`- **PowerRaw total = ${r(powerRawCalc, 2)}** → percentil na liga = **${am.powerScore}** → categoria **${am.categoria}**`);
      linhas.push('');
    }
    // Bucket detalhado: pega o mais consolidado
    const buckets = td.buckets;
    let melhor = null;
    for (const [k, v] of Object.entries(buckets)) {
      if (v && v.n >= 3 && (!melhor || v.n > melhor.n)) melhor = { k, ...v };
    }
    if (melhor) {
      linhas.push(`**Bucket detalhado (${melhor.k}, n=${melhor.n}, ${melhor.qualifier}):**`);
      linhas.push('');
      linhas.push(`- cantos pró média = **${melhor.cantos_pro_media}** (σ=${melhor.cantos_pro_desvio})`);
      linhas.push(`- cantos sofridos média = **${melhor.cantos_sofridos_media}** (σ=${melhor.cantos_sofridos_desvio})`);
      linhas.push(`- diferencial = **${melhor.diferencial}** | win_rate_cantos = ${melhor.win_rate_cantos_pct}%`);
      linhas.push(`- variação vs baseline pró (${td.baseline.cantos_pro_geral}): **${melhor.variacao_vs_baseline_pct > 0 ? '+' : ''}${melhor.variacao_vs_baseline_pct}%**`);
      linhas.push(`- padrão detectado? **${melhor.padrao_detectado ? '✅ SIM' : '❌ NÃO'}**`);
      linhas.push('');
    }
  }

  // 8. Matriz DNA×DNA (linhas-chave)
  linhas.push('## 8. Matriz DNA × DNA — Linhas-chave (top 5 por cantos totais)');
  linhas.push('');
  const cruzamentos = Object.entries(memoria.matriz_dna_cruzamentos)
    .filter(([_, m]) => m.qualifier !== 'amostra_insuficiente')
    .sort((a, b) => (b[1].cantos_media_total || 0) - (a[1].cantos_media_total || 0))
    .slice(0, 5);
  linhas.push(`| Mandante × Visitante | Cantos total | Mand × Vis | Dom mand % | n | Qualifier |`);
  linhas.push(`|---|---|---|---|---|---|`);
  for (const [key, c] of cruzamentos) {
    linhas.push(`| ${c.perfil_mandante} × ${c.perfil_visitante} | **${c.cantos_media_total}** | ${c.cantos_media_mandante} × ${c.cantos_media_visitante} | ${c.mandante_dominou_cantos_pct}% | ${c.n_jogos} | ${c.qualifier} |`);
  }
  linhas.push('');

  // 9. Divergências DNA Escoteiro × Performance Real
  linhas.push('## 9. Divergências DNA-Escoteiro × Performance Real');
  linhas.push('');
  linhas.push(`> Casos onde o perfil DNA promete uma coisa mas o PowerScore (performance recente real) entrega outra.`);
  linhas.push(`> Esses são os pontos onde o motor pode estar sendo enganado pelo DNA estático.`);
  linhas.push('');
  // Usa as divergências já injetadas no memoria pelo auditor (single source of truth)
  const divergencias = memoria.divergencias_dna_performance || [];
  if (divergencias.length === 0) {
    linhas.push(`✅ Nenhuma divergência forte detectada — DNA Escoteiro e PowerScore alinhados.`);
  } else {
    linhas.push(`| Time | Categoria | Perfil DNA | Tipo de divergência | Severidade | Evidência |`);
    linhas.push(`|---|---|---|---|---|---|`);
    for (const d of divergencias) {
      const ev = Object.entries(d.evidencia)
        .filter(([_, v]) => v != null)
        .map(([k, v]) => `${k}=${v}`)
        .join(' \\| ');
      linhas.push(`| **${d.time}** | ${d.categoria} | ${d.perfil_dna} | ${d.tipo_divergencia} | ${d.severidade.toUpperCase()} | ${ev} |`);
    }
  }
  linhas.push('');

  // 10. Anomalias detectadas
  linhas.push('## 10. Anomalias e limitações detectadas');
  linhas.push('');
  const anomalias = [];
  for (const r of memoria.ranking_powerscore) {
    if (r.categoria === 'SEM_DNA') anomalias.push(`- ${r.time} sem entrada no DNA Escoteiro`);
    if (r.n_jogos < 5) anomalias.push(`- ${r.time} com amostra reduzida (n=${r.n_jogos}) — confiabilidade BAIXA`);
  }
  if (baselineLiga.n_com_placar < baselineLiga.n_jogos * 0.8) {
    anomalias.push(`- Cobertura de placar baixa (${r((baselineLiga.n_com_placar/baselineLiga.n_jogos)*100,1)}%) → assinaturas EFETIVIDADE_CLINICA, ATAQUE_ESTERIL, MURO_DEFENSIVO, DEFESA_PRECARIA podem estar com baixa confiabilidade`);
  }
  if (anomalias.length === 0) anomalias.push('- Nenhuma anomalia grave detectada.');
  anomalias.forEach(a => linhas.push(a));
  linhas.push('');

  linhas.push('---');
  linhas.push('');
  linhas.push('## ✅ Decisão de aprovação');
  linhas.push('');
  linhas.push(`Se os números acima fazem sentido, autorize o processamento das outras 6 ligas. Caso contrário, indique o que precisa ser ajustado.`);
  linhas.push('');

  return linhas.join('\n');
}

function detectarSurpresas(memoria, dnaPorTime) {
  const surpresas = [];
  for (const r of memoria.ranking_powerscore) {
    const dna = dnaPorTime[r.time];
    if (!dna) continue;
    const perfil = (dna.perfil || '').toUpperCase();
    // Caso 1: perfil ofensivo mas PowerScore baixo
    if (/OFENSIVO/.test(perfil) && r.categoria === 'AZARÃO') {
      surpresas.push({ time: r.time, descricao: `Perfil DNA "${perfil}" mas PowerScore baixo (${r.powerScore}) → categoria AZARÃO. Provavelmente gols ofensivos mas defesa precária / forma ruim. Vale conferir bucket vs ELITE.` });
    }
    // Caso 2: perfil defensivo mas PowerScore alto (cantos pode confundir)
    if (/DEFENSIVO/.test(perfil) && r.categoria === 'ELITE') {
      surpresas.push({ time: r.time, descricao: `Perfil DNA "${perfil}" com PowerScore alto (${r.powerScore}) → ELITE. Esperar buckets com poucos cantos pró mas dominância via gols.` });
    }
    // Caso 3: forma fora de sincronia com categoria
    const formaCount = { V: 0, E: 0, D: 0 };
    (dna.forma || '').split('').forEach(c => { if (formaCount[c] != null) formaCount[c]++; });
    if (r.categoria === 'ELITE' && formaCount.D >= 3) {
      surpresas.push({ time: r.time, descricao: `Categoria ELITE com forma recente ruim (${formaCount.D} derrotas em 5: \`${dna.forma}\`) — alerta de regressão à média.` });
    }
    if (r.categoria === 'AZARÃO' && formaCount.V >= 3) {
      surpresas.push({ time: r.time, descricao: `Categoria AZARÃO com forma recente ascendente (${formaCount.V} vitórias em 5: \`${dna.forma}\`) — possível upgrade no próximo cálculo.` });
    }
  }
  return surpresas;
}

// Detecta divergências entre perfil DNA Escoteiro (estático) e PowerScore (performance recente)
//
// 4 tipos canônicos (documentados em _METODOLOGIA_APLICADA.md):
//   1. "Ofensivo subentregando"  → perfil ofensivo forte + (AZARÃO OU cantos_pro abaixo da média)
//   2. "Defensivo medíocre"      → perfil defensivo forte + AZARÃO
//   3. "Passivo elite"           → perfil PASSIVO + ELITE
//   4. "Vulnerável elite"        → perfil VULNERAVEL/SANGRA_CANTOS/REATIVO + ELITE
//
// Severidade:
//   - "alta":  n>=10 E magnitude alta (gap >= 25% OU cantos_sof >= 1.2× média)
//   - "media": n>=5  E magnitude moderada (gap 10-25% OU acima/abaixo da média)
//   - "baixa": casos marginais (amostra pequena ou gap < 10%)
const PERFIS_FORTES_OFENSIVOS  = ['OFENSIVO', 'OFENSIVO_SOLIDO', 'OFENSIVO_DOMINANTE', 'DOMINANTE', 'ABSOLUTO'];
const PERFIS_FORTES_DEFENSIVOS = ['MURO', 'MURO_DUPLO', 'DEFENSIVO', 'FORTALEZA', 'COMPACTO'];
const PERFIS_PASSIVOS          = ['PASSIVO'];
const PERFIS_VULNERAVEIS       = ['VULNERAVEL', 'SANGRA_CANTOS', 'REATIVO'];

function calcSeveridade(n, magnitudeRel) {
  if (n >= 10 && magnitudeRel >= 0.25) return 'alta';
  if (n >= 5  && magnitudeRel >= 0.10) return 'media';
  return 'baixa';
}

function detectarDivergenciasDnaPerformance(memoria, baselineLiga) {
  const out = [];
  const mediaLigaCantosSof = baselineLiga.media_cantos_sof_time || 0;
  const mediaLigaCantosPro = baselineLiga.media_cantos_pro_time || 0;

  for (const rk of memoria.ranking_powerscore) {
    const time = rk.time;
    const t = memoria.times[time];
    if (!t) continue;
    const perfil = (rk.perfil_dna || '').toUpperCase();
    const cat = rk.categoria;
    const b = t.baseline;
    const n = b.n_jogos || 0;

    let tipo = null;
    let evidencia = null;
    let magnitudeRel = 0;

    // CASO 1 — Ofensivo subentregando: perfil ofensivo forte + (AZARÃO OU cantos_pro << média)
    if (PERFIS_FORTES_OFENSIVOS.includes(perfil)) {
      const gapPro = mediaLigaCantosPro > 0 ? (mediaLigaCantosPro - b.cantos_pro_geral) / mediaLigaCantosPro : 0;
      if (cat === 'AZARÃO' || (n >= 5 && gapPro >= 0.10)) {
        tipo = 'Ofensivo subentregando';
        evidencia = {
          cantos_pro: b.cantos_pro_geral,
          media_liga_cantos_pro: r(mediaLigaCantosPro),
          gap_vs_media_pct: r(gapPro * 100, 1),
          gols_pro: b.gols_pro_geral,
          power_score: rk.powerScore,
          n_jogos: n
        };
        magnitudeRel = Math.max(gapPro, cat === 'AZARÃO' ? 0.25 : 0);
      }
    }
    // CASO 2 — Defensivo medíocre: perfil defensivo forte + AZARÃO
    // SÓ cria divergência se time DE FATO está sofrendo MAIS que a média
    // (acima_da_media === true). Time defensivo forte que sofre MENOS que a
    // média NÃO é "defensivo medíocre" — é defesa boa funcionando.
    else if (PERFIS_FORTES_DEFENSIVOS.includes(perfil) && cat === 'AZARÃO') {
      const ratioSof = mediaLigaCantosSof > 0 ? b.cantos_sofridos_geral / mediaLigaCantosSof : 1;
      const acimaMedia = b.cantos_sofridos_geral > mediaLigaCantosSof;
      // v1.2 (2026-05-15): filtro de direção semântica.
      // Auditoria externa identificou que Math.abs(ratioSof - 1) capturava
      // tanto times sofrendo MUITO (medíocres reais) quanto times sofrendo
      // POUCO (defesas boas falsamente flagueadas). 8 de 13 falsos positivos.
      // Correção: só cria divergência quando acima_da_media === true.
      if (acimaMedia) {
        tipo = 'Defensivo medíocre';
        evidencia = {
          cantos_sofridos: b.cantos_sofridos_geral,
          media_liga_cantos_sof: r(mediaLigaCantosSof),
          cantos_sof_vs_media_pct: r((ratioSof - 1) * 100, 1),
          acima_da_media: acimaMedia,
          gols_sofridos: b.gols_sofridos_geral,
          power_score: rk.powerScore,
          n_jogos: n
        };
        // Magnitude direcional: só conta o excesso (ratioSof - 1 quando > 0)
        magnitudeRel = ratioSof - 1;
      }
    }
    // CASO 3 — Passivo elite
    else if (PERFIS_PASSIVOS.includes(perfil) && cat === 'ELITE') {
      tipo = 'Passivo elite';
      evidencia = {
        cantos_pro: b.cantos_pro_geral,
        media_liga_cantos_pro: r(mediaLigaCantosPro),
        gols_pro: b.gols_pro_geral,
        power_score: rk.powerScore,
        n_jogos: n
      };
      magnitudeRel = 0.30;
    }
    // CASO 4 — Vulnerável elite
    else if (PERFIS_VULNERAVEIS.includes(perfil) && cat === 'ELITE') {
      tipo = 'Vulnerável elite';
      evidencia = {
        cantos_sofridos: b.cantos_sofridos_geral,
        media_liga_cantos_sof: r(mediaLigaCantosSof),
        gols_sofridos: b.gols_sofridos_geral,
        power_score: rk.powerScore,
        n_jogos: n
      };
      magnitudeRel = 0.30;
    }

    if (tipo) {
      out.push({
        time,
        categoria: cat,
        perfil_dna: perfil,
        tipo_divergencia: tipo,
        evidencia,
        severidade: calcSeveridade(n, magnitudeRel)
      });
    }
  }
  return out;
}

module.exports = { gerarCheckpoint, detectarSurpresas, detectarDivergenciasDnaPerformance };
