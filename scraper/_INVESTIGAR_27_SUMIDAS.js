// ════════════════════════════════════════════════════════════
// Investiga as 27 apostas que sumiram entre CSV (352) e Tracker (325)
// Reproduz exatamente a lógica de _parsearLinhaCSVPinnacle do app
// ════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');

const CSV_PATH = path.join(__dirname, '..', 'Auditoria Especialista em cantos', 'Apostas_Simples_20260503.csv');
const csvText = fs.readFileSync(CSV_PATH, 'utf8');
const linhas = csvText.split(/\r?\n/).filter(l => l.trim().length > 0);
const header = linhas.shift(); // remove header

const _LIGA_MAP = {
  'Alemanha - Bundesliga': 'BUN',
  'Argentina - Liga Pro': 'ARG',
  'Argentina - Primeira B Nacional': 'ARG_B',
  'Austrália - A-League': 'ALM',
  'Brasil - Série A': 'BR',
  'Brasil - Série B': 'BR_B',
  'Chile - 1ª División': 'CHI',
  'China - League One': 'CHN_1',
  'China - Superliga': 'CHN_S',
  'EUA - Major League Soccer': 'MLS',
  'EUA - USL Championship': 'USL',
  'Equador - Série A': 'ECU',
  'Japão - J League': 'J1'
};

function parsear(cols) {
  if (!cols || cols.length < 12) return { erro: 'menos_de_12_cols' };
  const [dataStr, camp, tCasa, tFora, mercado, periodo, selecao, oddStr, riscoStr, /*escHT*/, /*escFT*/, resultado] = cols.map(s => (s||'').trim());
  if (!dataStr || !camp || !tCasa || !tFora) return { erro: 'campos_basicos_vazios', cols };

  const mData = dataStr.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
  if (!mData) return { erro: 'data_malformada', dataStr };

  const dd = mData[1].padStart(2,'0');
  const mm = mData[2].padStart(2,'0');
  const yyyy = mData[3] ? (mData[3].length === 2 ? '20'+mData[3] : mData[3]) : '2026';
  const dataISO = `${yyyy}-${mm}-${dd}`;

  const liga = _LIGA_MAP[camp];
  if (!liga) return { erro: 'liga_nao_mapeada', camp };

  let mercadoTracker = null, linha = '';
  if (mercado === 'O/U') {
    const mSel = selecao.match(/^(Menos|Mais)\s+de\s+(\d+(?:[.,]\d+)?)/i);
    if (!mSel) return { erro: 'OU_selecao_malformada', selecao };
    linha = mSel[2].replace(',', '.');
    const over = /^mais/i.test(mSel[1]);
    mercadoTracker = periodo === 'HT' ? (over ? 'Over HT' : 'Under HT') : (over ? 'Over FT' : 'Under FT');
  } else if (mercado === 'HDP') {
    const mSel = selecao.match(/([+\-]?\d+(?:[.,]\d+)?)\s*$/);
    if (!mSel) return { erro: 'HDP_selecao_malformada', selecao };
    linha = mSel[1].replace(',', '.');
    if (!/^[+\-]/.test(linha) && parseFloat(linha) === 0) linha = '0';
    mercadoTracker = periodo === 'HT' ? 'Handicap HT' : 'Handicap FT';
  } else {
    return { skip: 'mercado_nao_suportado', mercado, selecao };
  }

  const odd = parseFloat(oddStr.replace(',', '.'));
  const unid = parseFloat(riscoStr.replace(',', '.'));
  if (isNaN(odd) || isNaN(unid)) return { erro: 'odd_ou_unid_NaN', oddStr, riscoStr };

  const ALIAS = {
    'Atlético Tucumán': 'Atl. Tucuman', 'Argentinos Juniors': 'Argentinos Jrs',
    'Independiente Rivadavia': 'Ind. Rivadavia', 'Estudiantes de La Plata': 'Estudiantes L.P.',
    'Sarmiento de Junin': 'Sarmiento', 'Defensa Y Justicia': 'Defensa y Justicia',
    'Talleres de Cordoba': 'Talleres', 'Deportivo Riestra': 'Dep. Riestra',
    'Union de Santa Fe': 'Union Santa Fe', 'Vélez Sarsfield': 'Velez Sarsfield',
    'Gimnasia La Plata': 'Gimnasia L.P.',
    'San Martin de San Juan': 'San Martin SJ', 'Colón de Santa Fe': 'Colon Santa Fe',
    'Atletico Rafaela': 'Atl. Rafaela', 'Tristán Suárez': 'Tristan Suarez',
    'Deportivo Madryn': 'Dep. Madryn', 'Deportivo Maipu': 'Dep. Maipu',
    'Deportivo Moron': 'Dep. Moron',
    'Deportes Limache': 'Dep. Limache', 'Deportes Concepcion': 'Dep. Concepcion',
    'Deportes La Serena': 'Dep. La Serena', 'Universidad de Concepción': 'Univ. Concepcion',
    'Universidad de Chile': 'Univ. de Chile', 'Everton Vina del Mar': 'Everton Vina',
    'Union La Calera': 'U. La Calera',
    'Atlanta United': 'Atlanta Utd', 'D.C. United': 'DC United',
    'FC Koln': '1. FC Koln', 'Mainz 05': 'Mainz',
    'Tecnico Universitario': 'Tecnico U.',
    'Kashima Antlers': 'Kashima', 'Urawa Red Diamonds': 'Urawa',
    'JEF United Chiba': 'JEF United',
    'Western Sydney Wanderers': 'W. Sydney Wanderers',
    'Central Coast Mariners': 'Central Coast'
  };
  const apl = (n) => ALIAS[n] || n;

  const mapStatus = { 'GANHOU': 'green', 'PERDEU': 'red', 'REEMB.': 'void', 'REEMB': 'void' };
  const status = mapStatus[resultado.toUpperCase()] || 'aberto';

  return {
    ok: true,
    parsed: {
      data: dataISO, liga, mandante: apl(tCasa), visitante: apl(tFora),
      mercado: mercadoTracker, linha, odd, unid, status
    }
  };
}

const erros = {};
const skips = {};
const validos = [];
const chave = b => [b.liga, b.data, b.mandante, b.visitante, b.mercado, b.linha, b.odd].join('|');
const chaves = new Set();
let dups = [];

linhas.forEach((linha, idx) => {
  const cols = linha.split(';');
  const r = parsear(cols);
  if (r.erro) {
    erros[r.erro] = (erros[r.erro] || 0) + 1;
    return;
  }
  if (r.skip) {
    skips[r.skip] = (skips[r.skip] || 0) + 1;
    return;
  }
  const k = chave(r.parsed);
  if (chaves.has(k)) {
    dups.push({ linha: idx + 2, dados: r.parsed });
    return;
  }
  chaves.add(k);
  validos.push(r.parsed);
});

console.log('═══════════════════════════════════════════════════════');
console.log('INVESTIGAÇÃO: 352 CSV → ' + validos.length + ' importadas');
console.log('═══════════════════════════════════════════════════════');
console.log();
console.log('📊 Resultado da simulação do importador do app:');
console.log('  Total no CSV:        ' + linhas.length);
console.log('  ✅ Importadas:       ' + validos.length);
console.log('  🔁 DUPLICATAS:       ' + dups.length);
console.log('  ⚠️  Mercado pulado:   ' + Object.values(skips).reduce((a,b)=>a+b,0));
console.log('  ❌ Erros parsing:    ' + Object.values(erros).reduce((a,b)=>a+b,0));
console.log();

if (dups.length > 0) {
  console.log('🔁 DUPLICATAS DETECTADAS (' + dups.length + ')');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  dups.forEach((d, i) => {
    const p = d.dados;
    console.log('  ' + (i+1) + '. Linha ' + d.linha + ': ' + p.liga + ' | ' + p.data + ' | ' + p.mandante + ' x ' + p.visitante);
    console.log('     ' + p.mercado + ' ' + p.linha + ' @ ' + p.odd);
  });
  console.log();
}

if (Object.keys(skips).length > 0) {
  console.log('⚠️  MERCADOS PULADOS:');
  Object.entries(skips).forEach(([k, n]) => console.log('  ' + k + ': ' + n));
  console.log();
}

if (Object.keys(erros).length > 0) {
  console.log('❌ ERROS DE PARSING:');
  Object.entries(erros).forEach(([k, n]) => console.log('  ' + k + ': ' + n));
}
