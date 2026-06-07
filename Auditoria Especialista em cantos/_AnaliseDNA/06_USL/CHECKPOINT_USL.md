# 🚦 CHECKPOINT — USL Championship (USL)

Gerado em **2026-05-16** · Validação rápida em 5 min

---

## 1. Sanity Check — Contagens

- **Jogos processados:** 106
- **Times no dataset:** 25
- **Times com DNA Escoteiro:** 25
- **Baseline da liga:** 9.15 cantos/jogo (σ=3.1)
- **Cobertura placar:** 106/106 (100%)

## 2. Distribuição de Categorias

| Categoria | Quantidade | Times |
|---|---|---|
| **ELITE** | 8 | El Paso, Tampa Bay, Louisville City, Detroit, Orange County SC, Oakland Roots, Phoenix Rising, Colorado Springs |
| **MÉDIO** | 10 | San Antonio, Sacramento Republic, Charleston, Indy Eleven, Rhode Island, Birmingham, Miami FC, Hartford Athletic, Las Vegas Lights, Pittsburgh |
| **AZARÃO** | 7 | FC Tulsa, New Mexico, Loudoun, Lexington, Brooklyn, Monterey Bay, Sporting Jax |

## 3. Top 5 e Bottom 5 PowerScore (sanity visual)

### 🥇 Top 5 (maior PowerScore)

| # | Time | PowerScore | Categoria | Perfil DNA | Forma | n |
|---|---|---|---|---|---|---|
| 1 | El Paso | 98 | ELITE | OFENSIVO | `VVVEV` | 8 |
| 2 | Tampa Bay | 94 | ELITE | OFENSIVO | `VVEVV` | 8 |
| 3 | Louisville City | 90 | ELITE | OFENSIVO | `VVVEV` | 9 |
| 4 | Detroit | 86 | ELITE | EQUILIBRADO | `VDVVE` | 8 |
| 5 | Orange County SC | 82 | ELITE | DEFENSIVO | `VVEVV` | 10 |

### 🪨 Bottom 5 (menor PowerScore)

| # | Time | PowerScore | Categoria | Perfil DNA | Forma | n |
|---|---|---|---|---|---|---|
| 21 | Loudoun | 18 | AZARÃO | EQUILIBRADO | `DEDEE` | 8 |
| 22 | Lexington | 14 | AZARÃO | EQUILIBRADO | `DVEDD` | 9 |
| 23 | Brooklyn | 10 | AZARÃO | EQUILIBRADO | `DDDDV` | 9 |
| 24 | Monterey Bay | 6 | AZARÃO | VULNERAVEL | `DEDDD` | 9 |
| 25 | Sporting Jax | 2 | AZARÃO | VULNERAVEL | `DDEDD` | 9 |

## 4. Frequência das 12 Assinaturas

| Assinatura | Times c/ presença | % times |
|---|---|---|
| BLITZ_INICIAL | 11 | 44% |
| EFETIVIDADE_CLINICA | 10 | 40% |
| RUPTURA_HOME | 9 | 36% |
| RETRANCA_AVANCADA | 2 | 8% |
| ELITE_KILLER | 2 | 8% |
| DESEQUILIBRA_FAVORITO | 2 | 8% |
| SUCUMBE_AZARAO | 2 | 8% |
| ATAQUE_ESTERIL | 1 | 4% |
| MURO_DEFENSIVO | 1 | 4% |
| DEFESA_PRECARIA | 0 | 0% |
| CARRINHO_FACIL | 0 | 0% |
| TERMOMETRO_FORMA | 0 | 0% |

## 5. Sample Size dos 6 Buckets (qualidade da matriz)

| Bucket | Consolidado (n≥5) | Sugestivo (n=3-4) | Insuficiente (n<3) | Padrão detectado |
|---|---|---|---|---|
| casa_vs_elite | 0 | 1 | 24 | **1** |
| casa_vs_medio | 0 | 4 | 21 | **2** |
| casa_vs_azarao | 0 | 0 | 25 | **0** |
| fora_vs_elite | 0 | 4 | 21 | **2** |
| fora_vs_medio | 0 | 6 | 19 | **3** |
| fora_vs_azarao | 0 | 1 | 24 | **1** |

## 6. Surpresas detectadas (top 3 para revisão visual)

1. **Orange County SC** — Perfil DNA "DEFENSIVO" com PowerScore alto (82) → ELITE. Esperar buckets com poucos cantos pró mas dominância via gols.

## 7. Cálculo manual visível — 3 times para conferência

> Pegue uma calculadora. Os 3 times abaixo têm o PowerScore decomposto + 1 bucket detalhado. Se bater = metodologia consistente.

### El Paso (ELITE)

**PowerScore decomposto:**

- gp_jogo = 2.67 → 2.67 × 30 = **80.1**
- gc_jogo = 1.33 → (2 - 1.33) × 20 = **13.4**
- forma = `VVVEV` → valores [1, 1, 1, 0.5, 1] → média = **0.9** × 25 = **22.5**
- v_pct = (casa 33% + fora 100%) / 2 = **66.5** × 0.25 = **16.63**
- **PowerRaw total = 132.63** → percentil na liga = **98** → categoria **ELITE**

### Rhode Island (MÉDIO)

**PowerScore decomposto:**

- gp_jogo = 1.71 → 1.71 × 30 = **51.3**
- gc_jogo = 1.57 → (2 - 1.57) × 20 = **8.6**
- forma = `DDEVE` → valores [0, 0, 0.5, 1, 0.5] → média = **0.4** × 25 = **10**
- v_pct = (casa 25% + fora 33%) / 2 = **29** × 0.25 = **7.25**
- **PowerRaw total = 77.15** → percentil na liga = **50** → categoria **MÉDIO**

### Sporting Jax (AZARÃO)

**PowerScore decomposto:**

- gp_jogo = 0.63 → 0.63 × 30 = **18.9**
- gc_jogo = 2.25 → (2 - 2.25) × 20 = **-5**
- forma = `DDEDD` → valores [0, 0, 0.5, 0, 0] → média = **0.1** × 25 = **2.5**
- v_pct = (casa 0% + fora 0%) / 2 = **0** × 0.25 = **0**
- **PowerRaw total = 16.4** → percentil na liga = **2** → categoria **AZARÃO**

**Bucket detalhado (fora_vs_medio, n=4, sugestivo):**

- cantos pró média = **2** (σ=1.41)
- cantos sofridos média = **6.5** (σ=2.6)
- diferencial = **-4.5** | win_rate_cantos = 0%
- variação vs baseline pró (3.33): **-39.9%**
- padrão detectado? **✅ SIM**

## 8. Matriz DNA × DNA — Linhas-chave (top 5 por cantos totais)

| Mandante × Visitante | Cantos total | Mand × Vis | Dom mand % | n | Qualifier |
|---|---|---|---|---|---|
| EQUILIBRADO × DEFENSIVO | **11.6** | 7 × 4.6 | 60% | 5 | consolidado |
| OFENSIVO × EQUILIBRADO | **9.77** | 6.38 × 3.38 | 69.2% | 13 | consolidado |
| EQUILIBRADO × OFENSIVO | **9.64** | 3.93 × 5.71 | 28.6% | 14 | consolidado |
| DEFENSIVO × EQUILIBRADO | **9.56** | 4.78 × 4.78 | 44.4% | 9 | consolidado |
| EQUILIBRADO × EQUILIBRADO | **9.23** | 4.65 × 4.58 | 38.7% | 31 | consolidado |

## 9. Divergências DNA-Escoteiro × Performance Real

> Casos onde o perfil DNA promete uma coisa mas o PowerScore (performance recente real) entrega outra.
> Esses são os pontos onde o motor pode estar sendo enganado pelo DNA estático.

| Time | Categoria | Perfil DNA | Tipo de divergência | Severidade | Evidência |
|---|---|---|---|---|---|
| **Oakland Roots** | ELITE | OFENSIVO | Ofensivo subentregando | MEDIA | cantos_pro=4 \| media_liga_cantos_pro=4.58 \| gap_vs_media_pct=12.7 \| gols_pro=1.78 \| power_score=78 \| n_jogos=9 |
| **Phoenix Rising** | ELITE | OFENSIVO | Ofensivo subentregando | MEDIA | cantos_pro=4.11 \| media_liga_cantos_pro=4.58 \| gap_vs_media_pct=10.3 \| gols_pro=1.44 \| power_score=74 \| n_jogos=9 |

## 10. Anomalias e limitações detectadas

- Nenhuma anomalia grave detectada.

---

## ✅ Decisão de aprovação

Se os números acima fazem sentido, autorize o processamento das outras 6 ligas. Caso contrário, indique o que precisa ser ajustado.
