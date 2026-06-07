const fs = require('fs');
let text = fs.readFileSync('index.html', 'utf8');
text = text.replace(
  /alert\(['"].. Nenhum padr.*? LIGA_ATUAL\);/g,
  'if(txt.length > 5 && jogosFuturos.length > 0) { alert("✅ INFORMAÇÃO: A Inteligência leu seu texto, mas percebeu que os jogos já estão na sua lista abaixo (não foram duplicados).\\n\\nPara testar do zero, clique no botão 🗑️ Limpar Rodada primeiro."); } else { alert("⚠️ NENHUM time lido! (Falta de Cache)\\n\\n🔴 IMPORTANTE: Aperte Ctrl+F5 para forçar o navegador a baixar a versão corrigida do dicionário ARG."); }'
);
fs.writeFileSync('index.html', text);
console.log('Update Complete!');
