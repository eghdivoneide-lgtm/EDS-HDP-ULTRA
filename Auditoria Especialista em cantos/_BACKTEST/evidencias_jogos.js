// Extrai evidências dos jogos individuais REAIS que sustentam cada pick.

const fs = require('fs');
const path = require('path');
const ranking = JSON.parse(fs.readFileSync(path.join(__dirname, 'ranking_profundo_1605.json'), 'utf-8'));

function fmtJogo(j) {
  return `${j.data} ${j.adv}(PS${j.adv_PS}) ${j.pro}-${j.sof} (HT:${j.ht}) total=${j.total} ${j.veredito}`;
}

Object.entries(ranking).forEach(([liga, picks]) => {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`  ${liga}`);
  console.log('═'.repeat(70));
  picks.forEach((p, i) => {
    console.log(`\n  ${i + 1}. [${p.conf}] ${p.mercado} — ${p.jogo}`);
    console.log(`     Margem ${p.margem} | xFT ${p.xFT} | xHT ${p.xHT} | n=${p.n_relevantes} | over9.5_empirico=${p.over95Pct}%`);
    console.log(`     PS: ${p.psM} (${p.catM}) × ${p.psV} (${p.catV})`);
    if (p.flags.length) console.log(`     Flags: ${p.flags.join(', ')}`);
    if (p.tendM || p.tendV) console.log(`     Tendência M:${p.tendM || '-'} V:${p.tendV || '-'}`);
    if (p.h2h) console.log(`     H2H: ${p.h2h.data} (${p.h2h.ctx}) ${p.h2h.cantos} total=${p.h2h.total}`);

    if (p.jogosM && p.jogosM.length) {
      console.log(`     ── ${p.jogo.split(' × ')[0]} (casa) histórico relevante (peso ≥0.5) ──`);
      p.jogosM.filter(j => j.peso >= 0.5).forEach(j => {
        console.log(`        ${fmtJogo(j)} [peso ${j.peso}]`);
      });
    }
    if (p.jogosV && p.jogosV.length) {
      console.log(`     ── ${p.jogo.split(' × ')[1]} (fora) histórico relevante (peso ≥0.5) ──`);
      p.jogosV.filter(j => j.peso >= 0.5).forEach(j => {
        console.log(`        ${fmtJogo(j)} [peso ${j.peso}]`);
      });
    }
  });
});
