/**
 * Gera documento Word com Top 15 Over 10.5 + Top 15 Under 8.5
 * Lê _picks_2026-05-22.json gerado pelo parser
 */
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, AlignmentType,
  BorderStyle, ShadingType, PageBreak
} = require('docx');

const BASE = __dirname;
const picks = JSON.parse(fs.readFileSync(path.join(BASE, '_picks_2026-05-22.json'), 'utf8'));

// ─── Helpers de estilo ───
const COLOR_GREEN  = '22C55E';
const COLOR_RED    = 'EF4444';
const COLOR_GOLD   = 'F59E0B';
const COLOR_GRAY   = '6B7280';
const COLOR_DARK   = '111827';

function txt(content, opts = {}) {
  return new TextRun({
    text: content,
    bold: opts.bold || false,
    size: opts.size || 22,
    color: opts.color || COLOR_DARK,
    font: 'Calibri',
    italics: opts.italics || false
  });
}

function par(content, opts = {}) {
  return new Paragraph({
    children: Array.isArray(content) ? content : [content],
    alignment: opts.alignment || AlignmentType.LEFT,
    heading: opts.heading,
    spacing: { before: opts.before || 60, after: opts.after || 60 }
  });
}

function celula(text, opts = {}) {
  return new TableCell({
    children: [par(txt(text, { bold: opts.bold, color: opts.color, size: 20 }), { alignment: opts.align || AlignmentType.CENTER })],
    shading: opts.bg ? { type: ShadingType.CLEAR, fill: opts.bg } : undefined,
    width: opts.width
  });
}

function linhaCabecalho() {
  return new TableRow({
    tableHeader: true,
    children: [
      celula('#',          { bold: true, bg: '1F2937', color: 'FFFFFF', width: { size: 600, type: WidthType.DXA } }),
      celula('Liga',       { bold: true, bg: '1F2937', color: 'FFFFFF' }),
      celula('Mandante',   { bold: true, bg: '1F2937', color: 'FFFFFF', align: AlignmentType.LEFT }),
      celula('Visitante',  { bold: true, bg: '1F2937', color: 'FFFFFF', align: AlignmentType.LEFT }),
      celula('Projeção',   { bold: true, bg: '1F2937', color: 'FFFFFF' }),
      celula('Pick App',   { bold: true, bg: '1F2937', color: 'FFFFFF' }),
      celula('Confiança',  { bold: true, bg: '1F2937', color: 'FFFFFF' })
    ]
  });
}

function nivelConfianca(j, tipo) {
  // tipo: 'over' (alto bom) ou 'under' (baixo bom)
  const p = j.projecao_ft;
  if (tipo === 'over') {
    if (p >= 14)   return { label: '🔥 ALTA',    cor: COLOR_GREEN };
    if (p >= 12)   return { label: '✅ MÉDIA',   cor: COLOR_GOLD };
    return                  { label: '⚠️ BAIXA',  cor: COLOR_GRAY };
  } else {
    if (p <= 6)    return { label: '🔥 ALTA',    cor: COLOR_GREEN };
    if (p <= 7.5)  return { label: '✅ MÉDIA',   cor: COLOR_GOLD };
    return                  { label: '⚠️ BAIXA',  cor: COLOR_GRAY };
  }
}

function linhaJogo(j, idx, tipo) {
  const conf = nivelConfianca(j, tipo);
  const projColor = tipo === 'over' ? COLOR_GREEN : COLOR_RED;
  return new TableRow({
    children: [
      celula(String(idx + 1), { bold: true, color: COLOR_DARK }),
      celula(j.liga,          { color: COLOR_DARK }),
      celula(j.mandante,      { color: COLOR_DARK, align: AlignmentType.LEFT }),
      celula(j.visitante,     { color: COLOR_DARK, align: AlignmentType.LEFT }),
      celula(String(j.projecao_ft), { bold: true, color: projColor }),
      celula(j.pick_balaprata || '—', { color: COLOR_GRAY }),
      celula(conf.label,      { bold: true, color: conf.cor })
    ]
  });
}

function tabela(rows, cabecalho = true) {
  return new Table({
    rows: cabecalho ? [linhaCabecalho(), ...rows] : rows,
    width: { size: 9000, type: WidthType.DXA },
    borders: {
      top:    { style: BorderStyle.SINGLE, size: 4, color: 'BFBFBF' },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: 'BFBFBF' },
      left:   { style: BorderStyle.SINGLE, size: 4, color: 'BFBFBF' },
      right:  { style: BorderStyle.SINGLE, size: 4, color: 'BFBFBF' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: 'E5E7EB' },
      insideVertical:   { style: BorderStyle.SINGLE, size: 2, color: 'E5E7EB' }
    }
  });
}

// ════════════════════════════════════════════════════════════════
// MONTAGEM DO DOCUMENTO
// ════════════════════════════════════════════════════════════════
const dataHoje = new Date().toLocaleDateString('pt-BR', { year:'numeric', month:'long', day:'numeric' });
const horaGer  = new Date().toLocaleTimeString('pt-BR');

const elementos = [
  // Cabeçalho
  par(txt('Relatório de Entradas — Cantos', { bold: true, size: 36, color: '1F4E79' }), { alignment: AlignmentType.CENTER, after: 120 }),
  par(txt(`Análise das 15 melhores entradas Over 10.5 e Under 8.5`, { size: 22, color: COLOR_GRAY }), { alignment: AlignmentType.CENTER, after: 60 }),
  par(txt(`Gerado em ${dataHoje} às ${horaGer}`, { italics: true, size: 18, color: COLOR_GRAY }), { alignment: AlignmentType.CENTER, after: 240 }),

  // Sumário
  par(txt('Sumário do escaneamento', { bold: true, size: 26, color: '1F4E79' }), { heading: HeadingLevel.HEADING_1, before: 240, after: 120 }),
  par([
    txt('▸ Ligas analisadas: ', { bold: true }),
    txt(`${picks.total_ligas} (BR, BR_B, MLS, USL, CHI, ECU, ARG_B, CHN_SUP, CHN_1, J2_J3)`)
  ]),
  par([
    txt('▸ Total de jogos escaneados: ', { bold: true }),
    txt(String(picks.total_jogos_analisados))
  ]),
  par([
    txt('▸ Candidatos Over 10.5 (projeção > 10.5): ', { bold: true }),
    txt(String(picks.candidatos_over))
  ]),
  par([
    txt('▸ Candidatos Under 8.5 (projeção < 8.5): ', { bold: true }),
    txt(String(picks.candidatos_under))
  ]),
  par([
    txt('▸ Fonte: ', { bold: true }),
    txt('Bala de Prata (motor principal do Especialista em Cantos)')
  ]),

  // Legenda
  par(txt('Critério de confiança', { bold: true, size: 24, color: '1F4E79' }), { heading: HeadingLevel.HEADING_2, before: 200, after: 120 }),
  par([txt('🔥 ALTA: ', { bold: true, color: COLOR_GREEN }), txt('Projeção ≥ 14 (Over) ou ≤ 6 (Under) — convergência forte com o histórico da liga')]),
  par([txt('✅ MÉDIA: ', { bold: true, color: COLOR_GOLD }), txt('Projeção 12–14 (Over) ou 6–7.5 (Under) — sinal claro com margem segura')]),
  par([txt('⚠️ BAIXA: ', { bold: true, color: COLOR_GRAY }), txt('Projeção 10.5–12 (Over) ou 7.5–8.5 (Under) — borda do mercado, exige cautela')]),

  // PAGE BREAK
  par([new TextRun({ children: [new PageBreak()] })]),

  // TOP 15 OVER 10.5
  par(txt('🎯 TOP 15 — Over 10.5 Cantos FT', { bold: true, size: 30, color: COLOR_GREEN }), { alignment: AlignmentType.CENTER, before: 240, after: 120 }),
  par(txt('Ordenado por projeção (do maior para o menor)', { italics: true, size: 18, color: COLOR_GRAY }), { alignment: AlignmentType.CENTER, after: 240 }),
  tabela(picks.top15_over_105.map((j, i) => linhaJogo(j, i, 'over'))),

  // PAGE BREAK
  par([new TextRun({ children: [new PageBreak()] })]),

  // TOP 15 UNDER 8.5
  par(txt('🛡️ TOP 15 — Under 8.5 Cantos FT', { bold: true, size: 30, color: COLOR_RED }), { alignment: AlignmentType.CENTER, before: 240, after: 120 }),
  par(txt('Ordenado por projeção (do menor para o maior)', { italics: true, size: 18, color: COLOR_GRAY }), { alignment: AlignmentType.CENTER, after: 240 }),
  tabela(picks.top15_under_85.map((j, i) => linhaJogo(j, i, 'under'))),

  // PAGE BREAK
  par([new TextRun({ children: [new PageBreak()] })]),

  // OBSERVAÇÕES E ASSINATURA
  par(txt('Observações importantes (Padrão EDS)', { bold: true, size: 26, color: '1F4E79' }), { heading: HeadingLevel.HEADING_1, before: 240, after: 120 }),
  par([txt('• ', { bold: true }), txt('Estas são SUGESTÕES baseadas na projeção do motor Bala de Prata. A decisão de aposta é exclusiva do operador.')]),
  par([txt('• ', { bold: true }), txt('Linha Over 10.5 = vence se a partida tiver 11 ou mais escanteios totais (FT). Linha Under 8.5 = vence com 8 ou menos.')]),
  par([txt('• ', { bold: true }), txt('Projeções acima de 14 ou abaixo de 6 são consideradas de ALTA confiança porque margem do mercado é grande.')]),
  par([txt('• ', { bold: true }), txt('Sample do banco no momento da análise: 2.068 jogos ricos em 13 ligas (cobertura 92%).')]),
  par([txt('• ', { bold: true }), txt('Bug do estatísticas_2t corrigido em 20/05/2026 — projeções de hoje usam apenas dados HT/FT confiáveis.')]),
  par([txt('• ', { bold: true }), txt('Recomenda-se confirmar contexto recente (lesões, troca de técnico, clima) antes de confirmar a entrada.')]),

  // Assinatura
  par(txt(''), { before: 480 }),
  par(txt('— Assinatura —', { italics: true, color: COLOR_GRAY, size: 18 }), { alignment: AlignmentType.CENTER, after: 60 }),
  par(txt('Claude (Opus 4.7) · Engenheiro de Dados EDS', { bold: true, color: '1F4E79', size: 22 }), { alignment: AlignmentType.CENTER, after: 60 }),
  par(txt('Análise gerada em colaboração com o operador Eghdivoneide', { italics: true, color: COLOR_GRAY, size: 18 }), { alignment: AlignmentType.CENTER, after: 60 }),
  par(txt(`Especialista em Cantos · Soluções Inteligentes EDS · ${dataHoje}`, { color: COLOR_GRAY, size: 16 }), { alignment: AlignmentType.CENTER })
];

const doc = new Document({
  creator: 'Claude Opus 4.7 — EDS',
  title: `Top 15 Over 10.5 e Under 8.5 — ${dataHoje}`,
  description: 'Relatório curado das melhores entradas Over 10.5 e Under 8.5 baseado em projeções Bala de Prata',
  sections: [{ properties: {}, children: elementos }]
});

Packer.toBuffer(doc).then(buf => {
  const out = path.join(BASE, `Relatorio_TOP15_Over105_Under85_${new Date().toISOString().split('T')[0]}.docx`);
  fs.writeFileSync(out, buf);
  console.log('✅ Documento gerado:');
  console.log('   ' + out);
  console.log('   Tamanho: ' + (buf.length/1024).toFixed(1) + ' KB');
});
