// html_renderer.js — Gera relatorio_<LIGA>.html standalone

const escapeHtml = s => String(s ?? '').replace(/[&<>"']/g, c => ({
  '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
}[c]));

const CSS = `
  :root {
    --bg:#0a0f0d; --bg2:#111a14; --bg3:#162019;
    --border: rgba(52,211,103,0.15);
    --green:#34d367; --green2:#22c55e;
    --gold:#f59e0b; --gold2:#fbbf24;
    --red:#ef4444; --red2:#fca5a5;
    --text:#e8f5ee; --muted:#6b8f79;
    --card: rgba(22,32,25,0.85);
  }
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family: 'Inter', system-ui, sans-serif; background:var(--bg); color:var(--text); padding:24px; line-height:1.5; }
  h1, h2, h3, h4 { color:var(--green); margin:18px 0 10px; }
  h1 { font-size:1.8rem; }
  h2 { font-size:1.3rem; border-bottom:1px solid var(--border); padding-bottom:6px; }
  h3 { font-size:1.1rem; color:var(--gold); }
  h4 { font-size:0.95rem; color:var(--text); }
  .container { max-width:1400px; margin:0 auto; }
  .header { background:var(--bg2); border:1px solid var(--border); border-radius:8px; padding:20px; margin-bottom:24px; }
  .header .meta { color:var(--muted); font-size:0.9rem; margin-top:6px; }
  .section { background:var(--bg2); border:1px solid var(--border); border-radius:8px; padding:18px; margin-bottom:18px; }
  table { width:100%; border-collapse:collapse; margin:8px 0; font-size:0.88rem; }
  th { background:var(--bg3); color:var(--gold); text-align:left; padding:8px; border-bottom:1px solid var(--border); }
  td { padding:6px 8px; border-bottom:1px solid rgba(52,211,103,0.06); }
  tr:hover td { background: rgba(52,211,103,0.03); }
  .badge { display:inline-block; padding:2px 10px; border-radius:12px; font-size:0.75rem; font-weight:700; }
  .badge-elite { background:rgba(245,158,11,0.2); color:var(--gold2); border:1px solid var(--gold); }
  .badge-medio { background:rgba(52,211,103,0.15); color:var(--green); border:1px solid var(--green); }
  .badge-azarao { background:rgba(107,143,121,0.15); color:var(--muted); border:1px solid var(--muted); }
  .badge-sem { background:rgba(239,68,68,0.15); color:var(--red2); border:1px solid var(--red); }
  .sig-presente { background:rgba(52,211,103,0.18); color:var(--green); border:1px solid var(--green); padding:3px 8px; border-radius:6px; font-size:0.75rem; display:inline-block; margin:2px; }
  .sig-ausente { background:rgba(107,143,121,0.1); color:var(--muted); border:1px solid rgba(107,143,121,0.3); padding:3px 8px; border-radius:6px; font-size:0.75rem; display:inline-block; margin:2px; }
  .sig-nao-aval { background:rgba(239,68,68,0.1); color:var(--red2); border:1px solid rgba(239,68,68,0.3); padding:3px 8px; border-radius:6px; font-size:0.75rem; display:inline-block; margin:2px; }
  .grid-4 { display:grid; grid-template-columns: repeat(4, 1fr); gap:12px; margin:10px 0; }
  .card { background:var(--bg3); border:1px solid var(--border); border-radius:6px; padding:10px; }
  .card .label { font-size:0.7rem; color:var(--muted); text-transform:uppercase; letter-spacing:0.5px; }
  .card .valor { font-size:1.3rem; font-weight:700; color:var(--text); margin-top:4px; }
  .bucket-ok    { background:rgba(52,211,103,0.10); }
  .bucket-warn  { background:rgba(245,158,11,0.10); }
  .bucket-faint { background:rgba(107,143,121,0.05); }
  .narrativa { background:var(--bg3); border-left:3px solid var(--green); padding:14px 16px; border-radius:6px; margin-top:14px; font-size:0.95rem; line-height:1.6; }
  .narrativa strong { color:var(--gold); }
  .narrativa code { background:rgba(52,211,103,0.12); padding:1px 6px; border-radius:3px; color:var(--green); font-family:'Inter',monospace; font-size:0.85rem; }
  .insight { background:var(--bg3); border-left:3px solid var(--gold); padding:10px 14px; border-radius:6px; margin:6px 0; font-size:0.9rem; }
  .heatmap-cell { padding:8px 6px; text-align:center; font-size:0.78rem; }
  .small { font-size:0.78rem; color:var(--muted); }
  .time-section { background:var(--bg2); border:1px solid var(--border); border-radius:8px; padding:18px; margin-bottom:16px; }
  .time-section h3 { display:flex; align-items:center; gap:10px; }
`;

function badgeCategoria(cat) {
  if (cat === 'ELITE')  return `<span class="badge badge-elite">ELITE</span>`;
  if (cat === 'MÉDIO')  return `<span class="badge badge-medio">MÉDIO</span>`;
  if (cat === 'AZARÃO') return `<span class="badge badge-azarao">AZARÃO</span>`;
  return `<span class="badge badge-sem">SEM DNA</span>`;
}

function bucketCellHtml(b) {
  if (!b || b.n === 0) {
    return `<td class="bucket-faint">⚠️ n=0</td>`;
  }
  if (b.qualifier === 'amostra_insuficiente') {
    return `<td class="bucket-faint">${b.cantos_pro_media}/${b.cantos_sofridos_media} <span class="small">(n=${b.n} ⚠️)</span></td>`;
  }
  const css = b.padrao_detectado ? 'bucket-ok' : (b.qualifier === 'sugestivo' ? 'bucket-warn' : 'bucket-faint');
  const dif = b.diferencial != null ? (b.diferencial > 0 ? '+' : '') + b.diferencial : '?';
  return `<td class="${css}">${b.cantos_pro_media}/${b.cantos_sofridos_media} <span class="small">Δ${dif} | n=${b.n} | ${b.qualifier}</span></td>`;
}

function renderRanking(ranking) {
  let html = `<table><thead><tr><th>#</th><th>Time</th><th>PowerScore</th><th>Categoria</th><th>Perfil DNA</th><th>Forma</th><th>n jogos</th></tr></thead><tbody>`;
  ranking.forEach((r, i) => {
    html += `<tr><td>${i+1}</td><td>${escapeHtml(r.time)}</td><td>${r.powerScore ?? '?'}</td><td>${badgeCategoria(r.categoria)}</td><td>${escapeHtml(r.perfil_dna || '?')}</td><td><code>${escapeHtml(r.forma || '?????')}</code></td><td>${r.n_jogos}</td></tr>`;
  });
  html += `</tbody></table>`;
  return html;
}

function renderMatrizDna(matriz) {
  // Coletar perfis únicos
  const perfis = new Set();
  Object.values(matriz).forEach(c => { perfis.add(c.perfil_mandante); perfis.add(c.perfil_visitante); });
  const lista = [...perfis].sort();

  let html = `<table><thead><tr><th>Mandante \\ Visitante</th>`;
  lista.forEach(p => { html += `<th>${escapeHtml(p)}</th>`; });
  html += `</tr></thead><tbody>`;

  for (const pM of lista) {
    html += `<tr><th>${escapeHtml(pM)}</th>`;
    for (const pV of lista) {
      const key = `${pM}__vs__${pV}`;
      const c = matriz[key];
      if (!c || c.n_jogos === 0) {
        html += `<td class="heatmap-cell" style="color:var(--muted)">—</td>`;
      } else {
        const hot = c.cantos_media_total >= 11 ? 'color:#fbbf24;font-weight:700' :
                    c.cantos_media_total >= 9  ? 'color:#34d367' :
                    c.cantos_media_total >= 7  ? '' : 'color:var(--muted)';
        const qIcon = c.qualifier === 'consolidado' ? '🟢' : c.qualifier === 'sugestivo' ? '🟡' : '⚪';
        html += `<td class="heatmap-cell" style="${hot}" title="${c.cantos_media_mandante}×${c.cantos_media_visitante} | dom_mand ${c.mandante_dominou_cantos_pct}% | n=${c.n_jogos}">${c.cantos_media_total} ${qIcon}<br><span class="small">n=${c.n_jogos}</span></td>`;
      }
    }
    html += `</tr>`;
  }
  html += `</tbody></table>`;
  html += `<p class="small">🟢 consolidado (n≥5) · 🟡 sugestivo (n=3-4) · ⚪ amostra insuficiente · células coloridas mais quentes = mais cantos no total. Cantos totais HT+FT estão no centro; tooltip mostra split mandante×visitante.</p>`;
  return html;
}

function renderAssinaturas(assinaturas) {
  let html = `<div>`;
  for (const a of assinaturas) {
    const ev = JSON.stringify(a.evidencia || {});
    const cls = a.nao_avaliavel ? 'sig-nao-aval' : a.presente ? 'sig-presente' : 'sig-ausente';
    const symbol = a.nao_avaliavel ? '∅' : a.presente ? '✓' : '✗';
    const qual = a.qualifier ? ` [${a.qualifier}]` : '';
    html += `<span class="${cls}" title="${escapeHtml(ev)}">${symbol} ${escapeHtml(a.nome)}${qual}</span>`;
  }
  html += `</div>`;
  return html;
}

function renderTimeSection(time, dadosTime) {
  const i = dadosTime.identidade;
  const b = dadosTime.baseline;
  const bk = dadosTime.buckets;
  const ass = dadosTime.assinaturas;
  const nar = dadosTime.narrativa;

  let html = `<div class="time-section"><h3>${escapeHtml(time)} ${badgeCategoria(i.categoria)} <span class="small">PowerScore ${i.powerScore ?? '?'}</span></h3>`;

  // Cards identidade
  html += `<div class="grid-4">
    <div class="card"><div class="label">Perfil DNA</div><div class="valor" style="font-size:0.95rem">${escapeHtml(i.perfil_dna || '—')}</div></div>
    <div class="card"><div class="label">Forma</div><div class="valor"><code>${escapeHtml(i.forma || '?????')}</code></div></div>
    <div class="card"><div class="label">N jogos</div><div class="valor">${b.n_jogos}</div></div>
    <div class="card"><div class="label">Confiabilidade</div><div class="valor" style="font-size:1rem">${escapeHtml(b.confiabilidade)}</div></div>
  </div>`;

  // Baseline
  html += `<h4>Baseline (médias por jogo)</h4>
  <table><thead><tr><th></th><th>Geral</th><th>🏠 Casa</th><th>✈️ Fora</th></tr></thead><tbody>
    <tr><th>Cantos pró</th><td>${b.cantos_pro_geral}</td><td>${b.cantos_pro_casa}</td><td>${b.cantos_pro_fora}</td></tr>
    <tr><th>Cantos sofridos</th><td>${b.cantos_sofridos_geral}</td><td>${b.cantos_sofridos_casa}</td><td>${b.cantos_sofridos_fora}</td></tr>
    <tr><th>Cantos HT pró/sof</th><td>${b.cantos_pro_ht_geral}/${b.cantos_sof_ht_geral}</td><td colspan="2" class="small">consistência σ=${b.consistencia_pro}</td></tr>
    <tr><th>Gols pró/sof</th><td>${b.gols_pro_geral ?? '—'}/${b.gols_sofridos_geral ?? '—'}</td><td colspan="2" class="small">${b.n_com_placar} jogos c/ placar</td></tr>
  </tbody></table>`;

  // Bucket Matrix
  html += `<h4>Bucket Matrix (cantos pró/sof por contexto situacional)</h4>
  <table><thead><tr><th></th><th>vs ELITE</th><th>vs MÉDIO</th><th>vs AZARÃO</th></tr></thead><tbody>
    <tr><th>🏠 Casa</th>${bucketCellHtml(bk.casa_vs_elite)}${bucketCellHtml(bk.casa_vs_medio)}${bucketCellHtml(bk.casa_vs_azarao)}</tr>
    <tr><th>✈️ Fora</th>${bucketCellHtml(bk.fora_vs_elite)}${bucketCellHtml(bk.fora_vs_medio)}${bucketCellHtml(bk.fora_vs_azarao)}</tr>
  </tbody></table>
  <p class="small">Verde = padrão detectado (n≥3 + |Δ|≥2 ou |variação|≥25%). Amarelo = sugestivo. Cinza = amostra insuficiente.</p>`;

  // Assinaturas
  html += `<h4>Assinaturas (12 detectores)</h4>${renderAssinaturas(ass)}`;

  // Narrativa
  // Markdown simples: **bold** → <strong>, `code` → <code>
  const narHtml = escapeHtml(nar)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
  html += `<div class="narrativa">${narHtml}</div></div>`;
  return html;
}

function renderRelatorioLiga(memoria) {
  const ligaId = memoria.liga;
  const ligaNome = memoria.ligaNome;

  let html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Auditoria DNA — ${escapeHtml(ligaNome)}</title>
  <style>${CSS}</style></head><body><div class="container">`;

  // Header
  html += `<div class="header">
    <h1>🧬 Auditoria DNA — ${escapeHtml(ligaNome)} <span style="color:var(--muted);font-weight:400;font-size:1rem">[${ligaId}]</span></h1>
    <div class="meta">
      Data da análise: ${escapeHtml(memoria.data_analise)} ·
      ${memoria.n_jogos_analisados} jogos analisados ·
      ${memoria.n_times} times ·
      Baseline liga: ${memoria.baseline_liga.media_cantos_jogo_ft} cantos/jogo (σ=${memoria.baseline_liga.desvio_cantos_jogo_ft})
    </div>
  </div>`;

  // Banner de cobertura baixa — quando placar < 80%
  const coberturaPlacar = memoria.baseline_liga.n_com_placar / Math.max(memoria.baseline_liga.n_jogos, 1);
  if (coberturaPlacar < 0.8) {
    const pctTxt = (coberturaPlacar * 100).toFixed(1);
    html += `<div style="background:rgba(245,158,11,0.15); border:2px solid var(--gold); border-radius:8px; padding:14px 18px; margin-bottom:18px;">
      <strong style="color:var(--gold);">⚠️ Cobertura de placar ${pctTxt}%</strong>
      <span style="color:var(--text);"> — 4 assinaturas afetadas (<code>ATAQUE_ESTERIL</code>, <code>MURO_DEFENSIVO</code>, <code>DEFESA_PRECARIA</code>, <code>EFETIVIDADE_CLINICA</code>) podem aparecer como <code>nao_avaliavel: sem_dados_placar</code> para a maioria dos times.
      Ver <code>log_${ligaId}.txt</code> para lista completa de times afetados por assinatura.</span>
    </div>`;
  }

  // Insights
  html += `<div class="section"><h2>💡 Insights da liga</h2>`;
  for (const ins of memoria.insights_liga) {
    const insHtml = escapeHtml(ins).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html += `<div class="insight">${insHtml}</div>`;
  }
  html += `</div>`;

  // Ranking
  html += `<div class="section"><h2>🏆 Ranking PowerScore</h2>${renderRanking(memoria.ranking_powerscore)}</div>`;

  // Matriz DNA × DNA
  html += `<div class="section"><h2>🧬 Matriz DNA × DNA (cantos totais por cruzamento de perfis)</h2>${renderMatrizDna(memoria.matriz_dna_cruzamentos)}</div>`;

  // Contagens de assinaturas
  html += `<div class="section"><h2>📊 Frequência das 12 assinaturas (quantos times)</h2>`;
  const cont = memoria.contagens_assinaturas;
  html += `<table><thead><tr><th>Assinatura</th><th>Times c/ presença</th></tr></thead><tbody>`;
  Object.entries(cont).sort((a, b) => b[1] - a[1]).forEach(([n, c]) => {
    html += `<tr><td>${escapeHtml(n)}</td><td>${c}</td></tr>`;
  });
  html += `</tbody></table></div>`;

  // Por time
  html += `<div class="section"><h2>📋 Análise por time</h2>`;
  const ordemTimes = memoria.ranking_powerscore.map(r => r.time);
  for (const t of ordemTimes) {
    if (memoria.times[t]) html += renderTimeSection(t, memoria.times[t]);
  }
  html += `</div>`;

  html += `</div></body></html>`;
  return html;
}

module.exports = { renderRelatorioLiga };
