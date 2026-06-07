// ANÁLISE JOGO-A-JOGO REAL — sem médias agregadas.
// Para cada confronto da rodada, abre os 15 jogos históricos REAIS de cada time
// e filtra os jogos com perfil similar (mesma força do adversário no mesmo contexto).
// Projeção = média ponderada dos jogos reais relevantes.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const completo = JSON.parse(fs.readFileSync(path.join(ROOT, 'memoria Fotografica/09_DOSSIE_JOGO_A_JOGO_COMPLETO.json'), 'utf-8'));
const memTxt = fs.readFileSync(path.join(ROOT, 'data/memoria_dna.js'), 'utf-8');
const MEM = JSON.parse(memTxt.slice(memTxt.indexOf('{'), memTxt.lastIndexOf('}') + 1));

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

function catBucket(ps) {
  // categorias usadas no dossiê COMPLETO
  if (ps >= 80) return 'ELITE';
  if (ps >= 60) return 'MEDIO_FORTE';
  if (ps >= 40) return 'MEDIO';
  if (ps >= 25) return 'MEDIO_FRACO';
  return 'AZARAO';
}

function similaridadePS(psA, psB) {
  const diff = Math.abs(psA - psB);
  if (diff <= 10) return 1.0;
  if (diff <= 20) return 0.75;
  if (diff <= 30) return 0.5;
  if (diff <= 40) return 0.3;
  return 0.15;
}

function analisarJogo(liga, nomeM, nomeV) {
  if (!completo[liga]) return { erro: `liga ${liga} não no dossie completo` };
  const histM = completo[liga][nomeM];
  const histV = completo[liga][nomeV];
  if (!histM) return { erro: `${nomeM} não tem histórico` };
  if (!histV) return { erro: `${nomeV} não tem histórico` };

  const tm = MEM[liga].times[nomeM];
  const tv = MEM[liga].times[nomeV];
  const psM = tm.identidade.powerScore;
  const psV = tv.identidade.powerScore;
  const catM = catBucket(psM);
  const catV = catBucket(psV);

  // Para mandante: pegar jogos EM CASA com adversário de PS similar ao visitante
  const jogosM = histM.filter(j => j.ctx === 'casa');
  const jogosM_relevantes = jogosM.map(j => ({
    ...j, peso: similaridadePS(j.adv_PS, psV)
  }));

  // Para visitante: pegar jogos FORA com adversário de PS similar ao mandante
  const jogosV = histV.filter(j => j.ctx === 'fora');
  const jogosV_relevantes = jogosV.map(j => ({
    ...j, peso: similaridadePS(j.adv_PS, psM)
  }));

  // Combinar: o jogo individual de cada lado representa metade do confronto
  // Pra cantos_PRO de cada lado, uso jogos do próprio time
  // Pra estimar TOTAL FT do confronto:
  //  - somar todos os jogos relevantes de ambos os lados
  //  - cada jogo conta como uma observação total (já é total_ft)
  //  - ponderado por peso (similaridade)

  const todos = [
    ...jogosM_relevantes.map(j => ({ ...j, lado: 'M' })),
    ...jogosV_relevantes.map(j => ({ ...j, lado: 'V' }))
  ].filter(j => j.peso >= 0.3); // ignora jogos muito fora do contexto

  if (todos.length === 0) {
    return { erro: 'sem jogos contextualmente relevantes' };
  }

  // xFT REAL: média ponderada dos totais FT dos jogos relevantes
  const sumPesoFT = todos.reduce((a, j) => a + j.peso, 0);
  const xFT = todos.reduce((a, j) => a + j.total_ft * j.peso, 0) / sumPesoFT;

  // xHT REAL: cantos no HT dos jogos relevantes
  // (cantos_ht_pro é o do próprio time. Como temos os 2 lados, somamos os pro deles)
  // Cada lado contribui com seus cantos_ht_pro como produto do "seu" produto HT
  // Para o total HT, preciso ver: nesta projeção, cada jogo representa o time inteiro do lado;
  // a soma é cantos_ht_pro do time + cantos_sof_ht do oponente naquele jogo, MAS não temos cantos_sof_ht.
  // Aproximação razoável: ratio HT/FT médio dos jogos relevantes aplicado ao xFT.
  const sumHTpro = todos.reduce((a, j) => a + (j.cantos_ht_pro || 0) * j.peso, 0) / sumPesoFT;
  const sumFTpro = todos.reduce((a, j) => a + (j.cantos_pro || 0) * j.peso, 0) / sumPesoFT;
  const ratioHT = sumFTpro > 0 ? sumHTpro / sumFTpro : 0.4;
  const xHT = xFT * ratioHT;

  // Distribuição empírica: % jogos relevantes que ficaram over/under 9.5 FT
  const over95Real = todos.filter(j => j.total_ft > 9).length;
  const under95Real = todos.filter(j => j.total_ft < 10).length;
  const over95Pct = (over95Real / todos.length * 100).toFixed(0);

  // Distribuição HT (ponderada — cada jogo: cantos_ht_pro + cantos_sof_ht do oponente)
  // Sem cantos_sof_ht no dossie, uso aproximação: total_ht ~= 2 * cantos_ht_pro do time
  // melhor: usar ratio FT individual aplicado a cada jogo total_ft
  // Aqui simplifico contando jogos com cantos_ht_pro*2 >= 5 como "over 4.5 HT do lado dele"
  // (não é perfeito, mas é um indicador)

  // Confronto direto histórico? (procura V × M ou M × V no histórico de M ou V)
  const h2hM = histM.filter(j => j.adv === nomeV);
  const h2hV = histV.filter(j => j.adv === nomeM);
  const h2h = h2hM.length > 0 ? h2hM[0] : (h2hV.length > 0 ? h2hV[0] : null);

  // Assinaturas
  const assM = (tm.assinaturas || []).filter(a => a.presente).map(a => a.nome);
  const assV = (tv.assinaturas || []).filter(a => a.presente).map(a => a.nome);

  // Volatilidade e tendência
  const volM = tm.dossie_tatico && tm.dossie_tatico.volatilidade ? tm.dossie_tatico.volatilidade.classificacao : 'MODERADA';
  const volV = tv.dossie_tatico && tv.dossie_tatico.volatilidade ? tv.dossie_tatico.volatilidade.classificacao : 'MODERADA';
  const tendM = tm.dossie_tatico && tm.dossie_tatico.tendencia ? tm.dossie_tatico.tendencia.veredito : null;
  const tendV = tv.dossie_tatico && tv.dossie_tatico.tendencia ? tv.dossie_tatico.tendencia.veredito : null;

  return {
    jogo: `${nomeM} × ${nomeV}`,
    liga,
    ps: { M: psM, V: psV, catM, catV },
    n_relevantes: todos.length,
    xFT: +xFT.toFixed(2),
    xHT: +xHT.toFixed(2),
    over95Real, under95Real, over95Pct: +over95Pct,
    h2h: h2h ? { data: h2h.data, ctx: h2h.ctx, cantos: `${h2h.cantos_pro}-${h2h.cantos_sof}`, total: h2h.total_ft } : null,
    assM, assV, volM, volV, tendM, tendV,
    // Top jogos relevantes (para mostrar evidência)
    jogosM_relevantes: jogosM_relevantes.filter(j => j.peso >= 0.5).map(j => ({
      data: j.data, adv: j.adv, ps: j.adv_PS, pro: j.cantos_pro, sof: j.cantos_sof, total: j.total_ft, ht: j.cantos_ht_pro, veredito: j.veredito, peso: j.peso
    })),
    jogosV_relevantes: jogosV_relevantes.filter(j => j.peso >= 0.5).map(j => ({
      data: j.data, adv: j.adv, ps: j.adv_PS, pro: j.cantos_pro, sof: j.cantos_sof, total: j.total_ft, ht: j.cantos_ht_pro, veredito: j.veredito, peso: j.peso
    }))
  };
}

const resultados = {};
Object.entries(RODADA).forEach(([liga, jogos]) => {
  resultados[liga] = jogos.map(([m, v]) => analisarJogo(liga, m, v));
});

fs.writeFileSync(path.join(__dirname, 'analise_profunda_real.json'), JSON.stringify(resultados, null, 2), 'utf-8');

console.log('✅ Análise profunda jogo-a-jogo REAL gerada.');
console.log('\n────── RESUMO ──────');
Object.entries(resultados).forEach(([liga, jogos]) => {
  console.log(`\n═══ ${liga} ═══`);
  jogos.forEach(j => {
    if (j.erro) { console.log(`  ❌ ${j.jogo || ''} - ${j.erro}`); return; }
    const dirFT = j.xFT < 9.5 ? '⬇UND' : '⬆OVR';
    const dirHT = j.xHT < 4.5 ? '⬇UND' : '⬆OVR';
    const margFT = (9.5 - j.xFT).toFixed(1);
    const margHT = (4.5 - j.xHT).toFixed(1);
    console.log(`  ${j.jogo.padEnd(46)} xFT=${j.xFT.toString().padEnd(5)} xHT=${j.xHT.toString().padEnd(4)} ${dirFT}(${margFT}) ${dirHT}(${margHT}) | n=${j.n_relevantes} over9.5=${j.over95Pct}%`);
  });
});
