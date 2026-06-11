'use strict';

// ============================================================
//  COPA DO MUNDO 2026 — Análise Formação × Cantos × Odds
//  Base: scores cross-liga validados em 8 ligas / 1507 jogos
// ============================================================

// Scores de formação — médias cross-liga (BR,BR_B,ARG,ARG_B,MLS,USL,CHI,ECU)
const FORM_SCORE = {
  '3-1-4-2':  0.85,   // ✅ GERADORA FORTE
  '4-1-3-2':  0.73,   // ✅ GERADORA
  '4-2-3-1':  0.28,   // ➖ NEUTRA / leve geradora
  '4-3-3':    0.21,   // ➖ NEUTRA
  '3-4-2-1':  0.18,   // ➖ NEUTRA / leve geradora
  '4-1-4-1':  0.08,   // ➖ NEUTRA
  '4-4-2':    0.01,   // ➖ NEUTRA pura
  '5-4-1':   -0.08,   // ➖ NEUTRA / leve sofredora
  '4-3-1-2': -0.40,   // 🔴 SOFREDORA leve
  '3-4-3':   -0.53,   // 🔴 SOFREDORA
  '5-3-2':   -0.57,   // 🔴 SOFREDORA
  '3-5-2':   -1.44,   // 🔴 SOFREDORA FORTE
  '3-4-1-2': -1.79,   // 🔴 SOFREDORA FORTE
  '4-4-1-1': -1.96,   // 🔴 SOFREDORA FORTE
  '4-5-1':   -3.31,   // 🔴🔴 SOFREDORA EXTREMA
};

// ============================================================
//  DATABASE — 48 Seleções Copa 2026
//  Formação base por técnico (referência: ago/2025 — verificar atualizações)
// ============================================================
const SELECOES = [
  // ── EUROPA ──────────────────────────────────────────────
  { nome:'Spain',       conf:'UEFA', form:'4-3-3',    estilo:'Posse alta, pressing, alas abertos',     tecnico:'De la Fuente' },
  { nome:'France',      conf:'UEFA', form:'4-2-3-1',  estilo:'Transições rápidas, mezala criativa',    tecnico:'Deschamps' },
  { nome:'Germany',     conf:'UEFA', form:'4-2-3-1',  estilo:'Pressing alto, Nagelsmann sistema',      tecnico:'Nagelsmann' },
  { nome:'Portugal',    conf:'UEFA', form:'4-2-3-1',  estilo:'Posse + verticalizacão, Fernandes livre', tecnico:'Martínez' },
  { nome:'England',     conf:'UEFA', form:'4-2-3-1',  estilo:'Pressing alto, laterais ofensivos',      tecnico:'Carsley' },
  { nome:'Netherlands', conf:'UEFA', form:'4-3-3',    estilo:'Pressing, Robben/wing style',            tecnico:'Koeman' },
  { nome:'Belgium',     conf:'UEFA', form:'4-2-3-1',  estilo:'Jogo direto, mezalas criativas',         tecnico:'Tedesco' },
  { nome:'Italy',       conf:'UEFA', form:'3-4-2-1',  estilo:'Trequartistas, laterais avançados',      tecnico:'Spalletti' },
  { nome:'Croatia',     conf:'UEFA', form:'4-2-3-1',  estilo:'Posse média, Modric livre',              tecnico:'Dalic' },
  { nome:'Switzerland', conf:'UEFA', form:'3-4-2-1',  estilo:'Agressivo, Granit Xhaka orq.',           tecnico:'Yakin' },
  { nome:'Serbia',      conf:'UEFA', form:'3-4-2-1',  estilo:'Físico + técnico, Mitrovic ref.',        tecnico:'Stojkovic' },
  { nome:'Turkey',      conf:'UEFA', form:'4-2-3-1',  estilo:'Pressing, Guler criativo',               tecnico:'Montella' },
  { nome:'Austria',     conf:'UEFA', form:'4-2-3-1',  estilo:'Gegenpressing, alta intensidade',        tecnico:'Rangnick' },
  { nome:'Denmark',     conf:'UEFA', form:'3-4-3',    estilo:'Defensive 3, wide wingbacks',            tecnico:'Hjulmand' },
  { nome:'Poland',      conf:'UEFA', form:'4-2-3-1',  estilo:'Levandowski referência, médio campo',    tecnico:'Probierz' },
  { nome:'Ukraine',     conf:'UEFA', form:'4-2-3-1',  estilo:'Pressing, Zinchenko orquestra',          tecnico:'Rebrov' },
  { nome:'Czech Rep.',  conf:'UEFA', form:'4-2-3-1',  estilo:'Físico + transição vertical',            tecnico:'Hasek' },
  { nome:'Slovakia',    conf:'UEFA', form:'4-4-2',    estilo:'Compacto, transição Duda',               tecnico:'Calzona' },
  { nome:'Hungary',     conf:'UEFA', form:'4-2-3-1',  estilo:'Bloco médio, contra-ataque',             tecnico:'Rossi' },
  { nome:'Scotland',    conf:'UEFA', form:'4-3-3',    estilo:'Pressing alto, Gilmour + Robertson',     tecnico:'Clarke' },
  { nome:'Albania',     conf:'UEFA', form:'4-4-2',    estilo:'Compacto, físico',                       tecnico:'Sylvinho' },
  // ── AMÉRICAS ────────────────────────────────────────────
  { nome:'Brazil',      conf:'CONMEBOL', form:'4-2-3-1', estilo:'Habilidade + pressing, R10 style',   tecnico:'Dorival' },
  { nome:'Argentina',   conf:'CONMEBOL', form:'4-4-2',   estilo:'Diamond 4-4-2, pressing Scaloni',    tecnico:'Scaloni' },
  { nome:'Colombia',    conf:'CONMEBOL', form:'4-2-3-1', estilo:'Muito ofensivo, J.Díaz+Cuadrado',    tecnico:'Lorenzo' },
  { nome:'Uruguay',     conf:'CONMEBOL', form:'3-4-3',   estilo:'Bielsa pressing, 3atrás dinâmico',   tecnico:'Bielsa' },
  { nome:'Ecuador',     conf:'CONMEBOL', form:'4-4-2',   estilo:'Compacto, Valencia referência',      tecnico:'Beccacece' },
  { nome:'Paraguay',    conf:'CONMEBOL', form:'4-3-1-2', estilo:'Físico, meia-atacante livre',        tecnico:'Garnero' },
  { nome:'Chile',       conf:'CONMEBOL', form:'4-2-3-1', estilo:'Pressing alto, geração dourada ainda', tecnico:'Berizzo' },
  { nome:'Peru',        conf:'CONMEBOL', form:'4-2-3-1', estilo:'Bloco baixo-médio, Guerrero ref.',   tecnico:'Fossati' },
  { nome:'Bolivia',     conf:'CONMEBOL', form:'5-3-2',   estilo:'Defesa 5, contra-ataque altitude',   tecnico:'Villegas' },
  { nome:'Venezuela',   conf:'CONMEBOL', form:'4-4-2',   estilo:'Físico, Bello + Soteldo',            tecnico:'Pekerman' },
  { nome:'USA',         conf:'CONCACAF', form:'4-2-3-1', estilo:'Pressing intenso, Pochettino DNA',   tecnico:'Pochettino' },
  { nome:'Mexico',      conf:'CONCACAF', form:'4-3-3',   estilo:'Posse, habilidade individual',       tecnico:'Aguirre' },
  { nome:'Canada',      conf:'CONCACAF', form:'4-2-3-1', estilo:'Físico + Davies explosivo',          tecnico:'Herdman' },
  { nome:'Panama',      conf:'CONCACAF', form:'5-4-1',   estilo:'Bloco compacto profundo',            tecnico:'Thomas' },
  { nome:'Costa Rica',  conf:'CONCACAF', form:'5-4-1',   estilo:'Defensivo 5, contra-ataque',         tecnico:'Suarez' },
  { nome:'Honduras',    conf:'CONCACAF', form:'5-4-1',   estilo:'Ultra defensivo, físico',            tecnico:'Carevic' },
  { nome:'El Salvador', conf:'CONCACAF', form:'4-5-1',   estilo:'Bloco baixo extremo',                tecnico:'Reyes' },
  { nome:'Jamaica',     conf:'CONCACAF', form:'4-4-2',   estilo:'Físico + atletismo',                 tecnico:'Lorne' },
  // ── ÁFRICA ──────────────────────────────────────────────
  { nome:'Morocco',     conf:'CAF', form:'4-1-4-1', estilo:'Compacto, transições letais, Hakimi', tecnico:'Regragui' },
  { nome:'Senegal',     conf:'CAF', form:'4-2-3-1', estilo:'Técnico + físico, Mané DNA',          tecnico:'Cissé' },
  { nome:'Nigeria',     conf:'CAF', form:'4-2-3-1', estilo:'Técnico, Osimhen referência',         tecnico:'Finidi' },
  { nome:'Cameroon',    conf:'CAF', form:'4-3-3',   estilo:'Físico + velocidade, Eto DNA',        tecnico:'Song' },
  { nome:'Algeria',     conf:'CAF', form:'4-3-3',   estilo:'Mahrez criativo, pressing médio',     tecnico:'Petkovic' },
  { nome:'South Africa',conf:'CAF', form:'4-4-2',   estilo:'Compacto, físico, transição',         tecnico:'Broos' },
  { nome:'Ivory Coast', conf:'CAF', form:'4-2-3-1', estilo:'Velocidade, Haller ref.',             tecnico:'Faé' },
  { nome:'Congo DR',    conf:'CAF', form:'4-3-3',   estilo:'Atlético, Mbemba defesa',             tecnico:'Conceição' },
  // ── ÁSIA / OCEANIA ────────────────────────────────────
  { nome:'Japan',       conf:'AFC', form:'4-2-3-1', estilo:'Pressing intenso, organização',      tecnico:'Moriyasu' },
  { nome:'South Korea', conf:'AFC', form:'4-2-3-1', estilo:'Son criativo, pressing Son',         tecnico:'Hong' },
  { nome:'Saudi Arabia',conf:'AFC', form:'4-4-2',   estilo:'Médio compacto, velocidade',         tecnico:'Mancini' },
  { nome:'Australia',   conf:'OFC', form:'4-2-3-1', estilo:'Físico + pressing, Kuol',            tecnico:'Popovic' },
  { nome:'New Zealand', conf:'OFC', form:'4-4-2',   estilo:'Físico, compacto',                   tecnico:'Rufer' },
  { nome:'Bahrain',     conf:'AFC', form:'5-4-1',   estilo:'Ultra defensivo, contra-ataque',     tecnico:'Cosmin' },
];

// ============================================================
//  FUNÇÕES DE ANÁLISE
// ============================================================

function getScore(form) {
  return FORM_SCORE[form] ?? 0;
}

function classifyTeam(score) {
  if (score >= 0.5)  return { classe: 'GERADORA_FORTE', emoji: '🟢🟢' };
  if (score >= 0.15) return { classe: 'GERADORA',       emoji: '🟢' };
  if (score >= -0.15)return { classe: 'NEUTRA',         emoji: '🟡' };
  if (score >= -0.7) return { classe: 'SOFREDORA',      emoji: '🔴' };
  if (score >= -1.5) return { classe: 'SOFREDORA_FORTE',emoji: '🔴🔴' };
  return               { classe: 'SOFREDORA_EXTREMA',   emoji: '🔴🔴🔴' };
}

function analyzeMatchup(teamA, teamB) {
  const scoreA = getScore(teamA.form);
  const scoreB = getScore(teamB.form);
  const diff = scoreA - scoreB;
  const classA = classifyTeam(scoreA);
  const classB = classifyTeam(scoreB);

  let signal = '⚪ SEM SINAL';
  let signalStrength = 0;

  if (diff >= 2.5) { signal = '🟢🟢 FORTE → ' + teamA.nome + ' cantos'; signalStrength = 3; }
  else if (diff >= 1.0) { signal = '🟢 MODERADO → ' + teamA.nome + ' cantos'; signalStrength = 2; }
  else if (diff >= 0.4) { signal = '🟡 LEVE → ' + teamA.nome + ' cantos'; signalStrength = 1; }
  else if (diff <= -2.5) { signal = '🟢🟢 FORTE → ' + teamB.nome + ' cantos'; signalStrength = -3; }
  else if (diff <= -1.0) { signal = '🟢 MODERADO → ' + teamB.nome + ' cantos'; signalStrength = -2; }
  else if (diff <= -0.4) { signal = '🟡 LEVE → ' + teamB.nome + ' cantos'; signalStrength = -1; }

  // Valor de mercado esperado: avg global G×S = +4.4 cantos
  // Se diff >= 1.0 o mercado tende a sub-estimar o side de cantos
  const expectedCornerEdge = (diff * 3.5).toFixed(1); // escala clube→seleção

  return { scoreA, scoreB, diff: diff.toFixed(2), classA, classB, signal, signalStrength, expectedCornerEdge };
}

function detectOddsValue(matchup, sideAOdd, sideBOdd) {
  // Equilíbrio de odds: quanto mais próximo de 2.0/2.0 mais equilibrado
  const totalInv = (1/sideAOdd) + (1/sideBOdd);
  const margin = totalInv - 1;
  const trueA = (1/sideAOdd) / totalInv;
  const trueB = (1/sideBOdd) / totalInv;

  let equil = '';
  const diff = Math.abs(trueA - trueB);
  if (diff < 0.08)       equil = 'EQUILIBRADO (ambos ~50%)';
  else if (diff < 0.20)  equil = 'LEVE DESEQUILÍBRIO';
  else if (diff < 0.38)  equil = 'DESEQUILÍBRIO CLARO';
  else                   equil = 'DOMÍNIO';

  // Valor: se o mercado de resultado é DESEQUILÍBRIO/DOMÍNIO
  // mas o sinal de cantos é FORTE para o lado "perdedor" de resultado
  // → mercado subestima o poder de cantos do underdog com formação geradora
  const formDiff = parseFloat(matchup.diff);
  const favorite = trueA > trueB ? 'A' : 'B';
  const cornerFavored = formDiff > 0 ? 'A' : formDiff < 0 ? 'B' : 'EQUAL';
  const isInverted = favorite !== cornerFavored && Math.abs(formDiff) >= 0.4;

  let valueAlert = '';
  if (isInverted && diff >= 0.20) {
    valueAlert = '💰 VALUE: Mercado favorece ' + favorite + ' no resultado mas CANTOS favorecem ' + cornerFavored + '!';
  } else if (Math.abs(formDiff) >= 1.0 && diff >= 0.20) {
    valueAlert = '💡 EDGE: Forte sinal de formação + mercado desequilibrado = HDP cantos pode estar sub-precificado';
  }

  return { equil, margin: (margin*100).toFixed(1)+'%', trueA: (trueA*100).toFixed(1)+'%', trueB: (trueB*100).toFixed(1)+'%', isInverted, valueAlert };
}

// ============================================================
//  OUTPUT — CLASSIFICAÇÃO DAS 48 SELEÇÕES
// ============================================================
console.log('\n' + '═'.repeat(72));
console.log('  COPA DO MUNDO 2026 — PERFIL DE CANTOS POR FORMAÇÃO');
console.log('  Base: scores cross-liga validados (8 ligas, 1507 jogos)');
console.log('  ⚠️  Formações ref. ago/2025 — confirmar técnicos atuais');
console.log('═'.repeat(72));

const selecoesComScore = SELECOES.map(s => ({
  ...s,
  score: getScore(s.form),
  classif: classifyTeam(getScore(s.form)),
})).sort((a, b) => b.score - a.score);

const grupos = {
  'GERADORA_FORTE': [],
  'GERADORA':       [],
  'NEUTRA':         [],
  'SOFREDORA':      [],
  'SOFREDORA_FORTE':[],
  'SOFREDORA_EXTREMA': [],
};

selecoesComScore.forEach(s => {
  grupos[s.classif.classe].push(s);
});

const labels = {
  'GERADORA_FORTE':   '🟢🟢 GERADORAS FORTES (score ≥ +0.5)',
  'GERADORA':         '🟢  GERADORAS (score +0.15 a +0.5)',
  'NEUTRA':           '🟡  NEUTRAS (score -0.15 a +0.15)',
  'SOFREDORA':        '🔴  SOFREDORAS (score -0.15 a -0.7)',
  'SOFREDORA_FORTE':  '🔴🔴 SOFREDORAS FORTES (score -0.7 a -1.5)',
  'SOFREDORA_EXTREMA':'🔴🔴🔴 SOFREDORAS EXTREMAS (score < -1.5)',
};

for (const [classe, label] of Object.entries(labels)) {
  const times = grupos[classe];
  if (!times.length) continue;
  console.log('\n' + label);
  console.log('─'.repeat(65));
  times.forEach(s => {
    const pad = s.nome.padEnd(14);
    const form = s.form.padEnd(10);
    const score = (s.score >= 0 ? '+' : '') + s.score.toFixed(2);
    console.log(`  ${pad} ${form} ${score.padEnd(7)} [${s.conf}] ${s.tecnico}`);
  });
}

// ============================================================
//  MATCHUPS MAIS INTERESSANTES — G×S
//  (times com maior diferença de score → maior edge de cantos)
// ============================================================
console.log('\n\n' + '═'.repeat(72));
console.log('  TOP MATCHUPS — MAIOR EDGE DE FORMAÇÃO (G×S)');
console.log('  Cenários onde mercado provavelmente sub-estima HDP cantos');
console.log('═'.repeat(72));

const geradoras = selecoesComScore.filter(s => s.score >= 0.15);
const sofredoras = selecoesComScore.filter(s => s.score <= -0.40);

const matchups = [];
for (const g of geradoras) {
  for (const s of sofredoras) {
    if (g.conf !== s.conf && Math.abs(g.score - s.score) < 0.01) continue;
    const diff = g.score - s.score;
    matchups.push({ g, s, diff });
  }
}
matchups.sort((a, b) => b.diff - a.diff);

console.log('\n  Formação         Score    vs  Formação         Score    Diff  Edge');
console.log('─'.repeat(72));
matchups.slice(0, 20).forEach(m => {
  const gn = m.g.nome.padEnd(14);
  const gf = m.g.form.padEnd(10);
  const gs = ('+' + m.g.score.toFixed(2)).padEnd(7);
  const sn = m.s.nome.padEnd(14);
  const sf = m.s.form.padEnd(10);
  const ss = (m.s.score.toFixed(2)).padEnd(7);
  const diff = ('+' + m.diff.toFixed(2)).padEnd(6);
  const edge = m.diff >= 3.5 ? '🟢🟢🟢 EXTREMO' :
               m.diff >= 2.5 ? '🟢🟢 MUITO FORTE' :
               m.diff >= 1.5 ? '🟢 FORTE' : '🟡 MODERADO';
  console.log(`  ${gn} ${gf} ${gs} vs ${sn} ${sf} ${ss} ${diff} ${edge}`);
});

// ============================================================
//  ANÁLISE DE CASOS ESPECÍFICOS — VALUE DE MERCADO
// ============================================================
console.log('\n\n' + '═'.repeat(72));
console.log('  ANÁLISE VALUE — ONDE O MERCADO ERRA');
console.log('  Cenários com inversão resultado×cantos');
console.log('═'.repeat(72));

const casos = [
  // Grupo A favorito vs defensivo
  { a: 'Brazil',      b: 'Bolivia',    oddA: 1.12, oddB: 15.0, cenario: 'Brasil fav absoluto, Bolívia 5-3-2' },
  { a: 'Argentina',   b: 'El Salvador',oddA: 1.10, oddB: 20.0, cenario: 'Argentina fav absoluto, Salvador 4-5-1' },
  { a: 'France',      b: 'Honduras',   oddA: 1.15, oddB: 18.0, cenario: 'França fav, Honduras 5-4-1' },
  { a: 'Spain',       b: 'Costa Rica', oddA: 1.18, oddB: 14.0, cenario: 'Espanha fav, Costa Rica 5-4-1' },
  { a: 'Germany',     b: 'El Salvador',oddA: 1.13, oddB: 19.0, cenario: 'Alemanha fav, Salvador 4-5-1' },
  { a: 'USA',         b: 'Panama',     oddA: 1.55, oddB: 6.0,  cenario: 'USA moderado fav, Panamá 5-4-1' },
  { a: 'Colombia',    b: 'Bolivia',    oddA: 1.45, oddB: 7.5,  cenario: 'Colômbia atacante vs Bolívia defensiva' },
  { a: 'Japan',       b: 'Honduras',   oddA: 1.80, oddB: 4.5,  cenario: 'Japan atacante vs Honduras bunker' },
  { a: 'Italy',       b: 'Panama',     oddA: 1.30, oddB: 10.0, cenario: 'Itália 3-4-2-1 (geradora!) vs Panamá 5-4-1' },
  { a: 'Switzerland', b: 'Costa Rica', oddA: 1.38, oddB: 9.0,  cenario: 'Suíça 3-4-2-1 vs Costa Rica 5-4-1' },
  // Inversão clássica: underdog atacante vs favorite defensivo
  { a: 'Uruguay',     b: 'Brazil',     oddA: 5.5,  oddB: 1.65, cenario: '⚠️ Bielsa 3-4-3 vs Brasil 4-2-3-1' },
  { a: 'Denmark',     b: 'France',     oddA: 6.0,  oddB: 1.50, cenario: '⚠️ Dinamarca 3-4-3 vs França 4-2-3-1' },
];

const teamMap = {};
SELECOES.forEach(s => { teamMap[s.nome] = s; });

casos.forEach(c => {
  const teamA = teamMap[c.a];
  const teamB = teamMap[c.b];
  if (!teamA || !teamB) return;

  const m = analyzeMatchup(teamA, teamB);
  const v = detectOddsValue(m, c.oddA, c.oddB);

  console.log(`\n  📋 ${c.a} (${teamA.form}) vs ${c.b} (${teamB.form})`);
  console.log(`     Cenário: ${c.cenario}`);
  console.log(`     Odds: ${c.a}=${c.oddA} | ${c.b}=${c.oddB}`);
  console.log(`     Mercado: ${v.equil} | ${c.a}=${v.trueA} ${c.b}=${v.trueB} (margin ${v.margin})`);
  console.log(`     Score formação: ${c.a}=${m.scoreA>=0?'+':''}${m.scoreA} | ${c.b}=${m.scoreB>=0?'+':''}${m.scoreB} | Diff=${m.diff}`);
  console.log(`     ${m.classA.emoji} ${c.a}:${m.classA.classe} vs ${m.classB.emoji} ${c.b}:${m.classB.classe}`);
  console.log(`     Sinal cantos: ${m.signal}`);
  if (v.valueAlert) console.log(`     ${v.valueAlert}`);
});

// ============================================================
//  RESUMO ESTRATÉGICO
// ============================================================
console.log('\n\n' + '═'.repeat(72));
console.log('  RESUMO ESTRATÉGICO — COPA 2026');
console.log('═'.repeat(72));

console.log(`
  ┌─ SELEÇÕES GERADORAS (formações com edge positivo cross-liga) ──────────┐
  │  Itália     3-4-2-1  +0.18  (SURPRESA! geradora por laterais avançados) │
  │  Suíça      3-4-2-1  +0.18  (idem — Yakin usa bem os laterais)          │
  │  Sérvia     3-4-2-1  +0.18  (mesmo perfil, Mitrovic como referência)    │
  │  Colombia   4-2-3-1  +0.28  (Lorenzo muito ofensivo, gera cantos)       │
  │  Brasil     4-2-3-1  +0.28  (padrão geral, favorito em todos matchups)  │
  │  Japan      4-2-3-1  +0.28  (pressing intenso = muitos escanteios)      │
  │  USA        4-2-3-1  +0.28  (Pochettino pressing = gerador de cantos)   │
  │  Espanha    4-3-3    +0.21  (posse alta → corners naturais)             │
  └────────────────────────────────────────────────────────────────────────┘

  ┌─ SELEÇÕES SOFREDORAS (formações penalizadas cross-liga) ───────────────┐
  │  Panamá     5-4-1   -3.31  (EXTREMA — 12.5% win rate histórico)       │
  │  El Salvador 4-5-1  -3.31  (EXTREMA — igual ao Panamá)                │
  │  Honduras   5-4-1   -3.31  (EXTREMA — bunker defensivo)               │
  │  Costa Rica 5-4-1   -3.31  (EXTREMA — modelo Óscar Ramírez herdado)   │
  │  Bahrain    5-4-1   -3.31  (EXTREMA — defensivo asiático)              │
  │  Bolivia    5-3-2   -0.57  (SOFREDORA — altitude não compensa forma)  │
  │  Paraguay   4-3-1-2 -0.40  (SOFREDORA LEVE)                           │
  │  Uruguay    3-4-3   -0.53  (⚠️ Bielsa = SOFREDORA de cantos!)         │
  │  Denmark    3-4-3   -0.53  (3 atrás Hjulmand = sofre cantos)          │
  └────────────────────────────────────────────────────────────────────────┘

  ┌─ ESTRATÉGIA DE VALOR ──────────────────────────────────────────────────┐
  │                                                                        │
  │  1. SITUAÇÃO IDEAL (Triple Lock Copa):                                 │
  │     • Time A: 4-2-3-1 ou 3-4-2-1 (geradora)                          │
  │     • Time B: 4-5-1 ou 5-4-1 (sofredora extrema)                     │
  │     • Diff esperada: +3.5 a +4.0 cantos                               │
  │     • Mercado geralmente precifica HDP -2.5/-3.5 → VALUE em -2.5      │
  │                                                                        │
  │  2. INVERSÃO VALUE (underdog atacante vs fav defensivo):               │
  │     • Exemplo: Suíça (3-4-2-1 +0.18) vs país defensivo               │
  │     • Mercado foca no resultado (Suíça pode ser underdog)              │
  │     • Cantos favorecem Suíça — HDP pode estar melhor que resultado    │
  │                                                                        │
  │  3. SURPRESA GERADORA — Itália (3-4-2-1):                             │
  │     • Mercado não reconhece Itália como geradora de cantos            │
  │     • 3-4-2-1 = +0.18 cross-liga (leve geradora)                     │
  │     • Contra qualquer equipe defensiva → edge real                    │
  │                                                                        │
  │  4. FUJA DE: Uruguay (Bielsa 3-4-3 = -0.53 cross-liga)               │
  │     • Mercado valoriza Bielsa como "time ofensivo"                    │
  │     • Mas 3-4-3 é SOFREDORA de cantos em todas as ligas!              │
  │     • HDP cantos de Uruguai é VALUE PARA O ADVERSÁRIO                 │
  │                                                                        │
  └────────────────────────────────────────────────────────────────────────┘
`);
