// FASE 2 — Análise rodada por rodada (overdispersion temporal)
// FASE 3 — Backtest de regras DNA hipotéticas

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
function totalFT(j) { return j.cantos.ft.m + j.cantos.ft.v; }
function diffFT(j) { return Math.abs(j.cantos.ft.m - j.cantos.ft.v); }
function totalHT(j) { return j.cantos.ht ? (j.cantos.ht.m||0)+(j.cantos.ht.v||0) : 0; }

const memMaster = JSON.parse(fs.readFileSync(path.join(ROOT, 'Auditoria Especialista em cantos/_AnaliseDNA/_MEMORIA_TIMES_MASTER.json'), 'utf-8'));
function normNome(s){return (s||'').toLowerCase().replace(/[^a-z0-9]/g,'');}
function getDna(liga, nome) {
  const m = memMaster[liga];
  if (!m || !m.times) return null;
  if (m.times[nome]) return m.times[nome];
  const alvo = normNome(nome);
  const k = Object.keys(m.times).find(x => {
    const nx = normNome(x);
    return nx===alvo || nx.startsWith(alvo.slice(0,6)) || alvo.startsWith(nx.slice(0,6));
  });
  return k ? m.times[k] : null;
}
function temAss(dna, nome) {
  if (!dna || !dna.assinaturas) return false;
  return dna.assinaturas.some(a => a.nome===nome && a.presente && a.qualifier==='consolidado');
}
function ps(dna) { return dna && dna.identidade ? dna.identidade.powerScore : null; }
function cat(dna) { return dna && dna.identidade ? dna.identidade.categoria : null; }

// ============ FASE 3 — Backtest de regras DNA ============
console.log('═══════════════════════════════════════════════════════');
console.log('  FASE 3 — Backtest de Regras DNA (N=1717 jogos)');
console.log('═══════════════════════════════════════════════════════\n');

// Função genérica: aplica regra a todos os jogos das 9 ligas e calcula WR
function backtestRegra(nome, predicado, linha, direcao) {
  const jogosAtende = [];
  Object.entries(LIGAS_ARQS).forEach(([liga, arq]) => {
    const ds = carregaDataset(arq);
    (ds.jogos || []).filter(jogoValido).forEach(j => {
      const dM = getDna(liga, j.mandante);
      const dV = getDna(liga, j.visitante);
      if (predicado(j, dM, dV, liga)) {
        jogosAtende.push({ liga, j, total: totalFT(j), dM, dV });
      }
    });
  });
  if (jogosAtende.length === 0) return { regra: nome, n: 0, wr: 0, dir: direcao, linha };

  let acertos = 0;
  jogosAtende.forEach(x => {
    const bate = direcao === 'OVER' ? x.total > linha : x.total < linha;
    if (bate) acertos++;
  });

  // WR por liga
  const porLiga = {};
  jogosAtende.forEach(x => {
    porLiga[x.liga] = porLiga[x.liga] || { n: 0, acertos: 0 };
    porLiga[x.liga].n++;
    const bate = direcao === 'OVER' ? x.total > linha : x.total < linha;
    if (bate) porLiga[x.liga].acertos++;
  });

  return {
    regra: nome, n: jogosAtende.length, acertos, wr: 100 * acertos / jogosAtende.length,
    dir: direcao, linha, porLiga
  };
}

// =========== TESTES DE REGRAS ===========
const regras = [];

// R1: Mandante DEFESA_PRECARIA → Over 9.5 (testar minha hipótese nova)
regras.push(backtestRegra(
  'Mandante DEFESA_PRECARIA → Over 9.5 FT',
  (j, dM) => temAss(dM, 'DEFESA_PRECARIA'),
  9.5, 'OVER'
));
regras.push(backtestRegra(
  'Mandante DEFESA_PRECARIA → Under 9.5 FT (negativo: deveria errar)',
  (j, dM) => temAss(dM, 'DEFESA_PRECARIA'),
  9.5, 'UNDER'
));

// R2: Dois MURO_DUPLO → Under 9.5
regras.push(backtestRegra(
  'Dois MURO_DUPLO → Under 9.5 FT',
  (j, dM, dV) => {
    const pM = dM && dM.identidade ? dM.identidade.perfil_dna : '';
    const pV = dV && dV.identidade ? dV.identidade.perfil_dna : '';
    return pM === 'MURO_DUPLO' && pV === 'MURO_DUPLO';
  },
  9.5, 'UNDER'
));

// R3: Mandante BLITZ_INICIAL → Over HT 3.5
regras.push(backtestRegra(
  'Mandante BLITZ_INICIAL → Over HT 3.5',
  (j, dM) => {
    if (!temAss(dM, 'BLITZ_INICIAL')) return false;
    return j.cantos && j.cantos.ht && typeof j.cantos.ht.m === 'number';
  },
  3.5, 'OVER'
));
// Sobrescrever pra usar HT
regras[regras.length-1] = (() => {
  let acertos = 0, n = 0;
  const porLiga = {};
  Object.entries(LIGAS_ARQS).forEach(([liga, arq]) => {
    const ds = carregaDataset(arq);
    (ds.jogos || []).filter(jogoValido).forEach(j => {
      if (!j.cantos.ht || typeof j.cantos.ht.m !== 'number') return;
      const dM = getDna(liga, j.mandante);
      if (!temAss(dM, 'BLITZ_INICIAL')) return;
      n++;
      porLiga[liga] = porLiga[liga] || { n:0, acertos:0 };
      porLiga[liga].n++;
      if (totalHT(j) > 3.5) { acertos++; porLiga[liga].acertos++; }
    });
  });
  return { regra: 'Mandante BLITZ_INICIAL → Over HT 3.5', n, acertos, wr: 100*acertos/n, dir:'OVER', linha:3.5, porLiga };
})();

// R4: ELITE (PS>=80) em casa vs AZARÃO (PS<=30) → Over 9.5
regras.push(backtestRegra(
  'ELITE casa (PS≥80) vs AZARÃO fora (PS≤30) → Over 9.5',
  (j, dM, dV) => {
    const psM = ps(dM), psV = ps(dV);
    return psM != null && psV != null && psM >= 80 && psV <= 30;
  },
  9.5, 'OVER'
));
// Mesmo cruzamento → HDP cantos: mandante vence cantos por 2.5+?
regras.push((() => {
  let acertos = 0, n = 0;
  const porLiga = {};
  Object.entries(LIGAS_ARQS).forEach(([liga, arq]) => {
    const ds = carregaDataset(arq);
    (ds.jogos || []).filter(jogoValido).forEach(j => {
      const dM = getDna(liga, j.mandante), dV = getDna(liga, j.visitante);
      const psM = ps(dM), psV = ps(dV);
      if (psM == null || psV == null || psM < 80 || psV > 30) return;
      n++;
      porLiga[liga] = porLiga[liga] || { n:0, acertos:0 };
      porLiga[liga].n++;
      // HDP -2.5 cantos: mandante faz ≥ visitante + 3
      if ((j.cantos.ft.m - j.cantos.ft.v) >= 3) { acertos++; porLiga[liga].acertos++; }
    });
  });
  return { regra: 'ELITE casa (PS≥80) vs AZARÃO fora (PS≤30) → HDP -2.5 cantos (diff≥3)', n, acertos, wr: 100*acertos/n, dir:'HDP', linha:-2.5, porLiga };
})());

// R5: Dois com EFETIVIDADE_CLINICA → Under 9.5
regras.push(backtestRegra(
  'Dois com EFETIVIDADE_CLINICA → Under 9.5',
  (j, dM, dV) => temAss(dM, 'EFETIVIDADE_CLINICA') && temAss(dV, 'EFETIVIDADE_CLINICA'),
  9.5, 'UNDER'
));

// R6: Mandante CARRINHO_FACIL vs AZARÃO → Over 9.5
regras.push(backtestRegra(
  'Mandante CARRINHO_FACIL vs AZARÃO (PS≤30) → Over 9.5',
  (j, dM, dV) => temAss(dM, 'CARRINHO_FACIL') && ps(dV) != null && ps(dV) <= 30,
  9.5, 'OVER'
));

// R7: Visitante SUCUMBE_AZARAO → Over 9.5
regras.push(backtestRegra(
  'Visitante AZARÃO com SUCUMBE_AZARAO → Over 9.5',
  (j, dM, dV) => temAss(dV, 'SUCUMBE_AZARAO'),
  9.5, 'OVER'
));

// R8: ATAQUE_ESTERIL no mandante → Over 9.5 (gera cantos sem converter)
regras.push(backtestRegra(
  'Mandante ATAQUE_ESTERIL → Over 9.5',
  (j, dM) => temAss(dM, 'ATAQUE_ESTERIL'),
  9.5, 'OVER'
));

// R9: Mandante MURO_DEFENSIVO → Under 9.5
regras.push(backtestRegra(
  'Mandante MURO_DEFENSIVO → Under 9.5',
  (j, dM) => temAss(dM, 'MURO_DEFENSIVO'),
  9.5, 'UNDER'
));

// R10: PS_diff ≥ 50 (favorito MUITO forte) → Over 9.5 + HDP -2
regras.push(backtestRegra(
  'PS_diff ≥ 50 (assimetria forte mandante) → Over 9.5',
  (j, dM, dV) => {
    const a = ps(dM), b = ps(dV);
    return a != null && b != null && (a - b) >= 50;
  },
  9.5, 'OVER'
));
regras.push((() => {
  let acertos = 0, n = 0;
  const porLiga = {};
  Object.entries(LIGAS_ARQS).forEach(([liga, arq]) => {
    const ds = carregaDataset(arq);
    (ds.jogos || []).filter(jogoValido).forEach(j => {
      const dM = getDna(liga, j.mandante), dV = getDna(liga, j.visitante);
      const a = ps(dM), b = ps(dV);
      if (a == null || b == null || (a - b) < 50) return;
      n++;
      porLiga[liga] = porLiga[liga] || { n:0, acertos:0 };
      porLiga[liga].n++;
      if ((j.cantos.ft.m - j.cantos.ft.v) >= 3) { acertos++; porLiga[liga].acertos++; }
    });
  });
  return { regra: 'PS_diff ≥ 50 → HDP -2.5 cantos mandante', n, acertos, wr: 100*acertos/n, dir:'HDP', linha:-2.5, porLiga };
})());

// R11: ELITE vs ELITE (ambos PS≥70) → qual mercado bate?
regras.push(backtestRegra(
  'ELITE×ELITE (ambos PS≥70) → Over 9.5',
  (j, dM, dV) => {
    const a = ps(dM), b = ps(dV);
    return a != null && b != null && a >= 70 && b >= 70;
  },
  9.5, 'OVER'
));
regras.push(backtestRegra(
  'ELITE×ELITE (ambos PS≥70) → Under 9.5',
  (j, dM, dV) => {
    const a = ps(dM), b = ps(dV);
    return a != null && b != null && a >= 70 && b >= 70;
  },
  9.5, 'UNDER'
));

// R12: Linha 8.5 em ARG/ARG_B/USL (ligas trucadas/equilibradas com baseline baixo)
regras.push((() => {
  let acertos = 0, n = 0;
  const porLiga = {};
  ['ARG','ARG_B','USL'].forEach(liga => {
    const ds = carregaDataset(LIGAS_ARQS[liga]);
    (ds.jogos || []).filter(jogoValido).forEach(j => {
      n++;
      porLiga[liga] = porLiga[liga] || { n:0, acertos:0 };
      porLiga[liga].n++;
      if (totalFT(j) < 8.5) { acertos++; porLiga[liga].acertos++; }
    });
  });
  return { regra: 'ARG/ARG_B/USL → Under 8.5 FT (linha trucada)', n, acertos, wr: 100*acertos/n, dir:'UNDER', linha:8.5, porLiga };
})());

// R13: Linha 10.5 em BR/BR_B/MLS (ligas ofensivas com baseline alto)
regras.push((() => {
  let acertos = 0, n = 0;
  const porLiga = {};
  ['BR','BR_B','MLS','J2_J3'].forEach(liga => {
    const ds = carregaDataset(LIGAS_ARQS[liga]);
    (ds.jogos || []).filter(jogoValido).forEach(j => {
      n++;
      porLiga[liga] = porLiga[liga] || { n:0, acertos:0 };
      porLiga[liga].n++;
      if (totalFT(j) > 10.5) { acertos++; porLiga[liga].acertos++; }
    });
  });
  return { regra: 'BR/BR_B/MLS/J2_J3 → Over 10.5 FT (linha ofensiva)', n, acertos, wr: 100*acertos/n, dir:'OVER', linha:10.5, porLiga };
})());

// IMPRESSÃO
regras.forEach(r => {
  const tag = r.wr >= 65 ? '🟢' : (r.wr >= 55 ? '🟡' : (r.wr >= 45 ? '⚪' : '🔴'));
  console.log(`${tag} ${r.regra}`);
  console.log(`   N=${r.n} | WR=${r.wr.toFixed(1)}% | Direção: ${r.dir} ${r.linha}`);
  if (r.porLiga && Object.keys(r.porLiga).length > 0) {
    const breakdown = Object.entries(r.porLiga)
      .filter(([_,v])=>v.n>=5)
      .sort((a,b)=>b[1].acertos/b[1].n - a[1].acertos/a[1].n)
      .map(([l,v]) => `${l}:${v.acertos}/${v.n}(${(100*v.acertos/v.n).toFixed(0)}%)`).join(' | ');
    if (breakdown) console.log(`   Por liga (N≥5): ${breakdown}`);
  }
  console.log('');
});

// Salva
fs.writeFileSync(path.join(__dirname, 'fase3_regras.json'), JSON.stringify(regras, null, 2));
console.log('💾 Fase 3 salva em fase3_regras.json\n');
