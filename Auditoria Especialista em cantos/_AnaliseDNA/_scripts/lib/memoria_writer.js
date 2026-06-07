// memoria_writer.js — Monta o JSON de memória + matriz DNA × DNA
const { r, media } = require('./normalizadores');

// Gera matriz cruzando perfis DNA (mandante × visitante) → cantos médios + dominância
function gerarMatrizDnaCruzamentos(jogosValidos, dnaPorTime) {
  const mapa = {}; // chave "PERFIL_M__vs__PERFIL_V"

  for (const j of jogosValidos) {
    const dnaM = dnaPorTime[j.mandante];
    const dnaV = dnaPorTime[j.visitante];
    if (!dnaM || !dnaV) continue;
    const perfM = dnaM.perfil || 'INDEFINIDO';
    const perfV = dnaV.perfil || 'INDEFINIDO';
    const key = `${perfM}__vs__${perfV}`;
    if (!mapa[key]) {
      mapa[key] = { perfil_mandante: perfM, perfil_visitante: perfV, jogos: [] };
    }
    mapa[key].jogos.push(j);
  }

  const out = {};
  for (const [key, info] of Object.entries(mapa)) {
    const cantosM = info.jogos.map(j => j.cantos.ft.m);
    const cantosV = info.jogos.map(j => j.cantos.ft.v);
    const totalCantos = info.jogos.map(j => j.cantos.ft.m + j.cantos.ft.v);
    let mandanteDominouCantos = 0;
    let diffs = [];
    for (const j of info.jogos) {
      if (j.cantos.ft.m > j.cantos.ft.v) mandanteDominouCantos++;
      diffs.push(j.cantos.ft.m - j.cantos.ft.v);
    }
    const n = info.jogos.length;
    out[key] = {
      perfil_mandante: info.perfil_mandante,
      perfil_visitante: info.perfil_visitante,
      n_jogos: n,
      cantos_media_total:      r(media(totalCantos)),
      cantos_media_mandante:   r(media(cantosM)),
      cantos_media_visitante:  r(media(cantosV)),
      mandante_dominou_cantos_pct: r((mandanteDominouCantos / n) * 100, 1),
      diferencial_medio_cantos: r(media(diffs)),
      qualifier: n >= 5 ? 'consolidado' : n >= 3 ? 'sugestivo' : 'amostra_insuficiente'
    };
  }
  return out;
}

// Insights derivados da matriz e dos perfis
function gerarInsightsLiga(matriz, ranking, baselineLiga, contagensAssinaturas) {
  const insights = [];

  // 1. Cruzamento de maior produção de cantos (consolidado)
  const cruzamentos = Object.values(matriz).filter(m => m.qualifier !== 'amostra_insuficiente');
  cruzamentos.sort((a, b) => (b.cantos_media_total || 0) - (a.cantos_media_total || 0));
  if (cruzamentos[0]) {
    const c = cruzamentos[0];
    insights.push(
      `Cruzamento de maior produção de cantos: **${c.perfil_mandante}** (casa) × **${c.perfil_visitante}** (fora) — ` +
      `${c.cantos_media_total} cantos/jogo em ${c.n_jogos} confrontos (${c.qualifier}).`
    );
  }

  // 2. Cruzamento de maior dominância de mandante
  cruzamentos.sort((a, b) => (b.mandante_dominou_cantos_pct || 0) - (a.mandante_dominou_cantos_pct || 0));
  if (cruzamentos[0] && cruzamentos[0].mandante_dominou_cantos_pct >= 70) {
    const c = cruzamentos[0];
    insights.push(
      `Maior dominância de mandante em cantos: **${c.perfil_mandante}** vs **${c.perfil_visitante}** — ` +
      `${c.mandante_dominou_cantos_pct}% dos jogos o mandante fez mais cantos (n=${c.n_jogos}).`
    );
  }

  // 3. Assinatura mais frequente
  const ordemAss = Object.entries(contagensAssinaturas).sort((a, b) => b[1] - a[1]);
  if (ordemAss[0] && ordemAss[0][1] > 0) {
    insights.push(`Assinatura mais frequente na liga: **${ordemAss[0][0]}** (presente em ${ordemAss[0][1]} times).`);
  }

  // 4. Concentração de elite
  const elites = ranking.filter(r => r.categoria === 'ELITE').length;
  insights.push(`Distribuição de categorias: ${elites} ELITE, ${ranking.filter(r => r.categoria === 'MÉDIO').length} MÉDIO, ${ranking.filter(r => r.categoria === 'AZARÃO').length} AZARÃO.`);

  // 5. Baseline geral
  insights.push(`Baseline da liga: ${baselineLiga.media_cantos_jogo_ft} cantos/jogo (σ=${baselineLiga.desvio_cantos_jogo_ft}).`);

  return insights;
}

function montarMemoriaLiga({ ligaMeta, baselineLiga, dataAnalise, ranking, timesData, matrizDna, insights, contagensAssinaturas, jogosValidos }) {
  return {
    liga: ligaMeta.id,
    ligaNome: ligaMeta.nome,
    data_analise: dataAnalise,
    n_jogos_analisados: jogosValidos.length,
    n_times: Object.keys(timesData).length,
    baseline_liga: baselineLiga,
    contagens_assinaturas: contagensAssinaturas,
    ranking_powerscore: ranking,
    times: timesData,
    matriz_dna_cruzamentos: matrizDna,
    insights_liga: insights
  };
}

module.exports = { gerarMatrizDnaCruzamentos, gerarInsightsLiga, montarMemoriaLiga };
