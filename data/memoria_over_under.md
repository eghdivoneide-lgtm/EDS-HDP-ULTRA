# MEMÓRIA DE ANÁLISE — Mercado Over/Under Cantos

**Gerado:** 13/jun/2026 · **Base:** 1.324 jogos · 8 ligas · histórico próprio
**Engine:** `engine_ou.js` · **Saída:** `ou_output.json` · **Relatório:** `EDS_OU_CANTOS_*.html`

---

## 1. PRINCÍPIO DO MERCADO

O mercado de Over/Under de cantos é **estruturalmente diferente** do mercado de
duelo (handicap). No handicap importa *quem* vence o duelo de cantos; no O/U importa
o **volume total** dos dois times somados. Por isso o preditor não é histCasa — é a
combinação de perfis e a soma dos diff_cantos.

### Linha correta por liga (média FT de cantos)

| Liga | Média FT | Linha O/U FT | Linha O/U HT |
|------|----------|--------------|--------------|
| BR_A | 10.02 | **9.5** | 3.5 |
| BR_B | 10.23 | **9.5** | 3.5 |
| MLS | 10.15 | **9.5** | 4.5 |
| CHI | 9.51 | **9.5** | 3.5 |
| USL | 9.03 | **8.5** | 3.5 |
| ECU | 9.20 | **8.5** | 3.5 |
| ARG_A | 8.56 | **8.5** | 3.5 |
| ARG_B | 8.59 | **8.5** | 3.5 |

> Regra de ouro: **nunca jogar O/U 9.5 nas ligas argentinas e USL/ECU.** A base de
> Over 9.5 cai para 36–42% — mercado perdedor estrutural. Use 8.5, onde a base fica
> próxima de 50/50 e o edge de perfil aparece limpo.

---

## 2. GATILHOS POR LIGA (combo de perfil — FT)

Edge = (Over% do combo) − (Over% base da liga). Sinais com |edge| ≥ 10% e n ≥ 5.

### USL — O/8.5 (base OVER 41.9%)
| Combo | Over% | Sinal | n |
|-------|-------|-------|---|
| G_STRONG×S_STRONG | 80.0% | **OVER FORTE** | 5 |
| N×S | 66.7% | **OVER FORTE** | 12 |
| G×G_STRONG | 71.4% | **OVER FORTE** | 14 |
| N×S_STRONG | 0% | **UNDER EXTREMO** | 5 |
| N×N | 16.7% | **UNDER FORTE** | 12 |
| G_STRONG×N | 16.7% | **UNDER FORTE** | 6 |
| S×N | 14.3% | **UNDER FORTE** | 7 |
| S×S_STRONG | 20.0% | **UNDER FORTE** | 5 |

### MLS — O/9.5 (base OVER 42.5%)
| Combo | Over% | Sinal | n |
|-------|-------|-------|---|
| N×S_STRONG | 75.0% | **OVER FORTE** | 8 |
| N×G | 73.3% | **OVER FORTE** | 15 |
| G×S | 62.5% | **OVER FORTE** | 8 |
| G_STRONG×N | 14.3% | **UNDER FORTE** | 7 |
| N×G_STRONG | 16.7% | **UNDER FORTE** | 12 |
| S×S_STRONG | 16.7% | **UNDER FORTE** | 6 |

### ECU — O/8.5 (base OVER 41.2%)
| Combo | Over% | Sinal | n |
|-------|-------|-------|---|
| S×S | 21.4% | **UNDER FORTE** | 14 |
| S×G | 20.0% | **UNDER FORTE** | 5 |
| diffSum 1.5–3 | 56.3% | OVER (faixa) | 16 |
| diffSum >3 | 54.5% | OVER (faixa) | 11 |

### CHI — O/9.5 (base OVER 33.0%)
| Combo | Over% | Sinal | n |
|-------|-------|-------|---|
| N×S | 66.7% | **OVER FORTE** | 6 |
| G×N | 50.0% | **OVER FORTE** | 14 |
| S_STRONG×G | 50.0% | **OVER FORTE** | 6 |
| N×N | 7.7% | **UNDER EXTREMO** | 13 |
| N×S_STRONG | 14.3% | **UNDER FORTE** | 7 |
| G×S | 20.0% | **UNDER FORTE** | 5 |

### BR_A — O/9.5 (base OVER 37.3%)
| Combo | Over% | Sinal | n |
|-------|-------|-------|---|
| G_STRONG×N | 66.7% | **OVER FORTE** | 6 |
| N×G_STRONG | 55.6% | **OVER FORTE** | 9 |
| N×G | 53.8% | **OVER FORTE** | 13 |
| G×G | 0% | **UNDER EXTREMO** | 6 |
| G×S | 14.3% | **UNDER FORTE** | 7 |
| S_STRONG×G | 16.7% | **UNDER FORTE** | 6 |
| N×S | 23.1% | **UNDER FORTE** | 13 |

### BR_B — O/9.5 (base OVER 46.4%)
| Combo | Over% | Sinal | n |
|-------|-------|-------|---|
| G×N | 60.0% | OVER | 5 |
| N×G | 58.3% | OVER | 12 |
| N×S | 12.5% | **UNDER FORTE** | 8 |
| G_STRONG×N | 16.7% | **UNDER FORTE** | 6 |
| N×N | 20.0% | **UNDER FORTE** | 15 |
| N×S_STRONG | 20.0% | **UNDER FORTE** | 5 |

### ARG_A — O/8.5 (base OVER 36.8%)
| Combo | Over% | Sinal | n |
|-------|-------|-------|---|
| G_STRONG×S | 54.5% | **OVER FORTE** | 11 |
| G×S | 54.5% | **OVER FORTE** | 11 |
| N×G | 50.0% | **OVER FORTE** | 22 |
| S_STRONG×N | 0% | **UNDER EXTREMO** | 7 |
| NxS_STRONG | 14.3% | **UNDER FORTE** | 7 |
| S_STRONG×S | 20.0% | **UNDER FORTE** | 5 |

### ARG_B — O/8.5 (base OVER 40.6%)
| Combo | Over% | Sinal | n |
|-------|-------|-------|---|
| G×S_STRONG | 80.0% | **OVER FORTE** | 5 |
| G_STRONG×S | 60.0% | **OVER FORTE** | 5 |
| N×S | 57.1% | **OVER FORTE** | 35 |
| G×G | 16.7% | **UNDER FORTE** | 6 |
| N×G_STRONG | 20.0% | **UNDER FORTE** | 5 |
| S_STRONG×N | 28.6% | UNDER | 7 |

---

## 3. PADRÕES TRANSVERSAIS (válidos em quase todas as ligas)

1. **N×N → UNDER.** Quando nenhum dos dois gera cantos, o jogo morre em volume.
   Forte em USL (16.7%), CHI (7.7%), BR_B (20%), BR_A (40.7% vs base 37%). É o
   espelho do mercado de duelo: no duelo N×N favorece o MANDANTE; no O/U favorece o UNDER.

2. **N×G / G×N → OVER.** Um gerador contra um neutro empurra o volume para cima
   sem o cancelamento que ocorre quando dois geradores se enfrentam. Consistente
   em MLS, CHI, BR_A, BR_B, ARG.

3. **G×G → UNDER (contra-intuitivo, mas sólido).** Dois geradores fortes se
   anulam — disputam posse no meio, o jogo trava. BR_A 0% (n=6), ARG_B 16.7%,
   CHI 22.2%, ARG_A 27.3%. **Nunca jogar OVER em duelo de dois geradores.**

4. **S×S_STRONG / N×S_STRONG → UNDER.** Time que não cede cantos do lado visitante
   derruba o total. USL N×S_STRONG = 0%.

5. **diffSum como confirmação:** diffSum > 3 tende a OVER nas ligas de base alta
   (BR, ECU); diffSum entre -3 e -1.5 tende a UNDER em todas. Usar como segundo
   filtro, não como gatilho isolado.

---

## 4. REGRAS DO ENGINE (engine_ou.js)

```
1. Combo de perfil é o gatilho primário (efeito estrutural).
2. diffSum confirma: se concorda → edge +3%; se diverge → edge ×0.6.
3. Força: FORTE |edge|≥15% (ou ≥18% c/ n≥8) · MÉDIO ≥10% · LEAN ≥6%.
4. Amostra mínima n≥5 para gerar gatilho. Abaixo disso → fallback diffSum.
5. Manifesta sempre (filosofia HDP): lado é OVER se edge≥0, senão UNDER.
   Sinais sem força (BASE) não entram no relatório, mas ficam no JSON.
```

---

## 5. RESSALVAS

- Combos com n < 8 são **direcionais** — revalidar a cada rodada (forward test).
- HT tem amostra menor que FT; usar só quando combo n ≥ 6.
- Esta memória deve ser **re-rodada** quando `memoria_usl.js` for atualizado
  (perfis mudam ao longo da temporada → gatilhos mudam).
- Próximo passo de validação: backtest retroativo do engine_ou contra as últimas
  3 rodadas de cada liga para medir hit-rate real dos sinais FORTE.
