// assinaturas.js — 12 detectores de padrão comportamental
// REGRA: avalia TODAS as 12 para TODOS os times, mesmo quando ausente.
// Ausência também é sinal — sempre retorna `evidencia` para inspeção.
const { media, desvio, r } = require('./normalizadores');

const NOMES = [
  'BLITZ_INICIAL',
  'RETRANCA_AVANCADA',
  'EFETIVIDADE_CLINICA',
  'ATAQUE_ESTERIL',
  'MURO_DEFENSIVO',
  'DEFESA_PRECARIA',
  'RUPTURA_HOME',
  'ELITE_KILLER',
  'CARRINHO_FACIL',
  'DESEQUILIBRA_FAVORITO',
  'SUCUMBE_AZARAO',
  'TERMOMETRO_FORMA'
];

function evalSign(time, baseline, buckets, jogosTime, baselineLiga, categoria) {
  const out = [];
  const n = baseline.n_jogos;
  const semDados = n < 5;
  const semPlacar = baseline.n_com_placar === 0;

  // Helpers
  const cantosProGeral = baseline.cantos_pro_geral || 0;
  const cantosSofGeral = baseline.cantos_sofridos_geral || 0;
  const golsProGeral   = baseline.gols_pro_geral;
  const golsSofGeral   = baseline.gols_sofridos_geral;
  const cantosProCasa  = baseline.cantos_pro_casa || 0;
  const cantosProFora  = baseline.cantos_pro_fora || 0;
  const mediaLigaCantos = baselineLiga.media_cantos_pro_time || 0;
  const mediaLigaGols   = baselineLiga.media_gols_pro_time;
  const cantosProHt    = baseline.cantos_pro_ht_geral || 0;
  const cantosSofHt    = baseline.cantos_sof_ht_geral || 0;

  // 1. BLITZ_INICIAL — cantos_HT_pro / cantos_FT_pro >= 0.50 E n >= 5
  {
    const ratio = cantosProGeral > 0 ? cantosProHt / cantosProGeral : 0;
    const presente = n >= 5 && ratio >= 0.50;
    out.push({
      nome: 'BLITZ_INICIAL',
      presente,
      evidencia: { cantos_pro_ht: cantosProHt, cantos_pro_ft: cantosProGeral, ratio: r(ratio, 2), n },
      qualifier: n < 3 ? 'amostra_insuficiente' : n < 5 ? 'sugestivo' : 'consolidado'
    });
  }

  // 2. RETRANCA_AVANCADA — cantos_sofridos_HT / cantos_sofridos_FT <= 0.35 E n >= 5
  {
    const ratio = cantosSofGeral > 0 ? cantosSofHt / cantosSofGeral : 0;
    const presente = n >= 5 && ratio <= 0.35 && cantosSofGeral > 0;
    out.push({
      nome: 'RETRANCA_AVANCADA',
      presente,
      evidencia: { cantos_sof_ht: cantosSofHt, cantos_sof_ft: cantosSofGeral, ratio: r(ratio, 2), n },
      qualifier: n < 3 ? 'amostra_insuficiente' : n < 5 ? 'sugestivo' : 'consolidado'
    });
  }

  // 3. EFETIVIDADE_CLINICA — gols_pro/cantos_pro >= 0.30 E cantos_pro <= media_liga*0.95 E n>=5
  {
    if (semPlacar) {
      out.push({ nome: 'EFETIVIDADE_CLINICA', presente: false, nao_avaliavel: 'sem_dados_placar', evidencia: { n }, qualifier: 'amostra_insuficiente' });
    } else {
      const ratioGolCanto = cantosProGeral > 0 ? golsProGeral / cantosProGeral : 0;
      const cantosAbaixoMedia = cantosProGeral <= mediaLigaCantos * 0.95;
      const presente = n >= 5 && ratioGolCanto >= 0.30 && cantosAbaixoMedia;
      out.push({
        nome: 'EFETIVIDADE_CLINICA',
        presente,
        evidencia: { gols_pro: golsProGeral, cantos_pro: cantosProGeral, ratio_gol_canto: r(ratioGolCanto, 2), media_liga_cantos: mediaLigaCantos, n },
        qualifier: n < 3 ? 'amostra_insuficiente' : n < 5 ? 'sugestivo' : 'consolidado'
      });
    }
  }

  // 4. ATAQUE_ESTERIL — cantos_pro>=media_liga E gols_pro<=media_liga_gols*0.7 E (cantos/max(gols,0.1))>=4.5 E n>=5
  {
    if (semPlacar) {
      out.push({ nome: 'ATAQUE_ESTERIL', presente: false, nao_avaliavel: 'sem_dados_placar', evidencia: { n }, qualifier: 'amostra_insuficiente' });
    } else {
      const cantosAcimaMedia = cantosProGeral >= mediaLigaCantos;
      const golsBaixos = golsProGeral <= (mediaLigaGols || 0) * 0.7;
      const ratioCantoGol = cantosProGeral / Math.max(golsProGeral || 0, 0.1);
      const presente = n >= 5 && cantosAcimaMedia && golsBaixos && ratioCantoGol >= 4.5;
      out.push({
        nome: 'ATAQUE_ESTERIL',
        presente,
        evidencia: { cantos_pro: cantosProGeral, gols_pro: golsProGeral, ratio_canto_gol: r(ratioCantoGol, 2), media_liga_cantos: mediaLigaCantos, media_liga_gols: mediaLigaGols, n },
        qualifier: n < 3 ? 'amostra_insuficiente' : n < 5 ? 'sugestivo' : 'consolidado'
      });
    }
  }

  // 5. MURO_DEFENSIVO — cantos_sofridos<=media_liga*0.7 E gols_sofridos<=media_liga_gols*0.7 E n>=5
  {
    if (semPlacar) {
      out.push({ nome: 'MURO_DEFENSIVO', presente: false, nao_avaliavel: 'sem_dados_placar', evidencia: { n }, qualifier: 'amostra_insuficiente' });
    } else {
      const cantosBaixos = cantosSofGeral <= mediaLigaCantos * 0.7;
      const golsBaixos = golsSofGeral <= (mediaLigaGols || 0) * 0.7;
      const presente = n >= 5 && cantosBaixos && golsBaixos;
      out.push({
        nome: 'MURO_DEFENSIVO',
        presente,
        evidencia: { cantos_sof: cantosSofGeral, gols_sof: golsSofGeral, media_liga_cantos: mediaLigaCantos, media_liga_gols: mediaLigaGols, n },
        qualifier: n < 3 ? 'amostra_insuficiente' : n < 5 ? 'sugestivo' : 'consolidado'
      });
    }
  }

  // 6. DEFESA_PRECARIA — cantos_sofridos>=media_liga*1.3 E gols_sofridos>=media_liga_gols*1.3 E n>=5
  {
    if (semPlacar) {
      out.push({ nome: 'DEFESA_PRECARIA', presente: false, nao_avaliavel: 'sem_dados_placar', evidencia: { n }, qualifier: 'amostra_insuficiente' });
    } else {
      const cantosAltos = cantosSofGeral >= mediaLigaCantos * 1.3;
      const golsAltos = golsSofGeral >= (mediaLigaGols || 0) * 1.3;
      const presente = n >= 5 && cantosAltos && golsAltos;
      out.push({
        nome: 'DEFESA_PRECARIA',
        presente,
        evidencia: { cantos_sof: cantosSofGeral, gols_sof: golsSofGeral, media_liga_cantos: mediaLigaCantos, media_liga_gols: mediaLigaGols, n },
        qualifier: n < 3 ? 'amostra_insuficiente' : n < 5 ? 'sugestivo' : 'consolidado'
      });
    }
  }

  // 7. RUPTURA_HOME — |cantos_pro_casa - cantos_pro_fora| >= 2.0
  {
    const diff = Math.abs(cantosProCasa - cantosProFora);
    const presente = diff >= 2.0 && baseline.n_jogos_casa >= 3 && baseline.n_jogos_fora >= 3;
    out.push({
      nome: 'RUPTURA_HOME',
      presente,
      evidencia: { cantos_pro_casa: cantosProCasa, cantos_pro_fora: cantosProFora, diferenca: r(diff), n_casa: baseline.n_jogos_casa, n_fora: baseline.n_jogos_fora },
      qualifier: (baseline.n_jogos_casa < 3 || baseline.n_jogos_fora < 3) ? 'amostra_insuficiente' : 'consolidado'
    });
  }

  // 8. ELITE_KILLER — cantos_pro_vs_elite > cantos_pro_vs_azarao E n_elite>=3 E n_azarao>=3
  {
    const bElite = [...(buckets.casa_vs_elite ? [buckets.casa_vs_elite] : []), ...(buckets.fora_vs_elite ? [buckets.fora_vs_elite] : [])];
    const bAzarao = [...(buckets.casa_vs_azarao ? [buckets.casa_vs_azarao] : []), ...(buckets.fora_vs_azarao ? [buckets.fora_vs_azarao] : [])];
    const nElite = bElite.reduce((s, b) => s + (b.n || 0), 0);
    const nAzarao = bAzarao.reduce((s, b) => s + (b.n || 0), 0);
    const cpVsElite  = nElite > 0 ? bElite.reduce((s, b) => s + (b.cantos_pro_media || 0) * (b.n || 0), 0) / nElite : 0;
    const cpVsAzarao = nAzarao > 0 ? bAzarao.reduce((s, b) => s + (b.cantos_pro_media || 0) * (b.n || 0), 0) / nAzarao : 0;
    const presente = cpVsElite > cpVsAzarao && nElite >= 3 && nAzarao >= 3;
    out.push({
      nome: 'ELITE_KILLER',
      presente,
      evidencia: { cantos_pro_vs_elite: r(cpVsElite), cantos_pro_vs_azarao: r(cpVsAzarao), n_elite: nElite, n_azarao: nAzarao },
      qualifier: (nElite < 3 || nAzarao < 3) ? 'amostra_insuficiente' : 'consolidado'
    });
  }

  // 9. CARRINHO_FACIL — cantos_pro_vs_azarao >= baseline_pro*1.3 E win_rate_cantos_vs_azarao>=70 E n_azarao>=3
  {
    const bAzarao = [...(buckets.casa_vs_azarao ? [buckets.casa_vs_azarao] : []), ...(buckets.fora_vs_azarao ? [buckets.fora_vs_azarao] : [])];
    const nAzarao = bAzarao.reduce((s, b) => s + (b.n || 0), 0);
    const cpVsAzarao = nAzarao > 0 ? bAzarao.reduce((s, b) => s + (b.cantos_pro_media || 0) * (b.n || 0), 0) / nAzarao : 0;
    const wrVsAzarao = nAzarao > 0 ? bAzarao.reduce((s, b) => s + (b.win_rate_cantos_pct || 0) * (b.n || 0), 0) / nAzarao : 0;
    const presente = cpVsAzarao >= cantosProGeral * 1.3 && wrVsAzarao >= 70 && nAzarao >= 3;
    out.push({
      nome: 'CARRINHO_FACIL',
      presente,
      evidencia: { cantos_pro_vs_azarao: r(cpVsAzarao), baseline: cantosProGeral, win_rate_vs_azarao: r(wrVsAzarao, 1), n_azarao: nAzarao },
      qualifier: nAzarao < 3 ? 'amostra_insuficiente' : 'consolidado'
    });
  }

  // 10. DESEQUILIBRA_FAVORITO — categoria==ELITE: diferencial_vs_azarao>=2.0 E n>=3
  {
    if (categoria !== 'ELITE') {
      out.push({ nome: 'DESEQUILIBRA_FAVORITO', presente: false, nao_avaliavel: 'time_nao_eh_elite', evidencia: { categoria }, qualifier: 'amostra_insuficiente' });
    } else {
      const bAzarao = [...(buckets.casa_vs_azarao ? [buckets.casa_vs_azarao] : []), ...(buckets.fora_vs_azarao ? [buckets.fora_vs_azarao] : [])];
      const nAzarao = bAzarao.reduce((s, b) => s + (b.n || 0), 0);
      const difMed = nAzarao > 0 ? bAzarao.reduce((s, b) => s + (b.diferencial || 0) * (b.n || 0), 0) / nAzarao : 0;
      const presente = difMed >= 2.0 && nAzarao >= 3;
      out.push({
        nome: 'DESEQUILIBRA_FAVORITO',
        presente,
        evidencia: { diferencial_vs_azarao: r(difMed), n_azarao: nAzarao, categoria },
        qualifier: nAzarao < 3 ? 'amostra_insuficiente' : 'consolidado'
      });
    }
  }

  // 11. SUCUMBE_AZARAO — categoria==AZARÃO: em ≥60% dos jogos sofreu mais cantos que pró E n>=5
  {
    if (categoria !== 'AZARÃO') {
      out.push({ nome: 'SUCUMBE_AZARAO', presente: false, nao_avaliavel: 'time_nao_eh_azarao', evidencia: { categoria }, qualifier: 'amostra_insuficiente' });
    } else {
      let sofreuMais = 0;
      for (const j of jogosTime) {
        const ehCasa = j.mandante === time;
        const pro = ehCasa ? j.cantos.ft.m : j.cantos.ft.v;
        const sof = ehCasa ? j.cantos.ft.v : j.cantos.ft.m;
        if (sof > pro) sofreuMais++;
      }
      const pct = jogosTime.length > 0 ? (sofreuMais / jogosTime.length) * 100 : 0;
      const presente = n >= 5 && pct >= 60;
      out.push({
        nome: 'SUCUMBE_AZARAO',
        presente,
        evidencia: { jogos_sofrendo_mais: sofreuMais, total: jogosTime.length, pct: r(pct, 1), categoria, n },
        qualifier: n < 3 ? 'amostra_insuficiente' : n < 5 ? 'sugestivo' : 'consolidado'
      });
    }
  }

  // 12. TERMOMETRO_FORMA — desvio(últimos_5) > desvio(geral) * 1.5 E n>=5
  {
    if (n < 5) {
      out.push({ nome: 'TERMOMETRO_FORMA', presente: false, evidencia: { n }, qualifier: 'amostra_insuficiente' });
    } else {
      // Jogos do time ordenados por data — pega os últimos 5
      const cronologico = [...jogosTime].sort((a, b) => (a.data || '').localeCompare(b.data || ''));
      const ultimos5 = cronologico.slice(-5);
      const cantosPro5 = ultimos5.map(j => j.mandante === time ? j.cantos.ft.m : j.cantos.ft.v);
      const cantosProTodos = jogosTime.map(j => j.mandante === time ? j.cantos.ft.m : j.cantos.ft.v);
      const dev5 = desvio(cantosPro5);
      const devAll = desvio(cantosProTodos);
      const presente = dev5 > devAll * 1.5 && devAll > 0;
      out.push({
        nome: 'TERMOMETRO_FORMA',
        presente,
        evidencia: { desvio_ultimos_5: r(dev5), desvio_geral: r(devAll), ratio: devAll > 0 ? r(dev5 / devAll, 2) : null, n },
        qualifier: 'consolidado'
      });
    }
  }

  return out;
}

module.exports = { NOMES, evalSign };
