# 🚦 CHECKPOINT — Argentina — Liga Profesional (ARG)

Gerado em **2026-05-16** · Validação rápida em 5 min

---

## 1. Sanity Check — Contagens

- **Jogos processados:** 249
- **Times no dataset:** 30
- **Times com DNA Escoteiro:** 30
- **Baseline da liga:** 8.57 cantos/jogo (σ=3.23)
- **Cobertura placar:** 249/249 (100%)

## 2. Distribuição de Categorias

| Categoria | Quantidade | Times |
|---|---|---|
| **ELITE** | 9 | Ind. Rivadavia, River Plate, Estudiantes L.P., Velez Sarsfield, Belgrano, Independiente, Boca Juniors, Argentinos Jrs, Union de Santa Fe |
| **MÉDIO** | 12 | Lanus, Rosario Central, Talleres Cordoba, Huracan, Gimnasia L.P., Barracas Central, Tigre, Defensa y Justicia, San Lorenzo, Instituto, Sarmiento Junin, Banfield |
| **AZARÃO** | 9 | Racing Club, Platense, Atl. Tucuman, Gimnasia Mendoza, Newells Old Boys, Central Cordoba, Dep. Riestra, Aldosivi, Estudiantes Rio Cuarto |

## 3. Top 5 e Bottom 5 PowerScore (sanity visual)

### 🥇 Top 5 (maior PowerScore)

| # | Time | PowerScore | Categoria | Perfil DNA | Forma | n |
|---|---|---|---|---|---|---|
| 1 | Ind. Rivadavia | 98.3 | ELITE | OFENSIVO_SOLIDO | `VVVVD` | 17 |
| 2 | River Plate | 95 | ELITE | EQUILIBRADO | `VVVVD` | 17 |
| 3 | Estudiantes L.P. | 91.7 | ELITE | DEFENSIVO | `EVVDE` | 17 |
| 4 | Velez Sarsfield | 88.3 | ELITE | DEFENSIVO | `VVEVE` | 17 |
| 5 | Belgrano | 85 | ELITE | DEFENSIVO | `VEVVV` | 18 |

### 🪨 Bottom 5 (menor PowerScore)

| # | Time | PowerScore | Categoria | Perfil DNA | Forma | n |
|---|---|---|---|---|---|---|
| 26 | Newells Old Boys | 15 | AZARÃO | VULNERAVEL | `DEEEE` | 16 |
| 27 | Central Cordoba | 11.7 | AZARÃO | EQUILIBRADO | `DEDED` | 16 |
| 28 | Dep. Riestra | 8.3 | AZARÃO | MURO_DUPLO | `DDEDD` | 16 |
| 29 | Aldosivi | 5 | AZARÃO | DEFENSIVO | `EEDED` | 16 |
| 30 | Estudiantes Rio Cuarto | 1.7 | AZARÃO | VULNERAVEL | `DEDDD` | 16 |

## 4. Frequência das 12 Assinaturas

| Assinatura | Times c/ presença | % times |
|---|---|---|
| BLITZ_INICIAL | 14 | 47% |
| RUPTURA_HOME | 10 | 33% |
| ELITE_KILLER | 7 | 23% |
| DESEQUILIBRA_FAVORITO | 4 | 13% |
| ATAQUE_ESTERIL | 3 | 10% |
| SUCUMBE_AZARAO | 3 | 10% |
| RETRANCA_AVANCADA | 2 | 7% |
| EFETIVIDADE_CLINICA | 2 | 7% |
| MURO_DEFENSIVO | 1 | 3% |
| CARRINHO_FACIL | 1 | 3% |
| DEFESA_PRECARIA | 0 | 0% |
| TERMOMETRO_FORMA | 0 | 0% |

## 5. Sample Size dos 6 Buckets (qualidade da matriz)

| Bucket | Consolidado (n≥5) | Sugestivo (n=3-4) | Insuficiente (n<3) | Padrão detectado |
|---|---|---|---|---|
| casa_vs_elite | 1 | 14 | 15 | **9** |
| casa_vs_medio | 5 | 17 | 8 | **16** |
| casa_vs_azarao | 2 | 12 | 16 | **8** |
| fora_vs_elite | 4 | 14 | 12 | **16** |
| fora_vs_medio | 2 | 20 | 8 | **10** |
| fora_vs_azarao | 3 | 10 | 17 | **7** |

## 6. Surpresas detectadas (top 3 para revisão visual)

1. **Estudiantes L.P.** — Perfil DNA "DEFENSIVO" com PowerScore alto (91.7) → ELITE. Esperar buckets com poucos cantos pró mas dominância via gols.
2. **Velez Sarsfield** — Perfil DNA "DEFENSIVO" com PowerScore alto (88.3) → ELITE. Esperar buckets com poucos cantos pró mas dominância via gols.
3. **Belgrano** — Perfil DNA "DEFENSIVO" com PowerScore alto (85) → ELITE. Esperar buckets com poucos cantos pró mas dominância via gols.

## 7. Cálculo manual visível — 3 times para conferência

> Pegue uma calculadora. Os 3 times abaixo têm o PowerScore decomposto + 1 bucket detalhado. Se bater = metodologia consistente.

### Ind. Rivadavia (ELITE)

**PowerScore decomposto:**

- gp_jogo = 1.81 → 1.81 × 30 = **54.3**
- gc_jogo = 0.94 → (2 - 0.94) × 20 = **21.2**
- forma = `VVVVD` → valores [1, 1, 1, 1, 0] → média = **0.8** × 25 = **20**
- v_pct = (casa 67% + fora 57%) / 2 = **62** × 0.25 = **15.5**
- **PowerRaw total = 111** → percentil na liga = **98.3** → categoria **ELITE**

**Bucket detalhado (casa_vs_elite, n=5, consolidado):**

- cantos pró média = **4.6** (σ=2.06)
- cantos sofridos média = **5** (σ=2.28)
- diferencial = **-0.4** | win_rate_cantos = 40%
- variação vs baseline pró (4.47): **+2.9%**
- padrão detectado? **❌ NÃO**

### Tigre (MÉDIO)

**PowerScore decomposto:**

- gp_jogo = 0.88 → 0.88 × 30 = **26.4**
- gc_jogo = 0.88 → (2 - 0.88) × 20 = **22.4**
- forma = `VEEVE` → valores [1, 0.5, 0.5, 1, 0.5] → média = **0.7** × 25 = **17.5**
- v_pct = (casa 38% + fora 0%) / 2 = **19** × 0.25 = **4.75**
- **PowerRaw total = 71.05** → percentil na liga = **48.3** → categoria **MÉDIO**

**Bucket detalhado (fora_vs_medio, n=4, sugestivo):**

- cantos pró média = **6.5** (σ=3.2)
- cantos sofridos média = **2.25** (σ=1.3)
- diferencial = **4.25** | win_rate_cantos = 100%
- variação vs baseline pró (4.31): **+50.8%**
- padrão detectado? **✅ SIM**

### Estudiantes Rio Cuarto (AZARÃO)

**PowerScore decomposto:**

- gp_jogo = 0.31 → 0.31 × 30 = **9.3**
- gc_jogo = 1.5 → (2 - 1.5) × 20 = **10**
- forma = `DEDDD` → valores [0, 0.5, 0, 0, 0] → média = **0.1** × 25 = **2.5**
- v_pct = (casa 13% + fora 0%) / 2 = **6.5** × 0.25 = **1.63**
- **PowerRaw total = 23.43** → percentil na liga = **1.7** → categoria **AZARÃO**

**Bucket detalhado (fora_vs_medio, n=5, consolidado):**

- cantos pró média = **5.2** (σ=2.04)
- cantos sofridos média = **3.4** (σ=1.62)
- diferencial = **1.8** | win_rate_cantos = 80%
- variação vs baseline pró (4.44): **+17.1%**
- padrão detectado? **❌ NÃO**

## 8. Matriz DNA × DNA — Linhas-chave (top 5 por cantos totais)

| Mandante × Visitante | Cantos total | Mand × Vis | Dom mand % | n | Qualifier |
|---|---|---|---|---|---|
| EQUILIBRADO × DEFENSIVO | **9.75** | 6.15 × 3.6 | 75% | 20 | consolidado |
| OFENSIVO × DEFENSIVO | **9.57** | 5.86 × 3.71 | 71.4% | 7 | consolidado |
| DEFENSIVO × VULNERAVEL | **9.43** | 5.71 × 3.71 | 71.4% | 7 | consolidado |
| OFENSIVO_SOLIDO × DEFENSIVO | **9.33** | 5.33 × 4 | 66.7% | 3 | sugestivo |
| EQUILIBRADO × EQUILIBRADO | **9.25** | 7 × 2.25 | 75% | 8 | consolidado |

## 9. Divergências DNA-Escoteiro × Performance Real

> Casos onde o perfil DNA promete uma coisa mas o PowerScore (performance recente real) entrega outra.
> Esses são os pontos onde o motor pode estar sendo enganado pelo DNA estático.

| Time | Categoria | Perfil DNA | Tipo de divergência | Severidade | Evidência |
|---|---|---|---|---|---|
| **Aldosivi** | AZARÃO | DEFENSIVO | Defensivo medíocre | MEDIA | cantos_sofridos=5.13 \| media_liga_cantos_sof=4.29 \| cantos_sof_vs_media_pct=19.6 \| acima_da_media=true \| gols_sofridos=1.13 \| power_score=5 \| n_jogos=16 |

## 10. Anomalias e limitações detectadas

- Nenhuma anomalia grave detectada.

---

## ✅ Decisão de aprovação

Se os números acima fazem sentido, autorize o processamento das outras 6 ligas. Caso contrário, indique o que precisa ser ajustado.
