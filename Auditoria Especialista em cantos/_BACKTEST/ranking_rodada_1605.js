// Aplica filtros de qualidade na análise base e gera ranking por liga.
// Devolve 2-4 sinais por liga em Over/Under nas linhas FIXAS 4.5 HT e 9.5 FT.

const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'analise_rodada_1605.json'), 'utf-8'));

function scorePick(j, mercado, lado) {
  // mercado: 'HT' | 'FT'  | lado: 'OVER' | 'UNDER'
  const linha = mercado === 'HT' ? 4.5 : 9.5;
  const xval = mercado === 'HT' ? j.xHT : j.xFT;
  const margem = lado === 'UNDER' ? (linha - xval) : (xval - linha);

  // Score base: margem
  let score = margem;

  // Penalidade se margem ≤ 0.5 (linha apertada)
  if (margem < 0.5) score -= 2;
  if (margem < 0) return null;

  // Amostra
  const nM = j.bucketM ? j.bucketM.n : 0;
  const nV = j.bucketV ? j.bucketV.n : 0;
  const confM = j.bucketM ? j.bucketM.conf : 'sem_dado';
  const confV = j.bucketV ? j.bucketV.conf : 'sem_dado';

  // Boost: ambos buckets com "tendencia" ou melhor + n total ≥ 4
  if (nM + nV >= 4 && confM !== 'amostra_baixa' && confV !== 'amostra_baixa') score += 1.0;
  else if (nM + nV >= 3 && (confM !== 'amostra_baixa' || confV !== 'amostra_baixa')) score += 0.5;
  else if (nM + nV <= 2) score -= 1.0;

  // Convergência de buckets (variância baixa)
  if (j.xFTvariancia !== undefined && j.xFTvariancia <= 2.0 && nM > 0 && nV > 0) score += 0.5;
  if (j.xFTvariancia !== undefined && j.xFTvariancia >= 4.0) score -= 1.0;

  // Assinaturas
  if (lado === 'UNDER') {
    if (mercado === 'FT') {
      if (j.flags.includes('M_MURO')) score += 0.4;
      if (j.flags.includes('V_MURO')) score += 0.4;
      if (j.flags.includes('M_RETRANCA')) score += 0.3;
      if (j.flags.includes('V_RETRANCA')) score += 0.3;
      if (j.flags.includes('M_DEF_PRECARIA')) score -= 1.5;
      if (j.flags.includes('V_DEF_PRECARIA')) score -= 0.5;
      if (j.flags.includes('M_BLITZ')) score -= 0.2;
      if (j.flags.includes('V_BLITZ')) score -= 0.2;
    }
    if (mercado === 'HT') {
      if (j.flags.includes('M_RETRANCA')) score += 0.3;
      if (j.flags.includes('V_RETRANCA')) score += 0.3;
      if (j.flags.includes('M_BLITZ')) score -= 0.5;
      if (j.flags.includes('V_BLITZ')) score -= 0.3;
    }
    // VOLATIL é risco para Under (pode estourar)
    if (j.flags.includes('M_VOLATIL')) score -= 0.4;
    if (j.flags.includes('V_VOLATIL')) score -= 0.4;
  } else { // OVER
    if (mercado === 'FT') {
      if (j.flags.includes('M_DEF_PRECARIA')) score += 0.5;
      if (j.flags.includes('V_DEF_PRECARIA')) score += 0.5;
      if (j.flags.includes('M_RUPTURA_HOME')) score += 0.3;
      if (j.flags.includes('M_MURO')) score -= 0.5;
      if (j.flags.includes('V_MURO')) score -= 0.5;
    }
    if (mercado === 'HT') {
      if (j.flags.includes('M_BLITZ')) score += 0.5;
      if (j.flags.includes('V_BLITZ')) score += 0.3;
      if (j.flags.includes('M_MURO')) score -= 0.3;
      if (j.flags.includes('V_MURO')) score -= 0.3;
      if (j.flags.includes('M_RETRANCA')) score -= 0.4;
    }
  }

  // Tendência alinhada
  const tendValeUnder = ['DEFESA_MELHORANDO', 'ATAQUE_DECRESCENTE'];
  const tendValeOver = ['ATAQUE_CRESCENTE', 'EM_EVOLUCAO_FORTE'];
  if (lado === 'UNDER') {
    if (tendValeUnder.includes(j.tendM)) score += 0.3;
    if (tendValeUnder.includes(j.tendV)) score += 0.3;
    if (tendValeOver.includes(j.tendM)) score -= 0.4;
    if (tendValeOver.includes(j.tendV)) score -= 0.4;
  } else {
    if (tendValeOver.includes(j.tendM)) score += 0.3;
    if (tendValeOver.includes(j.tendV)) score += 0.3;
    if (tendValeUnder.includes(j.tendM)) score -= 0.4;
    if (tendValeUnder.includes(j.tendV)) score -= 0.4;
  }

  // Confirmação histórica via over9_5_pct
  if (mercado === 'FT') {
    const ovrM = j.bucketM ? j.bucketM.over95 : null;
    const ovrV = j.bucketV ? j.bucketV.over95 : null;
    if (lado === 'UNDER') {
      if (ovrM != null && ovrM === 0) score += 0.3;
      if (ovrV != null && ovrV === 0) score += 0.3;
      if (ovrM != null && ovrM === 100) score -= 1.0;
      if (ovrV != null && ovrV === 100) score -= 1.0;
    } else {
      if (ovrM != null && ovrM === 100) score += 0.5;
      if (ovrV != null && ovrV === 100) score += 0.5;
      if (ovrM != null && ovrM === 0) score -= 0.5;
      if (ovrV != null && ovrV === 0) score -= 0.5;
    }
  }

  return { score: +score.toFixed(2), margem: +margem.toFixed(2) };
}

function classificarConfianca(score) {
  if (score >= 3.5) return 'MÁXIMA';
  if (score >= 2.5) return 'ALTA';
  if (score >= 1.5) return 'ALTA-MÉDIA';
  return 'MÉDIA';
}

const ranking = {};
Object.entries(data).forEach(([liga, jogos]) => {
  const candidatos = [];
  jogos.forEach(j => {
    if (j.erro) return;
    [['HT', 'UNDER'], ['HT', 'OVER'], ['FT', 'UNDER'], ['FT', 'OVER']].forEach(([m, l]) => {
      const r = scorePick(j, m, l);
      if (!r) return;
      candidatos.push({
        jogo: j.jogo,
        mercado: `${l} ${m === 'HT' ? '4.5 HT' : '9.5 FT'}`,
        score: r.score,
        margem: r.margem,
        xFT: j.xFT, xHT: j.xHT,
        n: (j.bucketM ? j.bucketM.n : 0) + (j.bucketV ? j.bucketV.n : 0),
        conf: classificarConfianca(r.score),
        flags: j.flags,
        bucketM: j.bucketM,
        bucketV: j.bucketV,
        catM: j.ps.catM, catV: j.ps.catV,
        tendM: j.tendM, tendV: j.tendV
      });
    });
  });
  candidatos.sort((a, b) => b.score - a.score);
  // Filtrar confiança ALTA-MÉDIA pra cima E descartar MÉDIA (regra Kofu × Gifu)
  ranking[liga] = candidatos.filter(c => c.conf !== 'MÉDIA').slice(0, 4);
});

fs.writeFileSync(path.join(__dirname, 'ranking_rodada_1605.json'), JSON.stringify(ranking, null, 2), 'utf-8');

Object.entries(ranking).forEach(([liga, picks]) => {
  console.log(`\n═══ ${liga} ═══`);
  if (picks.length === 0) { console.log('  (nenhum sinal com confiança ≥ ALTA-MÉDIA)'); return; }
  picks.forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.conf.padEnd(12)} | ${p.mercado.padEnd(15)} | ${p.jogo}`);
    console.log(`     score=${p.score} margem=${p.margem} n=${p.n} xFT=${p.xFT} xHT=${p.xHT}`);
    if (p.bucketM) console.log(`     M: ${p.bucketM.total} (n=${p.bucketM.n}, over9.5=${p.bucketM.over95}%, ${p.bucketM.conf})`);
    if (p.bucketV) console.log(`     V: ${p.bucketV.total} (n=${p.bucketV.n}, over9.5=${p.bucketV.over95}%, ${p.bucketV.conf})`);
    if (p.flags.length) console.log(`     flags: ${p.flags.join(',')}`);
  });
});
