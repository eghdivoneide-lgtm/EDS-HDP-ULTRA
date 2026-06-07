// ════════════════════════════════════════════════════════════════
// INJETOR DE RODADA — 24-27/04/2026
// 95 jogos · 9 ligas · 0 falhas (conforme relatório oficial)
// ════════════════════════════════════════════════════════════════
// Uso: node scraper/_INJETAR_RODADA_2026_04_26.js
// Cria backup automático antes de gravar.
// ════════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const RODADA_DATA = '2026-04-26'; // data central da rodada (sáb/dom)

// ── 95 JOGOS ESTRUTURADOS ────────────────────────────────────────
// Formato: [mandante, visitante, ht_m, ht_v, ft_m, ft_v, c_ht_m, c_ht_v, c_ft_m, c_ft_v, posse_m, posse_v, fin_m, fin_v]
const RODADA = {
  BR: [
    ['Bahia',          'Santos',           0,2, 2,2, 2,1, 5,3,  64,36, 18,11],
    ['Botafogo RJ',    'Internacional',    0,0, 2,2, 2,2, 3,5,  53,47, 16,8],
    ['Remo',           'Cruzeiro',         0,1, 0,1, 1,0, 4,1,  47,53, 14,6],
    ['Sao Paulo',      'Mirassol',         0,0, 1,0, 6,0, 12,4, 53,47, 17,10],
    ['Corinthians',    'Vasco',            1,0, 1,0, 4,2, 5,7,  40,60, 13,21],
    ['Gremio',         'Coritiba',         1,0, 1,0, 2,2, 5,2,  56,44, 22,15],
    ['Athletico-PR',   'Vitoria',          1,1, 3,1, 3,3, 4,4,  60,40, 23,7],
    ['Bragantino',     'Palmeiras',        0,1, 0,1, 4,3, 9,4,  61,39, 19,6],
    ['Atletico-MG',    'Flamengo RJ',      0,3, 0,4, 5,1, 8,1,  51,49, 18,9],
    ['Fluminense',     'Chapecoense-SC',   0,0, 2,1, 3,0, 7,1,  71,29, 30,8]
  ],
  ARG: [
    ['Dep. Riestra',           'Independiente',     1,0, 2,0, 1,1, 3,3,  31,69, 8,13],
    ['Estudiantes Rio Cuarto', 'Rosario Central',   0,1, 1,2, 0,4, 0,4,  43,57, 14,12],
    ['Lanus',                  'Central Cordoba',   0,0, 0,0, 2,3, 5,3,  66,34, 15,9],
    ['Platense',               'San Lorenzo',       0,1, 0,1, 4,3, 8,4,  56,44, 23,10],
    ['Racing Club',            'Barracas Central',  1,0, 1,1, 1,0, 2,3,  50,50, 5,17],
    ['Estudiantes LP',         'Talleres Cordoba',  0,0, 0,0, 3,0, 6,1,  55,45, 16,10],
    ['Sarmiento Junin',        'Tigre',             1,0, 1,0, 2,3, 3,6,  48,52, 10,15],
    ['River Plate',            'Aldosivi',          1,0, 3,1, 6,0, 8,1,  72,28, 23,5],
    ['Ind. Rivadavia',         'Gimnasia Mendoza',  1,1, 5,1, 7,2, 11,2, 59,41, 24,7],
    ['Belgrano',               'Gimnasia LP',       0,1, 0,1, 1,3, 3,6,  46,54, 7,6],
    ["Newell's Old Boys",      'Instituto',         0,0, 1,1, 2,0, 4,3,  54,46, 11,6],
    ['Atl. Tucuman',           'Banfield',          0,0, 1,1, 1,1, 3,2,  53,47, 15,10],
    ['Velez Sarsfield',        'Union de Santa Fe', 2,1, 2,2, 1,1, 2,4,  57,43, 12,14],
    ['Huracan',                'Argentinos Juniors',1,1, 1,2, 1,2, 4,5,  45,55, 11,5]
  ],
  ARG_B: [
    ['San Miguel',         'Los Andes',          0,1, 0,2, 5,2, 11,4, 51,49, 11,11],
    ['San Telmo',          'All Boys',           0,0, 1,0, 0,2, 2,5,  51,49, 17,10],
    ['Temperley',          'Patronato',          0,0, 0,0, 2,0, 6,1,  49,51, 10,3],
    ['San Martin S.J.',    'Quilmes',            1,0, 1,0, 2,1, 4,1,  56,44, 8,6],
    ['Atl. Rafaela',       'Gimnasia Jujuy',     0,0, 0,0, 8,1, 11,2, 55,45, 8,3],
    ['Deportivo Moron',    'Racing Cordoba',     0,0, 2,1, 6,0, 6,1,  53,47, 10,6],
    ['Nueva Chicago',      'Colegiales',         0,0, 0,0, 2,1, 3,4,  54,46, 9,9],
    ['Tristan Suarez',     'Gimnasia y Tiro',    1,1, 2,1, 3,4, 8,5,  52,48, 17,6],
    ['Acassuso',           'CA Estudiantes',     0,0, 0,1, 1,3, 3,7,  47,53, 3,8],
    ['Chacarita Juniors',  'Midland',            0,0, 1,0, 2,1, 4,3,  49,51, 6,6],
    ['Agropecuario',       'San Martin T.',      1,0, 2,0, 2,1, 2,2,  48,52, 8,2],
    ['Deportivo Madryn',   'Def. de Belgrano',   1,0, 2,1, 2,1, 5,1,  54,46, 7,12],
    ['Central Norte',      'Ciudad Bolivar',     0,1, 0,1, 0,0, 5,2,  49,51, 9,4],
    ['Chaco For Ever',     'CA Mitre',           1,0, 1,1, 4,2, 8,3,  53,47, 14,12],
    ['Club A. Guemes',     'Atletico Atlanta',   0,0, 0,2, 4,1, 4,2,  49,51, 7,7],
    ['Deportivo Maipu',    'Almagro',            1,0, 1,0, 6,1, 10,6, 57,43, 18,5],
    ['Colon Santa Fe',     'Godoy Cruz',         0,0, 0,0, 2,1, 5,2,  52,48, 11,5],
    ['Ferro',              'Almirante Brown',    0,1, 0,1, 4,0, 8,0,  58,42, 10,6]
  ],
  ALM: [
    ['Macarthur FC',           'Wellington Phoenix',     3,0, 4,0, 6,3, 8,6,  55,45, 26,12],
    ['Newcastle Jets',         'Central Coast Mariners', 3,0, 4,0, 3,3, 5,3,  54,46, 18,11],
    ['WS Wanderers',           'Melbourne Victory',      0,0, 0,2, 2,4, 4,5,  55,45, 16,14],
    ['Perth Glory',            'Brisbane Roar',          1,0, 2,1, 1,4, 2,6,  29,71, 12,10],
    ['Sydney FC',              'Auckland FC',            0,0, 2,2, 0,2, 4,6,  60,40, 17,9],
    ['Melbourne City',         'Adelaide United',        1,0, 1,2, 2,2, 3,10, 43,57, 9,17]
  ],
  CHI: [
    ['Union La Calera',  'Coquimbo',     0,0, 1,2, 4,4, 4,4,  58,42, 12,10],
    ['A. Italiano',      'Limache',      1,1, 2,2, 0,0, 1,4,  46,54, 13,11],
    ['Nublense',         "O'Higgins",    0,2, 0,2, 2,2, 4,6,  46,54, 15,7],
    ['U. de Chile',      'U. Catolica',  1,0, 1,0, 5,1, 7,3,  48,52, 15,7],
    ['La Serena',        'Huachipato',   0,0, 0,0, 6,0, 7,1,  55,45, 12,10],
    ['U. de Concepcion', 'Colo Colo',    0,1, 1,2, 1,1, 4,5,  35,65, 9,17],
    ['Everton',          'Cobresal',     2,1, 3,1, 2,0, 2,4,  57,43, 21,15]
  ],
  ECU: [
    ['Mushuc Runa',       'Dep. Cuenca',       2,1, 4,1, 3,2, 3,8,  50,50, 15,16],
    ['Ind. del Valle',    'Leones del Norte',  1,1, 2,1, 3,2, 5,5,  62,38, 21,8],
    ['Emelec',            'LDU Quito',         0,0, 1,0, 5,0, 9,4,  46,54, 7,14],
    ['Macara',            'Libertad',          2,0, 3,0, 1,4, 3,5,  44,56, 17,14],
    ['Guayaquil City',    'Tecnico U.',        1,0, 1,0, 1,2, 1,7,  52,48, 7,21],
    ['Orense',            'Barcelona SC',      0,1, 1,1, 4,2, 7,4,  61,39, 16,7],
    ['Manta',             'U. Catolica',       1,0, 1,0, 5,0, 7,2,  42,58, 11,10],
    ['Aucas',             'Delfin',            0,0, 1,0, 3,0, 5,1,  73,27, 20,7]
  ],
  MLS: [
    ['Toronto FC',          'Atlanta Utd',                0,0, 1,2, 1,5, 8,7,  51,49, 9,6],
    ['CF Montreal',         'New York City',              1,0, 1,0, 0,0, 3,1,  35,65, 8,4],
    ['Minnesota United',    'LAFC',                       0,1, 0,1, 5,0, 11,2, 62,38, 23,7],
    ['Columbus Crew',       'Philadelphia Union',         2,0, 2,0, 2,2, 2,4,  56,44, 7,10],
    ['DC United',           'Orlando City',               1,0, 3,2, 3,5, 7,8,  38,62, 15,8],
    ['FC Cincinnati',       'New York Red Bulls',         2,0, 2,0, 3,2, 4,7,  48,52, 15,19],
    ['Inter Miami',         'New England Revolution',     0,0, 1,1, 4,0, 7,1,  68,32, 18,16],
    ['Austin FC',           'Houston Dynamo',             2,0, 2,0, 1,3, 3,5,  45,55, 13,11],
    ['Chicago Fire',        'Sporting Kansas City',       0,0, 5,0, 1,0, 4,2,  71,29, 17,6],
    ['Nashville SC',        'Charlotte',                  2,1, 4,2, 4,0, 6,4,  61,39, 13,8],
    ['St. Louis City',      'San Jose Earthquakes',       0,1, 2,3, 5,2, 10,3, 58,42, 21,9],
    ['San Diego FC',        'Portland Timbers',           1,1, 1,2, 5,1, 6,6,  67,33, 10,11],
    ['Seattle Sounders',    'FC Dallas',                  2,1, 2,1, 2,3, 4,7,  58,42, 9,12],
    ['Vancouver Whitecaps', 'Colorado Rapids',            2,1, 3,1, 5,1, 8,3,  45,55, 20,13],
    ['LA Galaxy',           'Real Salt Lake',             1,1, 2,1, 5,0, 7,0,  39,61, 16,15]
  ],
  BUN: [
    ['RB Leipzig',     'Union Berlin',          2,0, 3,1, 5,1, 10,4, 67,33, 20,5],
    ['Augsburg',       'Eintracht Frankfurt',   1,0, 1,1, 5,1, 9,7,  40,60, 17,19],
    ['FC Koln',        'Bayer Leverkusen',      0,1, 1,2, 0,5, 2,5,  45,55, 25,8],
    ['Heidenheim',     'St. Pauli',             1,0, 2,0, 1,3, 6,6,  45,55, 12,11],
    ['Mainz',          'Bayern Munich',         3,0, 3,4, 2,2, 4,4,  30,70, 21,11],
    ['Wolfsburg',      'B. Monchengladbach',    0,0, 0,0, 3,5, 8,5,  44,56, 12,10],
    ['Hamburger SV',   'Hoffenheim',            1,2, 1,2, 1,2, 4,9,  41,59, 12,15],
    ['Stuttgart',      'Werder Bremen',         0,1, 1,1, 6,2, 14,2, 68,32, 20,9],
    ['Dortmund',       'Freiburg',              3,0, 4,0, 4,0, 5,0,  61,39, 17,7]
  ],
  J1: [
    ['FC Tokyo',              'Mito',              3,1, 5,2, 2,0, 7,1,  48,52, 21,9],
    ['Kashiwa Reysol',        'Kashima Antlers',   0,1, 0,1, 3,2, 8,2,  52,48, 13,12],
    ['Okayama',               'Avispa Fukuoka',    1,0, 2,0, 0,5, 3,7,  39,61, 6,9],
    ['Shimizu S-Pulse',       'Nagoya Grampus',    0,1, 0,2, 1,2, 1,3,  51,49, 6,9],
    ['Urawa Reds',            'Yokohama F. Marinos',1,1, 2,3, 2,1, 9,2, 61,39, 15,8],
    ['Kawasaki Frontale',     'Chiba',             1,0, 2,1, 3,0, 5,3,  47,53, 10,16],
    ['Sanfrecce Hiroshima',   'Cerezo Osaka',      0,1, 2,1, 4,2, 11,5, 59,41, 16,11],
    ['V-Varen Nagasaki',      'Gamba Osaka',       0,0, 1,2, 3,5, 7,8,  45,55, 11,17]
  ]
};

// ── MAPA DE LIGAS → ARQUIVO + CHAVE WINDOW ──
const LIGA_INFO = {
  BR:    { file: 'brasileirao2026.js', windowKey: 'DADOS_BR' },
  ARG:   { file: 'argentina2026.js',   windowKey: 'DADOS_ARG' },
  ARG_B: { file: 'argentina_b2026.js', windowKey: 'DADOS_ARG_B' },
  ALM:   { file: 'aleague2026.js',     windowKey: 'DADOS_ALM' },
  CHI:   { file: 'chile2026.js',       windowKey: 'DADOS_CHI' },
  ECU:   { file: 'equador2026.js',     windowKey: 'DADOS_ECU' },
  MLS:   { file: 'mls2026.js',         windowKey: 'DADOS_MLS' },
  BUN:   { file: 'bundesliga2026.js',  windowKey: 'DADOS_BUN' },
  J1:    { file: 'j1league2026.js',    windowKey: 'DADOS_J1' }
};

// ── FUZZY MATCH (Levenshtein simplificado) ──
function _norm(s) {
  return (s||'').toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g,'')
    .replace(/['.\-]/g,'')
    .replace(/\s+/g,' ').trim();
}
function _editDist(a, b) {
  if (a === b) return 0;
  if (!a.length || !b.length) return Math.max(a.length, b.length);
  const dp = Array.from({length: a.length+1}, () => Array(b.length+1).fill(0));
  for (let i=0; i<=a.length; i++) dp[i][0] = i;
  for (let j=0; j<=b.length; j++) dp[0][j] = j;
  for (let i=1; i<=a.length; i++) {
    for (let j=1; j<=b.length; j++) {
      const cost = a[i-1] === b[j-1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+cost);
    }
  }
  return dp[a.length][b.length];
}
function fuzzyTime(nome, listaTimes) {
  const n1 = _norm(nome);
  // 1. exato (após normalização)
  for (const t of listaTimes) if (_norm(t) === n1) return t;
  // 2. inclusão (um contém o outro)
  for (const t of listaTimes) {
    const n2 = _norm(t);
    if (n1.includes(n2) || n2.includes(n1)) return t;
  }
  // 3. distância de edição mais curta (tolerância 2)
  let melhor = null, melhorDist = 99;
  for (const t of listaTimes) {
    const d = _editDist(n1, _norm(t));
    if (d < melhorDist) { melhorDist = d; melhor = t; }
  }
  if (melhorDist <= 2) return melhor;
  return null;
}

// ── INJEÇÃO ──
function carregarLiga(file, windowKey) {
  const code = fs.readFileSync(path.join(DATA_DIR, file), 'utf8');
  const ctx = { window: {} };
  new Function('window', code)(ctx.window);
  return { dados: ctx.window[windowKey], code, header: code.match(/^([\s\S]*?)window\./)[1] };
}

function gerarBackup(file) {
  const ts = new Date().toISOString().replace(/[:.]/g,'-').slice(0,19);
  const backup = path.join(DATA_DIR, file + '.backup_inject_' + ts);
  fs.copyFileSync(path.join(DATA_DIR, file), backup);
  return backup;
}

const RELATORIO = {
  totalInjetados: 0,
  porLiga: {},
  jogosFalha: [],
  cisneAnalise: []
};

console.log('═══ INJEÇÃO DE RODADA — 24-27/04/2026 ═══\n');

for (const [code, jogos] of Object.entries(RODADA)) {
  const info = LIGA_INFO[code];
  if (!info) { console.log('⚠️  Liga ' + code + ' não mapeada — pulando'); continue; }

  const { dados, header } = carregarLiga(info.file, info.windowKey);
  const maxRodada = Math.max(...dados.jogos.filter(j=>typeof j.rodada==='number').map(j=>j.rodada).concat([0]));
  const novaRodada = maxRodada + 1;

  RELATORIO.porLiga[code] = { injetados: 0, falhas: 0, cisneCandidatos: 0 };
  let injetados = 0;

  jogos.forEach((j, idx) => {
    const [m, v, htM, htV, ftM, ftV, cHtM, cHtV, cFtM, cFtV, posM, posV, finM, finV] = j;
    const mTime = fuzzyTime(m, dados.times);
    const vTime = fuzzyTime(v, dados.times);
    if (!mTime || !vTime) {
      RELATORIO.jogosFalha.push({ liga: code, m, v, mTime, vTime });
      RELATORIO.porLiga[code].falhas++;
      return;
    }
    // Evita duplicar (já existe esse par + data)
    const jaExiste = dados.jogos.find(x => x.mandante === mTime && x.visitante === vTime && x.data === RODADA_DATA);
    if (jaExiste) return;

    const novo = {
      id: 'inject_' + code + '_' + idx + '_' + RODADA_DATA.replace(/-/g,''),
      rodada: novaRodada,
      data: RODADA_DATA,
      mandante: mTime,
      visitante: vTime,
      placar: { m: ftM, v: ftV },
      gols:    { ht: { m: htM, v: htV }, ft: { m: ftM, v: ftV } },
      cantos:  { ht: { m: cHtM, v: cHtV }, ft: { m: cFtM, v: cFtV } },
      stats_taticas: {
        posse:        { m: posM, v: posV },
        finalizacoes: { m: finM, v: finV }
      }
    };
    dados.jogos.push(novo);
    injetados++;

    // Análise Cisne pós-fato: vantagem real ≥ 2.0?
    const diffFt = Math.abs(cFtM - cFtV);
    if (diffFt >= 1.5) {
      RELATORIO.cisneAnalise.push({
        liga: code, m: mTime, v: vTime,
        cantos: cFtM + 'x' + cFtV, diff: diffFt,
        faixa: diffFt >= 4 ? 'EXTREMA' : diffFt >= 3 ? 'FORTE' : diffFt >= 2 ? 'BOA' : 'PROPOSTA(1.5-2.0)'
      });
      RELATORIO.porLiga[code].cisneCandidatos++;
    }
  });

  RELATORIO.porLiga[code].injetados = injetados;
  RELATORIO.totalInjetados += injetados;

  // Salvar
  const backup = gerarBackup(info.file);
  const novoConteudo = header + 'window.' + info.windowKey + ' = ' + JSON.stringify(dados, null, 2) + ';\n';
  fs.writeFileSync(path.join(DATA_DIR, info.file), novoConteudo, 'utf8');
  console.log('✅ ' + code + ' — ' + injetados + '/' + jogos.length + ' jogos injetados (Rd ' + novaRodada + ') · backup: ' + path.basename(backup));
}

// ═══ RELATÓRIO FINAL ═══
console.log('\n═══ INJEÇÃO COMPLETA ═══');
console.log('Total injetados: ' + RELATORIO.totalInjetados + ' / 95');
console.log('Falhas (fuzzy match): ' + RELATORIO.jogosFalha.length);

if (RELATORIO.jogosFalha.length > 0) {
  console.log('\n⚠️  JOGOS QUE FALHARAM:');
  RELATORIO.jogosFalha.forEach(f => console.log('  ' + f.liga + ': ' + f.m + ' vs ' + f.v + ' (m=' + f.mTime + ' v=' + f.vTime + ')'));
}

// Análise Cisne
console.log('\n═══ ANÁLISE CISNE NEGRO PÓS-JOGO ═══');
console.log('Jogos com vantagem real de cantos FT ≥ 1.5: ' + RELATORIO.cisneAnalise.length);
const porFaixa = { EXTREMA: 0, FORTE: 0, BOA: 0, 'PROPOSTA(1.5-2.0)': 0 };
RELATORIO.cisneAnalise.forEach(c => porFaixa[c.faixa]++);
console.log('  EXTREMA (≥4 cantos): ' + porFaixa.EXTREMA);
console.log('  FORTE   (3-4):       ' + porFaixa.FORTE);
console.log('  BOA     (2-3):       ' + porFaixa.BOA);
console.log('  PROPOSTA (1.5-2.0):  ' + porFaixa['PROPOSTA(1.5-2.0)']);

console.log('\n═══ TOP 15 JOGOS COM MAIOR VANTAGEM ═══');
RELATORIO.cisneAnalise.sort((a,b) => b.diff - a.diff).slice(0,15).forEach(c => {
  console.log('  [' + c.liga.padEnd(5) + '] ' + c.m.padEnd(20) + ' vs ' + c.v.padEnd(20) + ' · ' + c.cantos + ' (Δ' + c.diff + ') · ' + c.faixa);
});

console.log('\n═══ JOGOS NA FAIXA 1.5-2.0 (que threshold proposto pegaria) ═══');
RELATORIO.cisneAnalise.filter(c => c.faixa === 'PROPOSTA(1.5-2.0)').forEach(c => {
  console.log('  [' + c.liga.padEnd(5) + '] ' + c.m + ' vs ' + c.v + ' · ' + c.cantos + ' (Δ' + c.diff + ')');
});

// Salva relatório JSON
fs.writeFileSync(path.join(__dirname, '_RELATORIO_INJECAO_2026_04_26.json'), JSON.stringify(RELATORIO, null, 2));
console.log('\n📄 Relatório salvo: scraper/_RELATORIO_INJECAO_2026_04_26.json');
