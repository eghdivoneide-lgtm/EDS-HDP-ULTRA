'use strict';
// ================================================================
// GERADOR DE PERFIS v3 — Adiciona campos USL + Formação
// à memoria_qualitativa.js com base nos dados brutos das ligas
// Uso: node gerador_perfis_v3.js
// ================================================================

const fs = require('fs');
const path = require('path');

// Formation scores cross-liga (8 ligas, 1507 jogos)
const FORM_SCORE = {
  '3-1-4-2': 0.85, '4-1-3-2': 0.73, '4-2-3-1': 0.28, '4-3-3': 0.21,
  '3-4-2-1': 0.18, '4-1-4-1': 0.08, '4-4-2': 0.01,  '5-4-1': -0.08,
  '4-3-1-2': -0.40, '3-4-3': -0.53, '5-3-2': -0.57, '3-5-2': -1.44,
  '3-4-1-2': -1.79, '4-4-1-1': -1.96, '4-5-1': -3.31,
};

function classifyUSL(diff) {
  if (diff >= 2.0)  return 'G_STRONG';
  if (diff >= 0.75) return 'G';
  if (diff >= -0.75)return 'N';
  if (diff >= -2.0) return 'S';
  return 'S_STRONG';
}

function getFormClasse(score) {
  if (score >= 0.5)  return 'GERADORA_FORTE';
  if (score >= 0.15) return 'GERADORA';
  if (score >= -0.15)return 'NEUTRA';
  if (score >= -0.7) return 'SOFREDORA';
  if (score >= -1.5) return 'SOFREDORA_FORTE';
  return 'SOFREDORA_EXTREMA';
}

function loadLeague(file) {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const match = content.match(/window\.\w+\s*=\s*(\{[\s\S]*\})\s*;?\s*$/);
    if (!match) return null;
    return JSON.parse(match[1]);
  } catch(e) {
    return null;
  }
}

function buildUSLProfiles(jogos) {
  const stats = {};
  for (const j of jogos) {
    const cm = j.cantos?.ft?.m;
    const cv = j.cantos?.ft?.v;
    if (cm == null || cv == null) continue;
    const mand = j.mandante;
    const vis  = j.visitante;
    const fm   = j.formacao?.m || null;
    const fv   = j.formacao?.v || null;

    if (!stats[mand]) stats[mand] = { n:0, pró:0, contra:0, casa_pró:0, casa_contra:0, fora_pró:0, fora_contra:0, wins:0, forms:{} };
    if (!stats[vis])  stats[vis]  = { n:0, pró:0, contra:0, casa_pró:0, casa_contra:0, fora_pró:0, fora_contra:0, wins:0, forms:{} };

    // Mandante
    stats[mand].n++;
    stats[mand].pró     += cm;
    stats[mand].contra  += cv;
    stats[mand].casa_pró    += cm;
    stats[mand].casa_contra += cv;
    if (cm > cv) stats[mand].wins++;
    if (fm) stats[mand].forms[fm] = (stats[mand].forms[fm] || 0) + 1;

    // Visitante
    stats[vis].n++;
    stats[vis].pró     += cv;
    stats[vis].contra  += cm;
    stats[vis].fora_pró    += cv;
    stats[vis].fora_contra += cm;
    if (cv > cm) stats[vis].wins++;
    if (fv) stats[vis].forms[fv] = (stats[vis].forms[fv] || 0) + 1;
  }

  const profiles = {};
  for (const [time, s] of Object.entries(stats)) {
    if (s.n < 5) continue;
    const diff      = parseFloat(((s.pró - s.contra) / s.n).toFixed(2));
    const diffCasa  = s.casa_pró + s.casa_contra > 0
      ? parseFloat(((s.casa_pró - s.casa_contra) / (s.casa_pró + s.casa_contra > 0 ? Math.round(s.n/2) : 1)).toFixed(2)) : null;
    const diffFora  = s.fora_pró + s.fora_contra > 0
      ? parseFloat(((s.fora_pró - s.fora_contra) / (s.fora_pró + s.fora_contra > 0 ? Math.round(s.n/2) : 1)).toFixed(2)) : null;
    const winPct    = parseFloat((s.wins / s.n).toFixed(3));

    // Formação principal (mais frequente)
    let formPrinc = null, formScore = 0, formClasse = 'DESCONHECIDA';
    const forms = s.forms;
    if (Object.keys(forms).length > 0) {
      formPrinc = Object.entries(forms).sort((a,b) => b[1]-a[1])[0][0];
      formScore = FORM_SCORE[formPrinc] ?? 0;
      formClasse = getFormClasse(formScore);
    }

    // Alertas USL
    const alertas_usl = [];
    const usl = classifyUSL(diff);
    if (usl === 'G_STRONG') alertas_usl.push('USL_GERADORA_FORTE: diff +' + diff + ' — pressão máxima de cantos');
    if (usl === 'S_STRONG') alertas_usl.push('USL_SOFREDORA_EXTREMA: diff ' + diff + ' — concede cantos sistematicamente');
    if (formScore >= 0.4)   alertas_usl.push('FORMACAO_GERADORA: ' + formPrinc + ' (score +' + formScore + ')');
    if (formScore <= -0.4)  alertas_usl.push('FORMACAO_SOFREDORA: ' + formPrinc + ' (score ' + formScore + ')');

    profiles[time] = {
      diff_cantos:        diff,
      perfil_usl:         usl,
      diff_cantos_casa:   diffCasa,
      diff_cantos_fora:   diffFora,
      win_pct_cantos:     winPct,
      formacao_principal: formPrinc,
      score_formacao:     formScore,
      classe_formacao:    formClasse,
      n_jogos_usl:        s.n,
      alertas_usl:        alertas_usl,
    };
  }
  return profiles;
}

// ── LIGAS A PROCESSAR ──────────────────────────────────────────
const LIGAS = [
  { key: 'BR',    file: 'data/brasileirao2026.js',    varName: 'DADOS_BR'     },
  { key: 'BR_B',  file: 'data/brasileiraoB2026.js',   varName: 'DADOS_BR_B'   },
  { key: 'ARG',   file: 'data/argentina2026.js',      varName: 'DADOS_ARG'    },
  { key: 'ARG_B', file: 'data/argentina_b2026.js',    varName: 'DADOS_ARG_B'  },
  { key: 'MLS',   file: 'data/mls2026.js',            varName: 'DADOS_MLS'    },
  { key: 'USL',   file: 'data/usl2026.js',            varName: 'DADOS_USL'    },
  { key: 'CHI',   file: 'data/chile2026.js',          varName: 'DADOS_CHI'    },
  { key: 'ECU',   file: 'data/equador2026.js',        varName: 'DADOS_ECU'    },
];

const output = {};

for (const liga of LIGAS) {
  const fullPath = path.join(__dirname, liga.file);
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  ${liga.key}: arquivo não encontrado — ${liga.file}`);
    continue;
  }
  const data = loadLeague(fullPath);
  if (!data || !data.jogos) {
    console.log(`⚠️  ${liga.key}: sem campo jogos`);
    continue;
  }

  const profiles = buildUSLProfiles(data.jogos);
  const sorted = Object.entries(profiles).sort((a,b) => b[1].diff_cantos - a[1].diff_cantos);

  output[liga.key] = {
    gerado_em: new Date().toISOString().split('T')[0],
    jogos_base: data.jogos.length,
    times_com_perfil: sorted.length,
    perfis: Object.fromEntries(sorted),
  };

  // Contagem por classe USL
  const counts = { G_STRONG:0, G:0, N:0, S:0, S_STRONG:0 };
  sorted.forEach(([,p]) => counts[p.perfil_usl]++);

  console.log(`\n✅ ${liga.key} — ${data.jogos.length} jogos | ${sorted.length} times`);
  console.log(`   G_STRONG=${counts.G_STRONG} G=${counts.G} N=${counts.N} S=${counts.S} S_STRONG=${counts.S_STRONG}`);

  // Top 3 geradores e top 3 sofredores
  const geradores = sorted.filter(([,p]) => p.diff_cantos >= 0.75).slice(0, 3);
  const sofredores = sorted.filter(([,p]) => p.diff_cantos <= -0.75).slice(-3).reverse();

  if (geradores.length) {
    console.log('   🟢 Geradores: ' + geradores.map(([t,p]) => `${t}(${p.perfil_usl},${p.diff_cantos>0?'+':''}${p.diff_cantos})`).join(', '));
  }
  if (sofredores.length) {
    console.log('   🔴 Sofredores: ' + sofredores.map(([t,p]) => `${t}(${p.perfil_usl},${p.diff_cantos})`).join(', '));
  }
}

// ── SALVA ARQUIVO ──────────────────────────────────────────────
const outContent = '// ================================================================\n' +
  '// MEMORIA_USL.JS — Perfis USL v3.0 por liga\n' +
  '// Gerado automaticamente por gerador_perfis_v3.js\n' +
  '// ' + new Date().toISOString().split('T')[0] + '\n' +
  '// ================================================================\n\n' +
  'window.MEMORIA_USL = ' + JSON.stringify(output, null, 2) + ';\n';

fs.writeFileSync(path.join(__dirname, 'data/memoria_usl.js'), outContent, 'utf8');
console.log('\n\n✅ data/memoria_usl.js gerado com sucesso!');
console.log('   Ligas processadas: ' + Object.keys(output).join(', '));
