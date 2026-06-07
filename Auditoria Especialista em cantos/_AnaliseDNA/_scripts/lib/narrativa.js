// narrativa.js — Gerador de texto operacional 3-6 frases por time
const { r } = require('./normalizadores');

function categoriaLabel(categoria) {
  if (categoria === 'ELITE') return 'ELITE';
  if (categoria === 'MÉDIO') return 'MÉDIO';
  if (categoria === 'AZARÃO') return 'AZARÃO';
  return 'sem categoria';
}

// Gera narrativa para um time
function gerarNarrativa(time, identidade, baseline, buckets, assinaturas, baselineLiga) {
  const partes = [];

  // 1. Identidade
  const dnaTxt = identidade.perfil_dna && identidade.perfil_dna !== 'SEM_DNA'
    ? `perfil ${identidade.perfil_dna}` : 'perfil indeterminado';
  const forma = identidade.forma || '?????';
  partes.push(
    `**${time}** — Time ${categoriaLabel(identidade.categoria)} (PowerScore ${identidade.powerScore ?? '?'}). ` +
    `${dnaTxt.charAt(0).toUpperCase() + dnaTxt.slice(1)}, forma recente ${forma}.`
  );

  // 2. Padrão em casa (se houver bucket consolidado/sugestivo significativo)
  const bucketsCasa = ['casa_vs_elite', 'casa_vs_medio', 'casa_vs_azarao']
    .map(k => buckets[k]).filter(b => b && b.n >= 3);
  const casaForte = bucketsCasa.find(b => b.padrao_detectado);
  if (casaForte) {
    const alvo = casaForte.alvo.toLowerCase();
    partes.push(
      `🏠 Em casa vs ${alvo}: ${casaForte.cantos_pro_media} cantos pró, ` +
      `${casaForte.cantos_sofridos_media} sofridos ` +
      `(${casaForte.variacao_vs_baseline_pct > 0 ? '+' : ''}${casaForte.variacao_vs_baseline_pct}% vs baseline, n=${casaForte.n}, ${casaForte.qualifier}).`
    );
  } else if (baseline.cantos_pro_casa) {
    partes.push(
      `🏠 Em casa: baseline ${baseline.cantos_pro_casa} cantos pró, ` +
      `${baseline.cantos_sofridos_casa} sofridos (n=${baseline.n_jogos_casa}, sem padrão situacional detectado).`
    );
  }

  // 3. Padrão fora
  const bucketsFora = ['fora_vs_elite', 'fora_vs_medio', 'fora_vs_azarao']
    .map(k => buckets[k]).filter(b => b && b.n >= 3);
  const foraForte = bucketsFora.find(b => b.padrao_detectado);
  if (foraForte) {
    const alvo = foraForte.alvo.toLowerCase();
    partes.push(
      `✈️ Fora vs ${alvo}: ${foraForte.cantos_pro_media} cantos pró, ` +
      `${foraForte.cantos_sofridos_media} sofridos ` +
      `(${foraForte.variacao_vs_baseline_pct > 0 ? '+' : ''}${foraForte.variacao_vs_baseline_pct}% vs baseline, n=${foraForte.n}, ${foraForte.qualifier}).`
    );
  } else if (baseline.cantos_pro_fora) {
    partes.push(
      `✈️ Fora: baseline ${baseline.cantos_pro_fora} cantos pró, ` +
      `${baseline.cantos_sofridos_fora} sofridos (n=${baseline.n_jogos_fora}, sem padrão situacional detectado).`
    );
  }

  // 4. 1-3 assinaturas presentes (preferindo as mais informativas)
  const presentes = assinaturas.filter(a => a.presente);
  const prioridade = ['ATAQUE_ESTERIL', 'MURO_DEFENSIVO', 'DEFESA_PRECARIA', 'CARRINHO_FACIL', 'SUCUMBE_AZARAO', 'RUPTURA_HOME', 'ELITE_KILLER', 'BLITZ_INICIAL', 'EFETIVIDADE_CLINICA', 'DESEQUILIBRA_FAVORITO', 'RETRANCA_AVANCADA', 'TERMOMETRO_FORMA'];
  const ordenadas = [...presentes].sort((a, b) => prioridade.indexOf(a.nome) - prioridade.indexOf(b.nome));
  const top = ordenadas.slice(0, 3);
  if (top.length) {
    const nomes = top.map(a => `\`${a.nome}\` (${a.qualifier})`).join(', ');
    partes.push(`Assinaturas detectadas: ${nomes}.`);
  }

  // 5. Variância / consistência
  if (baseline.consistencia_pro != null) {
    const desvBaseline = baselineLiga.desvio_cantos_jogo_ft || 0;
    const consTxt = baseline.consistencia_pro <= desvBaseline * 0.6 ? 'baixa (previsível)' :
                    baseline.consistencia_pro >= desvBaseline * 1.1 ? 'alta (errático)' : 'moderada';
    partes.push(`Variância nos cantos pró: σ=${baseline.consistencia_pro} (${consTxt}).`);
  }

  // 6. Alerta operacional principal
  const termFor = assinaturas.find(a => a.nome === 'TERMOMETRO_FORMA' && a.presente);
  const sucumb = assinaturas.find(a => a.nome === 'SUCUMBE_AZARAO' && a.presente);
  const defPrec = assinaturas.find(a => a.nome === 'DEFESA_PRECARIA' && a.presente);
  if (defPrec) {
    partes.push(`⚠️ Alerta: defesa precária — favorece OVER em qualquer cenário.`);
  } else if (sucumb) {
    partes.push(`⚠️ Alerta: sucumbe ao adversário em cantos — sinal direcional pouco confiável.`);
  } else if (termFor) {
    partes.push(`⚠️ Alerta: termômetro de forma instável — variância recente acima do baseline.`);
  } else if (baseline.confiabilidade === 'BAIXA') {
    partes.push(`⚠️ Alerta: amostra reduzida (n=${baseline.n_jogos}) — confiabilidade baixa.`);
  }

  return partes.join(' ');
}

module.exports = { gerarNarrativa };
