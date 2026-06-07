# 🚦 CHECKPOINT — Brasileirão Série B (BR_B)

Gerado em **2026-05-16** · Validação rápida em 5 min

---

## 1. Sanity Check — Contagens

- **Jogos processados:** 77
- **Times no dataset:** 20
- **Times com DNA Escoteiro:** 20
- **Baseline da liga:** 10.39 cantos/jogo (σ=4.04)
- **Cobertura placar:** 18/77 (23.4%)

## 2. Distribuição de Categorias

| Categoria | Quantidade | Times |
|---|---|---|
| **ELITE** | 6 | Sao Bernardo, Vila Nova FC, Fortaleza, Sport Recife, Operario-PR, Criciuma |
| **MÉDIO** | 8 | Botafogo SP, Ceara, Juventude, Avai, Novorizontino, Athletic Club, Atletico GO, Cuiaba |
| **AZARÃO** | 6 | Nautico, Goias, Ponte Preta, CRB, Londrina, America MG |

## 3. Top 5 e Bottom 5 PowerScore (sanity visual)

### 🥇 Top 5 (maior PowerScore)

| # | Time | PowerScore | Categoria | Perfil DNA | Forma | n |
|---|---|---|---|---|---|---|
| 1 | Sao Bernardo | 97.5 | ELITE | OFENSIVO | `DVVDE` | 6 |
| 2 | Vila Nova FC | 92.5 | ELITE | OFENSIVO | `EVVEV` | 8 |
| 3 | Fortaleza | 87.5 | ELITE | EQUILIBRADO | `VEVVE` | 8 |
| 4 | Sport Recife | 82.5 | ELITE | DEFENSIVO | `VEVEE` | 8 |
| 5 | Operario-PR | 77.5 | ELITE | DEFENSIVO | `DEEEV` | 8 |

### 🪨 Bottom 5 (menor PowerScore)

| # | Time | PowerScore | Categoria | Perfil DNA | Forma | n |
|---|---|---|---|---|---|---|
| 16 | Goias | 22.5 | AZARÃO | EQUILIBRADO | `DVDED` | 7 |
| 17 | Ponte Preta | 17.5 | AZARÃO | EQUILIBRADO | `DDEVD` | 8 |
| 18 | CRB | 12.5 | AZARÃO | EQUILIBRADO | `EDDDE` | 8 |
| 19 | Londrina | 7.5 | AZARÃO | EQUILIBRADO | `DEDDE` | 7 |
| 20 | America MG | 2.5 | AZARÃO | VULNERAVEL | `EDEDD` | 8 |

## 4. Frequência das 12 Assinaturas

| Assinatura | Times c/ presença | % times |
|---|---|---|
| RUPTURA_HOME | 9 | 45% |
| BLITZ_INICIAL | 8 | 40% |
| ATAQUE_ESTERIL | 7 | 35% |
| EFETIVIDADE_CLINICA | 4 | 20% |
| RETRANCA_AVANCADA | 2 | 10% |
| MURO_DEFENSIVO | 2 | 10% |
| ELITE_KILLER | 1 | 5% |
| DEFESA_PRECARIA | 0 | 0% |
| CARRINHO_FACIL | 0 | 0% |
| DESEQUILIBRA_FAVORITO | 0 | 0% |
| SUCUMBE_AZARAO | 0 | 0% |
| TERMOMETRO_FORMA | 0 | 0% |

## 5. Sample Size dos 6 Buckets (qualidade da matriz)

| Bucket | Consolidado (n≥5) | Sugestivo (n=3-4) | Insuficiente (n<3) | Padrão detectado |
|---|---|---|---|---|
| casa_vs_elite | 0 | 0 | 20 | **0** |
| casa_vs_medio | 0 | 2 | 18 | **1** |
| casa_vs_azarao | 0 | 1 | 19 | **1** |
| fora_vs_elite | 0 | 0 | 20 | **0** |
| fora_vs_medio | 0 | 2 | 18 | **1** |
| fora_vs_azarao | 0 | 2 | 18 | **2** |

## 6. Surpresas detectadas (top 3 para revisão visual)

1. **Sport Recife** — Perfil DNA "DEFENSIVO" com PowerScore alto (82.5) → ELITE. Esperar buckets com poucos cantos pró mas dominância via gols.
2. **Operario-PR** — Perfil DNA "DEFENSIVO" com PowerScore alto (77.5) → ELITE. Esperar buckets com poucos cantos pró mas dominância via gols.

## 7. Cálculo manual visível — 3 times para conferência

> Pegue uma calculadora. Os 3 times abaixo têm o PowerScore decomposto + 1 bucket detalhado. Se bater = metodologia consistente.

### Sao Bernardo (ELITE)

**PowerScore decomposto:**

- gp_jogo = 1.67 → 1.67 × 30 = **50.1**
- gc_jogo = 0.83 → (2 - 0.83) × 20 = **23.4**
- forma = `DVVDE` → valores [0, 1, 1, 0, 0.5] → média = **0.5** × 25 = **12.5**
- v_pct = (casa 33% + fora 67%) / 2 = **50** × 0.25 = **12.5**
- **PowerRaw total = 98.5** → percentil na liga = **97.5** → categoria **ELITE**

### Novorizontino (MÉDIO)

**PowerScore decomposto:**

- gp_jogo = 1.17 → 1.17 × 30 = **35.1**
- gc_jogo = 1 → (2 - 1) × 20 = **20**
- forma = `EDEVV` → valores [0.5, 0, 0.5, 1, 1] → média = **0.6** × 25 = **15**
- v_pct = (casa 33% + fora 33%) / 2 = **33** × 0.25 = **8.25**
- **PowerRaw total = 78.35** → percentil na liga = **50** → categoria **MÉDIO**

### America MG (AZARÃO)

**PowerScore decomposto:**

- gp_jogo = 0.57 → 0.57 × 30 = **17.1**
- gc_jogo = 1.71 → (2 - 1.71) × 20 = **5.8**
- forma = `EDEDD` → valores [0.5, 0, 0.5, 0, 0] → média = **0.2** × 25 = **5**
- v_pct = (casa 0% + fora 0%) / 2 = **0** × 0.25 = **0**
- **PowerRaw total = 27.9** → percentil na liga = **2.5** → categoria **AZARÃO**

**Bucket detalhado (fora_vs_azarao, n=3, sugestivo):**

- cantos pró média = **7** (σ=2.94)
- cantos sofridos média = **2.67** (σ=0.47)
- diferencial = **4.33** | win_rate_cantos = 66.7%
- variação vs baseline pró (6.75): **+3.7%**
- padrão detectado? **✅ SIM**

## 8. Matriz DNA × DNA — Linhas-chave (top 5 por cantos totais)

| Mandante × Visitante | Cantos total | Mand × Vis | Dom mand % | n | Qualifier |
|---|---|---|---|---|---|
| EQUILIBRADO × OFENSIVO | **13** | 7.33 × 5.67 | 66.7% | 3 | sugestivo |
| DEFENSIVO × EQUILIBRADO | **12.27** | 8.45 × 3.82 | 100% | 11 | consolidado |
| EQUILIBRADO × DEFENSIVO | **11.89** | 7.89 × 4 | 66.7% | 9 | consolidado |
| DEFENSIVO × DEFENSIVO | **11.56** | 6.89 × 4.67 | 44.4% | 9 | consolidado |
| OFENSIVO × DEFENSIVO | **11.33** | 5.67 × 5.67 | 33.3% | 3 | sugestivo |

## 9. Divergências DNA-Escoteiro × Performance Real

> Casos onde o perfil DNA promete uma coisa mas o PowerScore (performance recente real) entrega outra.
> Esses são os pontos onde o motor pode estar sendo enganado pelo DNA estático.

| Time | Categoria | Perfil DNA | Tipo de divergência | Severidade | Evidência |
|---|---|---|---|---|---|
| **Sao Bernardo** | ELITE | OFENSIVO | Ofensivo subentregando | MEDIA | cantos_pro=4.17 \| media_liga_cantos_pro=5.19 \| gap_vs_media_pct=19.7 \| gols_pro=3 \| power_score=97.5 \| n_jogos=6 |
| **Nautico** | AZARÃO | DEFENSIVO | Defensivo medíocre | BAIXA | cantos_sofridos=5.63 \| media_liga_cantos_sof=5.19 \| cantos_sof_vs_media_pct=8.5 \| acima_da_media=true \| gols_sofridos=0.5 \| power_score=27.5 \| n_jogos=8 |

## 10. Anomalias e limitações detectadas

- Cobertura de placar baixa (23.4%) → assinaturas EFETIVIDADE_CLINICA, ATAQUE_ESTERIL, MURO_DEFENSIVO, DEFESA_PRECARIA podem estar com baixa confiabilidade

---

## ✅ Decisão de aprovação

Se os números acima fazem sentido, autorize o processamento das outras 6 ligas. Caso contrário, indique o que precisa ser ajustado.
