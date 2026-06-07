# 🚦 CHECKPOINT — Brasileirão Série A (BR)

Gerado em **2026-05-16** · Validação rápida em 5 min

---

## 1. Sanity Check — Contagens

- **Jogos processados:** 147
- **Times no dataset:** 20
- **Times com DNA Escoteiro:** 20
- **Baseline da liga:** 10.09 cantos/jogo (σ=3.66)
- **Cobertura placar:** 147/147 (100%)

## 2. Distribuição de Categorias

| Categoria | Quantidade | Times |
|---|---|---|
| **ELITE** | 6 | Palmeiras, Flamengo, Fluminense, Athletico-PR, São Paulo, Bahia |
| **MÉDIO** | 8 | Botafogo, Internacional, Red Bull Bragantino, Vitória, Vasco, Santos, Grêmio, Atlético-MG |
| **AZARÃO** | 6 | Coritiba, Cruzeiro, Corinthians, Remo, Mirassol, Chapecoense |

## 3. Top 5 e Bottom 5 PowerScore (sanity visual)

### 🥇 Top 5 (maior PowerScore)

| # | Time | PowerScore | Categoria | Perfil DNA | Forma | n |
|---|---|---|---|---|---|---|
| 1 | Palmeiras | 97.5 | ELITE | OFENSIVO | `VEVVV` | 15 |
| 2 | Flamengo | 92.5 | ELITE | OFENSIVO_SOLIDO | `VVVDE` | 14 |
| 3 | Fluminense | 87.5 | ELITE | OFENSIVO | `VDEVV` | 15 |
| 4 | Athletico-PR | 82.5 | ELITE | EQUILIBRADO | `VVDDV` | 15 |
| 5 | São Paulo | 77.5 | ELITE | EQUILIBRADO | `VDVED` | 15 |

### 🪨 Bottom 5 (menor PowerScore)

| # | Time | PowerScore | Categoria | Perfil DNA | Forma | n |
|---|---|---|---|---|---|---|
| 16 | Cruzeiro | 22.5 | AZARÃO | EQUILIBRADO | `VVDED` | 15 |
| 17 | Corinthians | 17.5 | AZARÃO | MURO_DUPLO | `VEDDE` | 15 |
| 18 | Remo | 12.5 | AZARÃO | EQUILIBRADO | `DEEDV` | 15 |
| 19 | Mirassol | 7.5 | AZARÃO | EQUILIBRADO | `DDDDD` | 14 |
| 20 | Chapecoense | 2.5 | AZARÃO | EQUILIBRADO | `DDEDD` | 14 |

## 4. Frequência das 12 Assinaturas

| Assinatura | Times c/ presença | % times |
|---|---|---|
| BLITZ_INICIAL | 6 | 30% |
| ELITE_KILLER | 6 | 30% |
| EFETIVIDADE_CLINICA | 4 | 20% |
| RUPTURA_HOME | 4 | 20% |
| DESEQUILIBRA_FAVORITO | 4 | 20% |
| SUCUMBE_AZARAO | 2 | 10% |
| RETRANCA_AVANCADA | 1 | 5% |
| CARRINHO_FACIL | 1 | 5% |
| ATAQUE_ESTERIL | 0 | 0% |
| MURO_DEFENSIVO | 0 | 0% |
| DEFESA_PRECARIA | 0 | 0% |
| TERMOMETRO_FORMA | 0 | 0% |

## 5. Sample Size dos 6 Buckets (qualidade da matriz)

| Bucket | Consolidado (n≥5) | Sugestivo (n=3-4) | Insuficiente (n<3) | Padrão detectado |
|---|---|---|---|---|
| casa_vs_elite | 2 | 6 | 12 | **4** |
| casa_vs_medio | 2 | 10 | 8 | **6** |
| casa_vs_azarao | 0 | 5 | 15 | **4** |
| fora_vs_elite | 0 | 7 | 13 | **4** |
| fora_vs_medio | 3 | 8 | 9 | **6** |
| fora_vs_azarao | 2 | 6 | 12 | **3** |

## 6. Surpresas detectadas (top 3 para revisão visual)

> Nenhuma divergência grande encontrada — DNA Escoteiro e PowerScore estão alinhados.

## 7. Cálculo manual visível — 3 times para conferência

> Pegue uma calculadora. Os 3 times abaixo têm o PowerScore decomposto + 1 bucket detalhado. Se bater = metodologia consistente.

### Palmeiras (ELITE)

**PowerScore decomposto:**

- gp_jogo = 1.71 → 1.71 × 30 = **51.3**
- gc_jogo = 0.79 → (2 - 0.79) × 20 = **24.2**
- forma = `VEVVV` → valores [1, 0.5, 1, 1, 1] → média = **0.9** × 25 = **22.5**
- v_pct = (casa 86% + fora 57%) / 2 = **71.5** × 0.25 = **17.88**
- **PowerRaw total = 115.88** → percentil na liga = **97.5** → categoria **ELITE**

**Bucket detalhado (casa_vs_medio, n=4, sugestivo):**

- cantos pró média = **7.25** (σ=1.3)
- cantos sofridos média = **2.75** (σ=1.3)
- diferencial = **4.5** | win_rate_cantos = 100%
- variação vs baseline pró (6.33): **+14.5%**
- padrão detectado? **✅ SIM**

### Vasco (MÉDIO)

**PowerScore decomposto:**

- gp_jogo = 1.43 → 1.43 × 30 = **42.9**
- gc_jogo = 1.5 → (2 - 1.5) × 20 = **10**
- forma = `DEDEV` → valores [0, 0.5, 0, 0.5, 1] → média = **0.4** × 25 = **10**
- v_pct = (casa 57% + fora 0%) / 2 = **28.5** × 0.25 = **7.13**
- **PowerRaw total = 70.03** → percentil na liga = **47.5** → categoria **MÉDIO**

**Bucket detalhado (casa_vs_elite, n=5, consolidado):**

- cantos pró média = **6.4** (σ=1.85)
- cantos sofridos média = **4.4** (σ=0.8)
- diferencial = **2** | win_rate_cantos = 80%
- variação vs baseline pró (5.53): **+15.7%**
- padrão detectado? **✅ SIM**

### Chapecoense (AZARÃO)

**PowerScore decomposto:**

- gp_jogo = 1 → 1 × 30 = **30**
- gc_jogo = 2 → (2 - 2) × 20 = **0**
- forma = `DDEDD` → valores [0, 0, 0.5, 0, 0] → média = **0.1** × 25 = **2.5**
- v_pct = (casa 13% + fora 0%) / 2 = **6.5** × 0.25 = **1.63**
- **PowerRaw total = 34.13** → percentil na liga = **2.5** → categoria **AZARÃO**

**Bucket detalhado (casa_vs_medio, n=6, consolidado):**

- cantos pró média = **5** (σ=2.52)
- cantos sofridos média = **4.83** (σ=4.3)
- diferencial = **0.17** | win_rate_cantos = 50%
- variação vs baseline pró (3.86): **+29.5%**
- padrão detectado? **✅ SIM**

## 8. Matriz DNA × DNA — Linhas-chave (top 5 por cantos totais)

| Mandante × Visitante | Cantos total | Mand × Vis | Dom mand % | n | Qualifier |
|---|---|---|---|---|---|
| EQUILIBRADO × OFENSIVO | **12.45** | 6.45 × 6 | 63.6% | 11 | consolidado |
| CAMISA_ABERTA × EQUILIBRADO | **11.5** | 5.25 × 6.25 | 50% | 4 | sugestivo |
| MURO_DUPLO × EQUILIBRADO | **11.2** | 5.4 × 5.8 | 20% | 5 | consolidado |
| DEFENSIVO × EQUILIBRADO | **10.2** | 6.4 × 3.8 | 60% | 10 | consolidado |
| EQUILIBRADO × EQUILIBRADO | **10.15** | 5.66 × 4.48 | 58.1% | 62 | consolidado |

## 9. Divergências DNA-Escoteiro × Performance Real

> Casos onde o perfil DNA promete uma coisa mas o PowerScore (performance recente real) entrega outra.
> Esses são os pontos onde o motor pode estar sendo enganado pelo DNA estático.

| Time | Categoria | Perfil DNA | Tipo de divergência | Severidade | Evidência |
|---|---|---|---|---|---|
| **Flamengo** | ELITE | OFENSIVO_SOLIDO | Ofensivo subentregando | MEDIA | cantos_pro=4 \| media_liga_cantos_pro=5.04 \| gap_vs_media_pct=20.6 \| gols_pro=1.93 \| power_score=92.5 \| n_jogos=14 |
| **Corinthians** | AZARÃO | MURO_DUPLO | Defensivo medíocre | BAIXA | cantos_sofridos=5.2 \| media_liga_cantos_sof=5.04 \| cantos_sof_vs_media_pct=3.2 \| acima_da_media=true \| gols_sofridos=1 \| power_score=17.5 \| n_jogos=15 |

## 10. Anomalias e limitações detectadas

- Nenhuma anomalia grave detectada.

---

## ✅ Decisão de aprovação

Se os números acima fazem sentido, autorize o processamento das outras 6 ligas. Caso contrário, indique o que precisa ser ajustado.
