# 🚦 CHECKPOINT — J2 + J3 League (J2_J3)

Gerado em **2026-05-16** · Validação rápida em 5 min

---

## 1. Sanity Check — Contagens

- **Jogos processados:** 319
- **Times no dataset:** 40
- **Times com DNA Escoteiro:** 40
- **Baseline da liga:** 9.88 cantos/jogo (σ=3.09)
- **Cobertura placar:** 62/319 (19.4%)

## 2. Distribuição de Categorias

| Categoria | Quantidade | Times |
|---|---|---|
| **ELITE** | 12 | Vegalta Sendai, Toyama, Tegevajaro Miyazaki, Tokushima, Shonan Bellmare, Iwaki, Kofu, Omiya Ardija, Kagoshima Utd, Blaublitz, Yamaga, Gifu |
| **MÉDIO** | 16 | Renofa Yamaguchi, Kochi United, Yokohama FC, Ehime, Sagan Tosu, Fujieda MYFC, Hokkaido Consadole Sapporo, Albirex Niigata, Kumamoto, Sagamihara, Iwata, Oita Trinita, Montedio Yamagata, Gainare Tottori, Kanazawa, Tochigi SC |
| **AZARÃO** | 12 | Osaka, Vanraure, Nara Club, Imabari, Kusatsu, Giravanz Kitakyushu, Reilac Shiga, Ryukyu, Fukushima Utd, Tochigi City, Nagano, Kamatamare |

## 3. Top 5 e Bottom 5 PowerScore (sanity visual)

### 🥇 Top 5 (maior PowerScore)

| # | Time | PowerScore | Categoria | Perfil DNA | Forma | n |
|---|---|---|---|---|---|---|
| 1 | Vegalta Sendai | 98.8 | ELITE | OFENSIVO_SOLIDO | `VVVVV` | 16 |
| 2 | Toyama | 96.3 | ELITE | OFENSIVO_SOLIDO | `VVVVV` | 16 |
| 3 | Tegevajaro Miyazaki | 93.8 | ELITE | OFENSIVO_SOLIDO | `VVVVV` | 16 |
| 4 | Tokushima | 91.3 | ELITE | OFENSIVO | `VDDDV` | 16 |
| 5 | Shonan Bellmare | 88.8 | ELITE | OFENSIVO_SOLIDO | `DVVDV` | 16 |

### 🪨 Bottom 5 (menor PowerScore)

| # | Time | PowerScore | Categoria | Perfil DNA | Forma | n |
|---|---|---|---|---|---|---|
| 36 | Ryukyu | 11.3 | AZARÃO | VULNERAVEL | `DDDDD` | 16 |
| 37 | Fukushima Utd | 8.8 | AZARÃO | EQUILIBRADO | `DDDDD` | 16 |
| 38 | Tochigi City | 6.3 | AZARÃO | EQUILIBRADO | `DDDDD` | 16 |
| 39 | Nagano | 3.8 | AZARÃO | VULNERAVEL | `DDDDV` | 16 |
| 40 | Kamatamare | 1.3 | AZARÃO | VULNERAVEL | `DDDDD` | 16 |

## 4. Frequência das 12 Assinaturas

| Assinatura | Times c/ presença | % times |
|---|---|---|
| ELITE_KILLER | 13 | 33% |
| BLITZ_INICIAL | 11 | 28% |
| EFETIVIDADE_CLINICA | 9 | 23% |
| SUCUMBE_AZARAO | 6 | 15% |
| CARRINHO_FACIL | 4 | 10% |
| ATAQUE_ESTERIL | 3 | 8% |
| RUPTURA_HOME | 3 | 8% |
| DESEQUILIBRA_FAVORITO | 3 | 8% |
| RETRANCA_AVANCADA | 1 | 3% |
| MURO_DEFENSIVO | 1 | 3% |
| DEFESA_PRECARIA | 1 | 3% |
| TERMOMETRO_FORMA | 1 | 3% |

## 5. Sample Size dos 6 Buckets (qualidade da matriz)

| Bucket | Consolidado (n≥5) | Sugestivo (n=3-4) | Insuficiente (n<3) | Padrão detectado |
|---|---|---|---|---|
| casa_vs_elite | 3 | 13 | 24 | **12** |
| casa_vs_medio | 3 | 29 | 8 | **20** |
| casa_vs_azarao | 0 | 17 | 23 | **14** |
| fora_vs_elite | 3 | 11 | 26 | **8** |
| fora_vs_medio | 2 | 31 | 7 | **20** |
| fora_vs_azarao | 0 | 17 | 23 | **13** |

## 6. Surpresas detectadas (top 3 para revisão visual)

1. **Tokushima** — Categoria ELITE com forma recente ruim (3 derrotas em 5: `VDDDV`) — alerta de regressão à média.
2. **Omiya Ardija** — Categoria ELITE com forma recente ruim (3 derrotas em 5: `DDDVV`) — alerta de regressão à média.
3. **Kagoshima Utd** — Categoria ELITE com forma recente ruim (3 derrotas em 5: `DDVDV`) — alerta de regressão à média.

## 7. Cálculo manual visível — 3 times para conferência

> Pegue uma calculadora. Os 3 times abaixo têm o PowerScore decomposto + 1 bucket detalhado. Se bater = metodologia consistente.

### Vegalta Sendai (ELITE)

**PowerScore decomposto:**

- gp_jogo = 2.21 → 2.21 × 30 = **66.3**
- gc_jogo = 0.71 → (2 - 0.71) × 20 = **25.8**
- forma = `VVVVV` → valores [1, 1, 1, 1, 1] → média = **1** × 25 = **25**
- v_pct = (casa 86% + fora 100%) / 2 = **93** × 0.25 = **23.25**
- **PowerRaw total = 140.35** → percentil na liga = **98.8** → categoria **ELITE**

**Bucket detalhado (fora_vs_medio, n=4, sugestivo):**

- cantos pró média = **7** (σ=3)
- cantos sofridos média = **2.5** (σ=1.12)
- diferencial = **4.5** | win_rate_cantos = 100%
- variação vs baseline pró (5.75): **+21.7%**
- padrão detectado? **✅ SIM**

### Kumamoto (MÉDIO)

**PowerScore decomposto:**

- gp_jogo = 1.14 → 1.14 × 30 = **34.2**
- gc_jogo = 1.14 → (2 - 1.14) × 20 = **17.2**
- forma = `DDDVV` → valores [0, 0, 0, 1, 1] → média = **0.4** × 25 = **10**
- v_pct = (casa 50% + fora 50%) / 2 = **50** × 0.25 = **12.5**
- **PowerRaw total = 73.9** → percentil na liga = **48.8** → categoria **MÉDIO**

**Bucket detalhado (casa_vs_medio, n=4, sugestivo):**

- cantos pró média = **4.75** (σ=1.48)
- cantos sofridos média = **4.25** (σ=2.28)
- diferencial = **0.5** | win_rate_cantos = 50%
- variação vs baseline pró (4.44): **+7%**
- padrão detectado? **❌ NÃO**

### Kamatamare (AZARÃO)

**PowerScore decomposto:**

- gp_jogo = 0.64 → 0.64 × 30 = **19.2**
- gc_jogo = 1.86 → (2 - 1.86) × 20 = **2.8**
- forma = `DDDDD` → valores [0, 0, 0, 0, 0] → média = **0** × 25 = **0**
- v_pct = (casa 43% + fora 14%) / 2 = **28.5** × 0.25 = **7.13**
- **PowerRaw total = 29.12** → percentil na liga = **1.3** → categoria **AZARÃO**

**Bucket detalhado (casa_vs_medio, n=4, sugestivo):**

- cantos pró média = **4** (σ=2.45)
- cantos sofridos média = **5** (σ=0.71)
- diferencial = **-1** | win_rate_cantos = 25%
- variação vs baseline pró (4.38): **-8.7%**
- padrão detectado? **❌ NÃO**

## 8. Matriz DNA × DNA — Linhas-chave (top 5 por cantos totais)

| Mandante × Visitante | Cantos total | Mand × Vis | Dom mand % | n | Qualifier |
|---|---|---|---|---|---|
| OFENSIVO × OFENSIVO_SOLIDO | **12.33** | 6 × 6.33 | 33.3% | 3 | sugestivo |
| EQUILIBRADO × CAMISA_ABERTA | **11.86** | 5.07 × 6.79 | 35.7% | 14 | consolidado |
| OFENSIVO_SOLIDO × DEFENSIVO | **11.4** | 7 × 4.4 | 80% | 5 | consolidado |
| VULNERAVEL × OFENSIVO | **11.2** | 5.6 × 5.6 | 20% | 5 | consolidado |
| CAMISA_ABERTA × EQUILIBRADO | **11** | 6.29 × 4.71 | 64.3% | 14 | consolidado |

## 9. Divergências DNA-Escoteiro × Performance Real

> Casos onde o perfil DNA promete uma coisa mas o PowerScore (performance recente real) entrega outra.
> Esses são os pontos onde o motor pode estar sendo enganado pelo DNA estático.

| Time | Categoria | Perfil DNA | Tipo de divergência | Severidade | Evidência |
|---|---|---|---|---|---|
| **Shonan Bellmare** | ELITE | OFENSIVO_SOLIDO | Ofensivo subentregando | MEDIA | cantos_pro=4.38 \| media_liga_cantos_pro=4.94 \| gap_vs_media_pct=11.3 \| gols_pro=0.67 \| power_score=88.8 \| n_jogos=16 |
| **Imabari** | AZARÃO | DEFENSIVO | Defensivo medíocre | BAIXA | cantos_sofridos=5 \| media_liga_cantos_sof=4.94 \| cantos_sof_vs_media_pct=1.2 \| acima_da_media=true \| gols_sofridos=1 \| power_score=21.3 \| n_jogos=16 |

## 10. Anomalias e limitações detectadas

- Cobertura de placar baixa (19.4%) → assinaturas EFETIVIDADE_CLINICA, ATAQUE_ESTERIL, MURO_DEFENSIVO, DEFESA_PRECARIA podem estar com baixa confiabilidade

---

## ✅ Decisão de aprovação

Se os números acima fazem sentido, autorize o processamento das outras 6 ligas. Caso contrário, indique o que precisa ser ajustado.
