// Injeta dossiê individual ponderado no memoria_dna.js (v1.7)

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const resumo = JSON.parse(fs.readFileSync(path.join(__dirname, 'dossie_individual_resumo.json'), 'utf-8'));
const completo = JSON.parse(fs.readFileSync(path.join(__dirname, 'dossie_individual_completo.json'), 'utf-8'));

// Backup
const memPath = path.join(ROOT, 'data/memoria_dna.js');
const masterPath = path.join(ROOT, 'Auditoria Especialista em cantos/_AnaliseDNA/_MEMORIA_TIMES_MASTER.json');
const ts = new Date().toISOString().replace(/[:.]/g,'-').slice(0,19);
fs.copyFileSync(memPath, memPath + '.backup_v17_' + ts);

// Carrega memoria_dna v1.6 atual
const txt = fs.readFileSync(memPath, 'utf-8');
const ini = txt.indexOf('{');
const fim = txt.lastIndexOf('}') + 1;
const mem = JSON.parse(txt.slice(ini, fim));
const master = JSON.parse(fs.readFileSync(masterPath, 'utf-8'));

// Injetar dossie_individual em cada time
let injetados = 0;
Object.entries(resumo).forEach(([liga, times]) => {
  if (!mem[liga] || !mem[liga].times) return;
  Object.entries(times).forEach(([nome, dossieIndiv]) => {
    if (mem[liga].times[nome]) {
      mem[liga].times[nome].dossie_individual = dossieIndiv;
      injetados++;
    }
    if (master[liga] && master[liga].times && master[liga].times[nome]) {
      master[liga].times[nome].dossie_individual = dossieIndiv;
    }
  });
});

mem.dossie_individual_versao = 'v1.7 (2026-05-17)';
mem.dossie_individual_descricao = 'Análise jogo-a-jogo REAL com pesos diferenciados por força do adversário (elite=2x, médio_forte=1.5x, azarão=0.7x). Síntese segmentada (8 buckets contextuais).';

master.dossie_individual_versao = mem.dossie_individual_versao;
master.dossie_individual_descricao = mem.dossie_individual_descricao;

// Salva
const header = '// MEMORIA DNA v1.7 (2026-05-17) - 9 ligas + DOSSIE INDIVIDUAL JOGO-A-JOGO PONDERADO\nwindow.MEMORIA_DNA = ';
fs.writeFileSync(memPath, header + JSON.stringify(mem, null, 2) + ';\n', 'utf-8');
fs.writeFileSync(masterPath, JSON.stringify(master, null, 2), 'utf-8');

const tamanho = (fs.statSync(memPath).size / (1024*1024)).toFixed(2);
console.log(`✅ ${injetados} dossiês individuais injetados`);
console.log(`   Tamanho final memoria_dna.js: ${tamanho} MB`);

// Atualiza cache-buster
const indexPath = path.join(ROOT, 'index.html');
let idx = fs.readFileSync(indexPath, 'utf-8');
idx = idx.replace(/data\/memoria_dna\.js\?v=[^"]+/, 'data/memoria_dna.js?v=2026-05-17-v17-individual');
fs.writeFileSync(indexPath, idx, 'utf-8');
console.log('✅ Cache-buster bumpado v17');

// Copia o arquivo completo (1.5MB) pra memoria Fotografica como referência separada
const kitCompletoPath = path.join(ROOT, 'memoria Fotografica/09_DOSSIE_JOGO_A_JOGO_COMPLETO.json');
fs.writeFileSync(kitCompletoPath, JSON.stringify(completo, null, 2), 'utf-8');
console.log('✅ Dossiê completo salvo em memoria Fotografica/09_DOSSIE_JOGO_A_JOGO_COMPLETO.json');

// Sync master no kit
const kitMaster = path.join(ROOT, 'memoria Fotografica/03_MEMORIA_DNA.json');
fs.writeFileSync(kitMaster, JSON.stringify(master, null, 2), 'utf-8');
console.log('✅ memoria Fotografica/03_MEMORIA_DNA.json atualizado');

const sizeKit = (fs.statSync(kitMaster).size / (1024*1024)).toFixed(2);
console.log(`\n📊 Tamanhos finais:`);
console.log(`   data/memoria_dna.js: ${tamanho} MB`);
console.log(`   kit 03_MEMORIA_DNA.json: ${sizeKit} MB`);
console.log(`   kit 09_DOSSIE_JOGO_A_JOGO_COMPLETO.json: ${(fs.statSync(kitCompletoPath).size/(1024*1024)).toFixed(2)} MB`);
