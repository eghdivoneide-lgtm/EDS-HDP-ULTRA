const fs = require('fs');

const dataFile = '../data/mls2025.js';
const outputFile = '../data/mls2026.js';

console.log('Lendo mls2025.js...');
let raw = fs.readFileSync(dataFile, 'utf-8');

// Remove the `const DADOS_MLS = ` and `export default ...`
raw = raw.replace('const DADOS_MLS = ', '');
raw = raw.split(';\n\nexport default')[0];

const jogos = JSON.parse(raw);
console.log(`Carregados ${jogos.length} jogos.`);

const timesSet = new Set();
jogos.forEach(j => {
  timesSet.add(j.mandante);
  timesSet.add(j.visitante);
});

const DADOS_2026 = {
  times: Array.from(timesSet),
  jogos: jogos,
  totalRodadas: 38
};

const saida = `const DADOS_2026 = ${JSON.stringify(DADOS_2026, null, 2)};\n`;
fs.writeFileSync(outputFile, saida, 'utf-8');

console.log('✅ Base de Estatísticas convertida para o Frontend! Salvo em mls2026.js');
