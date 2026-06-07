// baselines.js — Médias e desvios por time (geral, casa, fora)
const { media, desvio, r } = require('./normalizadores');

// Filtra apenas jogos com cantos.ft válidos
function filtrarJogosValidos(jogos) {
  return (jogos || []).filter(j =>
    j && j.cantos && j.cantos.ft &&
    j.cantos.ft.m != null && j.cantos.ft.v != null
  );
}

// Para cada time, calcula baselines completas
function calcularBaselines(jogosValidos, times) {
  const out = {};
  for (const time of times) {
    const jCasa = jogosValidos.filter(j => j.mandante === time);
    const jFora = jogosValidos.filter(j => j.visitante === time);

    const cantosProCasa     = jCasa.map(j => j.cantos.ft.m);
    const cantosSofCasa     = jCasa.map(j => j.cantos.ft.v);
    const cantosProFora     = jFora.map(j => j.cantos.ft.v);
    const cantosSofFora     = jFora.map(j => j.cantos.ft.m);

    const cantosProGeral    = [...cantosProCasa, ...cantosProFora];
    const cantosSofGeral    = [...cantosSofCasa, ...cantosSofFora];

    const cantosProGeralHT  = [
      ...jCasa.filter(j => j.cantos.ht).map(j => j.cantos.ht.m),
      ...jFora.filter(j => j.cantos.ht).map(j => j.cantos.ht.v)
    ];
    const cantosSofGeralHT  = [
      ...jCasa.filter(j => j.cantos.ht).map(j => j.cantos.ht.v),
      ...jFora.filter(j => j.cantos.ht).map(j => j.cantos.ht.m)
    ];

    // Gols (quando placar existe)
    const golsProCasa = jCasa.filter(j => j.gols && j.gols.ft).map(j => j.gols.ft.m);
    const golsSofCasa = jCasa.filter(j => j.gols && j.gols.ft).map(j => j.gols.ft.v);
    const golsProFora = jFora.filter(j => j.gols && j.gols.ft).map(j => j.gols.ft.v);
    const golsSofFora = jFora.filter(j => j.gols && j.gols.ft).map(j => j.gols.ft.m);
    const golsProGeral = [...golsProCasa, ...golsProFora];
    const golsSofGeral = [...golsSofCasa, ...golsSofFora];

    const nTotal = jCasa.length + jFora.length;
    const temPlacar = golsProGeral.length;

    out[time] = {
      n_jogos: nTotal,
      n_jogos_casa: jCasa.length,
      n_jogos_fora: jFora.length,
      n_com_placar: temPlacar,
      cantos_pro_geral:       r(media(cantosProGeral)),
      cantos_sofridos_geral:  r(media(cantosSofGeral)),
      cantos_pro_casa:        r(media(cantosProCasa)),
      cantos_sofridos_casa:   r(media(cantosSofCasa)),
      cantos_pro_fora:        r(media(cantosProFora)),
      cantos_sofridos_fora:   r(media(cantosSofFora)),
      cantos_pro_ht_geral:    r(media(cantosProGeralHT)),
      cantos_sof_ht_geral:    r(media(cantosSofGeralHT)),
      consistencia_pro:       r(desvio(cantosProGeral)),
      gols_pro_geral:         temPlacar ? r(media(golsProGeral)) : null,
      gols_sofridos_geral:    temPlacar ? r(media(golsSofGeral)) : null,
      gols_pro_casa:          golsProCasa.length ? r(media(golsProCasa)) : null,
      gols_pro_fora:          golsProFora.length ? r(media(golsProFora)) : null,
      confiabilidade:         nTotal < 5 ? 'BAIXA' : nTotal < 10 ? 'MÉDIA' : 'ALTA'
    };
  }
  return out;
}

// Médias da liga inteira
function calcularBaselineLiga(jogosValidos) {
  const totFt = jogosValidos.map(j => j.cantos.ft.m + j.cantos.ft.v);
  const totHt = jogosValidos.filter(j => j.cantos.ht).map(j => j.cantos.ht.m + j.cantos.ht.v);
  const comPlacar = jogosValidos.filter(j => j.gols && j.gols.ft);
  const golsFt = comPlacar.map(j => j.gols.ft.m + j.gols.ft.v);

  // Médias por time (não totais do jogo) — útil para regras das assinaturas
  const cantosProPorJogo = []; // cada jogo gera 2 entradas: mandante e visitante
  const cantosSofPorJogo = [];
  const golsProPorJogo = [];
  for (const j of jogosValidos) {
    cantosProPorJogo.push(j.cantos.ft.m, j.cantos.ft.v);
    cantosSofPorJogo.push(j.cantos.ft.v, j.cantos.ft.m);
  }
  for (const j of comPlacar) {
    golsProPorJogo.push(j.gols.ft.m, j.gols.ft.v);
  }

  return {
    n_jogos:                jogosValidos.length,
    n_com_placar:           comPlacar.length,
    media_cantos_jogo_ft:   r(media(totFt)),
    media_cantos_jogo_ht:   r(media(totHt)),
    media_gols_jogo_ft:     comPlacar.length ? r(media(golsFt)) : null,
    media_cantos_pro_time:  r(media(cantosProPorJogo)),
    media_cantos_sof_time:  r(media(cantosSofPorJogo)),
    media_gols_pro_time:    comPlacar.length ? r(media(golsProPorJogo)) : null,
    desvio_cantos_jogo_ft:  r(desvio(totFt))
  };
}

module.exports = { filtrarJogosValidos, calcularBaselines, calcularBaselineLiga };
