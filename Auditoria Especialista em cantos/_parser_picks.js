/**
 * Parser dos relatórios Bala de Prata + Teacher (2026-05-22)
 * Extrai todos os jogos + projeções FT para ranquear Over 10.5 / Under 8.5
 */
const fs = require('fs');
const path = require('path');

const BASE = __dirname;
const HOJE = '2026-05-22';

const LIGAS = [
  { dir: '01_Brasileirão Série A',  cod: 'BR',     emoji: '🇧🇷' },
  { dir: '02_Major League Soccer',  cod: 'MLS',    emoji: '🇺🇸' },
  { dir: '04_USL Championship',     cod: 'USL',    emoji: '🇺🇸' },
  { dir: '08_Primera Div. (CHI)',   cod: 'CHI',    emoji: '🇨🇱' },
  { dir: '09_LigaPro (ECU)',        cod: 'ECU',    emoji: '🇪🇨' },
  { dir: '10_Primera B (ARG)',      cod: 'ARG_B',  emoji: '🇦🇷' },
  { dir: '11_Super Liga China',     cod: 'CHN_SUP',emoji: '🇨🇳' },
  { dir: '12_Liga One China',       cod: 'CHN_1',  emoji: '🇨🇳' },
  { dir: '13_Brasileirão Série B',  cod: 'BR_B',   emoji: '🇧🇷' },
  { dir: '14_J2-J3 Japão',          cod: 'J2_J3',  emoji: '🇯🇵' }
];

// ════════════════════════════════════════════════════════════════
// Parser Bala de Prata
// Estrutura: <tr><td>JogoNome</td><td>Over%</td><td>@odd</td>
//                <td>Linha%</td><td>@odd</td><td>Under%</td><td>@odd</td>
//                <td>PICK</td><td>Projeção</td></tr>
// ════════════════════════════════════════════════════════════════
function parseBalaDePrata(html, liga) {
  const jogos = [];
  // Regex para capturar linha completa <tr> ... </tr> que tenha "vs"
  const rows = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) || [];

  rows.forEach(row => {
    if (!row.includes(' vs ')) return;
    const tds = row.match(/<td[^>]*>([\s\S]*?)<\/td>/g) || [];
    if (tds.length < 9) return;

    const stripHtml = s => s.replace(/<[^>]+>/g, '').trim();
    const partida = stripHtml(tds[0]);
    if (!partida.includes(' vs ')) return;

    const overPct = parseFloat(stripHtml(tds[1])) || null;
    const overOdd = parseFloat(stripHtml(tds[2]).replace('@','').trim()) || null;
    const linhaPct = parseFloat(stripHtml(tds[3])) || null;
    const linhaOdd = parseFloat(stripHtml(tds[4]).replace('@','').trim()) || null;
    const underPct = parseFloat(stripHtml(tds[5])) || null;
    const underOdd = parseFloat(stripHtml(tds[6]).replace('@','').trim()) || null;
    const pick = stripHtml(tds[7]);
    const projecao = parseFloat(stripHtml(tds[8])) || null;

    const [mandante, visitante] = partida.split(' vs ').map(s => s.trim());
    if (!mandante || !visitante || !projecao) return;

    jogos.push({
      liga,
      mandante,
      visitante,
      projecao_ft: projecao,
      pick_balaprata: pick,
      over_pct: overPct,
      over_odd: overOdd,
      linha_pct: linhaPct,
      linha_odd: linhaOdd,
      under_pct: underPct,
      under_odd: underOdd
    });
  });
  return jogos;
}

// ════════════════════════════════════════════════════════════════
// Coleta de todos os jogos
// ════════════════════════════════════════════════════════════════
const todosJogos = new Map(); // chave: liga|mandante|visitante

LIGAS.forEach(({ dir, cod, emoji }) => {
  // Bala de Prata
  const arqBP = path.join(BASE, dir, '05_Bala de Prata', `BalaDePrata_${cod}_${HOJE}.html`);
  if (!fs.existsSync(arqBP)) {
    console.log(`  ⚠️  ${cod}: BalaDePrata ausente`);
    return;
  }
  const html = fs.readFileSync(arqBP, 'utf8');
  const jogos = parseBalaDePrata(html, cod);
  jogos.forEach(j => {
    j.liga_emoji = emoji;
    const chave = `${cod}|${j.mandante}|${j.visitante}`;
    if (!todosJogos.has(chave)) {
      todosJogos.set(chave, j);
    }
  });
  console.log(`  ✅ ${cod}: ${jogos.length} jogos extraídos`);
});

const jogosArray = [...todosJogos.values()];
console.log('');
console.log('Total de jogos únicos coletados:', jogosArray.length);

// ════════════════════════════════════════════════════════════════
// RANKING: Top 15 OVER 10.5 (projeção alta)
// ════════════════════════════════════════════════════════════════
const overCandidatos = jogosArray
  .filter(j => j.projecao_ft > 10.5)
  .sort((a, b) => b.projecao_ft - a.projecao_ft);

const top15Over = overCandidatos.slice(0, 15);

// ════════════════════════════════════════════════════════════════
// RANKING: Top 15 UNDER 8.5 (projeção baixa)
// ════════════════════════════════════════════════════════════════
const underCandidatos = jogosArray
  .filter(j => j.projecao_ft < 8.5)
  .sort((a, b) => a.projecao_ft - b.projecao_ft);

const top15Under = underCandidatos.slice(0, 15);

// ════════════════════════════════════════════════════════════════
// Saída JSON para o gerador de Word
// ════════════════════════════════════════════════════════════════
const resultado = {
  data_geracao: new Date().toISOString(),
  total_jogos_analisados: jogosArray.length,
  total_ligas: LIGAS.length,
  candidatos_over: overCandidatos.length,
  candidatos_under: underCandidatos.length,
  top15_over_105: top15Over,
  top15_under_85: top15Under
};

const outPath = path.join(BASE, '_picks_2026-05-22.json');
fs.writeFileSync(outPath, JSON.stringify(resultado, null, 2));
console.log('');
console.log('═══ RESUMO ═══');
console.log(`  Candidatos Over 10.5 (proj > 10.5): ${overCandidatos.length}`);
console.log(`  Candidatos Under 8.5 (proj < 8.5):  ${underCandidatos.length}`);
console.log('');
console.log('🏆 TOP 5 OVER 10.5:');
top15Over.slice(0, 5).forEach((j, i) => {
  console.log(`  ${i+1}. [${j.liga}] ${j.mandante} vs ${j.visitante} | proj: ${j.projecao_ft} | pick: ${j.pick_balaprata}`);
});
console.log('');
console.log('🏆 TOP 5 UNDER 8.5:');
top15Under.slice(0, 5).forEach((j, i) => {
  console.log(`  ${i+1}. [${j.liga}] ${j.mandante} vs ${j.visitante} | proj: ${j.projecao_ft} | pick: ${j.pick_balaprata}`);
});
console.log('');
console.log(`Arquivo salvo: ${outPath}`);
