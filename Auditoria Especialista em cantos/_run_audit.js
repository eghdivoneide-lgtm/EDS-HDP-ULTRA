// Auditor unificado — rodada 01-04/05/2026
// Cruza sinais de Cisne / VencedorCantos / BalaDePrata / Teacher / Enigma
// com resultados reais em _jogos_reais_rodada_01_04_05_2026.json
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const JSON_REAL = path.join(ROOT, '_jogos_reais_rodada_01_04_05_2026.json');
const REAL = JSON.parse(fs.readFileSync(JSON_REAL, 'utf8'));

// ---------- Normalização e aliases ----------
const ALIASES = {
  '1. fc koln': 'fc koln',
  'koln': 'fc koln',
  'mainz 05': 'mainz',
  'atl. tucuman': 'atletico tucuman',
  'atletico tucuman': 'atletico tucuman',
  'argentinos jrs': 'argentinos juniors',
  'atletico-mg': 'atletico mg',
  'atletico mg': 'atletico mg',
  'sao paulo': 'sao paulo',
  'são paulo': 'sao paulo',
  'são pãulo': 'sao paulo',
  'gremio': 'gremio',
  'grêmio': 'gremio',
  'vitoria': 'vitoria',
  'vitória': 'vitoria',
  'ceara': 'ceara',
  'ceará': 'ceara',
  'sport': 'sport recife',
  'sport recife': 'sport recife',
  'rb bragantino': 'bragantino',
  'red bull bragantino': 'bragantino',
  'bragantino': 'bragantino',
  'flamengo rj': 'flamengo',
  'fluminense fc': 'fluminense',
  'corinthians sp': 'corinthians',
  'corinthians-sp': 'corinthians',
  'sao paulo fc': 'sao paulo',
  'fortaleza ec': 'fortaleza',
  'fortaleza': 'fortaleza',
  'palmeiras sp': 'palmeiras',
  'internacional rs': 'internacional',
  'inter': 'internacional',
  'cruzeiro mg': 'cruzeiro',
  'mirassol fc': 'mirassol',
  'juventude rs': 'juventude',
  'bahia ec': 'bahia',
  'vasco da gama': 'vasco',
  'vasco rj': 'vasco',
  'vasco': 'vasco',
  'cap': 'athletico-pr',
  'athletico paranaense': 'athletico-pr',
  'coritiba fc': 'coritiba',
  // Bundesliga
  'borussia monchengladbach': 'monchengladbach',
  "m'gladbach": 'monchengladbach',
  'mgladbach': 'monchengladbach',
  'bayer leverkusen': 'leverkusen',
  'bayer 04 leverkusen': 'leverkusen',
  'leverkusen': 'leverkusen',
  'borussia dortmund': 'dortmund',
  'bvb': 'dortmund',
  'dortmund': 'dortmund',
  'rb leipzig': 'leipzig',
  'leipzig': 'leipzig',
  'eintracht frankfurt': 'frankfurt',
  'frankfurt': 'frankfurt',
  'bayern munich': 'bayern',
  'bayern munchen': 'bayern',
  'fc bayern': 'bayern',
  'bayern': 'bayern',
  '1899 hoffenheim': 'hoffenheim',
  'tsg hoffenheim': 'hoffenheim',
  'hoffenheim': 'hoffenheim',
  'vfb stuttgart': 'stuttgart',
  'stuttgart': 'stuttgart',
  'sc freiburg': 'freiburg',
  'freiburg': 'freiburg',
  'fc augsburg': 'augsburg',
  'augsburg': 'augsburg',
  'werder bremen': 'bremen',
  'bremen': 'bremen',
  'union berlin': 'union berlin',
  'fc union berlin': 'union berlin',
  '1. fc union berlin': 'union berlin',
  'fc heidenheim': 'heidenheim',
  '1. fc heidenheim': 'heidenheim',
  'heidenheim': 'heidenheim',
  'fc st. pauli': 'st. pauli',
  'st pauli': 'st. pauli',
  'st. pauli': 'st. pauli',
  'hamburger sv': 'hamburg',
  'hamburg sv': 'hamburg',
  'hamburg': 'hamburg',
  'wolfsburg': 'wolfsburg',
  'vfl wolfsburg': 'wolfsburg',
  '1. fc koln': 'koln',
  'fc koln': 'koln',
  '1. fc köln': 'koln',
  'köln': 'koln',
  'koln': 'koln',
  'mainz 05': 'mainz',
  '1. fsv mainz 05': 'mainz',
  'mainz': 'mainz',
  // J1 / J2
  'urawa red diamonds': 'urawa',
  'urawa reds': 'urawa',
  'urawa': 'urawa',
  'kashima antlers': 'kashima',
  'fc tokyo': 'fc tokyo',
  'tokyo verdy': 'verdy',
  'tokyo verdy 1969': 'verdy',
  'cerezo osaka': 'cerezo osaka',
  'gamba osaka': 'gamba osaka',
  'kawasaki frontale': 'kawasaki frontale',
  'yokohama f.marinos': 'yokohama fm',
  'yokohama f. marinos': 'yokohama fm',
  'yokohama fm': 'yokohama fm',
  'yokohama fc': 'yokohama fc',
  'sanfrecce hiroshima': 'hiroshima',
  'hiroshima': 'hiroshima',
  'kashiwa reysol': 'kashiwa',
  'kashiwa': 'kashiwa',
  'kyoto sanga': 'kyoto',
  'kyoto sanga fc': 'kyoto',
  'kyoto': 'kyoto',
  'fc machida zelvia': 'machida',
  'machida zelvia': 'machida',
  'machida': 'machida',
  'avispa fukuoka': 'fukuoka',
  'fukuoka': 'fukuoka',
  'shonan bellmare': 'shonan',
  'shonan': 'shonan',
  'shimizu s-pulse': 'shimizu',
  'shimizu s pulse': 'shimizu',
  'shimizu': 'shimizu',
  'okayama': 'fagiano okayama',
  'fagiano okayama': 'fagiano okayama',
  'nagoya grampus': 'nagoya grampus',
  'v-varen nagasaki': 'v-varen nagasaki',
  'v varen nagasaki': 'v-varen nagasaki',
  'kagoshima utd': 'kagoshima utd',
  'kagoshima united': 'kagoshima utd',
  // Argentina
  'argentinos jrs': 'argentinos juniors',
  'atl tucuman': 'atletico tucuman',
  'atl. tucuman': 'atletico tucuman',
  'gimnasia lp': 'gimnasia la plata',
  'gimnasia (lp)': 'gimnasia la plata',
  'central cordoba': 'central cordoba',
  'central córdoba': 'central cordoba',
  'central cordoba (sde)': 'central cordoba',
  'racing club': 'racing club',
  'newells old boys': 'newells',
  "newell's old boys": 'newells',
  'newells': 'newells',
  'estudiantes lp': 'estudiantes',
  'estudiantes la plata': 'estudiantes',
  'estudiantes (lp)': 'estudiantes',
  'estudiantes': 'estudiantes',
  'estudiantes rio cuarto': 'estudiantes rio cuarto',
  'estudiantes (rc)': 'estudiantes rio cuarto',
  'velez sarsfield': 'velez',
  'vélez sarsfield': 'velez',
  'velez': 'velez',
  'instituto cordoba': 'instituto',
  'instituto': 'instituto',
  'union santa fe': 'union sf',
  'union sf': 'union sf',
  'union de santa fe': 'union sf',
  'rosario central': 'rosario central',
  'godoy cruz': 'godoy cruz',
  'banfield': 'banfield',
  'platense': 'platense',
  'lanus': 'lanus',
  'lanús': 'lanus',
  'huracan': 'huracan',
  'huracán': 'huracan',
  'tigre': 'tigre',
  'belgrano': 'belgrano',
  'barracas central': 'barracas central',
  'sarmiento': 'sarmiento',
  'defensa y justicia': 'defensa',
  'independiente': 'independiente',
  'independiente rivadavia': 'independiente rivadavia',
  'aldosivi': 'aldosivi',
  'san lorenzo': 'san lorenzo',
  'boca juniors': 'boca',
  'boca jrs': 'boca',
  'boca': 'boca',
  'river plate': 'river',
  'river': 'river',
  // ARG B
  'gimnasia y tiro': 'gimnasia y tiro',
  'agropecuario': 'agropecuario',
  'mitre': 'mitre',
  'arsenal sarandi': 'arsenal',
  'arsenal de sarandi': 'arsenal',
  'almirante brown': 'almirante brown',
  'tristan suarez': 'tristan suarez',
  'tristán suárez': 'tristan suarez',
  'def. de belgrano': 'defensores de belgrano',
  'defensores de belgrano': 'defensores de belgrano',
  'colon': 'colon',
  'colón': 'colon',
  'all boys': 'all boys',
  'estudiantes bs as': 'estudiantes bs as',
  'estudiantes ba': 'estudiantes bs as',
  'gimnasia mendoza': 'gimnasia mendoza',
  'gimnasia (m)': 'gimnasia mendoza',
  'chacarita': 'chacarita',
  'chacarita juniors': 'chacarita',
  'patronato': 'patronato',
  // BR Serie B
  'vila nova': 'vila nova',
  'vila nova fc': 'vila nova',
  'athletic club': 'athletic club',
  'athletic mg': 'athletic club',
  'avai': 'avai',
  'avaí': 'avai',
  'amazonas': 'amazonas',
  'criciuma': 'criciuma',
  'criciúma': 'criciuma',
  'crb': 'crb',
  'goias': 'goias',
  'goiás': 'goias',
  'novorizontino': 'novorizontino',
  'paysandu': 'paysandu',
  'ponte preta': 'ponte preta',
  'cuiaba': 'cuiaba',
  'cuiabá': 'cuiaba',
  'remo': 'remo',
  'operario pr': 'operario',
  'operário pr': 'operario',
  'operario': 'operario',
  'volta redonda': 'volta redonda',
  'chapecoense': 'chapecoense',
  'botafogo sp': 'botafogo sp',
  'botafogo-sp': 'botafogo sp',
  'america mg': 'america mg',
  'américa mg': 'america mg',
  // China
  'beijing guoan': 'beijing guoan',
  'shanghai port': 'shanghai port',
  'shanghai shenhua': 'shanghai shenhua',
  'shandong taishan': 'shandong taishan',
  'shenzhen peng city': 'shenzhen peng city',
  'shenzhen juniors': 'shenzhen juniors',
  'qingdao west coast': 'qingdao west coast',
  'qingdao hainiu': 'qingdao hainiu',
  'tianjin tigers': 'tianjin tigers',
  'tianjin jinmen tiger': 'tianjin tigers',
  'henan': 'henan',
  'henan ssln': 'henan',
  'meizhou hakka': 'meizhou hakka',
  'cangzhou mighty lions': 'cangzhou',
  'cangzhou': 'cangzhou',
  'changchun yatai': 'changchun yatai',
  'wuhan three towns': 'wuhan three towns',
  'chengdu rongcheng': 'chengdu',
  'yunnan yukun': 'yunnan yukun',
  'zhejiang professional': 'zhejiang',
  'zhejiang': 'zhejiang',
  'dalian yingbo': 'dalian yingbo',
  // MLS
  'inter miami cf': 'inter miami',
  'inter miami': 'inter miami',
  'fc cincinnati': 'cincinnati',
  'columbus crew': 'columbus crew',
  'la galaxy': 'la galaxy',
  'lafc': 'lafc',
  'los angeles fc': 'lafc',
  'new york city fc': 'nycfc',
  'nycfc': 'nycfc',
  'new york red bulls': 'ny red bulls',
  'ny red bulls': 'ny red bulls',
  'philadelphia union': 'philadelphia',
  'orlando city sc': 'orlando city',
  'orlando city': 'orlando city',
  'atlanta united': 'atlanta utd',
  'atlanta utd': 'atlanta utd',
  'austin fc': 'austin fc',
  'st. louis city': 'st louis city',
  'st louis city sc': 'st louis city',
  'st louis city': 'st louis city',
  'minnesota united': 'minnesota',
  'minnesota': 'minnesota',
  'colorado rapids': 'colorado',
  'colorado': 'colorado',
  'real salt lake': 'rsl',
  'rsl': 'rsl',
  'fc dallas': 'fc dallas',
  'sporting kc': 'sporting kc',
  'sporting kansas city': 'sporting kc',
  'cf montreal': 'montreal',
  'cf montréal': 'montreal',
  'montreal': 'montreal',
  'd.c. united': 'dc united',
  'dc united': 'dc united',
  'chicago fire': 'chicago fire',
  'charlotte fc': 'charlotte',
  'nashville sc': 'nashville',
  'new england revolution': 'new england',
  'toronto fc': 'toronto',
  'houston dynamo': 'houston',
  'portland timbers': 'portland',
  'seattle sounders': 'seattle',
  'san jose earthquakes': 'san jose',
  'vancouver whitecaps': 'vancouver',
  // USL
  'monterey bay': 'monterey bay',
  'fc tulsa': 'fc tulsa',
  'tampa bay rowdies': 'tampa bay',
  'rhode island fc': 'rhode island',
  'phoenix rising': 'phoenix rising',
  'sacramento republic': 'sacramento',
  'oakland roots': 'oakland',
  'el paso locomotive': 'el paso',
  'colorado switchbacks': 'colorado switchbacks',
  'detroit city': 'detroit',
  'birmingham legion': 'birmingham',
  'charleston battery': 'charleston',
  'indy eleven': 'indy eleven',
  'louisville city': 'louisville',
  'memphis 901': 'memphis 901',
  'miami fc': 'miami fc',
  'new mexico united': 'new mexico',
  'north carolina fc': 'north carolina',
  'orange county sc': 'orange county',
  'pittsburgh riverhounds': 'pittsburgh',
  'san antonio fc': 'san antonio',
  'lexington sc': 'lexington',
  'hartford athletic': 'hartford',
  'loudoun united': 'loudoun',
  'las vegas lights': 'las vegas',
};

function norm(s) {
  if (!s) return '';
  let t = String(s).toLowerCase().trim();
  t = t.normalize('NFD').replace(/[̀-ͯ]/g, '');
  t = t.replace(/[\.\-_]/g, ' ').replace(/\s+/g, ' ').trim();
  if (ALIASES[t]) return ALIASES[t];
  return t;
}

function decodeEnt(s) {
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&nbsp;/g, ' ');
}

function findReal(liga, m1, m2) {
  const arr = REAL[liga] || [];
  const a = norm(m1), b = norm(m2);
  // tenta exato
  for (const j of arr) {
    const jm = norm(j.mandante), jv = norm(j.visitante);
    if (jm === a && jv === b) return { jogo: j, swap: false };
    if (jm === b && jv === a) return { jogo: j, swap: true };
  }
  // tenta substring (fuzzy)
  for (const j of arr) {
    const jm = norm(j.mandante), jv = norm(j.visitante);
    const matchA = jm.includes(a) || a.includes(jm);
    const matchB = jv.includes(b) || b.includes(jv);
    if (matchA && matchB) return { jogo: j, swap: false };
    const matchA2 = jm.includes(b) || b.includes(jm);
    const matchB2 = jv.includes(a) || a.includes(jv);
    if (matchA2 && matchB2) return { jogo: j, swap: true };
  }
  return null;
}

// ---------- Parsers ----------
function stripHtml(s) {
  return decodeEnt(s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

// CISNE
function parseCisne(htmlPath) {
  if (!fs.existsSync(htmlPath)) return [];
  const t = fs.readFileSync(htmlPath, 'utf8');
  const out = [];
  // Cards: começam em "🦢 SELO CISNE NEGRO" ou bloco com Vantagem Projetada.
  // Padrão: bloco com Time1 vs Time2, depois Favorito Absoluto, depois Vantagem Projetada
  const re = /([A-ZÀ-Úa-zà-ú0-9\.\-' ]+?)\s*<br>\s*<span[^>]*>vs<\/span>\s*<br>\s*([A-ZÀ-Úa-zà-ú0-9\.\-' ]+?)\s*<\/div>[\s\S]{0,800}?Favorito Absoluto:\s*<span[^>]*>([^<]+)<\/span>[\s\S]{0,500}?Vantagem Projetada:\s*<span[^>]*>([+\-0-9.]+)\s*cantos<\/span>/g;
  let m;
  while ((m = re.exec(t)) !== null) {
    const t1 = decodeEnt(m[1]).trim();
    const t2 = decodeEnt(m[2]).trim();
    const fav = decodeEnt(m[3]).trim();
    const diff = parseFloat(m[4]);
    if (Math.abs(diff) >= 2.0) {
      out.push({ motor: 'cisne', t1, t2, favorito: fav, diff });
    }
  }
  return out;
}

// VENCEDOR CANTOS — pega só FT
function parseVencedor(htmlPath) {
  if (!fs.existsSync(htmlPath)) return [];
  const t = fs.readFileSync(htmlPath, 'utf8');
  const out = [];
  // Estrutura: <span ...>TIME1 <span ...>vs</span> TIME2</span> ... 🏆 Jogo todo (FT) ... <div ...>✈️|🏠 FAV</div><div ...>Vantagem: +X.X cantos</div>
  const re = /([A-ZÀ-Úa-zà-ú0-9\.\-' ]+?)\s*<span[^>]*>vs<\/span>\s*([A-ZÀ-Úa-zà-ú0-9\.\-' ]+?)\s*<\/span>[\s\S]*?🏆 Jogo todo \(FT\)[\s\S]{0,800}?<div[^>]*>\s*[✈🏠][^<]*<\/div>\s*<div[^>]*>\s*Vantagem:\s*([+\-0-9.]+)\s*cantos/g;
  let m;
  while ((m = re.exec(t)) !== null) {
    const t1 = decodeEnt(m[1]).trim();
    const t2 = decodeEnt(m[2]).trim();
    const vant = parseFloat(m[3]);
    // pega o nome do favorito do bloco FT que precede a vantagem
    const ftBlockStart = t.indexOf('🏆 Jogo todo (FT)', m.index);
    const slice = t.substring(ftBlockStart, ftBlockStart + 800);
    const favRe = /<div[^>]*>\s*([✈🏠]️?[^<]*?)\s*<\/div>\s*<div[^>]*>\s*Vantagem/;
    const fm = favRe.exec(slice);
    let fav = fm ? decodeEnt(fm[1]).replace(/^[✈🏠️\s]+/, '').trim() : null;
    if (vant > 0 && fav) out.push({ motor: 'vencedor', t1, t2, favorito: fav, vant });
  }
  return out;
}

// BALA DE PRATA — pega faixa, favorito, sniper
function parseBala(htmlPath) {
  if (!fs.existsSync(htmlPath)) return [];
  const t = fs.readFileSync(htmlPath, 'utf8');
  const out = [];
  // Match cada card: começa com "TIME1 <span...>vs</span> TIME2" e contém "🏆 Favorito" + valor + faixa NUCLEAR/FORTE/MODERADA
  const re = /class="label"[^>]*>\s*([^<]+?)\s*<span[^>]*>vs<\/span>\s*([^<]+?)\s*<\/div>[\s\S]{0,1500}?🏆 Favorito\s*<\/span>\s*<strong[^>]*>([^<]+)<\/strong>[\s\S]{0,800}?🛡️ Odd Justa[\s\S]{0,200}?<strong[^>]*>@\s*([0-9.]+)<\/strong>[\s\S]{0,400}?(NUCLEAR|FORTE|MODERADA)/g;
  let m;
  while ((m = re.exec(t)) !== null) {
    const t1 = decodeEnt(m[1]).trim();
    const t2 = decodeEnt(m[2]).trim();
    const fav = decodeEnt(m[3]).trim();
    const odd = parseFloat(m[4]);
    const faixa = m[5];
    out.push({ motor: 'bala', t1, t2, favorito: fav, odd, faixa });
  }
  return out;
}

// TEACHER — usa setJogoEmFoco('T1','T2','teacher') + xCorners FT + Sniper Over/Under N
function parseTeacher(htmlPath) {
  if (!fs.existsSync(htmlPath)) return [];
  const t = fs.readFileSync(htmlPath, 'utf8');
  const out = [];
  // o card tem onclick="setJogoEmFoco('T1','T2','teacher')" e dentro xCorners FT row com projeção e sniper
  const re = /setJogoEmFoco\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*,\s*['"]teacher['"]\s*\)[\s\S]{0,4000}?xCorners FT[\s\S]{0,400}?>([0-9.]+)<\/td>\s*<td[^>]*>(OVER|UNDER)\s*([0-9.]+)<\/td>/g;
  let m;
  while ((m = re.exec(t)) !== null) {
    const t1 = decodeEnt(m[1]).trim();
    const t2 = decodeEnt(m[2]).trim();
    const xc = parseFloat(m[3]);
    const dir = m[4];
    const linha = parseFloat(m[5]);
    out.push({ motor: 'teacher', t1, t2, xc, dir, linha });
  }
  return out;
}

// ENIGMA — pega cards com SDE / sinal ATIVO e descobre favorito da linha recomendada
function parseEnigma(htmlPath) {
  if (!fs.existsSync(htmlPath)) return [];
  const t = fs.readFileSync(htmlPath, 'utf8');
  const out = [];
  // Cards delimitados pela classe "enigma-card" (nem sempre na string, mas tem enigma-team-label como anchor)
  // Estratégia: pegar blocos "enigma-team-label">T1</span>...vs/×.../enigma-team-label">T2</span> + "ATIVO" status + linha "FT -X.X TIME"
  // Vamos achar o número SDE e status (ATIVO/OBSERVAÇÃO/RUÍDO) e a linha recomendada que indica favorito.
  const re = /enigma-team-label">\s*([^<]+?)\s*<\/span>\s*<span class="enigma-vs">[^<]*<\/span>\s*<span class="enigma-team-label">\s*([^<]+?)\s*<\/span>[\s\S]{0,1200}?<div[^>]*>([0-9]+)<\/div>\s*<div[^>]*>SDE \/ 100<\/div>\s*<div[^>]*>(ATIVO|OBSERVAÇÃO|OBSERVAR|RUÍDO|RUIDO|SEM SINAL)<\/div>[\s\S]{0,8000}?(?:📌 LINHA RECOMENDADA[\s\S]{0,400}?>FT\s*[+\-]?[0-9.]+\s+([^<(]+?)\s*\(([^)]+)\)<\/span>)?/g;
  let m;
  while ((m = re.exec(t)) !== null) {
    const t1 = decodeEnt(m[1]).trim();
    const t2 = decodeEnt(m[2]).trim();
    const sde = parseInt(m[3]);
    const status = m[4];
    const favRaw = m[5] ? decodeEnt(m[5]).trim() : null;
    const favSide = m[6] ? m[6].trim().toLowerCase() : null;
    if (!/ATIVO/.test(status)) continue; // só conta sinais ativos
    let fav = favRaw;
    if (!fav) {
      // fallback: assume mandante pelo lado mostrado
      fav = t1;
    }
    out.push({ motor: 'enigma', t1, t2, favorito: fav, sde, status, favSide });
  }
  return out;
}

// ---------- Mapas de pastas ----------
const LIGAS = [
  { id: 'BR',      dir: '01_Brasileirão Série A',  data: '2026-05-03', code: 'BR' },
  { id: 'MLS',     dir: '02_Major League Soccer',  data: '2026-05-03', code: 'MLS' },
  { id: 'ARG',     dir: '03_Liga Profesional (ARG)', data: '2026-05-03', code: 'ARG' },
  { id: 'USL',     dir: '04_USL Championship',     data: '2026-05-03', code: 'USL' },
  { id: 'BUN',     dir: '05_Bundesliga',           data: '2026-05-03', code: 'BUN' },
  { id: 'ALM',     dir: '06_A-League',             data: '2026-05-03', code: 'ALM' },
  { id: 'J1',      dir: '07_J1 League',            data: '2026-05-03', code: 'J1' },
  { id: 'CHI',     dir: '08_Primera Div. (CHI)',   data: '2026-05-03', code: 'CHI' },
  { id: 'ECU',     dir: '09_LigaPro (ECU)',        data: '2026-05-03', code: 'ECU' },
  { id: 'ARG_B',   dir: '10_Primera B (ARG)',      data: '2026-05-03', code: 'ARG_B' },
  { id: 'CHN_SUP', dir: '11_Super Liga China',     data: '2026-05-04', code: 'CHN_SUP' },
  { id: 'CHN_1',   dir: '12_Liga One China',       data: '2026-05-04', code: 'CHN_1' },
  { id: 'BR_B',    dir: '13_Brasileirão Série B',  data: '2026-05-04', code: 'BR_B' },
  { id: 'J2_J3',   dir: '14_J2-J3 Japão',          data: '2026-05-04', code: 'J2_J3' },
];

function findFile(dir, prefix) {
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir);
  // procura arquivo da rodada (data 03/04/05 de 05/2026)
  const cand = files.filter(f => /2026-05-0[345]/.test(f) && f.endsWith('.html'));
  if (cand.length === 0) return null;
  // preferência por arquivo com prefix exato
  const p = cand.find(f => f.toLowerCase().startsWith(prefix.toLowerCase()));
  return path.join(dir, p || cand[0]);
}

// ---------- Coleta ----------
const sinais = []; // { motor, liga, t1, t2, favorito, ... }

for (const lg of LIGAS) {
  const base = path.join(ROOT, lg.dir);
  const fCisne   = findFile(path.join(base, '01_Rodadas Cisne Negro'), 'CisneNegro');
  const fTeacher = findFile(path.join(base, '02_Projeção Teacher Rodada'), 'Teacher') || findFile(path.join(base, '02_Projeção Teacher Rodada'), 'Relatorio');
  const fEnigma  = findFile(path.join(base, '03_Projeção Enigma'), 'Enigma');
  const fVenc    = findFile(path.join(base, '04_Vencedor Cantos'), 'VencedorCantos');
  const fBala    = findFile(path.join(base, '05_Bala de Prata'), 'BalaDePrata');

  const cisne = fCisne ? parseCisne(fCisne) : [];
  const venc = fVenc ? parseVencedor(fVenc) : [];
  const bala = fBala ? parseBala(fBala) : [];
  const teacher = fTeacher ? parseTeacher(fTeacher) : [];
  const enigma = fEnigma ? parseEnigma(fEnigma) : [];

  for (const s of cisne) sinais.push({ ...s, liga: lg.id });
  for (const s of venc) sinais.push({ ...s, liga: lg.id });
  for (const s of bala) sinais.push({ ...s, liga: lg.id });
  for (const s of teacher) sinais.push({ ...s, liga: lg.id });
  for (const s of enigma) sinais.push({ ...s, liga: lg.id });
}

// ---------- Cruza com resultados ----------
const resultados = sinais.map(s => {
  const r = findReal(s.liga, s.t1, s.t2);
  if (!r) return { ...s, status: 'NO_MATCH' };
  const j = r.jogo;
  // Determina lado do favorito
  let acerto = null;
  let detalhe = '';
  if (s.motor === 'cisne' || s.motor === 'vencedor' || s.motor === 'bala' || s.motor === 'enigma') {
    const favN = norm(s.favorito);
    const mN = norm(j.mandante), vN = norm(j.visitante);
    let favLadoM = null;
    if (favN === mN || mN.includes(favN) || favN.includes(mN)) favLadoM = true;
    else if (favN === vN || vN.includes(favN) || favN.includes(vN)) favLadoM = false;
    if (favLadoM === null) return { ...s, status: 'FAV_INDEF', jogo: j };
    const favWon = (favLadoM ? j.margem_ft > 0 : j.margem_ft < 0);
    acerto = favWon;
    detalhe = `cantos M ${j.cantos_ft_m}-${j.cantos_ft_v} V (margem ${j.margem_ft})`;
  } else if (s.motor === 'teacher') {
    const linha = s.linha;
    const total = j.total_ft;
    if (s.dir === 'OVER') acerto = total > linha;
    else acerto = total < linha;
    detalhe = `total_ft ${total} vs linha ${s.dir} ${linha}`;
  }
  return { ...s, status: acerto === null ? 'INDEF' : (acerto ? 'ACERTO' : 'ERRO'), jogo: j, detalhe };
});

// ---------- Métricas ----------
function group(arr, fn) {
  const m = {};
  for (const x of arr) {
    const k = fn(x);
    if (!m[k]) m[k] = [];
    m[k].push(x);
  }
  return m;
}

const ok = resultados.filter(r => r.status === 'ACERTO' || r.status === 'ERRO');
const no = resultados.filter(r => r.status === 'NO_MATCH');
const indef = resultados.filter(r => r.status === 'INDEF' || r.status === 'FAV_INDEF');

console.log('\n========== TOTAIS ==========');
console.log('Sinais emitidos total:', sinais.length);
const porMotor = group(sinais, s => s.motor);
for (const m of Object.keys(porMotor)) console.log(`  ${m}: ${porMotor[m].length}`);

console.log('\nCruzados com resultado:', ok.length);
console.log('Não cruzados (NO_MATCH):', no.length);
console.log('Indefinidos:', indef.length);

const acertos = ok.filter(r => r.status === 'ACERTO');
console.log('\nWR global:', acertos.length, '/', ok.length, '=', (100*acertos.length/Math.max(1,ok.length)).toFixed(1)+'%');

console.log('\n========== POR MOTOR ==========');
const okMotor = group(ok, r => r.motor);
for (const m of Object.keys(okMotor)) {
  const arr = okMotor[m];
  const a = arr.filter(r => r.status === 'ACERTO').length;
  console.log(`  ${m}: ${a}/${arr.length} = ${(100*a/arr.length).toFixed(1)}%`);
}

console.log('\n========== POR MOTOR x LIGA ==========');
const motorLigaKey = r => `${r.motor}|${r.liga}`;
const ml = group(ok, motorLigaKey);
const ks = Object.keys(ml).sort();
for (const k of ks) {
  const arr = ml[k];
  const a = arr.filter(r => r.status === 'ACERTO').length;
  console.log(`  ${k}: ${a}/${arr.length} = ${(100*a/arr.length).toFixed(0)}%`);
}

console.log('\n========== BALA POR FAIXA ==========');
const balaArr = ok.filter(r => r.motor === 'bala');
const porFaixa = group(balaArr, r => r.faixa);
for (const f of Object.keys(porFaixa)) {
  const arr = porFaixa[f];
  const a = arr.filter(r => r.status === 'ACERTO').length;
  console.log(`  ${f}: ${a}/${arr.length} = ${(100*a/arr.length).toFixed(0)}%`);
}

console.log('\n========== CISNE POR INTENSIDADE ==========');
const cisneArr = ok.filter(r => r.motor === 'cisne');
const buckets = { '2.0-2.5': [], '2.5-3.0': [], '3.0+': [] };
for (const r of cisneArr) {
  const d = Math.abs(r.diff);
  if (d < 2.5) buckets['2.0-2.5'].push(r);
  else if (d < 3.0) buckets['2.5-3.0'].push(r);
  else buckets['3.0+'].push(r);
}
for (const b of Object.keys(buckets)) {
  const arr = buckets[b];
  const a = arr.filter(r => r.status === 'ACERTO').length;
  console.log(`  Δ ${b}: ${a}/${arr.length} = ${arr.length ? (100*a/arr.length).toFixed(0)+'%' : '-'}`);
}

console.log('\n========== TOP ACERTOS (ALTO NÍVEL) ==========');
const altos = [];
for (const r of ok) {
  if (r.status !== 'ACERTO') continue;
  let score = 0, label = '';
  if (r.motor === 'cisne' && Math.abs(r.diff) >= 2.5) { score = Math.abs(r.diff); label = `Cisne Δ${r.diff}`; }
  if (r.motor === 'bala' && r.faixa === 'NUCLEAR') { score = 100 + (1.50 - r.odd); label = `BP NUCLEAR @${r.odd}`; }
  if (r.motor === 'bala' && r.faixa === 'FORTE') { score = 50; label = `BP FORTE @${r.odd}`; }
  if (r.motor === 'enigma' && r.sde >= 75) { score = r.sde; label = `Enigma SDE ${r.sde}`; }
  if (score) altos.push({ score, label, r });
}
altos.sort((a,b) => b.score - a.score);
for (const a of altos.slice(0,8)) {
  console.log(`  [${a.label}] ${a.r.liga} ${a.r.t1} x ${a.r.t2} fav=${a.r.favorito || '-'} | ${a.r.detalhe}`);
}

console.log('\n========== TOP FURADAS (ALTO NÍVEL) ==========');
const erros = [];
for (const r of ok) {
  if (r.status !== 'ERRO') continue;
  let score = 0, label = '';
  if (r.motor === 'cisne' && Math.abs(r.diff) >= 2.5) { score = Math.abs(r.diff); label = `Cisne Δ${r.diff}`; }
  if (r.motor === 'bala' && r.faixa === 'NUCLEAR') { score = 100; label = `BP NUCLEAR @${r.odd}`; }
  if (r.motor === 'bala' && r.faixa === 'FORTE') { score = 50; label = `BP FORTE @${r.odd}`; }
  if (r.motor === 'enigma' && r.sde >= 75) { score = r.sde; label = `Enigma SDE ${r.sde}`; }
  if (score) erros.push({ score, label, r });
}
erros.sort((a,b) => b.score - a.score);
for (const e of erros.slice(0,10)) {
  console.log(`  [${e.label}] ${e.r.liga} ${e.r.t1} x ${e.r.t2} fav=${e.r.favorito || '-'} | ${e.r.detalhe}`);
}

console.log('\n========== NO_MATCH (não cruzados) ==========');
for (const r of no.slice(0,40)) {
  console.log(`  ${r.motor} ${r.liga} :: ${r.t1} x ${r.t2}`);
}
console.log('Total NO_MATCH:', no.length);

console.log('\n========== INDEFINIDOS (favorito não casou nos placares) ==========');
for (const r of indef.slice(0,20)) {
  console.log(`  ${r.motor} ${r.liga} :: ${r.t1} x ${r.t2} fav=${r.favorito}`);
}

// Salva JSON detalhado pro raciocínio
fs.writeFileSync(path.join(ROOT, '_audit_run_output.json'), JSON.stringify({
  totais: {
    sinais: sinais.length,
    cruzados: ok.length,
    noMatch: no.length,
    indef: indef.length,
    acertos: acertos.length,
    wr: 100*acertos.length/Math.max(1,ok.length),
  },
  porMotor: Object.fromEntries(Object.keys(porMotor).map(m => [m, porMotor[m].length])),
  motorLiga: Object.fromEntries(ks.map(k => {
    const arr = ml[k];
    const a = arr.filter(r => r.status === 'ACERTO').length;
    return [k, { sinais: arr.length, acertos: a, wr: 100*a/arr.length }];
  })),
  faixaBP: Object.fromEntries(Object.keys(porFaixa).map(f => {
    const arr = porFaixa[f];
    const a = arr.filter(r => r.status === 'ACERTO').length;
    return [f, { sinais: arr.length, acertos: a, wr: 100*a/arr.length }];
  })),
  cisneBuckets: Object.fromEntries(Object.keys(buckets).map(b => {
    const arr = buckets[b];
    const a = arr.filter(r => r.status === 'ACERTO').length;
    return [b, { sinais: arr.length, acertos: a, wr: arr.length ? 100*a/arr.length : null }];
  })),
  resultados,
}, null, 2));
console.log('\nSalvo: _audit_run_output.json');
