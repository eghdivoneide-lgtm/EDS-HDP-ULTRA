// buckets.js — Matriz 6 buckets (casa/fora × ELITE/MÉDIO/AZARÃO)
const { media, desvio, r } = require('./normalizadores');

// Calcula 6 buckets para UM time, dado um mapa categoria-por-time
function calcularBucketsTime(time, jogosValidos, categoriaPorTime, baselineTime) {
  const buckets = {
    casa_vs_elite:  { ctx: 'casa', alvo: 'ELITE' },
    casa_vs_medio:  { ctx: 'casa', alvo: 'MÉDIO' },
    casa_vs_azarao: { ctx: 'casa', alvo: 'AZARÃO' },
    fora_vs_elite:  { ctx: 'fora', alvo: 'ELITE' },
    fora_vs_medio:  { ctx: 'fora', alvo: 'MÉDIO' },
    fora_vs_azarao: { ctx: 'fora', alvo: 'AZARÃO' }
  };

  const baselinePro = baselineTime?.cantos_pro_geral || 0;

  for (const [bkey, def] of Object.entries(buckets)) {
    const ehCasa = def.ctx === 'casa';
    const jogosBucket = jogosValidos.filter(j => {
      const ehMandante = j.mandante === time;
      const ehVisitante = j.visitante === time;
      if (ehCasa && !ehMandante) return false;
      if (!ehCasa && !ehVisitante) return false;
      const adv = ehCasa ? j.visitante : j.mandante;
      const catAdv = categoriaPorTime[adv];
      return catAdv === def.alvo;
    });

    const n = jogosBucket.length;
    if (n === 0) {
      buckets[bkey] = { ...def, n: 0, qualifier: 'amostra_insuficiente', padrao_detectado: false };
      continue;
    }

    const cantosPro = jogosBucket.map(j => ehCasa ? j.cantos.ft.m : j.cantos.ft.v);
    const cantosSof = jogosBucket.map(j => ehCasa ? j.cantos.ft.v : j.cantos.ft.m);
    const cantosProHt = jogosBucket.filter(j => j.cantos.ht).map(j => ehCasa ? j.cantos.ht.m : j.cantos.ht.v);
    const cantosSofHt = jogosBucket.filter(j => j.cantos.ht).map(j => ehCasa ? j.cantos.ht.v : j.cantos.ht.m);

    const comPlacar = jogosBucket.filter(j => j.gols && j.gols.ft);
    const golsPro = comPlacar.map(j => ehCasa ? j.gols.ft.m : j.gols.ft.v);
    const golsSof = comPlacar.map(j => ehCasa ? j.gols.ft.v : j.gols.ft.m);

    // Win rate em cantos (% jogos em que time fez MAIS cantos que adv)
    let venceuCantos = 0;
    for (let i = 0; i < cantosPro.length; i++) {
      if (cantosPro[i] > cantosSof[i]) venceuCantos++;
    }
    const winRate = (venceuCantos / n) * 100;

    const cantosProMedia = media(cantosPro);
    const cantosSofMedia = media(cantosSof);
    const diferencial = cantosProMedia - cantosSofMedia;
    const variacaoPct = baselinePro > 0 ? ((cantosProMedia - baselinePro) / baselinePro) * 100 : 0;

    const qualifier = n >= 5 ? 'consolidado' : n >= 3 ? 'sugestivo' : 'amostra_insuficiente';
    const padraoDetectado = n >= 3 && (Math.abs(variacaoPct) >= 25 || Math.abs(diferencial) >= 2.0);

    buckets[bkey] = {
      ...def,
      n,
      cantos_pro_media:      r(cantosProMedia),
      cantos_pro_desvio:     r(desvio(cantosPro)),
      cantos_sofridos_media: r(cantosSofMedia),
      cantos_sofridos_desvio:r(desvio(cantosSof)),
      cantos_pro_ht_media:   cantosProHt.length ? r(media(cantosProHt)) : null,
      cantos_sof_ht_media:   cantosSofHt.length ? r(media(cantosSofHt)) : null,
      diferencial:           r(diferencial),
      variacao_vs_baseline_pct: r(variacaoPct, 1),
      gols_pro_media:        comPlacar.length ? r(media(golsPro)) : null,
      gols_sofridos_media:   comPlacar.length ? r(media(golsSof)) : null,
      win_rate_cantos_pct:   r(winRate, 1),
      qualifier,
      padrao_detectado: padraoDetectado
    };
  }

  return buckets;
}

// Calcula buckets para TODOS os times da liga
function calcularBucketsLiga(times, jogosValidos, categoriaPorTime, baselinesPorTime) {
  const out = {};
  for (const time of times) {
    out[time] = calcularBucketsTime(time, jogosValidos, categoriaPorTime, baselinesPorTime[time]);
  }
  return out;
}

module.exports = { calcularBucketsTime, calcularBucketsLiga };
