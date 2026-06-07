const fs = require('fs');

if (!fs.existsSync('raw_usl.json')) {
  console.log('Arquivo raw_usl.json não encontrado.');
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync('raw_usl.json', 'utf-8'));

// Não vamos mapear times argentinos rigidamente, deixaremos o nome natural vindo do Flashscore
function normalizar(nome) {
  if (!nome) return "Desconhecido";
  return nome.trim();
}

let jogosFormatados = [];
let rodadaAtual = 1;
let jogosPorRodada = 0;

for (let i = raw.length - 1; i >= 0; i--) {
  const j = raw[i];
  
  if (jogosPorRodada >= 10) {
      rodadaAtual++;
      jogosPorRodada = 0;
  }
  jogosPorRodada++;

  const m = normalizar(j.mandante);
  const v = normalizar(j.visitante);

  // Filtro de fallback matemático (Flashscore falhou? Usa 1)
  const posse_m = j.stats_taticas.posse.m || 50;
  const posse_v = j.stats_taticas.posse.v || 50;
  const final_m = j.stats_taticas.finalizacoes.m || 10;
  const final_v = j.stats_taticas.finalizacoes.v || 10;

  jogosFormatados.push({
    rodada: rodadaAtual,
    data: "2026-04-04", // Fake date just to maintain schema
    mandante: m,
    visitante: v,
    cantos: {
      ht: { m: j.cantos.ht.m, v: j.cantos.ht.v },
      ft: { m: j.cantos.ft.m, v: j.cantos.ft.v }
    },
    stats_taticas: {
      posse: { m: posse_m, v: posse_v },
      finalizacoes: { m: final_m, v: final_v }
    }
  });
}

// Extrair os times únicos para popular o combobox no frontend
const timesSet = new Set();
jogosFormatados.forEach(j => {
  timesSet.add(j.mandante);
  timesSet.add(j.visitante);
});
const timesUnicos = Array.from(timesSet).sort();

const saidaStr = `// ============================================================
// DADOS DA USL CHAMPIONSHIP 2026 — MOTOR FANTASMA TMI
// Extração Automática via Skynet Preditiva
// ============================================================

window.DADOS_USL = {
  temporada: "USL Championship",
  ultimaAtualizacao: "Hoje",
  totalRodadas: ${rodadaAtual},
  times: ${JSON.stringify(timesUnicos, null, 4)},
  jogos: ${JSON.stringify(jogosFormatados, null, 4)}
};
`;

fs.writeFileSync('../data/usl2026.js', saidaStr, 'utf-8');
console.log('✅ Arquivo ../data/usl2026.js formatado com sucesso! Contém Estatísticas Táticas Injetadas (Posse e Chutes)!');
