// ================================================================
// PREMISSAS_METODOLOGIA.JS — EDS HDP Ultra v3.0
// Base científica: validação cross-liga em 8 ligas / 1.507 jogos
// Fonte: analise_8ligas.js + validacao_universal_cantos.js
// Gerado: 2026-06-11
// ================================================================

window.PREMISSAS_EDS = {

  versao: '3.0',
  atualizado: '2026-06-11',
  ligas_validadas: 8,
  jogos_validados: 1507,

  // ─────────────────────────────────────────────────────────────────
  //  BLOCO 1 — SISTEMA USL (Universal Signal Layer)
  //  Classificação por diferencial de cantos por time
  // ─────────────────────────────────────────────────────────────────
  sistema_usl: {
    descricao: 'Classifica cada time pelo seu diferencial médio de cantos (pró - contra)',
    validacao: 'Confirmado em 8/8 ligas monitoradas. Hit rate global G×S: 82.8%',
    classes: {
      G_STRONG: { diff_min: 2.0,   diff_max: null, label: 'GERADOR FORTE',   emoji: '🟢🟢', bet_signal: 'APOSTAR A FAVOR' },
      G:        { diff_min: 0.75,  diff_max: 2.0,  label: 'GERADOR',         emoji: '🟢',   bet_signal: 'APOSTAR A FAVOR' },
      N:        { diff_min: -0.75, diff_max: 0.75, label: 'NEUTRO',          emoji: '🟡',   bet_signal: 'NEUTRO' },
      S:        { diff_min: -2.0,  diff_max: -0.75,label: 'SOFREDOR',        emoji: '🔴',   bet_signal: 'APOSTAR CONTRA' },
      S_STRONG: { diff_min: null,  diff_max: -2.0, label: 'SOFREDOR FORTE',  emoji: '🔴🔴', bet_signal: 'APOSTAR CONTRA' },
    },
    matchup_gxs: {
      descricao: 'Confronto Mandante G/G_STRONG × Visitante S/S_STRONG',
      resultado: {
        hit_rate_global: 0.828,
        diff_medio_cantos: 4.41,
        roi_medio_forte: 0.378, // +37.8% ROI médio no backtest FORTE
        melhor_liga: 'ARG (93% hit rate)',
        pior_liga: 'ECU (69% hit rate)',
      },
      thresholds_sinal: {
        FORTE:  { descricao: 'G_STRONG×S ou G×S_STRONG', roi_esperado: '+40%' },
        MEDIO:  { descricao: 'G×S padrão',               roi_esperado: '+15%' },
        FRACO:  { descricao: 'G×N ou N×S',               roi_esperado: 'sem edge' },
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────
  //  BLOCO 2 — FORMAÇÕES TÁTICAS × CANTOS
  //  Score cross-liga: médias de 8 ligas, 1.507 jogos com dados de formação
  // ─────────────────────────────────────────────────────────────────
  formacoes: {
    descricao: 'Score de cantos por formação — média cross-liga validada',
    metodologia: 'diff = média(cantos_mandante - cantos_visitante) quando time joga nessa formação',
    ranking: [
      { formacao: '3-1-4-2',  diff: +0.85, win_pct: 0.650, n_ligas: 6, classe: 'GERADORA_FORTE',   emoji: '✅' },
      { formacao: '4-1-3-2',  diff: +0.73, win_pct: 0.511, n_ligas: 8, classe: 'GERADORA',         emoji: '✅' },
      { formacao: '4-2-3-1',  diff: +0.28, win_pct: 0.470, n_ligas: 8, classe: 'GERADORA_LEVE',    emoji: '➖' },
      { formacao: '4-3-3',    diff: +0.21, win_pct: 0.500, n_ligas: 8, classe: 'NEUTRA',           emoji: '➖' },
      { formacao: '3-4-2-1',  diff: +0.18, win_pct: 0.452, n_ligas: 7, classe: 'NEUTRA',           emoji: '➖' },
      { formacao: '4-1-4-1',  diff: +0.08, win_pct: 0.450, n_ligas: 8, classe: 'NEUTRA',           emoji: '➖' },
      { formacao: '4-4-2',    diff: +0.01, win_pct: 0.457, n_ligas: 8, classe: 'NEUTRA',           emoji: '➖' },
      { formacao: '5-4-1',    diff: -0.08, win_pct: 0.452, n_ligas: 8, classe: 'SOFREDORA_LEVE',   emoji: '➖' },
      { formacao: '4-3-1-2',  diff: -0.40, win_pct: 0.533, n_ligas: 8, classe: 'SOFREDORA',        emoji: '🔴' },
      { formacao: '3-4-3',    diff: -0.53, win_pct: 0.438, n_ligas: 8, classe: 'SOFREDORA',        emoji: '🔴' },
      { formacao: '5-3-2',    diff: -0.57, win_pct: 0.462, n_ligas: 8, classe: 'SOFREDORA',        emoji: '🔴' },
      { formacao: '3-5-2',    diff: -1.44, win_pct: 0.341, n_ligas: 8, classe: 'SOFREDORA_FORTE',  emoji: '🔴🔴' },
      { formacao: '3-4-1-2',  diff: -1.79, win_pct: 0.256, n_ligas: 7, classe: 'SOFREDORA_FORTE',  emoji: '🔴🔴' },
      { formacao: '4-4-1-1',  diff: -1.96, win_pct: 0.360, n_ligas: 6, classe: 'SOFREDORA_FORTE',  emoji: '🔴🔴' },
      { formacao: '4-5-1',    diff: -3.31, win_pct: 0.125, n_ligas: 6, classe: 'SOFREDORA_EXTREMA',emoji: '🔴🔴🔴' },
    ],
    paradoxo_ofensivo: {
      descricao: 'Times com formações equilibradas geram MAIS cantos que formações ultra-ofensivas',
      evidencia: 'EQUILIBRADA +1.22 diff > OFENSIVA 0.0 diff (3 temporadas Bundesliga)',
      explicacao: 'Formações equilibradas mantêm pressão lateral e criam escanteios por bolas desviadas. Formações ultra-ofensivas tendem a finalizar mais perto do gol (menos córners).',
    },
    getScore: function(formacao) {
      var entry = this.ranking.find(function(r) { return r.formacao === formacao; });
      return entry ? entry.diff : 0;
    },
    getClasse: function(formacao) {
      var entry = this.ranking.find(function(r) { return r.formacao === formacao; });
      return entry ? entry.classe : 'DESCONHECIDA';
    },
  },

  // ─────────────────────────────────────────────────────────────────
  //  BLOCO 3 — BASELINES POR LIGA
  //  Dados calibrados da análise das 8 ligas foco
  // ─────────────────────────────────────────────────────────────────
  baselines: {
    BR: {
      liga: 'Brasileirão Série A',
      jogos_base: 177,
      avg_ft: 10.02,
      avg_ht: 4.60,
      over_9_5_pct: 0.559,
      over_8_5_pct: 0.684,
      home_win_corners_pct: 0.559,
      home_advantage: +0.88,
      correlacao_fin_cantos: 0.296,  // Pearson r
      gxs_hit_rate: 0.722,
      gxs_diff_medio: +3.7,
      roi_forte: +0.269,
      roi_medio: +0.243,
      anomalia: 'LEVE_DESEQUIL tem 88% Over 9.5 — investigar',
      insight_equilibrio: 'EQUILIBRADO → Over 9.5 apenas 43% — cautela em jogos muito parelhados',
    },
    BR_B: {
      liga: 'Brasileirão Série B',
      jogos_base: 97,
      avg_ft: 10.23,
      avg_ht: 4.74,
      over_9_5_pct: 0.536,
      over_8_5_pct: 0.619,
      home_win_corners_pct: 0.598,
      home_advantage: +1.90,
      correlacao_fin_cantos: 0.488,  // FORTE
      gxs_hit_rate: 0.800,
      gxs_diff_medio: +5.7,
      roi_forte: +0.480,
      roi_medio: -0.013,
      anomalia: 'ROI FORTE +48% mais alto das 8 ligas — edge estrutural real',
      insight_equilibrio: 'EQUILIBRADO → Over 9.5 63% — jogos disputados geram mais cantos',
    },
    ARG: {
      liga: 'Argentina Liga Profesional',
      jogos_base: 253,
      avg_ft: 8.56,
      avg_ht: 4.08,
      over_9_5_pct: 0.368,
      over_8_5_pct: 0.506,
      home_win_corners_pct: 0.593,
      home_advantage: +1.47,
      correlacao_fin_cantos: 0.414,  // FORTE
      gxs_hit_rate: 0.926,           // MELHOR DAS 8 LIGAS
      gxs_diff_medio: +4.5,
      roi_forte: +0.377,
      roi_medio: +0.227,
      anomalia: 'G×S 93% hit rate — mais confiável das 8 ligas monitoradas',
      insight_equilibrio: 'EQUILIBRADO → Over 9.5 apenas 41% — cautela',
    },
    ARG_B: {
      liga: 'Argentina B Nacional',
      jogos_base: 251,
      avg_ft: 8.59,
      avg_ht: 4.09,
      over_9_5_pct: 0.406,
      over_8_5_pct: 0.490,
      home_win_corners_pct: 0.637,
      home_advantage: +1.53,
      correlacao_fin_cantos: 0.255,
      gxs_hit_rate: 0.913,
      gxs_diff_medio: +4.5,
      roi_forte: +0.266,
      roi_medio: +0.070,
      anomalia: '4-5-1 = -3.0 diff (11.1% win) — formação mais destrutiva na liga',
      insight_equilibrio: 'EQUILIBRADO → Over 9.5 apenas 14% — fuga total em jogos parelhados',
    },
    MLS: {
      liga: 'MLS Major League Soccer',
      jogos_base: 207,
      avg_ft: 10.15,
      avg_ht: 4.68,
      over_9_5_pct: 0.546,
      over_8_5_pct: 0.657,
      home_win_corners_pct: 0.517,
      home_advantage: +0.95,
      correlacao_fin_cantos: 0.340,
      gxs_hit_rate: 0.840,
      gxs_diff_medio: +4.4,
      roi_forte: +0.220,
      roi_medio: +0.260,
      anomalia: 'EQUILIBRADO → 62% Over 9.5 — único liga onde equilíbrio favorece Over',
      insight_equilibrio: 'Ao contrário das outras ligas, jogos equilibrados geram MAIS cantos na MLS',
    },
    USL: {
      liga: 'USL Championship',
      jogos_base: 117,
      avg_ft: 9.03,
      avg_ht: 4.32,
      over_9_5_pct: 0.419,
      over_8_5_pct: 0.538,
      home_win_corners_pct: 0.462,
      home_advantage: +0.62,
      correlacao_fin_cantos: 0.376,
      gxs_hit_rate: 0.857,
      gxs_diff_medio: +5.6,
      roi_forte: +0.456,
      roi_medio: +0.079,
      anomalia: 'Louisville City outlier extremo: +6.6 diff (casa +9.2)',
      insight_equilibrio: 'Mando de campo FRACO — home advantage menor das 8 ligas',
    },
    CHI: {
      liga: 'Chile Primera División',
      jogos_base: 103,
      avg_ft: 9.51,
      avg_ht: 4.63,
      over_9_5_pct: 0.466,
      over_8_5_pct: 0.592,
      home_win_corners_pct: 0.505,
      home_advantage: +0.72,
      correlacao_fin_cantos: 0.409,  // FORTE
      gxs_hit_rate: 0.875,
      gxs_diff_medio: +3.0,
      roi_forte: +0.374,
      roi_medio: +0.057,
      anomalia: '3-1-4-2 = +1.83 diff / 83.3% win — formação geradora mais eficaz no Chile',
      insight_equilibrio: 'EQUILIBRADO → Over 9.5 38% — mais baixo do Chile',
    },
    ECU: {
      liga: 'Ecuador LigaPro',
      jogos_base: 119,
      avg_ft: 9.20,
      avg_ht: 4.26,
      over_9_5_pct: 0.412,
      over_8_5_pct: 0.580,
      home_win_corners_pct: 0.605,
      home_advantage: +1.62,
      correlacao_fin_cantos: 0.580,  // MAIS ALTA DE TODAS
      gxs_hit_rate: 0.692,           // MAIS BAIXA DAS 8
      gxs_diff_medio: +4.6,
      roi_forte: +0.321,
      roi_medio: -0.026,
      anomalia: 'Finalizações×Cantos r=0.58 — finalizações predizem cantos melhor no Equador',
      insight_equilibrio: 'Apenas 16 times — mais fácil identificar perfis extremos',
    },
  },

  // ─────────────────────────────────────────────────────────────────
  //  BLOCO 4 — REGRAS DE SINAL (Triple Lock)
  //  Hierarquia de sinais para geração de alertas
  // ─────────────────────────────────────────────────────────────────
  regras_sinal: {
    hierarquia: [
      {
        nivel: 1,
        nome: 'TRIPLE LOCK',
        emoji: '🔒🔒🔒',
        cor: '#f59e0b',
        criterios: [
          'Perfil USL mandante: G ou G_STRONG',
          'Perfil USL visitante: S ou S_STRONG',
          'Formação mandante: GERADORA ou GERADORA_FORTE (score ≥ +0.18)',
        ],
        roi_esperado: '+40% (ARG: +37.7%, BR_B: +48%, USL: +45.6%)',
        acao: 'APOSTAR no HDP de cantos a favor do mandante — tamanho de unidade máximo',
      },
      {
        nivel: 2,
        nome: 'DUPLO LOCK',
        emoji: '🔒🔒',
        cor: '#34d367',
        criterios: [
          'Perfil USL mandante: G ou G_STRONG',
          'Perfil USL visitante: S ou S_STRONG',
        ],
        roi_esperado: '+25% a +35%',
        acao: 'APOSTAR no HDP de cantos — tamanho de unidade padrão',
      },
      {
        nivel: 3,
        nome: 'SINAL FORMAÇÃO',
        emoji: '📐',
        cor: '#22c55e',
        criterios: [
          'Diferença de score de formação ≥ 1.0',
          'Mandante com formação GERADORA, visitante com SOFREDORA',
        ],
        roi_esperado: '+15% a +20%',
        acao: 'APOSTAR com stake reduzido — sinal de apoio, não principal',
      },
      {
        nivel: 4,
        nome: 'INVERSÃO VALUE',
        emoji: '💡',
        cor: '#3b82f6',
        criterios: [
          'Time visitante é G_STRONG ou G (diff ≥ +0.75)',
          'Time mandante é S ou S_STRONG',
          'Odds de resultado favorecem o mandante (S)',
        ],
        roi_esperado: 'Variável — value no visitante',
        acao: 'APOSTAR no HDP a favor do visitante — mercado precificou errado',
      },
    ],
    regras_de_fuga: [
      { regra: 'EQUILÍBRIO_FUGA', desc: 'ARG/ARG_B/CHI: odds muito equilibradas → Over 9.5 < 20%. Não apostar Over.' },
      { regra: 'FORMAÇÃO_SOFREDORA', desc: 'Mandante com 4-5-1 ou 3-4-1-2 (score ≤ -1.5). Nunca apostar no HDP do mandante.' },
      { regra: 'S×S_AVOID', desc: 'Dois sofredores se enfrentando — resultado imprevisível no volume de cantos.' },
      { regra: 'POUCA_AMOSTRA', desc: 'Time com < 5 jogos no perfil USL — não classificar, aguardar mais dados.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  //  BLOCO 5 — ARCHETYPES DNA (mapeamento antigo → novo)
  //  Como os archetypes do DNA Escoteiro se mapeiam para USL
  // ─────────────────────────────────────────────────────────────────
  mapeamento_dna_usl: {
    descricao: 'Correspondência entre Archetype DNA (sistema antigo) e Perfil USL (novo)',
    correlacao: [
      { dna_archetype: 'OFENSIVO_SOLIDO',  usl_esperado: 'G ou G_STRONG',   confianca: 'alta'  },
      { dna_archetype: 'OFENSIVO',         usl_esperado: 'G',               confianca: 'media' },
      { dna_archetype: 'CAMISA_ABERTA',    usl_esperado: 'G ou N',          confianca: 'media' },
      { dna_archetype: 'EQUILIBRADO',      usl_esperado: 'N',               confianca: 'alta'  },
      { dna_archetype: 'DEFENSIVO',        usl_esperado: 'S',               confianca: 'alta'  },
      { dna_archetype: 'VULNERAVEL',       usl_esperado: 'S_STRONG',        confianca: 'media' },
      { dna_archetype: 'MURO_DUPLO',       usl_esperado: 'S_STRONG',        confianca: 'alta'  },
    ],
    nota: 'USL é mais preciso que DNA para cantos. DNA captura padrão de gols. Para sinais de cantos, priorizar USL.',
  },

  // ─────────────────────────────────────────────────────────────────
  //  BLOCO 6 — FUNÇÕES UTILITÁRIAS (usáveis no app)
  // ─────────────────────────────────────────────────────────────────
  utils: {

    // Classifica um time pelo diferencial de cantos
    classificarUSL: function(diff_cantos) {
      if (diff_cantos >= 2.0)  return 'G_STRONG';
      if (diff_cantos >= 0.75) return 'G';
      if (diff_cantos >= -0.75)return 'N';
      if (diff_cantos >= -2.0) return 'S';
      return 'S_STRONG';
    },

    // Retorna o score de formação da tabela cross-liga
    scoreFormacao: function(formacao) {
      var ranking = window.PREMISSAS_EDS.formacoes.ranking;
      var entry = ranking.find(function(r) { return r.formacao === formacao; });
      return entry ? entry.diff : 0;
    },

    // Retorna nível de sinal G×S entre dois perfis USL
    nivelSinalGxS: function(perfil_mand, perfil_vis) {
      var gerador  = ['G_STRONG', 'G'];
      var sofredor = ['S_STRONG', 'S'];
      var g_forte  = perfil_mand === 'G_STRONG';
      var s_forte  = perfil_vis  === 'S_STRONG';

      if (gerador.includes(perfil_mand) && sofredor.includes(perfil_vis)) {
        if (g_forte || s_forte) return 'FORTE';
        return 'MEDIO';
      }
      if (sofredor.includes(perfil_mand) && gerador.includes(perfil_vis)) {
        return 'INVERSAO'; // visitante gera mais cantos que mandante
      }
      return 'NULO';
    },

    // Gera alerta G×S formatado para exibição
    gerarAlertaGxS: function(time_m, perfil_m, diff_m, time_v, perfil_v, diff_v, liga) {
      var nivel = this.nivelSinalGxS(perfil_m, perfil_v);
      var base  = window.PREMISSAS_EDS.baselines[liga] || {};
      var roi   = base.roi_forte ? (base.roi_forte * 100).toFixed(0) : '?';
      var hr    = base.gxs_hit_rate ? (base.gxs_hit_rate * 100).toFixed(0) : '?';

      if (nivel === 'FORTE') return [
        '🔒🔒 G×S FORTE: ' + time_m + ' (' + perfil_m + ', diff ' + (diff_m>=0?'+':'') + diff_m.toFixed(1) + ')',
        '         vs ' + time_v + ' (' + perfil_v + ', diff ' + (diff_v>=0?'+':'') + diff_v.toFixed(1) + ')',
        '         Liga ' + liga + ' → Hit rate histórico ' + hr + '% | ROI FORTE ~+' + roi + '%',
      ];
      if (nivel === 'MEDIO') return [
        '🔒 G×S MÉDIO: ' + time_m + ' (' + perfil_m + ') vs ' + time_v + ' (' + perfil_v + ')',
        '         Sinal presente — avaliar com outros fatores',
      ];
      if (nivel === 'INVERSAO') return [
        '💡 INVERSÃO: Visitante ' + time_v + ' é GERADOR — HDP cantos pode favorecer visitante',
      ];
      return [];
    },

    // Detecta valor de mercado em Corner HDP
    detectarValueHDP: function(diff_formacao, linha_hdp_mercado) {
      var expected_edge = diff_formacao * 3.5;
      if (expected_edge > Math.abs(linha_hdp_mercado) + 0.5) {
        return { value: true, msg: 'Mercado subestima edge formação — linha HDP favorável' };
      }
      if (expected_edge < Math.abs(linha_hdp_mercado) - 1.0) {
        return { value: false, msg: 'Mercado superprecificou — linha HDP cara' };
      }
      return { value: null, msg: 'Preço justo — sem edge claro' };
    },

    // Busca dados do confronto tático A (mandante) × B (visitante)
    // Retorna: { diff, win_pct, nivel, sinal, verificado, fonte } ou null
    getConfrontoTatico: function(formMand, formVis) {
      var mx = window.PREMISSAS_EDS.confrontos_taticos.matriz;
      var key = formMand + '×' + formVis;
      if (mx[key]) return mx[key];
      // Tenta derivar da diferença de scores individuais
      var r = window.PREMISSAS_EDS.formacoes.ranking;
      var eA = r.find(function(x){ return x.formacao === formMand; });
      var eB = r.find(function(x){ return x.formacao === formVis;  });
      if (!eA || !eB) return null;
      var diff = parseFloat((eA.diff - eB.diff).toFixed(2));
      var nivel = diff >= 3.0 ? 'EXTREMO' : diff >= 2.0 ? 'FORTE' : diff >= 1.0 ? 'MODERADO' : diff >= 0.3 ? 'LEVE' : 'NEUTRO';
      var sinalEmoji = diff >= 3.0 ? '🔴🔴🔴' : diff >= 2.0 ? '🟢🟢' : diff >= 1.0 ? '🟢' : diff >= 0.3 ? '🟡' : '⚪';
      return {
        diff: diff,
        win_pct: diff >= 3.0 ? 0.78 : diff >= 2.0 ? 0.70 : diff >= 1.0 ? 0.62 : 0.52,
        nivel: nivel,
        sinal: sinalEmoji + ' ' + nivel,
        verificado: false,
        fonte: 'derivado (scores individuais cross-liga)',
      };
    },
  },

  // ─────────────────────────────────────────────────────────────────
  //  BLOCO 7 — O QUE EXCLUIR / DEPRECAR DA METODOLOGIA ANTIGA
  // ─────────────────────────────────────────────────────────────────
  deprecacoes: {
    descricao: 'Componentes da metodologia v1/v2 que são substituídos ou têm confiança reduzida',
    itens: [
      {
        componente: 'top_confrontos_under',
        status: 'DEPRECAR',
        motivo: 'Confrontos fixos ficam desatualizados. Substituir por lookup dinâmico via USL.',
        substituto: 'Calcular S×S em runtime via perfil_usl dos dois times',
      },
      {
        componente: 'calibracao_teacher (Volvo Test v2)',
        status: 'MANTER_COM_RESSALVA',
        motivo: 'Ainda útil para calibração de Over/Under absoluto. Mas NÃO usar para HDP — para isso, usar G×S.',
        substituto: 'Para HDP: usar G×S. Para Over/Under absoluto: manter Poisson calibrado.',
      },
      {
        componente: 'perfil_defesa_vis SANGRA_CANTOS',
        status: 'CONSOLIDAR',
        motivo: 'SANGRA_CANTOS ≈ S_STRONG no USL. Unificar critério.',
        substituto: 'Usar S_STRONG do sistema USL. Manter SANGRA_CANTOS como alias de exibição.',
      },
      {
        componente: 'analise_under.mandantes_compactos baseado em xFT',
        status: 'MANTER_COMPLEMENTAR',
        motivo: 'xFT < 85% média é diferente de S_STRONG USL. Os dois capturam ângulos distintos.',
        substituto: 'Usar AMBOS: xFT para Over/Under absoluto, USL para HDP de cantos.',
      },
      {
        componente: 'DNA Archetype como sinal PRIMÁRIO de cantos',
        status: 'REBAIXAR',
        motivo: 'DNA foi projetado para gols, não cantos. USL é mais preciso para corners HDP.',
        substituto: 'Usar DNA como contexto qualitativo. Usar USL como sinal quantitativo primário.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  //  BLOCO 8 — ESTRUTURA DE PERFIL TIME v3.0
  //  Novos campos a adicionar em cada time nas memoria_*.js
  // ─────────────────────────────────────────────────────────────────
  estrutura_perfil_v3: {
    descricao: 'Campos obrigatórios no perfil de cada time — versão 3.0',
    campos_novos: {
      diff_cantos:        { tipo: 'float',  desc: 'Média de cantos pró - cantos contra por jogo' },
      perfil_usl:         { tipo: 'string', desc: 'G_STRONG | G | N | S | S_STRONG' },
      diff_cantos_casa:   { tipo: 'float',  desc: 'Diff médio como mandante' },
      diff_cantos_fora:   { tipo: 'float',  desc: 'Diff médio como visitante' },
      win_pct_cantos:     { tipo: 'float',  desc: '% de jogos em que o time venceu o duelo de cantos' },
      formacao_principal: { tipo: 'string', desc: 'Formação mais usada (ex: 4-2-3-1)' },
      score_formacao:     { tipo: 'float',  desc: 'Score cross-liga da formação (de premissas_metodologia.js)' },
      classe_formacao:    { tipo: 'string', desc: 'GERADORA_FORTE | GERADORA | NEUTRA | SOFREDORA | SOFREDORA_EXTREMA' },
      n_jogos_usl:        { tipo: 'int',    desc: 'Número de jogos usados para calcular USL (mínimo: 5)' },
    },
    campos_mantidos: {
      xFT_mandante:    'Mantido — para Over/Under absoluto via Poisson',
      xFT_visitante:   'Mantido — para Over/Under absoluto via Poisson',
      xHT_mandante:    'Mantido — para Over/Under HT via Poisson',
      xHT_visitante:   'Mantido — para Over/Under HT via Poisson',
      perfil_ataque:   'Mantido — contexto qualitativo de estilo',
      perfil_defesa_vis:'Mantido — contexto qualitativo de estilo',
      tendencia_cantos:'Mantido — sinaliza se perfil está mudando',
      alertas:         'Mantido + expandido com alertas G×S',
    },
    campos_novos_alertas: [
      'USL_GERADORA_FORTE: diff ≥ +2.0 — máxima pressão de cantos',
      'USL_SOFREDORA_EXTREMA: diff ≤ -2.0 — concede cantos sistematicamente',
      'GXS_FORTE_SIGNAL: mandante G/G_STRONG vs visitante S/S_STRONG',
      'INVERSAO_GXS: visitante é GERADOR — avaliar HDP ao visitante',
      'FORMACAO_GERADORA: mandante com formação score ≥ +0.4',
      'FORMACAO_SOFREDORA: visitante com formação score ≤ -0.4',
      'TRIPLE_LOCK: USL_G + USL_S + FORMACAO_GERADORA — sinal máximo',
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  //  BLOCO 9 — CONFRONTOS TÁTICOS (MATCHUP MATRIX)
  //  Histórico de cantos por par de formações A (mandante) × B (visitante)
  //  Fonte: Bundesliga 2023-24 e 2025-26 + derivados cross-liga
  // ─────────────────────────────────────────────────────────────────
  confrontos_taticos: {
    descricao: 'Diferencial médio de cantos quando formação A (mandante) enfrenta formação B (visitante)',
    metodologia: 'diff > 0 = mandante dominou cantos | verificado=true = dado direto das temporadas Bundesliga',
    niveis: {
      EXTREMO:  { diff_min: 3.0,  emoji: '🔴🔴🔴', win_pct_ref: 0.80 },
      FORTE:    { diff_min: 2.0,  emoji: '🟢🟢',   win_pct_ref: 0.70 },
      MODERADO: { diff_min: 1.0,  emoji: '🟢',     win_pct_ref: 0.62 },
      LEVE:     { diff_min: 0.3,  emoji: '🟡',     win_pct_ref: 0.54 },
      NEUTRO:   { diff_min: -0.3, emoji: '⚪',     win_pct_ref: 0.50 },
    },
    matriz: {
      // ── VERIFICADOS (Bundesliga 2023-24 + 2025-26) ──────────────────
      '3-4-2-1×3-4-3': {
        diff: 2.85, win_pct: 0.78, nivel: 'FORTE',   sinal: '🟢🟢 FORTE',
        verificado: true, fonte: 'Bundesliga 23-24 (+2.83) | média 2 temporadas',
        insight: '3-4-2-1 mantém pressão lateral; 3-4-3 perde duelos nas costas do meia',
      },
      '4-3-3×3-4-2-1': {
        diff: 4.00, win_pct: 0.75, nivel: 'EXTREMO', sinal: '🔴🔴🔴 EXTREMO',
        verificado: true, fonte: 'Bundesliga 23-24 (+4.00)',
        insight: 'Linhas altas do 4-3-3 somam pressão das alas + pivô — domínio total de córners',
      },
      '4-2-3-1×3-4-3': {
        diff: 2.67, win_pct: 0.67, nivel: 'FORTE',   sinal: '🟢🟢 FORTE',
        verificado: true, fonte: 'Bundesliga 23-24 (+3.33) + 25-26 (+2.0) | média',
        insight: '3-4-3 cede espaço lateral — 4-2-3-1 aproveita com cruzamentos bloqueados',
      },
      '4-2-3-1×5-4-1': {
        diff: 1.78, win_pct: 0.67, nivel: 'MODERADO', sinal: '🟢 MODERADO',
        verificado: true, fonte: 'Bundesliga 25-26',
        insight: '5-4-1 fecha espaços mas não gera reação de cantos — passividade cede corners',
      },
      '3-5-2×3-4-2-1': {
        diff: 3.57, win_pct: 0.71, nivel: 'FORTE',   sinal: '🟢🟢 FORTE',
        verificado: true, fonte: 'Bundesliga 25-26',
        insight: '3-5-2 com ala-esquerda + ala-direita altos superam meia-linha do 3-4-2-1',
      },

      // ── DERIVADOS DE ALTA CONFIANÇA (cross-liga, n ≥ 50 jogos) ───────
      '4-1-3-2×4-5-1': {
        diff: 4.04, win_pct: 0.79, nivel: 'EXTREMO', sinal: '🔴🔴🔴 EXTREMO',
        verificado: false, fonte: 'derivado cross-liga (score 4-1-3-2=+0.73, 4-5-1=-3.31)',
        insight: '4-5-1 é a formação mais sofredora de cantos — qualquer GERADORA domina',
      },
      '3-1-4-2×4-5-1': {
        diff: 4.16, win_pct: 0.80, nivel: 'EXTREMO', sinal: '🔴🔴🔴 EXTREMO',
        verificado: false, fonte: 'derivado cross-liga (score 3-1-4-2=+0.85, 4-5-1=-3.31)',
        insight: 'Combinação mais extrema conhecida — 3-1-4-2 vs 4-5-1',
      },
      '4-2-3-1×4-5-1': {
        diff: 3.59, win_pct: 0.78, nivel: 'EXTREMO', sinal: '🔴🔴🔴 EXTREMO',
        verificado: false, fonte: 'derivado cross-liga (score +0.28 vs -3.31)',
        insight: 'Visto frequentemente na Copa 2026 — seleções CONMEBOL defensivas',
      },
      '4-3-3×4-5-1': {
        diff: 3.52, win_pct: 0.77, nivel: 'EXTREMO', sinal: '🔴🔴🔴 EXTREMO',
        verificado: false, fonte: 'derivado cross-liga (score +0.21 vs -3.31)',
        insight: '4-3-3 gera pressão lateral constante — 4-5-1 é bloqueio passivo',
      },
      '3-4-2-1×4-5-1': {
        diff: 3.49, win_pct: 0.77, nivel: 'EXTREMO', sinal: '🔴🔴🔴 EXTREMO',
        verificado: false, fonte: 'derivado cross-liga (score +0.18 vs -3.31)',
        insight: 'Copa 2026: Europa/América Sul (3-4-2-1) vs CONCACAF (4-5-1)',
      },
      '4-1-3-2×3-4-1-2': {
        diff: 2.52, win_pct: 0.72, nivel: 'FORTE',   sinal: '🟢🟢 FORTE',
        verificado: false, fonte: 'derivado cross-liga (score +0.73 vs -1.79)',
      },
      '4-1-3-2×4-4-1-1': {
        diff: 2.69, win_pct: 0.73, nivel: 'FORTE',   sinal: '🟢🟢 FORTE',
        verificado: false, fonte: 'derivado cross-liga (score +0.73 vs -1.96)',
      },
      '4-2-3-1×3-4-1-2': {
        diff: 2.07, win_pct: 0.70, nivel: 'FORTE',   sinal: '🟢🟢 FORTE',
        verificado: false, fonte: 'derivado cross-liga (score +0.28 vs -1.79)',
      },
      '4-3-3×3-4-1-2': {
        diff: 2.00, win_pct: 0.70, nivel: 'FORTE',   sinal: '🟢🟢 FORTE',
        verificado: false, fonte: 'derivado cross-liga (score +0.21 vs -1.79)',
      },
      '4-3-3×4-4-1-1': {
        diff: 2.17, win_pct: 0.71, nivel: 'FORTE',   sinal: '🟢🟢 FORTE',
        verificado: false, fonte: 'derivado cross-liga (score +0.21 vs -1.96)',
      },
      '4-1-3-2×3-5-2': {
        diff: 2.17, win_pct: 0.71, nivel: 'FORTE',   sinal: '🟢🟢 FORTE',
        verificado: false, fonte: 'derivado cross-liga (score +0.73 vs -1.44)',
      },
      '3-4-2-1×3-5-2': {
        diff: 1.62, win_pct: 0.65, nivel: 'MODERADO', sinal: '🟢 MODERADO',
        verificado: false, fonte: 'derivado cross-liga (score +0.18 vs -1.44)',
      },
      '4-2-3-1×3-5-2': {
        diff: 1.72, win_pct: 0.66, nivel: 'MODERADO', sinal: '🟢 MODERADO',
        verificado: false, fonte: 'derivado cross-liga (score +0.28 vs -1.44)',
      },
      '4-3-3×3-5-2': {
        diff: 1.65, win_pct: 0.65, nivel: 'MODERADO', sinal: '🟢 MODERADO',
        verificado: false, fonte: 'derivado cross-liga (score +0.21 vs -1.44)',
      },
      '4-2-3-1×3-4-3': {
        diff: 0.81, win_pct: 0.57, nivel: 'LEVE',    sinal: '🟡 LEVE',
        verificado: false, fonte: 'derivado cross-liga (score +0.28 vs -0.53)',
      },
      '4-3-3×3-4-3': {
        diff: 0.74, win_pct: 0.56, nivel: 'LEVE',    sinal: '🟡 LEVE',
        verificado: false, fonte: 'derivado cross-liga (score +0.21 vs -0.53)',
      },
      '4-4-2×4-5-1': {
        diff: 3.32, win_pct: 0.76, nivel: 'FORTE',   sinal: '🟢🟢 FORTE',
        verificado: false, fonte: 'derivado cross-liga (score +0.01 vs -3.31)',
      },
      '5-4-1×4-5-1': {
        diff: 3.23, win_pct: 0.75, nivel: 'FORTE',   sinal: '🟢🟢 FORTE',
        verificado: false, fonte: 'derivado cross-liga (score -0.08 vs -3.31)',
        insight: 'Mesmo a SOFREDORA_LEVE 5-4-1 domina cantos vs 4-5-1 EXTREMA',
      },
      // Inversões notáveis (visitante favorito de cantos)
      '3-4-3×4-2-3-1': {
        diff: -0.81, win_pct: 0.43, nivel: 'LEVE',    sinal: '🟡 LEVE (visitante)',
        verificado: false, fonte: 'derivado cross-liga (score -0.53 vs +0.28)',
        insight: 'Visitante 4-2-3-1 favorito de cantos — verificar USL antes de apostar',
      },
      '4-5-1×4-3-3': {
        diff: -3.52, win_pct: 0.22, nivel: 'EXTREMO', sinal: '🔴🔴🔴 EXTREMO (visitante)',
        verificado: false, fonte: 'derivado cross-liga (score -3.31 vs +0.21)',
        insight: 'FUGA TOTAL: mandante 4-5-1 nunca apostar no HDP de cantos',
      },
    },

    // Função auxiliar para exibir o confronto no card visual
    getLabel: function(formMand, formVis) {
      var m = window.PREMISSAS_EDS.confrontos_taticos.matriz;
      var key = formMand + '×' + formVis;
      if (m[key]) {
        var c = m[key];
        var badge = c.verificado ? ' ✓' : ' ~';
        return c.sinal + ' | diff ' + (c.diff >= 0 ? '+' : '') + c.diff.toFixed(2) +
               ' | win ' + Math.round(c.win_pct * 100) + '%' + badge;
      }
      return null;
    },
  },

};

// Exporta compatibilidade com sistema antigo
if (typeof window !== 'undefined') {
  window.PREMISSAS_EDS = window.PREMISSAS_EDS;
}
