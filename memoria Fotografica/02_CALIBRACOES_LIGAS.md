# 🎛️ CALIBRAÇÕES POR LIGA

> Constantes empíricas que o motor v3.1 do app usa para cada liga. **Use exatamente esses valores ao reproduzir o raciocínio do SmartCoach.**

---

## 1. LIGA_DNA — arquétipo cultural por liga

| Liga | Arquétipo | Threshold Cisne Negro | Média HT | Média FT |
|---|---|---|---|---|
| **BR** | ofensiva | 2.0 | 4.61 | 10.09 |
| **BR_B** | ofensiva | 2.0 | 4.83 | 10.39 |
| **MLS** | ofensiva | 2.5 | 4.71 | 10.16 |
| **BUN** | equilibrada | 2.0 | 4.38 | 9.71 |
| **USL** | equilibrada | 2.0 | 4.35 | 9.15 |
| **ARG** | trucada | 1.5 | 4.10 | 8.57 |
| **ARG_B** | trucada | 1.5 | 4.12 | 8.60 |
| **J1** | equilibrada | 2.0 | 4.26 | 9.70 |
| **J2_J3** | ofensiva | 2.0 | 4.54 | 9.88 |

**Interpretação dos arquétipos:**
- **Ofensiva** (BR, BR_B, MLS, J2_J3) → volume alto de cantos; Over 9.5+ frequente; Bala de Prata MODERADA pode operar.
- **Equilibrada** (BUN, USL, J1) → volume médio; favorito não domina tanto; MODERADA vale 70%; Over 9.5 com critério.
- **Trucada** (ARG, ARG_B) → volume baixo; Under FT brilha; MODERADA **zerada** (produziu 40% WR no ARG_B); apenas NUCLEAR/ABSOLUTO operam direcional.

---

## 2. ARQUETIPO_MULT — multiplicadores aplicados ao Filtro OURO

Aplica-se ao score dos motores Bala de Prata e Reis dos Cantos. **Não** reduz peso de sinais NUCLEAR/ABSOLUTO (esses sempre funcionam, 78% WR cravado).

```javascript
const ARQUETIPO_MULT = {
  ofensiva: {
    bp_nuclear: 1.0, bp_forte: 1.0, bp_moderada: 1.0,
    reis_absoluto: 1.0, reis_dominante: 1.0, reis_moderado: 1.0,
    diff_alto: 1.0,
    under_premium: 1.0
  },
  equilibrada: {
    bp_nuclear: 1.0, bp_forte: 0.85, bp_moderada: 0.7,   // MODERADA vale menos
    reis_absoluto: 1.0, reis_dominante: 0.9, reis_moderado: 0.7,
    diff_alto: 1.0,
    under_premium: 0.8
  },
  trucada: {
    bp_nuclear: 1.1, bp_forte: 0.55, bp_moderada: 0.0,  // NUC +10%, MODERADA zerada (40% WR)
    reis_absoluto: 1.1, reis_dominante: 0.7, reis_moderado: 0.0,
    diff_alto: 1.0,
    under_premium: 1.25                                  // Under em ARG_B onde brilha
  }
};
```

---

## 3. FAV_DOMINANCE — correção empírica do Poisson

Poisson puro superestima dominância do favorito em ligas equilibradas. Aqui aplicamos correção empírica:

| Liga | Fator | Interpretação |
|---|---|---|
| **MLS** | 1.03 | App **subestimava** favorito; aumenta 3% |
| **BR** | 0.96 | Pequena correção pra baixo |
| **ARG** | 0.89 | Azarão argentino resiste |
| **J2_J3** | 0.88 | J2/J3 — japonês equilibra mais |
| **USL** | 0.87 | Azarões competitivos |
| **J1** | 0.85 | J1 — favorito não domina como na MLS |
| **ARG_B** | 0.85 | Azarão argentino primera B resiste |
| **BR_B** | 0.83 | Brasileirão B equilibradíssimo |
| **BUN** | 0.79 | **Azarão rouba cantos** — maior correção |
| _default_ | 0.92 | Para ligas não calibradas |

**Como aplicar:**
- `fator < 1.0` → reduz probabilidade do favorito, manda para empate (azarão rouba cantos).
- `fator > 1.0` → aumenta probabilidade do favorito (puxa do empate).
- Use ao calcular probabilidades de Match Odds de cantos (1x2 HT/FT) e ao avaliar viabilidade de HDP.

---

## 4. PROTOCOLO_STAKE — regras vivas do motor

```javascript
PROTOCOLO_STAKE = {
  // Regra 1 — Under FT REFORÇADO: ambos os times com TMI < 1.0 (jogo apático)
  //          E Sniper FT indicando UNDER. Stake CHEIO.
  UNDER_REFORCADO_STAKE: 10,            // 10u = stake cheio
  TMI_LIMITE_APATICO: 1.0,

  // Regra 2 — HDP HT LIBERADO: mandante entre top 5 em atk HT casa
  //          E visitante entre top 10 em defesa HT fora. Stake REDUZIDO.
  HDP_HT_LIBERADO_STAKE: 5,             // 5u = stake reduzido
  TOP_RANK_ATAQUE_CASA_HT: 5,
  TOP_RANK_DEFESA_FORA_HT: 10,

  // Regra 3 — corolário: HDP HT NÃO entra sem o cruzamento das condições da Regra 2.
  // (Implementada como filtro em gerarRecomendacoes — recs.push só acontece se liberado.)

  // Regra 4 — outliers existem. Lembrete obrigatório:
  LEMBRETE_ANTI_REVANCHE: 'Outliers acontecem em ~8% das apostas com 90%+ de probabilidade. ' +
                          'Aceitar o stop loss e recalibrar no próximo lote — nunca dobrar stake após red.'
};
```

**Resumindo:**
- **Under FT** com TMI dupla < 1.0 + Sniper UNDER → stake cheio (10u).
- **HDP HT** liberado SÓ se mandante top 5 atk HT casa × visitante top 10 def HT fora → stake reduzido (5u).
- **Anti-revanche**: nunca dobrar após red.

---

## 5. LIGAS_STATUS — alertas operacionais

| Liga | Status | ROI | n | Desde | Motivo |
|---|---|---|---|---|---|
| **MLS** | ⚠️ observação | -17% | 32 | 2026-04-22 | 158 apostas no tracker confirmam: HDP HT de favorito sem cruzamento drena ROI. PROTOCOLO_STAKE já bloqueia esses sinais. Operar apenas Unders com TMI dupla baixa. |
| **J1** | ⚠️ observação | — | 0 | 2026-05-15 | Reativada com paridade DNA parcial. Sem notas qualitativas YAAKEN. Amostra pequena para buckets (~1 jogo por bucket). Aguardar 2-3 rodadas antes de operar com stake real. Em maturação. |
| **CHI** | ⛔ suspensa | -31% | 6 | 2026-04-23 | Backtest negativo. Liga sem DNA Escoteiro, amostra pequena (~4 jogos por time). Padrão de erro similar ao ECU. (Liga **não** está em operação no app atual; mencionada apenas para registro histórico.) |
| **ECU** | ⛔ suspensa | -45% | 6 | 2026-04-22 | Backtest catastrófico (1V 5D). Motor sem DNA Escoteiro. (Liga **não** está em operação no app atual; mencionada apenas para registro histórico.) |

**Instrução ao agente IA:**
- Se a pergunta envolver **MLS**, abra a resposta com: *"⚠️ MLS está em observação operacional (ROI -17% em 32 apostas recentes). PROTOCOLO_STAKE bloqueia HDP HT de favorito sem cruzamento. Reduzir stake / operar apenas Unders reforçados."*
- Se a pergunta envolver **J1**, abra com: *"⚠️ J1 em maturação — DNA parcial. Análise comparativa OK; **não operar com stake real ainda**. Aguardar 2-3 rodadas."*
- Demais ligas (BR, BR_B, ARG, ARG_B, USL, BUN, J2_J3): operação normal.

---

## 6. OARF — Outlier Auto-Regressivo de Frequência (referência)

Constante por liga que regula a sensibilidade do motor a momentum recente:

| Liga | OARF_REF | Modo |
|---|---|---|
| BR | 0.45 | Médio |
| BR_B | 0.30 | Conservador |
| ARG | 0.45 | Médio |
| ARG_B | 0.30 | Conservador |
| MLS | 0.60 | Agressivo |
| USL | 0.30 | Conservador |
| BUN | 0.40 | Médio |
| J1 | 0.45 | Médio |
| J2_J3 | 0.45 | Médio |

**Uso:** liga com OARF AGRESSIVO (≥0.60) → projeções refletem momentum recente forte. Liga com OARF CONSERVADOR (<0.25) → motor cético; cite isso na recomendação.

---

## 7. Recapitulando — fluxo de raciocínio do agente IA

Ao receber uma pergunta sobre um jogo específico **Time A (casa) × Time B (fora)** na liga **L**:

1. **Status da liga L**: se SUSPENSA ou EM OBSERVAÇÃO, abra a resposta com aviso (seção 5).
2. **Identidade dos dois times** (`MEMORIA_DNA[L].times.A.identidade` e `.B.identidade`): PowerScore, categoria, perfil DNA, forma.
3. **Buckets situacionais**:
   - `A.buckets.casa_vs_<categoria_de_B>` → como A se comporta em casa contra times da categoria de B.
   - `B.buckets.fora_vs_<categoria_de_A>` → como B se comporta fora contra times da categoria de A.
   - Use apenas se `qualifier === 'consolidado'`.
4. **Assinaturas e divergências** de cada time (`.assinaturas` e `divergencias_dna_performance`).
5. **Calibração da liga L**:
   - Arquétipo (`LIGA_DNA[L].arquetipo`).
   - Multiplicador (`ARQUETIPO_MULT[arquetipo]`).
   - Fator de dominância (`FAV_DOMINANCE[L]`).
6. **Cálculo Poisson estimado** com xCorners ajustado e fator de dominância.
7. **Comparação com `LIGA_DNA[L].mediaFT`** → se diferença ≥ `cisneThreshold`, é Cisne Negro.
8. **PROTOCOLO_STAKE**:
   - Under: TMI dupla < 1.0 + Sniper UNDER → 10u.
   - HDP HT: cruzamento top 5 × top 10 → 5u.
   - Nenhum dos dois? Não recomende stake direcional.
9. **Lembrete anti-revanche** ao fechar.
