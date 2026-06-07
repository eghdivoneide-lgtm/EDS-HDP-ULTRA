// ═══════════════════════════════════════════════════════════
// AUDITORIA: PROJEÇÕES PRÉ-JOGO 26/04 vs RESULTADOS REAIS
// Compara o que o motor disse vs o que aconteceu
// ═══════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');

const AUDIT_FILE = path.join(__dirname, '..', 'Auditoria Especialista em cantos', 'Auditoria copleta', 'auditoria_completa_2026-04-26.json');
const DATA_DIR = path.join(__dirname, '..', 'data');

const audit = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf8'));

const FILES = {
  BR: 'brasileirao2026.js', ARG: 'argentina2026.js', ARG_B: 'argentina_b2026.js',
  MLS: 'mls2026.js', USL: 'usl2026.js', BUN: 'bundesliga2026.js',
  ALM: 'aleague2026.js', J1: 'j1league2026.js', CHI: 'chile2026.js', ECU: 'equador2026.js'
};

// Carrega resultados reais
const resultadosPorLiga = {};
for (const [code, file] of Object.entries(FILES)) {
  try {
    const code_js = fs.readFileSync(path.join(DATA_DIR, file), 'utf8');
    const ctx = { window: {} };
    new Function('window', code_js)(ctx.window);
    const d = ctx.window[Object.keys(ctx.window)[0]];
    resultadosPorLiga[code] = d.jogos.filter(j => j.data === '2026-04-26');
  } catch(e) { console.error('Erro carregando ' + code, e.message); }
}

function _norm(s) {
  return (s||'').toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g,'')
    .replace(/['.\-]/g,'').replace(/\s+/g,' ').trim();
}
function matchJogo(m, v, jogos) {
  const nm = _norm(m), nv = _norm(v);
  return jogos.find(j => {
    const jm = _norm(j.mandante), jv = _norm(j.visitante);
    return (jm === nm || jm.includes(nm) || nm.includes(jm))
        && (jv === nv || jv.includes(nv) || nv.includes(jv));
  });
}

// ── AVALIADORES ──
function avaliarReis(reis, jogo, mandante, visitante) {
  if (!reis || !jogo) return null;
  const cm = jogo.cantos.ft.m, cv = jogo.cantos.ft.v;
  if (cm === cv) return 'PUSH';
  const vencedorReal = cm > cv ? mandante : visitante;
  return _norm(reis.vencedor) === _norm(vencedorReal) ? 'GREEN' : 'RED';
}
function avaliarBP(bp, jogo, mandante, visitante) {
  if (!bp || !jogo || !jogo.placar) return null;
  const pm = jogo.placar.m, pv = jogo.placar.v;
  if (pm === pv) return 'PUSH';
  const vencedorJogo = pm > pv ? mandante : visitante;
  return _norm(bp.time) === _norm(vencedorJogo) ? 'GREEN' : 'RED';
}
function avaliarEnigma(enigma, jogo) {
  if (!enigma || !jogo) return null;
  if (enigma.classificacao !== 'ATIVO' && enigma.classificacao !== 'WATCH') return null;
  if (!enigma.linhaFT) return null;
  const linhaNum = Math.abs(parseFloat(enigma.linhaFT));
  const cm = jogo.cantos.ft.m, cv = jogo.cantos.ft.v;
  const vantagem = enigma.sinalInverso ? (cv - cm) : (cm - cv);
  if (vantagem > linhaNum) return 'GREEN';
  if (vantagem === linhaNum) return 'PUSH';
  return 'RED';
}
function avaliarCisne(reis, jogo, mandante, visitante) {
  if (!reis || !jogo) return null;
  const cm = jogo.cantos.ft.m, cv = jogo.cantos.ft.v;
  const apostaMandante = _norm(reis.vencedor) === _norm(mandante);
  const vantagem = apostaMandante ? (cm - cv) : (cv - cm);
  return vantagem >= 2.0 ? 'GREEN' : 'RED';
}

// ── ROLLUPS ──
const _zero = () => ({ g: 0, r: 0, p: 0 });
const total = {
  reis: _zero(), reis_abs: _zero(), reis_dom: _zero(), reis_mod: _zero(),
  bp: _zero(), bp_nuc: _zero(), bp_forte: _zero(),
  enigma_ativo: _zero(), enigma_watch: _zero(),
  cisne: _zero(),
  conv4: _zero(), conv3: _zero(),
  mandante: _zero(), visitante: _zero()
};
const porLiga = {};
const naoEncontrados = [];

for (const [code, snap] of Object.entries(audit.ligas)) {
  if (!snap.teacher || snap.status !== 'ok') continue;
  if (!resultadosPorLiga[code]) continue;
  porLiga[code] = { reis: _zero(), bp: _zero(), enigma: _zero(), cisne: _zero() };
  const jogosReais = resultadosPorLiga[code];

  snap.teacher.forEach(t => {
    if (!t.valido) return;
    const jogo = matchJogo(t.m, t.v, jogosReais);
    if (!jogo) {
      naoEncontrados.push(code + ': ' + t.m + ' x ' + t.v);
      return;
    }

    // Reis
    const rReis = avaliarReis(t.reis, jogo, t.m, t.v);
    if (rReis) {
      const k = rReis === 'GREEN' ? 'g' : (rReis === 'RED' ? 'r' : 'p');
      total.reis[k]++;
      porLiga[code].reis[k]++;
      // Por faixa
      if (t.reis.faixa === 'ABSOLUTO') total.reis_abs[k]++;
      else if (t.reis.faixa === 'DOMINANTE') total.reis_dom[k]++;
      else if (t.reis.faixa === 'MODERADO') total.reis_mod[k]++;
      // Por lado
      const apostaMand = _norm(t.reis.vencedor) === _norm(t.m);
      if (apostaMand) total.mandante[k]++;
      else total.visitante[k]++;
    }

    // BP
    const rBP = avaliarBP(t.bp, jogo, t.m, t.v);
    if (rBP) {
      const k = rBP === 'GREEN' ? 'g' : (rBP === 'RED' ? 'r' : 'p');
      total.bp[k]++;
      porLiga[code].bp[k]++;
      if (t.bp && t.bp.faixa === 'NUCLEAR') total.bp_nuc[k]++;
      else if (t.bp && t.bp.faixa === 'FORTE') total.bp_forte[k]++;
    }

    // Enigma
    const enigmaJogo = (snap.enigma || []).find(e => _norm(e.m)===_norm(t.m) && _norm(e.v)===_norm(t.v));
    let rEnig = null;
    if (enigmaJogo) {
      rEnig = avaliarEnigma(enigmaJogo, jogo);
      if (rEnig) {
        const k = rEnig === 'GREEN' ? 'g' : (rEnig === 'RED' ? 'r' : 'p');
        if (enigmaJogo.classificacao === 'ATIVO') total.enigma_ativo[k]++;
        else total.enigma_watch[k]++;
        porLiga[code].enigma[k]++;
      }
    }

    // Cisne
    const naCisne = (snap.cisne || []).some(c => _norm(c.m)===_norm(t.m) && _norm(c.v)===_norm(t.v));
    let rCisne = null;
    if (naCisne) {
      rCisne = avaliarCisne(t.reis, jogo, t.m, t.v);
      if (rCisne) {
        const k = rCisne === 'GREEN' ? 'g' : (rCisne === 'RED' ? 'r' : 'p');
        total.cisne[k]++;
        porLiga[code].cisne[k]++;
      }
    }

    // Convergência: 4 motores apontando mesmo lado
    if (t.reis && t.bp && enigmaJogo && naCisne) {
      const mesmoLado = _norm(t.reis.vencedor) === _norm(t.bp.time);
      const enigmaConfirma = enigmaJogo.classificacao === 'ATIVO' &&
        ((enigmaJogo.sinalInverso && _norm(t.reis.vencedor) === _norm(t.v)) ||
         (!enigmaJogo.sinalInverso && _norm(t.reis.vencedor) === _norm(t.m)));
      if (mesmoLado && enigmaConfirma) {
        // Conv 4/4: usa Reis como veredito
        const k = rReis === 'GREEN' ? 'g' : (rReis === 'RED' ? 'r' : 'p');
        total.conv4[k]++;
      }
    }
  });
}

// ── RELATÓRIO ──
const hr = (m) => {
  const tot = m.g + m.r + m.p;
  if (tot === 0) return '—';
  const taxa = (100 * m.g / Math.max(1, tot - m.p)).toFixed(1);
  return taxa + '% (' + m.g + 'G ' + m.r + 'R ' + m.p + 'P · n=' + tot + ')';
};

console.log('═══════════════════════════════════════════════════════════');
console.log('AUDITORIA REAL: PROJEÇÕES 26/04 vs RESULTADOS DA RODADA');
console.log('═══════════════════════════════════════════════════════════');
console.log();
console.log('🎯 HIT RATE GLOBAL POR MOTOR');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🦢 CISNE NEGRO (vantagem ≥2.0 cantos no Reis):  ' + hr(total.cisne));
console.log('👑 REIS DOS CANTOS (vencedor de cantos):        ' + hr(total.reis));
console.log('🐺 BALA DE PRATA (vencedor jogo MO):            ' + hr(total.bp));
console.log('🔮 ENIGMA ATIVO (linha HDP -X):                 ' + hr(total.enigma_ativo));
console.log('👁️  ENIGMA WATCH (linha HDP -X):                 ' + hr(total.enigma_watch));
console.log('🏆 CONVERGÊNCIA 4/4 motores:                   ' + hr(total.conv4));
console.log();
console.log('🎯 REIS — POR FAIXA DE FAVORITISMO');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  ABSOLUTO (odd ≤ 1.30):    ' + hr(total.reis_abs));
console.log('  DOMINANTE (odd 1.30-1.50): ' + hr(total.reis_dom));
console.log('  MODERADO (odd 1.50-1.75):  ' + hr(total.reis_mod));
console.log();
console.log('🎯 BALA DE PRATA — POR FAIXA');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  NUCLEAR (super-favorito):  ' + hr(total.bp_nuc));
console.log('  FORTE:                     ' + hr(total.bp_forte));
console.log();
console.log('🎯 LADO — REIS APONTOU MANDANTE OU VISITANTE');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  🏠 MANDANTE apontado:    ' + hr(total.mandante));
console.log('  ✈️  VISITANTE apontado:   ' + hr(total.visitante));
console.log();
console.log('🌍 HIT RATE POR LIGA — REIS DOS CANTOS');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
Object.entries(porLiga).forEach(([code, m]) => {
  if (m.reis.g + m.reis.r + m.reis.p > 0) console.log('  ' + code.padEnd(6) + 'Reis: ' + hr(m.reis));
});
console.log();
console.log('🌍 HIT RATE POR LIGA — CISNE NEGRO');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
Object.entries(porLiga).forEach(([code, m]) => {
  if (m.cisne.g + m.cisne.r + m.cisne.p > 0) console.log('  ' + code.padEnd(6) + 'Cisne: ' + hr(m.cisne));
});
console.log();
console.log('🌍 HIT RATE POR LIGA — ENIGMA');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
Object.entries(porLiga).forEach(([code, m]) => {
  if (m.enigma.g + m.enigma.r + m.enigma.p > 0) console.log('  ' + code.padEnd(6) + 'Enigma: ' + hr(m.enigma));
});
console.log();
console.log('🌍 HIT RATE POR LIGA — BALA DE PRATA');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
Object.entries(porLiga).forEach(([code, m]) => {
  if (m.bp.g + m.bp.r + m.bp.p > 0) console.log('  ' + code.padEnd(6) + 'BP: ' + hr(m.bp));
});
console.log();
if (naoEncontrados.length > 0) {
  console.log('⚠️  Jogos não pareados (' + naoEncontrados.length + '):');
  naoEncontrados.slice(0, 15).forEach(j => console.log('  ' + j));
}
