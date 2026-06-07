# 🚦 CHECKPOINT — Argentina — Primera Nacional (ARG_B)

Gerado em **2026-05-16** · Validação rápida em 5 min

---

## 1. Sanity Check — Contagens

- **Jogos processados:** 216
- **Times no dataset:** 36
- **Times com DNA Escoteiro:** 36
- **Baseline da liga:** 8.6 cantos/jogo (σ=3.16)
- **Cobertura placar:** 216/216 (100%)

## 2. Distribuição de Categorias

| Categoria | Quantidade | Times |
|---|---|---|
| **ELITE** | 10 | Atletico Atlanta, Almirante Brown, Gimnasia Jujuy, Deportivo Moron, Ferro, Agropecuario, Los Andes, Racing Cordoba, Ciudad Bolivar, Colegiales |
| **MÉDIO** | 16 | CA Estudiantes, Deportivo Maipu, San Telmo, Atl. Rafaela, Deportivo Madryn, Patronato, CA Mitre, Chacarita Juniors, San Martin S.J., Tristan Suarez, Godoy Cruz, Temperley, San Martin T., Midland, Chaco For Ever, Nueva Chicago |
| **AZARÃO** | 10 | Gimnasia y Tiro, Quilmes, Colon Santa Fe, All Boys, Central Norte, Club A. Guemes, San Miguel, Def. de Belgrano, Acassuso, Almagro |

## 3. Top 5 e Bottom 5 PowerScore (sanity visual)

### 🥇 Top 5 (maior PowerScore)

| # | Time | PowerScore | Categoria | Perfil DNA | Forma | n |
|---|---|---|---|---|---|---|
| 1 | Atletico Atlanta | 98.6 | ELITE | OFENSIVO_SOLIDO | `VVVV` | 13 |
| 2 | Almirante Brown | 95.8 | ELITE | DEFENSIVO | `VVV` | 12 |
| 3 | Gimnasia Jujuy | 93.1 | ELITE | OFENSIVO_SOLIDO | `VEE` | 12 |
| 4 | Deportivo Moron | 90.3 | ELITE | OFENSIVO_SOLIDO | `VVE` | 12 |
| 5 | Ferro | 87.5 | ELITE | OFENSIVO | `VDV` | 12 |

### 🪨 Bottom 5 (menor PowerScore)

| # | Time | PowerScore | Categoria | Perfil DNA | Forma | n |
|---|---|---|---|---|---|---|
| 32 | Club A. Guemes | 12.5 | AZARÃO | VULNERAVEL | `EDD` | 12 |
| 33 | San Miguel | 9.7 | AZARÃO | DEFENSIVO | `ED` | 11 |
| 34 | Def. de Belgrano | 6.9 | AZARÃO | VULNERAVEL | `DDE` | 12 |
| 35 | Acassuso | 4.2 | AZARÃO | DEFENSIVO | `EDD` | 12 |
| 36 | Almagro | 1.4 | AZARÃO | VULNERAVEL | `DDE` | 12 |

## 4. Frequência das 12 Assinaturas

| Assinatura | Times c/ presença | % times |
|---|---|---|
| RUPTURA_HOME | 15 | 42% |
| BLITZ_INICIAL | 13 | 36% |
| ELITE_KILLER | 11 | 31% |
| CARRINHO_FACIL | 4 | 11% |
| SUCUMBE_AZARAO | 4 | 11% |
| EFETIVIDADE_CLINICA | 2 | 6% |
| ATAQUE_ESTERIL | 1 | 3% |
| DESEQUILIBRA_FAVORITO | 1 | 3% |
| RETRANCA_AVANCADA | 0 | 0% |
| MURO_DEFENSIVO | 0 | 0% |
| DEFESA_PRECARIA | 0 | 0% |
| TERMOMETRO_FORMA | 0 | 0% |

## 5. Sample Size dos 6 Buckets (qualidade da matriz)

| Bucket | Consolidado (n≥5) | Sugestivo (n=3-4) | Insuficiente (n<3) | Padrão detectado |
|---|---|---|---|---|
| casa_vs_elite | 0 | 5 | 31 | **3** |
| casa_vs_medio | 5 | 10 | 21 | **9** |
| casa_vs_azarao | 0 | 9 | 27 | **6** |
| fora_vs_elite | 1 | 6 | 29 | **6** |
| fora_vs_medio | 4 | 14 | 18 | **13** |
| fora_vs_azarao | 0 | 6 | 30 | **4** |

## 6. Surpresas detectadas (top 3 para revisão visual)

1. **Almirante Brown** — Perfil DNA "DEFENSIVO" com PowerScore alto (95.8) → ELITE. Esperar buckets com poucos cantos pró mas dominância via gols.
2. **Los Andes** — Perfil DNA "DEFENSIVO" com PowerScore alto (81.9) → ELITE. Esperar buckets com poucos cantos pró mas dominância via gols.
3. **Colegiales** — Perfil DNA "DEFENSIVO" com PowerScore alto (73.6) → ELITE. Esperar buckets com poucos cantos pró mas dominância via gols.

## 7. Cálculo manual visível — 3 times para conferência

> Pegue uma calculadora. Os 3 times abaixo têm o PowerScore decomposto + 1 bucket detalhado. Se bater = metodologia consistente.

### Atletico Atlanta (ELITE)

**PowerScore decomposto:**

- gp_jogo = 2 → 2 × 30 = **60**
- gc_jogo = 0.5 → (2 - 0.5) × 20 = **30**
- forma = `VVVV` → valores [1, 1, 1, 1] → média = **1** × 25 = **25**
- v_pct = (casa 100% + fora 100%) / 2 = **100** × 0.25 = **25**
- **PowerRaw total = 140** → percentil na liga = **98.6** → categoria **ELITE**

**Bucket detalhado (casa_vs_medio, n=5, consolidado):**

- cantos pró média = **5.2** (σ=2.64)
- cantos sofridos média = **4.2** (σ=1.72)
- diferencial = **1** | win_rate_cantos = 60%
- variação vs baseline pró (4.62): **+12.6%**
- padrão detectado? **❌ NÃO**

### San Martin S.J. (MÉDIO)

**PowerScore decomposto:**

- gp_jogo = 0.75 → 0.75 × 30 = **22.5**
- gc_jogo = 1 → (2 - 1) × 20 = **20**
- forma = `VDVD` → valores [1, 0, 1, 0] → média = **0.5** × 25 = **12.5**
- v_pct = (casa 50% + fora 50%) / 2 = **50** × 0.25 = **12.5**
- **PowerRaw total = 67.5** → percentil na liga = **48.6** → categoria **MÉDIO**

**Bucket detalhado (fora_vs_medio, n=4, sugestivo):**

- cantos pró média = **2.5** (σ=1.12)
- cantos sofridos média = **4.25** (σ=1.92)
- diferencial = **-1.75** | win_rate_cantos = 25%
- variação vs baseline pró (4.38): **-42.9%**
- padrão detectado? **✅ SIM**

### Almagro (AZARÃO)

**PowerScore decomposto:**

- gp_jogo = 0.67 → 0.67 × 30 = **20.1**
- gc_jogo = 2.67 → (2 - 2.67) × 20 = **-13.4**
- forma = `DDE` → valores [0, 0, 0.5] → média = **0.167** × 25 = **4.17**
- v_pct = (casa 0% + fora 0%) / 2 = **0** × 0.25 = **0**
- **PowerRaw total = 10.87** → percentil na liga = **1.4** → categoria **AZARÃO**

**Bucket detalhado (fora_vs_medio, n=4, sugestivo):**

- cantos pró média = **4** (σ=2.12)
- cantos sofridos média = **6.5** (σ=2.5)
- diferencial = **-2.5** | win_rate_cantos = 0%
- variação vs baseline pró (4.83): **-17.2%**
- padrão detectado? **✅ SIM**

## 8. Matriz DNA × DNA — Linhas-chave (top 5 por cantos totais)

| Mandante × Visitante | Cantos total | Mand × Vis | Dom mand % | n | Qualifier |
|---|---|---|---|---|---|
| EQUILIBRADO × VULNERAVEL | **10.8** | 7.2 × 3.6 | 100% | 5 | consolidado |
| MURO_DUPLO × OFENSIVO | **10.25** | 4.75 × 5.5 | 50% | 4 | sugestivo |
| OFENSIVO × DEFENSIVO | **10.2** | 8.2 × 2 | 100% | 5 | consolidado |
| DEFENSIVO × OFENSIVO | **10.17** | 6.17 × 4 | 83.3% | 6 | consolidado |
| MURO_DUPLO × VULNERAVEL | **10** | 6.67 × 3.33 | 100% | 3 | sugestivo |

## 9. Divergências DNA-Escoteiro × Performance Real

> Casos onde o perfil DNA promete uma coisa mas o PowerScore (performance recente real) entrega outra.
> Esses são os pontos onde o motor pode estar sendo enganado pelo DNA estático.

| Time | Categoria | Perfil DNA | Tipo de divergência | Severidade | Evidência |
|---|---|---|---|---|---|
| **Central Norte** | AZARÃO | DEFENSIVO | Defensivo medíocre | BAIXA | cantos_sofridos=4.58 \| media_liga_cantos_sof=4.3 \| cantos_sof_vs_media_pct=6.5 \| acima_da_media=true \| gols_sofridos=0.92 \| power_score=15.3 \| n_jogos=12 |
| **Acassuso** | AZARÃO | DEFENSIVO | Defensivo medíocre | MEDIA | cantos_sofridos=5.17 \| media_liga_cantos_sof=4.3 \| cantos_sof_vs_media_pct=20.2 \| acima_da_media=true \| gols_sofridos=1.08 \| power_score=4.2 \| n_jogos=12 |

## 10. Anomalias e limitações detectadas

- Nenhuma anomalia grave detectada.

---

## ✅ Decisão de aprovação

Se os números acima fazem sentido, autorize o processamento das outras 6 ligas. Caso contrário, indique o que precisa ser ajustado.
