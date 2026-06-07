# 🚦 CHECKPOINT — Major League Soccer (MLS)

Gerado em **2026-05-16** · Validação rápida em 5 min

---

## 1. Sanity Check — Contagens

- **Jogos processados:** 177
- **Times no dataset:** 30
- **Times com DNA Escoteiro:** 30
- **Baseline da liga:** 10.16 cantos/jogo (σ=3.41)
- **Cobertura placar:** 177/177 (100%)

## 2. Distribuição de Categorias

| Categoria | Quantidade | Times |
|---|---|---|
| **ELITE** | 9 | Vancouver Whitecaps, Nashville SC, San Jose Earthquakes, Los Angeles FC, Seattle Sounders, Chicago Fire, FC Dallas, San Diego FC, Colorado Rapids |
| **MÉDIO** | 12 | Real Salt Lake, New England Revolution, Inter Miami, Charlotte, Los Angeles Galaxy, New York City, FC Cincinnati, Toronto FC, Austin FC, Minnesota United, DC United, Columbus Crew |
| **AZARÃO** | 9 | Houston Dynamo, Atlanta Utd, Portland Timbers, CF Montreal, New York Red Bulls, St. Louis City, Philadelphia Union, Orlando City, Sporting Kansas City |

## 3. Top 5 e Bottom 5 PowerScore (sanity visual)

### 🥇 Top 5 (maior PowerScore)

| # | Time | PowerScore | Categoria | Perfil DNA | Forma | n |
|---|---|---|---|---|---|---|
| 1 | Vancouver Whitecaps | 98.3 | ELITE | OFENSIVO_SOLIDO | `DVVVV` | 12 |
| 2 | Nashville SC | 95 | ELITE | OFENSIVO_SOLIDO | `VVVEV` | 12 |
| 3 | San Jose Earthquakes | 91.7 | ELITE | OFENSIVO_SOLIDO | `VDVVV` | 12 |
| 4 | Los Angeles FC | 88.3 | ELITE | OFENSIVO_SOLIDO | `EVVVV` | 12 |
| 5 | Seattle Sounders | 85 | ELITE | EQUILIBRADO | `EVVDV` | 11 |

### 🪨 Bottom 5 (menor PowerScore)

| # | Time | PowerScore | Categoria | Perfil DNA | Forma | n |
|---|---|---|---|---|---|---|
| 26 | New York Red Bulls | 15 | AZARÃO | EQUILIBRADO | `DEDVV` | 12 |
| 27 | St. Louis City | 11.7 | AZARÃO | VULNERAVEL | `VDEDD` | 12 |
| 28 | Philadelphia Union | 8.3 | AZARÃO | EQUILIBRADO | `DDVDD` | 12 |
| 29 | Orlando City | 5 | AZARÃO | EQUILIBRADO | `DVEDD` | 12 |
| 30 | Sporting Kansas City | 1.7 | AZARÃO | VULNERAVEL | `DVDED` | 12 |

## 4. Frequência das 12 Assinaturas

| Assinatura | Times c/ presença | % times |
|---|---|---|
| BLITZ_INICIAL | 12 | 40% |
| EFETIVIDADE_CLINICA | 9 | 30% |
| RUPTURA_HOME | 6 | 20% |
| ELITE_KILLER | 6 | 20% |
| CARRINHO_FACIL | 4 | 13% |
| DESEQUILIBRA_FAVORITO | 4 | 13% |
| SUCUMBE_AZARAO | 4 | 13% |
| RETRANCA_AVANCADA | 3 | 10% |
| ATAQUE_ESTERIL | 2 | 7% |
| DEFESA_PRECARIA | 2 | 7% |
| MURO_DEFENSIVO | 0 | 0% |
| TERMOMETRO_FORMA | 0 | 0% |

## 5. Sample Size dos 6 Buckets (qualidade da matriz)

| Bucket | Consolidado (n≥5) | Sugestivo (n=3-4) | Insuficiente (n<3) | Padrão detectado |
|---|---|---|---|---|
| casa_vs_elite | 0 | 8 | 22 | **6** |
| casa_vs_medio | 0 | 12 | 18 | **8** |
| casa_vs_azarao | 0 | 8 | 22 | **7** |
| fora_vs_elite | 1 | 7 | 22 | **5** |
| fora_vs_medio | 2 | 11 | 17 | **7** |
| fora_vs_azarao | 0 | 7 | 23 | **5** |

## 6. Surpresas detectadas (top 3 para revisão visual)

> Nenhuma divergência grande encontrada — DNA Escoteiro e PowerScore estão alinhados.

## 7. Cálculo manual visível — 3 times para conferência

> Pegue uma calculadora. Os 3 times abaixo têm o PowerScore decomposto + 1 bucket detalhado. Se bater = metodologia consistente.

### Vancouver Whitecaps (ELITE)

**PowerScore decomposto:**

- gp_jogo = 2.6 → 2.6 × 30 = **78**
- gc_jogo = 0.6 → (2 - 0.6) × 20 = **28**
- forma = `DVVVV` → valores [0, 1, 1, 1, 1] → média = **0.8** × 25 = **20**
- v_pct = (casa 88% + fora 50%) / 2 = **69** × 0.25 = **17.25**
- **PowerRaw total = 143.25** → percentil na liga = **98.3** → categoria **ELITE**

**Bucket detalhado (casa_vs_medio, n=4, sugestivo):**

- cantos pró média = **6.75** (σ=3.34)
- cantos sofridos média = **4.5** (σ=2.18)
- diferencial = **2.25** | win_rate_cantos = 75%
- variação vs baseline pró (5.83): **+15.8%**
- padrão detectado? **✅ SIM**

### FC Cincinnati (MÉDIO)

**PowerScore decomposto:**

- gp_jogo = 1.8 → 1.8 × 30 = **54**
- gc_jogo = 2.1 → (2 - 2.1) × 20 = **-2**
- forma = `VDDDV` → valores [1, 0, 0, 0, 1] → média = **0.4** × 25 = **10**
- v_pct = (casa 60% + fora 20%) / 2 = **40** × 0.25 = **10**
- **PowerRaw total = 72** → percentil na liga = **48.3** → categoria **MÉDIO**

**Bucket detalhado (fora_vs_medio, n=4, sugestivo):**

- cantos pró média = **5.75** (σ=3.63)
- cantos sofridos média = **5** (σ=2.45)
- diferencial = **0.75** | win_rate_cantos = 50%
- variação vs baseline pró (4.92): **+16.9%**
- padrão detectado? **❌ NÃO**

### Sporting Kansas City (AZARÃO)

**PowerScore decomposto:**

- gp_jogo = 0.8 → 0.8 × 30 = **24**
- gc_jogo = 2.6 → (2 - 2.6) × 20 = **-12**
- forma = `DVDED` → valores [0, 1, 0, 0.5, 0] → média = **0.3** × 25 = **7.5**
- v_pct = (casa 0% + fora 20%) / 2 = **10** × 0.25 = **2.5**
- **PowerRaw total = 22** → percentil na liga = **1.7** → categoria **AZARÃO**

**Bucket detalhado (casa_vs_elite, n=4, sugestivo):**

- cantos pró média = **3.5** (σ=1.66)
- cantos sofridos média = **5.75** (σ=2.05)
- diferencial = **-2.25** | win_rate_cantos = 25%
- variação vs baseline pró (3.17): **+10.4%**
- padrão detectado? **✅ SIM**

## 8. Matriz DNA × DNA — Linhas-chave (top 5 por cantos totais)

| Mandante × Visitante | Cantos total | Mand × Vis | Dom mand % | n | Qualifier |
|---|---|---|---|---|---|
| OFENSIVO_SOLIDO × VULNERAVEL | **11.75** | 7.5 × 4.25 | 75% | 4 | sugestivo |
| EQUILIBRADO × VULNERAVEL | **11.33** | 6.33 × 5 | 33.3% | 3 | sugestivo |
| OFENSIVO_SOLIDO × EQUILIBRADO | **11.23** | 7.23 × 4 | 76.9% | 13 | consolidado |
| EQUILIBRADO × EQUILIBRADO | **11.13** | 5.3 × 5.83 | 40% | 30 | consolidado |
| OFENSIVO_SOLIDO × OFENSIVO | **11** | 6.33 × 4.67 | 66.7% | 3 | sugestivo |

## 9. Divergências DNA-Escoteiro × Performance Real

> Casos onde o perfil DNA promete uma coisa mas o PowerScore (performance recente real) entrega outra.
> Esses são os pontos onde o motor pode estar sendo enganado pelo DNA estático.

| Time | Categoria | Perfil DNA | Tipo de divergência | Severidade | Evidência |
|---|---|---|---|---|---|
| **New England Revolution** | MÉDIO | OFENSIVO | Ofensivo subentregando | ALTA | cantos_pro=3.36 \| media_liga_cantos_pro=5.08 \| gap_vs_media_pct=33.9 \| gols_pro=1.64 \| power_score=65 \| n_jogos=11 |
| **New York City** | MÉDIO | OFENSIVO | Ofensivo subentregando | MEDIA | cantos_pro=3.92 \| media_liga_cantos_pro=5.08 \| gap_vs_media_pct=22.8 \| gols_pro=1.58 \| power_score=51.7 \| n_jogos=12 |

## 10. Anomalias e limitações detectadas

- Nenhuma anomalia grave detectada.

---

## ✅ Decisão de aprovação

Se os números acima fazem sentido, autorize o processamento das outras 6 ligas. Caso contrário, indique o que precisa ser ajustado.
