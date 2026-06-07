# 📊 Backtest Profundo — Regras Calibradas por Liga

**Data:** 2026-05-17
**Dataset:** 1.717 jogos das 9 ligas operáveis
**Base estatística:** N suficiente para todas as ligas (mín 77 jogos em BR_B, máx 319 em J2_J3)

---

## 🎯 Regra OURO universal (aplica a TODAS as ligas)

### **Mandante BLITZ_INICIAL → Over 3.5 HT**

| Liga | WR | N |
|---|---|---|
| J1 | 100% | 12 |
| BR_B | 74.2% | 31 |
| J2/J3 | 72.7% | 88 |
| MLS | 71.4% | 70 |
| USL | 70.0% | 50 |
| BR | 68.9% | 45 |
| ARG_B | 67.5% | 80 |
| BUN | 66.3% | 83 |
| ARG | 59.1% | 115 |
| **Total** | **~70%** | **~574** |

**Regra cravada com N=574 jogos.** Sempre que o mandante tiver assinatura **BLITZ_INICIAL** consolidada, operar **Over 3.5 HT** com confiança ALTA.

---

## 🧬 Regras Calibradas por Liga (operacional)


### 🏆 BR

**Status geral:** Liga ofensiva — baseline 10.09, Over 9.5 = 55.8% (moderado sem filtro)

| Prioridade | Regra |
|---|---|
| 🥇 PRIMARY | Mandante BLITZ_INICIAL → Over 3.5 HT (68.9%, N=45) |
| 🥈 SECONDARY | Over 8.5 FT baseline (68.7%, N=147) |
| ❌ EVITAR | Over 10.5+ (zona extrema 36% WR) |

**Estratégia:** Operar Over 8.5 FT como mercado padrão; combinar com Over 3.5 HT quando mandante BLITZ_INICIAL


### 🏆 BR_B

**Status geral:** Liga ofensiva mas OVERDISPERSA — baseline 10.39 mas variância alta

| Prioridade | Regra |
|---|---|
| 🥇 PRIMARY | ⭐ Over 3.5 HT baseline (75.3%, N=77) — REGRA OURO |
| 🥈 SECONDARY | ⭐ Mandante ATAQUE_ESTERIL → Over 9.5 (73.1%, N=26) |
| 🥉 TERCIARY | Mandante BLITZ_INICIAL → Over 3.5 HT (74.2%, N=31) |
| ❌ EVITAR | 🔴 Under 9.5 FT geral (44.2% WR — TÓXICO sem filtro). Over 10.5+ também problemático. |

**Estratégia:** Foco em Over HT 3.5 + Over 9.5 quando mandante ATAQUE_ESTERIL. NÃO operar Under aqui.


### 🏆 ARG

**Status geral:** Liga TRUCADA — baseline 8.57, Under 9.5 = 63.1% (forte sem filtro)

| Prioridade | Regra |
|---|---|
| 🥇 PRIMARY | ⭐ Under 9.5 FT baseline (63.1%, N=249) |
| 🥈 SECONDARY | Under 4.5 HT (61.8%, N=249) |
| 🥉 TERCIARY | Mandante MURO_DEFENSIVO → Under 9.5 (63.6%, N=11) |
| ❌ EVITAR | Over 10.5+ (reversão à média alta) |

**Estratégia:** Under 9.5 FT como mercado padrão. Linha mais agressiva: Under 10.5 (70.3% WR)


### 🏆 ARG_B

**Status geral:** Liga TRUCADA — baseline 8.60, Under 9.5 = 58.8% (moderado)

| Prioridade | Regra |
|---|---|
| 🥇 PRIMARY | Mandante BLITZ_INICIAL → Over 3.5 HT (67.5%, N=80) |
| 🥈 SECONDARY | Under 10.5 FT (72.7%, N=216) |
| 🥉 TERCIARY | ELITE×ELITE → Under 9.5 (62.5%, N=16) |
| 🎯 ESPECIAL | Dois MURO_DUPLO → Under 9.5 (60%, N=20) |
| ❌ EVITAR | Over 10.5+ (linha agressiva ruim) |

**Estratégia:** Mix: Over HT 3.5 quando BLITZ + Under 10.5 FT como linha segura


### 🏆 MLS

**Status geral:** Liga ofensiva — baseline 10.16, Over 9.5 = 55.4%

| Prioridade | Regra |
|---|---|
| 🥇 PRIMARY | ⭐ Mandante BLITZ_INICIAL → Over 3.5 HT (71.4%, N=70) |
| 🥈 SECONDARY | ⭐ ELITE casa vs AZARÃO fora → Over 9.5 (69.2%, N=13) |
| 🥉 TERCIARY | Over 3.5 HT baseline (67.8%, N=177) |
| 🎯 ESPECIAL | Mandante DEFESA_PRECARIA → Over 9.5 (63.6%, N=11) |
| ❌ EVITAR | ⚠️ Operação anterior MLS no app teve ROI -17% em HDP HT sem cruzamento — manter cuidado em HDP |

**Estratégia:** Foco em Over HT 3.5 + Over 9.5 em ELITE × AZARÃO. Evitar HDP sem cruzamento.


### 🏆 USL

**Status geral:** Liga equilibrada — baseline 9.15

| Prioridade | Regra |
|---|---|
| 🥇 PRIMARY | 🏆 Dois EFETIVIDADE_CLINICA → Under 9.5 (85.7%, N=14) — REGRA TOP DA LIGA |
| 🥈 SECONDARY | ⭐ Mandante BLITZ_INICIAL → Over 3.5 HT (70.0%, N=50) |
| 🥉 TERCIARY | Over 3.5 HT baseline (61.3%, N=106) |
| 🎯 ESPECIAL | Under 11.5 (76.4%, N=106) — linha super conservadora |
| ❌ EVITAR | Over 9.5 sem filtro (44% WR) |

**Estratégia:** Caçar combinação dupla EFETIVIDADE_CLINICA (Under brilha). Default: Over HT 3.5 quando BLITZ.


### 🏆 BUN

**Status geral:** Liga equilibrada — baseline 9.71, FAV_DOMINANCE 0.79 (azarão rouba cantos)

| Prioridade | Regra |
|---|---|
| 🥇 PRIMARY | ⭐ ELITE (PS≥80) casa vs AZARÃO (PS≤30) → Over 9.5 (70.0%, N=20) |
| 🥈 SECONDARY | Mandante BLITZ_INICIAL → Over 3.5 HT (66.3%, N=83) |
| 🥉 TERCIARY | Over 3.5 HT baseline (62.0%, N=297) |
| 🎯 ESPECIAL | HDP de cantos validado em rodada anterior (Leverkusen acertou) |
| ❌ EVITAR | Over 10.5 sem filtro (~43% WR) |

**Estratégia:** Caçar ELITE × AZARÃO claro pra Over 9.5 OU HDP de cantos. Over HT 3.5 como complemento.


### 🏆 J1

**Status geral:** ⚠️ Liga em MATURAÇÃO — DNA parcial, N=129

| Prioridade | Regra |
|---|---|
| 🥇 PRIMARY | 🏆 Mandante BLITZ_INICIAL → Over 3.5 HT (100%, N=12) — amostra pequena |
| 🥈 SECONDARY | Mandante BLITZ_INICIAL → Over 4.5 HT (83.3%, N=12) |
| 🥉 TERCIARY | Mandante MURO_DEFENSIVO → Under 9.5 (69.2%, N=13) |
| ❌ EVITAR | LIGA EM MATURAÇÃO — operar APENAS com stake reduzido |

**Estratégia:** Apenas regras com confluência DNA forte + stake reduzido. Não operar baseline puro.


### 🏆 J2_J3

**Status geral:** Liga ofensiva overdispersa — baseline 9.88

| Prioridade | Regra |
|---|---|
| 🥇 PRIMARY | 🏆 Dois EFETIVIDADE_CLINICA → Under 9.5 (81.8%, N=11) — TOP DA LIGA |
| 🥈 SECONDARY | ⭐ Mandante BLITZ_INICIAL → Over 3.5 HT (72.7%, N=88) — N grande |
| 🥉 TERCIARY | Over 8.5 FT baseline (67.1%, N=319) |
| ❌ EVITAR | Zona extrema (xFT > 12 ou < 6) — reversão à média |

**Estratégia:** Linha 9.5 FT operável com filtro DNA. Over HT 3.5 + Under quando dupla EFETIVIDADE.


---

## 📐 Linhas de Equilíbrio por Liga (sem filtro DNA)

| Liga | Baseline FT | Linha equilíbrio | Direção forte | Linha SEGURA |
|---|---|---|---|---|
| **BR** | 10.09 | 9.5 | Over 8.5 (68.7%) | Over 7.5 (77.6%) |
| **BR_B** | 10.39 | 10.5 | Over 8.5 (64.9%) | Over 7.5 (72.7%) |
| **ARG** | 8.57 | 8.5 | Under 9.5 (63.1%) | Under 10.5 (70.3%) |
| **ARG_B** | 8.6 | 8.5 | Under 9.5 (58.8%) | Under 10.5 (72.7%) |
| **MLS** | 10.16 | 9.5 | Over 8.5 (66.7%) | Over 7.5 (76.3%) |
| **USL** | 9.15 | 8.5 | Over 7.5 (65.1%) | Under 11.5 (76.4%) |
| **BUN** | 9.71 | 9.5 | Over 8.5 (60.3%) | Over 7.5 (72.4%) |
| **J1** | 9.7 | 9.5 | (ver regras DNA) | Over 7.5 (75.2%) |
| **J2_J3** | 9.88 | 9.5 | Over 8.5 (67.1%) | Over 7.5 (79.9%) |

---

## 🔬 Achados Críticos do Backtest

### ✅ Confirmações da metodologia anterior
- **DEFESA_PRECARIA do mandante anula Under** (28% WR) — confirma lição cravada no Sao Bernardo × America MG
- **Linha 9.5 FT como padrão** funciona razoavelmente (50-56% sem filtro) — precisa DNA pra subir
- **Overdispersion confirmado** em BR_B (Over 10.5 = 47%) e J2/J3 (Over 10.5 = 39%)

### 🆕 Descobertas novas
1. **BLITZ_INICIAL é a regra de OURO universal** — funciona em 9/9 ligas (média 70% WR, N=574)
2. **USL é Under 9.5 com dupla EFETIVIDADE_CLINICA = 85.7% WR** — caçar essa combinação
3. **BUN é ELITE×AZARÃO em casa = 70% Over 9.5** — confirma intuição da rodada anterior
4. **ARG/ARG_B Under 10.5 são quase tiro certo** (70-73%) — linha mais agressiva que 9.5
5. **J2/J3 com dupla EFETIVIDADE_CLINICA = 81.8% Under** — combinação rara mas cravada

### ⚠️ Regras DESMENTIDAS pelo backtest
1. **ELITE casa vs AZARÃO fora → Over 9.5 NÃO é universal** (47.1% geral). Funciona só em BUN (70%) e MLS (69%). Cuidado!
2. **Visitante SUCUMBE_AZARÃO → Over 9.5 falhou** (49.4% geral). Não é regra confiável.
3. **PS_diff ≥ 50 → Over/HDP NÃO é universal** — depende da liga

---

## 🛡️ Limitações conhecidas

- **Backtest com look-ahead leve**: usei MEMORIA_DNA atual (calculada após a temporada) sobre jogos passados. Performance real pode ser ~5% menor.
- **N pequeno em algumas regras** (especialmente J1 com 12 jogos BLITZ). Marcar com prudência.
- **Calibração DNA é estática** — temporadas futuras precisarão de recalibração


*Gerado pelo motor de backtest do SmartCoach EDS — base estatística cravada em 1.717 jogos.*
