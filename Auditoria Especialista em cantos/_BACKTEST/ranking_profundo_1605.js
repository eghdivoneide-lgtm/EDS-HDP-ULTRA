// Ranking FINAL — usa análise profunda jogo-a-jogo REAL.
// Linhas FIXAS: 4.5 HT e 9.5 FT.
// Critérios:
// - Margem ≥ 1.5 FT / ≥ 1.0 HT (para evitar borderline)
// - n_relevantes ≥ 5
// - over95Pct EMPÍRICO alinhado (UNDER ≤ 45%, OVER ≥ 65%)
// - Assinaturas convergentes
// - Volatilidade controlada
// - 2-4 sinais por liga

const fs = require('fs');
const path = require('path');
const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'analise_profunda_real.json'), 'utf-8'));

function scorePick(j, mercado, lado) {
  const linha = mercado === 'HT' ? 4.5 : 9.5;
  const xval = mercado === 'HT' ? j.xHT : j.xFT;
  const margem = lado === 'UNDER' ? (linha - xval) : (xval - linha);

  // Margem mínima
  if (mercado === 'FT' && margem < 1.0) return null;
  if (mercado === 'HT' && margem < 0.7) return null;

  let score = margem;

  // Amostra
  if (j.n_relevantes < 4) return null;
  if (j.n_relevantes >= 8) score += 0.7;
  else if (j.n_relevantes >= 6) score += 0.4;
  else if (j.n_relevantes >= 5) score += 0.2;

  // Distribuição empírica (over9.5%)
  if (mercado === 'FT') {
    if (lado === 'UNDER') {
      if (j.over95Pct <= 25) score += 1.5;
      else if (j.over95Pct <= 40) score += 0.8;
      else if (j.over95Pct <= 50) score += 0.2;
      else if (j.over95Pct >= 65) score -= 1.5;
    } else { // OVER
      if (j.over95Pct >= 80) score += 1.5;
      else if (j.over95Pct >= 65) score += 0.8;
      else if (j.over95Pct >= 50) score += 0.2;
      else if (j.over95Pct <= 35) score -= 1.5;
    }
  }

  // Assinaturas
  const flags = [];
  if (j.assM.includes('BLITZ_INICIAL')) flags.push('M_BLITZ');
  if (j.assM.includes('RETRANCA_AVANCADA')) flags.push('M_RETRANCA');
  if (j.assM.includes('MURO_DEFENSIVO')) flags.push('M_MURO');
  if (j.assM.includes('DEFESA_PRECARIA')) flags.push('M_DEF_PRECARIA');
  if (j.assM.includes('RUPTURA_HOME')) flags.push('M_RUPTURA_HOME');
  if (j.assM.includes('ELITE_KILLER')) flags.push('M_ELITE_KILLER');
  if (j.assV.includes('BLITZ_INICIAL')) flags.push('V_BLITZ');
  if (j.assV.includes('RETRANCA_AVANCADA')) flags.push('V_RETRANCA');
  if (j.assV.includes('MURO_DEFENSIVO')) flags.push('V_MURO');
  if (j.assV.includes('DEFESA_PRECARIA')) flags.push('V_DEF_PRECARIA');
  if (j.assV.includes('ELITE_KILLER')) flags.push('V_ELITE_KILLER');
  if (j.volM === 'VOLATIL_ALTO') flags.push('M_VOLATIL');
  if (j.volV === 'VOLATIL_ALTO') flags.push('V_VOLATIL');

  if (lado === 'UNDER') {
    if (flags.includes('M_MURO')) score += 0.5;
    if (flags.includes('V_MURO')) score += 0.5;
    if (flags.includes('M_RETRANCA')) score += 0.3;
    if (flags.includes('V_RETRANCA')) score += 0.3;
    if (flags.includes('M_DEF_PRECARIA')) score -= 1.5;
    if (flags.includes('V_DEF_PRECARIA')) score -= 0.7;
    if (flags.includes('M_VOLATIL')) score -= 0.4;
    if (flags.includes('V_VOLATIL')) score -= 0.4;
    if (mercado === 'HT' && flags.includes('M_BLITZ')) score -= 0.6;
  } else {
    if (flags.includes('M_DEF_PRECARIA')) score += 0.7;
    if (flags.includes('V_DEF_PRECARIA')) score += 0.5;
    if (flags.includes('M_RUPTURA_HOME')) score += 0.3;
    if (flags.includes('M_MURO')) score -= 0.5;
    if (flags.includes('V_MURO')) score -= 0.5;
    if (mercado === 'HT' && flags.includes('M_BLITZ')) score += 0.6;
    if (mercado === 'HT' && flags.includes('V_BLITZ')) score += 0.4;
  }

  // Tendência
  const tendOver = ['ATAQUE_CRESCENTE', 'EM_EVOLUCAO_FORTE'];
  const tendUnder = ['DEFESA_MELHORANDO', 'ATAQUE_DECRESCENTE'];
  if (lado === 'UNDER') {
    if (tendUnder.includes(j.tendM)) score += 0.3;
    if (tendUnder.includes(j.tendV)) score += 0.3;
    if (tendOver.includes(j.tendM)) score -= 0.4;
    if (tendOver.includes(j.tendV)) score -= 0.4;
  } else {
    if (tendOver.includes(j.tendM)) score += 0.3;
    if (tendOver.includes(j.tendV)) score += 0.3;
    if (tendUnder.includes(j.tendM)) score -= 0.4;
    if (tendUnder.includes(j.tendV)) score -= 0.4;
  }

  return { score: +score.toFixed(2), margem: +margem.toFixed(2), flags };
}

function classificar(score) {
  if (score >= 4.0) return 'MÁXIMA';
  if (score >= 2.8) return 'ALTA';
  if (score >= 1.8) return 'ALTA-MÉDIA';
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
        n_relevantes: j.n_relevantes,
        over95Pct: j.over95Pct,
        flags: r.flags,
        conf: classificar(r.score),
        catM: j.ps.catM, catV: j.ps.catV,
        psM: j.ps.M, psV: j.ps.V,
        tendM: j.tendM, tendV: j.tendV,
        h2h: j.h2h,
        jogosM: j.jogosM_relevantes,
        jogosV: j.jogosV_relevantes
      });
    });
  });
  // Ordenar e descartar MÉDIA
  candidatos.sort((a, b) => b.score - a.score);
  // Evitar 2 picks no mesmo jogo (deixar só o melhor pick por jogo)
  const usados = new Set();
  const filtrados = candidatos.filter(c => {
    if (c.conf === 'MÉDIA') return false;
    if (usados.has(c.jogo)) return false;
    usados.add(c.jogo);
    return true;
  });
  ranking[liga] = filtrados.slice(0, 4);
});

fs.writeFileSync(path.join(__dirname, 'ranking_profundo_1605.json'), JSON.stringify(ranking, null, 2), 'utf-8');

Object.entries(ranking).forEach(([liga, picks]) => {
  console.log(`\n═══ ${liga} ═══`);
  if (picks.length === 0) { console.log('  (nenhum sinal qualificado)'); return; }
  picks.forEach((p, i) => {
    console.log(`\n  ${i + 1}. [${p.conf}] ${p.mercado} — ${p.jogo}`);
    console.log(`     score=${p.score} margem=${p.margem} | xFT=${p.xFT} xHT=${p.xHT} | n=${p.n_relevantes} over9.5=${p.over95Pct}%`);
    console.log(`     PS ${p.psM} (${p.catM}) × ${p.psV} (${p.catV})`);
    if (p.flags.length) console.log(`     flags: ${p.flags.join(', ')}`);
    if (p.h2h) console.log(`     h2h: ${p.h2h.data} (${p.h2h.ctx}) ${p.h2h.cantos} total=${p.h2h.total}`);
  });
});
