// Análise profunda jogo-a-jogo da rodada 16/05
// Linhas FIXAS: 4.5 HT e 9.5 FT
// Régua: cruzamento de buckets contextuais + assinaturas + regras calibradas

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const txt = fs.readFileSync(path.join(ROOT, 'data/memoria_dna.js'), 'utf-8');
const ini = txt.indexOf('{');
const fim = txt.lastIndexOf('}') + 1;
const MEM = JSON.parse(txt.slice(ini, fim));

// ─── RODADA ───
const RODADA = {
  BR: [
    ['Atlético-MG','Mirassol'], ['Internacional','Vasco'], ['Fluminense','São Paulo'],
    ['Palmeiras','Cruzeiro'], ['Santos','Coritiba'], ['Bahia','Grêmio'],
    ['Botafogo','Corinthians'], ['Red Bull Bragantino','Vitória'],
    ['Chapecoense','Remo'], ['Athletico-PR','Flamengo']
  ],
  BR_B: [
    ['Operario-PR','Nautico'], ['Sao Bernardo','America MG'], ['Goias','Botafogo SP'],
    ['Cuiaba','Novorizontino'], ['Athletic Club','Juventude'], ['Vila Nova FC','Avai'],
    ['Ceara','Fortaleza'], ['Criciuma','Atletico GO'], ['Sport Recife','CRB'],
    ['Ponte Preta','Londrina']
  ],
  ARG: [
    ['River Plate','Rosario Central'], ['Argentinos Jrs','Belgrano']
  ],
  ARG_B: [
    ['Atletico Atlanta','Atl. Rafaela'], ['Los Andes','Godoy Cruz'],
    ['Almirante Brown','San Telmo'], ['CA Estudiantes','Colon Santa Fe'],
    ['Ciudad Bolivar','Acassuso'], ['Colegiales','Club A. Guemes'],
    ['Deportivo Madryn','Ferro'], ['Almagro','San Martin S.J.'],
    ['Gimnasia Jujuy','Temperley'], ['CA Mitre','San Miguel'],
    ['Patronato','Chacarita Juniors'], ['Midland','Agropecuario'],
    ['Deportivo Maipu','Nueva Chicago'], ['Gimnasia y Tiro','San Martin T.'],
    ['Quilmes','Tristan Suarez'], ['Def. de Belgrano','Chaco For Ever'],
    ['All Boys','Deportivo Moron']
  ],
  MLS: [
    ['CF Montreal','Chicago Fire'], ['Charlotte','Toronto FC'],
    ['DC United','St. Louis City'], ['New England Revolution','Minnesota United'],
    ['New York Red Bulls','New York City'], ['Orlando City','Atlanta Utd'],
    ['Philadelphia Union','Columbus Crew'], ['Austin FC','Sporting Kansas City'],
    ['Houston Dynamo','Vancouver Whitecaps'], ['Seattle Sounders','Los Angeles Galaxy'],
    ['Real Salt Lake','Colorado Rapids'], ['San Diego FC','FC Cincinnati'],
    ['San Jose Earthquakes','FC Dallas'], ['Inter Miami','Portland Timbers'],
    ['Nashville SC','Los Angeles FC']
  ],
  USL: [
    ['Detroit','Miami FC'], ['New Mexico','Tampa Bay'], ['FC Tulsa','Hartford Athletic']
  ],
  J2_J3: [
    ['Albirex Niigata','Nara Club'], ['Fukushima Utd','Hokkaido Consadole Sapporo'],
    ['Sagamihara','Vanraure'], ['Sagan Tosu','Renofa Yamaguchi'],
    ['Shonan Bellmare','Vegalta Sendai'], ['Tochigi City','Montedio Yamagata'],
    ['Iwata','Fujieda MYFC'], ['Kofu','Gifu'],
    ['Blaublitz','Kusatsu'], ['Imabari','Kamatamare'],
    ['Iwaki','Yamaga'], ['Kagoshima Utd','Kumamoto'],
    ['Kochi United','Ehime'], ['Oita Trinita','Tegevajaro Miyazaki'],
    ['Omiya Ardija','Nagano'], ['Osaka','Kanazawa'],
    ['Toyama','Tokushima'], ['Yokohama FC','Tochigi SC'],
    ['Reilac Shiga','Giravanz Kitakyushu'], ['Ryukyu','Gainare Tottori']
  ]
};

// ─── HELPERS ───
function getCat(ps) {
  if (ps >= 80) return 'elite';
  if (ps >= 60) return 'medio_forte';
  if (ps >= 40) return 'medio';
  return 'azarao';
}

function getBucket(time, ctx, catAdv) {
  if (!time.dossie_individual || !time.dossie_individual.sintese_segmentada) return null;
  const key = `${ctx}_vs_${catAdv}`;
  return time.dossie_individual.sintese_segmentada[key] || null;
}

function getAssinaturas(time) {
  if (!time.assinaturas) return [];
  return time.assinaturas.filter(a => a.presente).map(a => a.nome);
}

function getRitmoHT(time) {
  // % cantos HT
  if (time.dossie_tatico && time.dossie_tatico.ritmo_ht_ft) {
    return time.dossie_tatico.ritmo_ht_ft.pct_cantos_no_ht / 100;
  }
  // fallback: usa baseline
  const b = time.baseline;
  if (!b || !b.cantos_pro_geral || !b.cantos_pro_ht_geral) return 0.4;
  return b.cantos_pro_ht_geral / b.cantos_pro_geral;
}

function getVolatilidade(time) {
  if (time.dossie_tatico && time.dossie_tatico.volatilidade) {
    return time.dossie_tatico.volatilidade.classificacao;
  }
  return 'MODERADA';
}

function getTendencia(time) {
  if (time.dossie_tatico && time.dossie_tatico.tendencia) {
    return time.dossie_tatico.tendencia.veredito;
  }
  return null;
}

// ─── ANÁLISE DE 1 JOGO ───
function analisarJogo(liga, nomeM, nomeV) {
  const ligaData = MEM[liga];
  if (!ligaData || !ligaData.times) return { erro: 'liga não existe' };

  const tm = ligaData.times[nomeM];
  const tv = ligaData.times[nomeV];
  if (!tm) return { erro: `mandante ${nomeM} não existe` };
  if (!tv) return { erro: `visitante ${nomeV} não existe` };

  const psM = tm.identidade.powerScore;
  const psV = tv.identidade.powerScore;
  const catM = getCat(psM);
  const catV = getCat(psV);

  // BUCKETS CRUZADOS
  const bM = getBucket(tm, 'casa', catV);
  const bV = getBucket(tv, 'fora', catM);

  // Cruzamento ponderado por n (FT)
  let xFT = null, xFT_detail = '';
  const partes = [];
  if (bM && bM.n > 0) partes.push({ total: bM.total, n: bM.n, label: `M_casa_vs_${catV}` });
  if (bV && bV.n > 0) partes.push({ total: bV.total, n: bV.n, label: `V_fora_vs_${catM}` });

  if (partes.length === 0) {
    // fallback: baselines casa/fora
    const cm = (tm.baseline.cantos_pro_casa || tm.baseline.cantos_pro_geral) + (tm.baseline.cantos_sofridos_casa || tm.baseline.cantos_sofridos_geral);
    const cv = (tv.baseline.cantos_pro_fora || tv.baseline.cantos_pro_geral) + (tv.baseline.cantos_sofridos_fora || tv.baseline.cantos_sofridos_geral);
    xFT = (cm + cv) / 2;
    xFT_detail = 'fallback_baseline';
  } else {
    const sumN = partes.reduce((a, p) => a + p.n, 0);
    xFT = partes.reduce((a, p) => a + p.total * p.n, 0) / sumN;
    xFT_detail = partes.map(p => `${p.label}=${p.total.toFixed(1)}(n=${p.n})`).join(' | ');
  }

  // xHT cruzado: usa ritmo HT de cada time aplicado ao xFT
  const rhtM = getRitmoHT(tm);
  const rhtV = getRitmoHT(tv);
  const rhtMed = (rhtM + rhtV) / 2;
  const xHT = xFT * rhtMed;

  // Variação de xFT cruzado (para detectar buckets divergentes)
  let xFTvariancia = 0;
  if (partes.length >= 2) {
    const xFTmed = partes.reduce((a, p) => a + p.total, 0) / partes.length;
    xFTvariancia = Math.max(...partes.map(p => Math.abs(p.total - xFTmed)));
  }

  // ASSINATURAS
  const assM = getAssinaturas(tm);
  const assV = getAssinaturas(tv);

  // FLAGS DE RISCO
  const flags = [];
  if (assM.includes('BLITZ_INICIAL')) flags.push('M_BLITZ');
  if (assM.includes('RETRANCA_AVANCADA')) flags.push('M_RETRANCA');
  if (assM.includes('MURO_DEFENSIVO')) flags.push('M_MURO');
  if (assM.includes('DEFESA_PRECARIA')) flags.push('M_DEF_PRECARIA');
  if (assM.includes('RUPTURA_HOME')) flags.push('M_RUPTURA_HOME');
  if (assM.includes('ELITE_KILLER')) flags.push('M_ELITE_KILLER');
  if (assV.includes('BLITZ_INICIAL')) flags.push('V_BLITZ');
  if (assV.includes('RETRANCA_AVANCADA')) flags.push('V_RETRANCA');
  if (assV.includes('MURO_DEFENSIVO')) flags.push('V_MURO');
  if (assV.includes('DEFESA_PRECARIA')) flags.push('V_DEF_PRECARIA');
  if (assV.includes('ELITE_KILLER')) flags.push('V_ELITE_KILLER');

  const volM = getVolatilidade(tm);
  const volV = getVolatilidade(tv);
  if (volM === 'VOLATIL_ALTO') flags.push('M_VOLATIL');
  if (volV === 'VOLATIL_ALTO') flags.push('V_VOLATIL');

  const tendM = getTendencia(tm);
  const tendV = getTendencia(tv);

  // SAMPLE SIZE TOTAL
  const nTotal = (bM ? bM.n : 0) + (bV ? bV.n : 0);

  // CONFIABILIDADE DOS BUCKETS
  const confiabM = bM ? bM.confiabilidade : 'sem_dado';
  const confiabV = bV ? bV.confiabilidade : 'sem_dado';

  // OVER 9.5 % nos buckets
  const over95M = bM ? bM.over9_5_pct : null;
  const over95V = bV ? bV.over9_5_pct : null;

  return {
    jogo: `${nomeM} × ${nomeV}`,
    liga,
    ps: { M: psM, V: psV, catM, catV },
    xFT: +xFT.toFixed(2),
    xHT: +xHT.toFixed(2),
    xFT_detail,
    xFTvariancia: +xFTvariancia.toFixed(2),
    bucketM: bM ? { total: bM.total, n: bM.n, over95: bM.over9_5_pct, veredito: bM.veredito_dominante, conf: bM.confiabilidade } : null,
    bucketV: bV ? { total: bV.total, n: bV.n, over95: bV.over9_5_pct, veredito: bV.veredito_dominante, conf: bV.confiabilidade } : null,
    nTotal,
    assM, assV, flags,
    volM, volV,
    tendM, tendV,
    over95: { M: over95M, V: over95V }
  };
}

// ─── EXECUTAR ───
const resultados = {};
Object.entries(RODADA).forEach(([liga, jogos]) => {
  resultados[liga] = jogos.map(([m, v]) => analisarJogo(liga, m, v));
});

fs.writeFileSync(path.join(__dirname, 'analise_rodada_1605.json'), JSON.stringify(resultados, null, 2), 'utf-8');
console.log('✅ Análise gerada: analise_rodada_1605.json');

// Print resumo
Object.entries(resultados).forEach(([liga, jogos]) => {
  console.log(`\n═══ ${liga} ═══`);
  jogos.forEach(j => {
    if (j.erro) { console.log(`  ❌ ${j.erro}`); return; }
    const margFT = (9.5 - j.xFT).toFixed(2);
    const margHT = (4.5 - j.xHT).toFixed(2);
    const dirFT = j.xFT < 9.5 ? '⬇UND' : '⬆OVR';
    const dirHT = j.xHT < 4.5 ? '⬇UND' : '⬆OVR';
    console.log(`  ${j.jogo.padEnd(45)} xFT=${j.xFT.toString().padEnd(5)} xHT=${j.xHT.toString().padEnd(4)} ${dirFT}(${margFT}) ${dirHT}(${margHT}) flags=${j.flags.join(',') || '-'}`);
  });
});
