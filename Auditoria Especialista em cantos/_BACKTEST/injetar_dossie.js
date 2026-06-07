// Injeta o dossiê tático dentro do memoria_dna.js (vira parte da memória institucional do SmartCoach)

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const dossies = JSON.parse(fs.readFileSync(path.join(__dirname, 'dossie_tatico.json'), 'utf-8'));

// Backup
const memPath = path.join(ROOT, 'data/memoria_dna.js');
const masterPath = path.join(ROOT, 'Auditoria Especialista em cantos/_AnaliseDNA/_MEMORIA_TIMES_MASTER.json');
const ts = new Date().toISOString().replace(/[:.]/g,'-').slice(0,19);
fs.copyFileSync(memPath, memPath + '.backup_' + ts);
fs.copyFileSync(masterPath, masterPath + '.backup_' + ts);

// Carrega memoria_dna atual (pegando o JSON dentro)
const txt = fs.readFileSync(memPath, 'utf-8');
const ini = txt.indexOf('{');
const fim = txt.lastIndexOf('}') + 1;
const mem = JSON.parse(txt.slice(ini, fim));

// Carrega master JSON
const master = JSON.parse(fs.readFileSync(masterPath, 'utf-8'));

// Injetar dossiê tático em cada time
let injetados = 0;
Object.entries(dossies).forEach(([liga, times]) => {
  if (!mem[liga] || !mem[liga].times) return;
  if (!master[liga] || !master[liga].times) return;
  Object.entries(times).forEach(([nome, dossie]) => {
    if (mem[liga].times[nome]) {
      mem[liga].times[nome].dossie_tatico = dossie;
      injetados++;
    }
    if (master[liga].times[nome]) {
      master[liga].times[nome].dossie_tatico = dossie;
    }
  });
});

// Atualiza metadados
mem.dossie_tatico_versao = 'v1.6 (2026-05-17)';
mem.dossie_tatico_descricao = '5 camadas táticas por time: vs_top3, vs_lanterna3, tendencia, ritmo_ht_ft, volatilidade, matchups_chave';

master.dossie_tatico_versao = mem.dossie_tatico_versao;
master.dossie_tatico_descricao = mem.dossie_tatico_descricao;

// Salva
const novoHeader = '// MEMORIA DNA v1.6 (2026-05-17) - 9 ligas + DOSSIE TATICO POR TIME (5 camadas: vs_top3, vs_lant3, tendencia, ritmo, volatilidade)\nwindow.MEMORIA_DNA = ';
fs.writeFileSync(memPath, novoHeader + JSON.stringify(mem, null, 2) + ';\n', 'utf-8');
fs.writeFileSync(masterPath, JSON.stringify(master, null, 2), 'utf-8');

const tamanho = (fs.statSync(memPath).size / (1024*1024)).toFixed(2);
console.log(`✅ ${injetados} dossiês táticos injetados no memoria_dna.js`);
console.log(`   Tamanho final: ${tamanho} MB`);

// Atualiza cache-buster no index.html
const indexPath = path.join(ROOT, 'index.html');
let idx = fs.readFileSync(indexPath, 'utf-8');
idx = idx.replace(/data\/memoria_dna\.js\?v=[^"]+/, 'data/memoria_dna.js?v=2026-05-17-v16-dossie');
fs.writeFileSync(indexPath, idx, 'utf-8');
console.log('✅ Cache-buster atualizado em index.html');

// Copia para memoria Fotografica
const kitPath = path.join(ROOT, 'memoria Fotografica/03_MEMORIA_DNA.json');
fs.writeFileSync(kitPath, JSON.stringify(master, null, 2), 'utf-8');
console.log('✅ Kit memoria Fotografica atualizado (03_MEMORIA_DNA.json)');

console.log('\n📊 Tamanhos:');
console.log(`   memoria_dna.js: ${tamanho} MB`);
console.log(`   03_MEMORIA_DNA.json: ${(fs.statSync(kitPath).size/(1024*1024)).toFixed(2)} MB`);
