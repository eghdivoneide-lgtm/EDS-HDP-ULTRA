// ════════════════════════════════════════════════════════════════
// GERADOR DE CSV PINNACLE — converte 358 apostas para formato
// importável pelo Bet Tracker do app (botão "📥 Importar CSV Pinnacle")
// ════════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');

// Carrega payload já processado
const APOSTAS = JSON.parse(fs.readFileSync(path.join(__dirname, '_PAYLOAD_358_APOSTAS.json'), 'utf8'));

// Mapa code interno → nome longo Pinnacle (REVERSO do _PINNACLE_LIGA_MAP)
const LIGA_NOMES = {
  BUN: 'Alemanha - Bundesliga',
  ARG: 'Argentina - Liga Pro',
  ARG_B: 'Argentina - Primeira B Nacional',
  ALM: 'Austrália - A-League',
  BR: 'Brasil - Série A',
  BR_B: 'Brasil - Série B',
  CHI: 'Chile - 1ª División',
  CHN_1: 'China - League One',
  CHN_S: 'China - Superliga',
  MLS: 'EUA - Major League Soccer',
  USL: 'EUA - USL Championship',
  ECU: 'Equador - Série A',
  J1: 'Japão - J League'
};

// Status interno (Win/Loss/Refund) → texto Pinnacle (GANHOU/PERDEU/REEMB.)
const STATUS_PINNACLE = {
  Win: 'GANHOU',
  Loss: 'PERDEU',
  Refund: 'REEMB.'
};

// Mercado: o app exporta "HDP FT" mas Pinnacle separa em "HDP" + período "FT"
function parseMercado(mercadoComPeriodo) {
  const parts = mercadoComPeriodo.split(' ');
  return { mercado: parts[0], periodo: parts[1] || 'FT' };
}

// Linha CSV
const linhas = [];
linhas.push('Data;Campeonato;Time Casa;Time Fora;Mercado;Período;Seleção;Odd;Risco;EscHT;EscFT;Resultado');

let pulados = 0;
const motivosPulo = {};

APOSTAS.forEach(a => {
  // Pula TT (Team Total) e linhas com mandante vazio (USL com formato esquisito)
  const { mercado, periodo } = parseMercado(a.mercado);
  if (mercado === 'TT') {
    pulados++;
    motivosPulo['Team Total não suportado'] = (motivosPulo['Team Total não suportado']||0) + 1;
    return;
  }
  if (!a.mandante || !a.visitante) {
    pulados++;
    motivosPulo['Time vazio (USL com formato (ESCANTEIOS))'] = (motivosPulo['Time vazio (USL com formato (ESCANTEIOS))']||0) + 1;
    return;
  }

  const camp = LIGA_NOMES[a.liga];
  if (!camp) {
    pulados++;
    motivosPulo['Liga não mapeada: ' + a.liga] = (motivosPulo['Liga não mapeada: ' + a.liga]||0) + 1;
    return;
  }

  const status = STATUS_PINNACLE[a.status] || 'PERDEU';
  const oddStr = a.odd.toFixed(3);
  const riscoStr = a.unid.toFixed(2);

  // Para CSV, mantém os campos com ; (separador) e escapa nada (texto simples)
  linhas.push([
    a.data,                  // Data DD/MM
    camp,                    // Campeonato (nome longo Pinnacle)
    a.mandante,              // Time Casa
    a.visitante,             // Time Fora
    mercado,                 // HDP ou OU (O/U)
    periodo,                 // HT ou FT
    a.selecao,               // ex: "Eintracht Frankfurt -2", "Mais de 9.5"
    oddStr,                  // Odd 1.934
    riscoStr,                // Risco 10.00
    '',                      // EscHT (vazio)
    '',                      // EscFT (vazio)
    status                   // GANHOU/PERDEU/REEMB.
  ].join(';'));
});

// Pinnacle usa O/U (com /), não OU
const csvFinal = linhas.join('\r\n').replace(/;OU;/g, ';O/U;');

// Salvar
const outPath = path.join(__dirname, '..', 'Auditoria Especialista em cantos', 'Apostas_Simples_20260503.csv');
fs.writeFileSync(outPath, csvFinal, 'utf8');

console.log('═══════════════════════════════════════════════════════════');
console.log('CSV PINNACLE GERADO');
console.log('═══════════════════════════════════════════════════════════');
console.log('📄 Arquivo: ' + outPath);
console.log('📊 Linhas: ' + (linhas.length - 1) + ' apostas (de ' + APOSTAS.length + ' originais)');
console.log('⚠️  Puladas: ' + pulados);
if (pulados > 0) {
  Object.entries(motivosPulo).forEach(([motivo, n]) => {
    console.log('   - ' + motivo + ': ' + n);
  });
}
console.log();
console.log('═══════════════════════════════════════════════════════════');
console.log('PRÓXIMOS PASSOS NO APP');
console.log('═══════════════════════════════════════════════════════════');
console.log('1. ABRA o app (http://localhost:8765 ou Netlify)');
console.log('2. APERTE F12 (DevTools) → aba Console');
console.log('3. COLE este comando para LIMPAR o tracker atual:');
console.log();
console.log('   localStorage.removeItem("sniper_bets_geral"); location.reload();');
console.log();
console.log('4. App recarrega ZERADO');
console.log('5. Vai em 📈 Operação → Bet Tracker → 📥 Importar CSV Pinnacle');
console.log('6. Selecione o arquivo: Apostas_Simples_20260503.csv');
console.log('7. Confirme alerta de importação');
console.log('8. Pronto: ' + (linhas.length - 1) + ' apostas no Tracker com status real');
