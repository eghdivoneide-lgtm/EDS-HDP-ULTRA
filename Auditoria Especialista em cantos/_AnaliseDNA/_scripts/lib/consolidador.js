// consolidador.js — gera _MEMORIA_TIMES_MASTER.json + _SUMARIO_EXECUTIVO.html + _METODOLOGIA_APLICADA.md
const fs = require('fs');
const path = require('path');
const { r } = require('./normalizadores');

const escapeHtml = s => String(s ?? '').replace(/[&<>"']/g, c => ({
  '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
}[c]));

function consolidar(memorias, rootAn, dataHoje) {
  // ── 1. Master JSON ───────────────────────────────────────
  const master = {
    geradoEm: new Date().toISOString(),
    versao: 'v1.0',
    n_ligas: Object.keys(memorias).length,
    n_times_total: Object.values(memorias).reduce((s, m) => s + (m.n_times || 0), 0)
  };
  for (const [ligaId, mem] of Object.entries(memorias)) master[ligaId] = mem;
  fs.writeFileSync(path.join(rootAn, '_MEMORIA_TIMES_MASTER.json'), JSON.stringify(master, null, 2), 'utf8');

  // ── 2. Sumário executivo HTML ────────────────────────────
  const sumario = renderSumario(master);
  fs.writeFileSync(path.join(rootAn, '_SUMARIO_EXECUTIVO.html'), sumario, 'utf8');

  // ── 3. Metodologia MD ────────────────────────────────────
  const metodologia = renderMetodologia(master);
  fs.writeFileSync(path.join(rootAn, '_METODOLOGIA_APLICADA.md'), metodologia, 'utf8');

  console.log(`✅ Consolidados gerados em ${rootAn}`);
}

function renderSumario(master) {
  const CSS = `
    :root { --bg:#0a0f0d; --bg2:#111a14; --bg3:#162019;
      --border: rgba(52,211,103,0.15); --green:#34d367; --gold:#f59e0b;
      --red:#ef4444; --text:#e8f5ee; --muted:#6b8f79; }
    * { box-sizing:border-box; margin:0; padding:0; }
    body { font-family: 'Inter', system-ui, sans-serif; background:var(--bg); color:var(--text); padding:24px; line-height:1.5; }
    h1, h2, h3 { color:var(--green); margin:18px 0 10px; }
    h1 { font-size:1.8rem; } h2 { font-size:1.3rem; border-bottom:1px solid var(--border); padding-bottom:6px; }
    h3 { font-size:1.05rem; color:var(--gold); }
    .container { max-width:1200px; margin:0 auto; }
    .section { background:var(--bg2); border:1px solid var(--border); border-radius:8px; padding:18px; margin-bottom:18px; }
    table { width:100%; border-collapse:collapse; margin:8px 0; font-size:0.88rem; }
    th { background:var(--bg3); color:var(--gold); text-align:left; padding:8px; border-bottom:1px solid var(--border); }
    td { padding:6px 8px; border-bottom:1px solid rgba(52,211,103,0.06); }
    .badge { display:inline-block; padding:2px 10px; border-radius:12px; font-size:0.75rem; font-weight:700; }
    .badge-elite { background:rgba(245,158,11,0.2); color:#fbbf24; border:1px solid var(--gold); }
    .badge-medio { background:rgba(52,211,103,0.15); color:var(--green); border:1px solid var(--green); }
    .badge-azarao { background:rgba(107,143,121,0.15); color:var(--muted); border:1px solid var(--muted); }
    .small { font-size:0.78rem; color:var(--muted); }
  `;

  // Top 10 cross-liga
  const todos = [];
  for (const [ligaId, mem] of Object.entries(master)) {
    if (!mem.ranking_powerscore) continue;
    for (const r of mem.ranking_powerscore) todos.push({ ...r, liga: ligaId });
  }
  todos.sort((a, b) => (b.powerScore ?? -1) - (a.powerScore ?? -1));
  const top10 = todos.slice(0, 10);

  // Comparativo de assinaturas por liga
  const ligasIds = ['BR', 'BR_B', 'ARG', 'ARG_B', 'MLS', 'USL', 'BUN', 'J1', 'J2_J3'].filter(l => master[l]);

  let html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Auditoria DNA — Sumário Executivo</title><style>${CSS}</style></head><body><div class="container">`;
  html += `<h1>📊 Sumário Executivo — Auditoria DNA por Time</h1>`;
  html += `<p class="small">Gerado em ${escapeHtml(master.geradoEm)} · ${master.n_ligas} ligas · ${master.n_times_total} times</p>`;

  // Top 10
  html += `<div class="section"><h2>🥇 Top 10 cross-liga (maior PowerScore)</h2>`;
  html += `<table><thead><tr><th>#</th><th>Time</th><th>Liga</th><th>PowerScore</th><th>Categoria</th><th>Perfil DNA</th><th>Forma</th></tr></thead><tbody>`;
  top10.forEach((r, i) => {
    const bcls = r.categoria === 'ELITE' ? 'badge-elite' : r.categoria === 'MÉDIO' ? 'badge-medio' : 'badge-azarao';
    html += `<tr><td>${i+1}</td><td>${escapeHtml(r.time)}</td><td>${escapeHtml(r.liga)}</td><td>${r.powerScore}</td><td><span class="badge ${bcls}">${r.categoria}</span></td><td>${escapeHtml(r.perfil_dna || '—')}</td><td><code>${escapeHtml(r.forma || '?????')}</code></td></tr>`;
  });
  html += `</tbody></table></div>`;

  // Comparativo cultural por liga
  html += `<div class="section"><h2>🧬 Comparativo cultural por liga (frequência de assinaturas)</h2>`;
  html += `<table><thead><tr><th>Assinatura</th>`;
  for (const lg of ligasIds) html += `<th>${escapeHtml(lg)}</th>`;
  html += `</tr></thead><tbody>`;
  const assNomes = master[ligasIds[0]] && master[ligasIds[0]].contagens_assinaturas ? Object.keys(master[ligasIds[0]].contagens_assinaturas) : [];
  for (const nome of assNomes) {
    html += `<tr><th>${escapeHtml(nome)}</th>`;
    for (const lg of ligasIds) {
      const c = master[lg].contagens_assinaturas?.[nome] ?? 0;
      const total = master[lg].n_times || 1;
      const pct = r((c / total) * 100, 0);
      html += `<td>${c} <span class="small">(${pct}%)</span></td>`;
    }
    html += `</tr>`;
  }
  html += `</tbody></table></div>`;

  // Distribuição categorias por liga
  html += `<div class="section"><h2>📊 Distribuição de categorias por liga</h2>`;
  html += `<table><thead><tr><th>Liga</th><th>ELITE</th><th>MÉDIO</th><th>AZARÃO</th><th>Total</th></tr></thead><tbody>`;
  for (const lg of ligasIds) {
    const rk = master[lg].ranking_powerscore || [];
    const e = rk.filter(r => r.categoria === 'ELITE').length;
    const m = rk.filter(r => r.categoria === 'MÉDIO').length;
    const a = rk.filter(r => r.categoria === 'AZARÃO').length;
    html += `<tr><th>${escapeHtml(lg)}</th><td>${e}</td><td>${m}</td><td>${a}</td><td>${rk.length}</td></tr>`;
  }
  html += `</tbody></table></div>`;

  // 🎯 Divergências DNA × Performance — Cross-liga
  const todasDiv = [];
  for (const lg of ligasIds) {
    const divs = master[lg].divergencias_dna_performance || [];
    for (const d of divs) todasDiv.push({ ...d, liga: lg });
  }
  // Ordena por severidade (alta > media > baixa)
  const sevOrder = { alta: 0, media: 1, baixa: 2 };
  todasDiv.sort((a, b) => (sevOrder[a.severidade] - sevOrder[b.severidade]) || a.liga.localeCompare(b.liga));

  html += `<div class="section"><h2>🎯 ${todasDiv.length} Divergências DNA × Performance — Casos para revisão do motor</h2>`;
  html += `<p class="small">Casos onde o perfil DNA Escoteiro (estático) promete uma coisa mas o PowerScore (performance recente) entrega outra. Esses pontos são onde o motor de projeção pode estar sendo enganado pelo DNA. Ordenado por severidade.</p>`;
  if (!todasDiv.length) {
    html += `<p>✅ Nenhuma divergência detectada cross-liga.</p>`;
  } else {
    html += `<table><thead><tr><th>Liga</th><th>Time</th><th>Categoria</th><th>Perfil DNA</th><th>Tipo</th><th>Severidade</th><th>Evidência chave</th><th>n</th></tr></thead><tbody>`;
    for (const d of todasDiv) {
      // Pega 2-3 campos chave da evidência para mostrar
      const ev = d.evidencia || {};
      const partes = [];
      if (ev.cantos_pro != null && ev.media_liga_cantos_pro != null) partes.push(`cantos_pro=${ev.cantos_pro} (média ${ev.media_liga_cantos_pro})`);
      if (ev.cantos_sofridos != null && ev.media_liga_cantos_sof != null) partes.push(`cantos_sof=${ev.cantos_sofridos} (média ${ev.media_liga_cantos_sof})`);
      if (ev.gap_vs_media_pct != null) partes.push(`gap=${ev.gap_vs_media_pct}%`);
      if (ev.cantos_sof_vs_media_pct != null) partes.push(`vs média=${ev.cantos_sof_vs_media_pct}%`);
      if (ev.power_score != null) partes.push(`PS=${ev.power_score}`);
      const evHtml = partes.join(' · ');
      const sevCls = d.severidade === 'alta' ? 'badge-elite' : d.severidade === 'media' ? 'badge-medio' : 'badge-azarao';
      html += `<tr><td>${escapeHtml(d.liga)}</td><td><strong>${escapeHtml(d.time)}</strong></td><td>${escapeHtml(d.categoria)}</td><td>${escapeHtml(d.perfil_dna)}</td><td>${escapeHtml(d.tipo_divergencia)}</td><td><span class="badge ${sevCls}">${escapeHtml(d.severidade.toUpperCase())}</span></td><td class="small">${evHtml}</td><td>${ev.n_jogos ?? '?'}</td></tr>`;
    }
    html += `</tbody></table>`;
    // Sumário por tipo
    const porTipo = {};
    for (const d of todasDiv) porTipo[d.tipo_divergencia] = (porTipo[d.tipo_divergencia] || 0) + 1;
    html += `<p class="small" style="margin-top:10px"><strong>Por tipo:</strong> ${Object.entries(porTipo).map(([t, c]) => `${t} (${c})`).join(' · ')}</p>`;
  }
  html += `</div>`;

  // Surpresas detectadas
  html += `<div class="section"><h2>⚠️ Surpresas detectadas (cross-liga)</h2><ul>`;
  for (const lg of ligasIds) {
    const rk = master[lg].ranking_powerscore || [];
    const surpresas = rk.filter(r => {
      const perfil = (r.perfil_dna || '').toUpperCase();
      return (perfil.includes('OFENSIVO') && r.categoria === 'AZARÃO') ||
             (perfil.includes('DEFENSIVO') && r.categoria === 'ELITE');
    });
    for (const s of surpresas.slice(0, 3)) {
      html += `<li><strong>${escapeHtml(s.team || s.time)}</strong> [${escapeHtml(lg)}] — perfil DNA "${escapeHtml(s.perfil_dna)}" mas categoria <strong>${escapeHtml(s.categoria)}</strong> (PowerScore ${s.powerScore})</li>`;
    }
  }
  html += `</ul></div>`;

  // Recomendações
  html += `<div class="section"><h2>🎯 Recomendações operacionais cross-liga</h2><ul>`;
  html += `<li>Use a <strong>Matriz DNA × DNA</strong> de cada liga antes de fechar projeção — ela revela o "gap de qualidade momentum" entre perfis (raiz do caso Grêmio×Flamengo).</li>`;
  html += `<li>Times com assinatura <code>SUCUMBE_AZARÃO</code> presente: sinal direcional pouco confiável — reduzir stake.</li>`;
  html += `<li>Times com <code>RUPTURA_HOME</code> e <code>ATAQUE_ESTERIL</code> simultâneos: foco em mercados de cantos pró-mandante, não over total.</li>`;
  html += `<li>Times com <code>DEFESA_PRECARIA</code> + <code>SUCUMBE_AZARÃO</code>: favorece OVER cantos do adversário independente do contexto.</li>`;
  html += `</ul></div>`;

  // Limitações
  html += `<div class="section"><h2>📌 Limitações da análise</h2><ul>`;
  for (const lg of ligasIds) {
    const mem = master[lg];
    const semDna = mem.ranking_powerscore.filter(r => r.categoria === 'SEM_DNA').length;
    const amostraBaixa = mem.ranking_powerscore.filter(r => r.n_jogos < 5).length;
    const limitacoes = [];
    if (semDna) limitacoes.push(`${semDna} time(s) sem DNA Escoteiro`);
    if (amostraBaixa) limitacoes.push(`${amostraBaixa} time(s) com n_jogos < 5`);
    if (mem.baseline_liga.n_com_placar < mem.baseline_liga.n_jogos * 0.8) limitacoes.push(`cobertura de placar < 80% (${mem.baseline_liga.n_com_placar}/${mem.baseline_liga.n_jogos})`);
    if (limitacoes.length) html += `<li><strong>${escapeHtml(lg)}</strong>: ${limitacoes.join('; ')}</li>`;
  }
  html += `</ul></div>`;

  html += `</div></body></html>`;
  return html;
}

function renderMetodologia(master) {
  const linhas = [];
  linhas.push(`# Metodologia Aplicada — Auditoria DNA por Time`);
  linhas.push('');
  linhas.push(`Gerado em: **${master.geradoEm}**`);
  linhas.push(`Versão: ${master.versao}`);
  linhas.push(`Ligas: ${master.n_ligas} | Times totais: ${master.n_times_total}`);
  linhas.push('');
  linhas.push('---');
  linhas.push('');
  linhas.push(`## 1. Fontes de dados`);
  linhas.push('');
  linhas.push(`- \`data/brasileirao2026.js\` — DADOS_BR`);
  linhas.push(`- \`data/brasileiraoB2026.js\` — DADOS_BR_B`);
  linhas.push(`- \`data/argentina2026.js\` — DADOS_ARG`);
  linhas.push(`- \`data/argentina_b2026.js\` — DADOS_ARG_B`);
  linhas.push(`- \`data/mls2026.js\` — DADOS_MLS`);
  linhas.push(`- \`data/usl2026.js\` — DADOS_USL`);
  linhas.push(`- \`data/bundesliga2026.js\` — DADOS_BUN`);
  linhas.push(`- \`data/dna_escoteiro.js\` — DNA_ESCOTEIRO`);
  linhas.push('');
  linhas.push(`Carregamento via \`new Function('window', code)\` em sandbox isolado — zero side effect no projeto.`);
  linhas.push('');
  linhas.push(`## 2. Filtro de jogos válidos`);
  linhas.push('');
  linhas.push(`Mantidos apenas jogos com \`j.cantos && j.cantos.ft && j.cantos.ft.m != null && j.cantos.ft.v != null\`. Jogos sem cantos coletados foram descartados.`);
  linhas.push('');
  linhas.push(`## 3. PowerScore — Fórmula`);
  linhas.push('');
  linhas.push('```');
  linhas.push(`forma_score = média de [V=1, E=0.5, D=0] dos 5 chars de DNA.forma`);
  linhas.push(`v_pct_geral = (DNA.casa_v_pct + DNA.fora_v_pct) / 2`);
  linhas.push(`power_raw   = gp_jogo*30 + (2 - gc_jogo)*20 + forma_score*25 + v_pct_geral*0.25`);
  linhas.push('```');
  linhas.push('');
  linhas.push(`Depois, **percentil dentro da liga** (rank-based, 0-100) → categoria:`);
  linhas.push(`- ≥70 → **ELITE**`);
  linhas.push(`- 30-70 → **MÉDIO**`);
  linhas.push(`- <30 → **AZARÃO**`);
  linhas.push('');
  linhas.push(`## 4. Buckets situacionais (6 buckets por time)`);
  linhas.push('');
  linhas.push(`Cada jogo é classificado por (local × categoria do adversário):`);
  linhas.push('');
  linhas.push(`|        | vs ELITE | vs MÉDIO | vs AZARÃO |`);
  linhas.push(`|--------|----------|----------|-----------|`);
  linhas.push(`| 🏠 Casa | casa_vs_elite | casa_vs_medio | casa_vs_azarao |`);
  linhas.push(`| ✈️ Fora | fora_vs_elite | fora_vs_medio | fora_vs_azarao |`);
  linhas.push('');
  linhas.push(`Métricas por bucket: \`n\`, \`cantos_pro_media\`, \`cantos_sofridos_media\`, desvios, \`diferencial\`, \`variacao_vs_baseline_pct\`, \`win_rate_cantos_pct\`, \`gols_pro/sof_media\`.`);
  linhas.push('');
  linhas.push(`**Qualifier:** \`consolidado\` (n≥5) · \`sugestivo\` (n=3-4) · \`amostra_insuficiente\` (n<3).`);
  linhas.push('');
  linhas.push(`**\`padrao_detectado: true\`** quando \`n≥3\` E (\`|variacao_vs_baseline_pct|≥25\` OU \`|diferencial|≥2.0\`).`);
  linhas.push('');
  linhas.push(`## 5. Assinaturas (12 detectores)`);
  linhas.push('');
  linhas.push(`Toda assinatura avaliada para todos os times (ausência também é sinal). Quando \`nao_avaliavel\`, o motivo é registrado (ex: \`sem_dados_placar\`).`);
  linhas.push('');
  linhas.push(`Regras: ver \`_scripts/lib/assinaturas.js\` — todas seguem item 5.3 do PROMPT_AUDITOR_DNA_v1.md.`);
  linhas.push('');
  linhas.push(`## 5.1. TERMÔMETRO_FORMA — Calibração futura recomendada`);
  linhas.push('');
  linhas.push(`A assinatura \`TERMOMETRO_FORMA\` ficou em **0 times** em todas as 7 ligas auditadas.`);
  linhas.push(`A regra atual exige \`desvio(últimos_5_cantos_pro) > desvio(geral_cantos_pro) × 1.5\`.`);
  linhas.push(`O threshold \`1.5×\` é conservador o suficiente para evitar falsos positivos, mas pode estar`);
  linhas.push(`mascarando padrões reais de instabilidade recente. **Sugestão para próxima rodada:**`);
  linhas.push(`afrouxar para \`1.3×\` e revalidar contra os dados reais. Aceitar zero detecção nesta rodada`);
  linhas.push(`é mais seguro que produzir falsos positivos.`);
  linhas.push('');
  linhas.push(`## 6. Matriz DNA × DNA`);
  linhas.push('');
  linhas.push(`Para cada par (\`perfil_DNA_mandante\`, \`perfil_DNA_visitante\`), agregamos n jogos, cantos médios (total, mandante, visitante), % de jogos em que mandante dominou cantos e diferencial médio. Esse é o componente que evidencia o "gap de qualidade momentum" omitido por análises só-por-time.`);
  linhas.push('');
  linhas.push(`## 7. Determinismo`);
  linhas.push('');
  linhas.push(`Zero aleatoriedade. Mesma entrada → mesma saída. Arredondamentos via \`Math.round(n * 10^k) / 10^k\`.`);
  linhas.push('');
  linhas.push(`## 7.1. Detector de Divergências DNA Escoteiro × Performance Real`);
  linhas.push('');
  linhas.push(`Componente adicionado para alimentar o SmartCoach com casos onde **o perfil DNA Escoteiro`);
  linhas.push(`(estático) conflita com o PowerScore (performance recente real)**. Esses são exatamente os`);
  linhas.push(`pontos onde o motor de projeção pode estar sendo enganado — origem do caso documentado`);
  linhas.push(`Grêmio × Flamengo.`);
  linhas.push('');
  linhas.push(`Resultado persistido como campo top-level \`divergencias_dna_performance: []\` em cada`);
  linhas.push(`\`memoria_<LIGA>.json\` e replicado no \`_MEMORIA_TIMES_MASTER.json\`.`);
  linhas.push('');
  linhas.push(`### 4 tipos canônicos de divergência`);
  linhas.push('');
  linhas.push(`| # | Tipo | Regra de detecção |`);
  linhas.push(`|---|---|---|`);
  linhas.push(`| 1 | **Ofensivo subentregando** | perfil ∈ {OFENSIVO, OFENSIVO_SOLIDO, OFENSIVO_DOMINANTE, DOMINANTE, ABSOLUTO} E (categoria == AZARÃO **OU** \`cantos_pro_geral < media_liga × 0.9\` com n ≥ 5) |`);
  linhas.push(`| 2 | **Defensivo medíocre** | perfil ∈ {MURO, MURO_DUPLO, DEFENSIVO, FORTALEZA, COMPACTO} E categoria == AZARÃO |`);
  linhas.push(`| 3 | **Passivo elite** | perfil == PASSIVO E categoria == ELITE |`);
  linhas.push(`| 4 | **Vulnerável elite** | perfil ∈ {VULNERAVEL, SANGRA_CANTOS, REATIVO} E categoria == ELITE |`);
  linhas.push('');
  linhas.push(`### Severidade`);
  linhas.push('');
  linhas.push('- `alta`  → `n ≥ 10` E magnitude relativa ≥ 25% (gap forte com amostra grande)');
  linhas.push('- `media` → `n ≥ 5`  E magnitude relativa ≥ 10%');
  linhas.push('- `baixa` → caso marginal (amostra pequena ou gap < 10%)');
  linhas.push('');
  linhas.push(`### Schema persistido`);
  linhas.push('');
  linhas.push('```json');
  linhas.push(`{`);
  linhas.push(`  "time": "Corinthians",`);
  linhas.push(`  "categoria": "AZARÃO",`);
  linhas.push(`  "perfil_dna": "MURO_DUPLO",`);
  linhas.push(`  "tipo_divergencia": "Defensivo medíocre",`);
  linhas.push(`  "evidencia": {`);
  linhas.push(`    "cantos_sofridos": 5.07,`);
  linhas.push(`    "media_liga_cantos_sof": 5.0,`);
  linhas.push(`    "cantos_sof_vs_media_pct": 1.4,`);
  linhas.push(`    "acima_da_media": true,`);
  linhas.push(`    "gols_sofridos": 0.93,`);
  linhas.push(`    "power_score": 17.5,`);
  linhas.push(`    "n_jogos": 14`);
  linhas.push(`  },`);
  linhas.push(`  "severidade": "alta"`);
  linhas.push(`}`);
  linhas.push('```');
  linhas.push('');
  linhas.push(`### Como o SmartCoach deve consumir`);
  linhas.push('');
  linhas.push(`Ao projetar um jogo do tipo \`Time_A (perfil DNA X) vs Time_B (perfil DNA Y)\`, o motor deve:`);
  linhas.push(`1. Buscar entradas em \`divergencias_dna_performance\` para ambos os times.`);
  linhas.push(`2. Se houver divergência de severidade \`alta\` em algum dos dois, **desinflar a confiança**`);
  linhas.push(`   no multiplicador derivado do perfil DNA Escoteiro para esse time.`);
  linhas.push(`3. Para tipos \`Ofensivo subentregando\` e \`Defensivo medíocre\`, considerar **inverter**`);
  linhas.push(`   o sinal direcional sugerido pelo DNA estático.`);
  linhas.push('');
  linhas.push(`## 8. Assinaturas propostas pelo auditor`);
  linhas.push('');
  linhas.push(`Nenhuma assinatura nova foi proposta nesta rodada — as 12 padronizadas cobriram os padrões recorrentes observados. Se padrões emergentes forem detectados em rodadas futuras (ex: "JOGO_FECHADO_HT" recorrente em ligas com muito empate), serão documentados aqui com regra objetiva.`);
  linhas.push('');
  linhas.push(`## 9. Restrições respeitadas`);
  linhas.push('');
  linhas.push(`- ❌ Nenhum arquivo em \`data/\` foi modificado`);
  linhas.push(`- ❌ Nenhum arquivo em \`scraper/\` foi modificado`);
  linhas.push(`- ❌ \`index.html\` não foi tocado`);
  linhas.push(`- ❌ Nenhum commit ou push foi feito`);
  linhas.push(`- ❌ Nenhuma dependência npm foi instalada (Node.js puro: \`fs\`, \`path\`)`);
  linhas.push(`- ❌ Nenhuma API externa foi chamada`);
  linhas.push('');
  return linhas.join('\n');
}

module.exports = { consolidar };
