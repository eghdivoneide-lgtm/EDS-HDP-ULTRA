const fs = require('fs');

if (!fs.existsSync('raw_br.json')) {
  console.log('Arquivo raw_br.json não encontrado.');
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync('raw_br.json', 'utf-8'));

// Dicionário de padronizar nomes do Flashscore para o nome oficial que usamos no Frontend
const mapTimes = {
  "Athletico-PR": "Athletico-PR",
  "Atletico-MG": "Atlético-MG",
  "Bahia": "Bahia",
  "Botafogo": "Botafogo",
  "Chapecoense-SC": "Chapecoense",
  "Corinthians": "Corinthians",
  "Coritiba": "Coritiba",
  "Cruzeiro": "Cruzeiro",
  "Flamengo RJ": "Flamengo", 
  "Flamengo": "Flamengo",
  "Fluminense": "Fluminense",
  "Gremio": "Grêmio",
  "Internacional": "Internacional",
  "Mirassol": "Mirassol",
  "Palmeiras": "Palmeiras",
  "Bragantino": "Red Bull Bragantino",
  "Red Bull Bragantino": "Red Bull Bragantino",
  "Remo": "Remo",
  "Santos": "Santos",
  "Sao Paulo": "São Paulo",
  "Vasco": "Vasco",
  "Vitoria": "Vitória",
  // Adicionando alguns extras caso o flashscore traga variações
  "Atletico GO": "Atlético-GO",
  "Cuiaba": "Cuiabá",
  "Fortaleza": "Fortaleza",
  "Juventude": "Juventude",
  "Criciuma": "Criciúma"
};

function normalizar(nome) {
  if (!nome) return "Desconhecido";
  if (mapTimes[nome]) return mapTimes[nome];
  return nome.replace(' SP', '').replace(' RJ', '').replace(' MG', '').trim();
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
// DADOS DO BRASILEIRÃO SÉRIE A 2026 — MOTOR FANTASMA TMI
// Extração Automática via Skynet Preditiva
// ============================================================

const DADOS_2026 = {
  temporada: "Brasileirão Série A",
  ultimaAtualizacao: "Hoje",
  totalRodadas: ${rodadaAtual},
  times: ${JSON.stringify(timesUnicos, null, 4)},
  jogos: ${JSON.stringify(jogosFormatados, null, 4)}
};

if (typeof module !== 'undefined') module.exports = { DADOS_2026 };
`;

fs.writeFileSync('../data/brasileirao2026.js', saidaStr, 'utf-8');
console.log('✅ Arquivo ../data/brasileirao2026.js formatado com sucesso! Contém Estatísticas Táticas Injetadas (Posse e Chutes)!');
