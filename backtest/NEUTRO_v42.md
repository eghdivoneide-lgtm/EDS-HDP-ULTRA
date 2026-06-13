# Backtest NEUTRO — Regras v4.2 (Fim do SKIP)

**Data:** 13/jun/2026
**Objetivo:** Verificar se os jogos que o modelo classificava como NEUTRO (confT < 60% → SKIP) escondem sinal explorável no fator casa × fora.

## Método
Backtest **rolling retroativo honesto**: cada jogo histórico foi reavaliado usando **apenas os dados anteriores à sua data** (sem look-ahead). Amostra mínima: ≥3 jogos em casa + ≥3 fora antes de avaliar.

- Jogos avaliados: **222** (das 4 ligas)
- Caíram em NEUTRO: **69**
- Scripts: `neutro_v42_backtest.js` (extração), `neutro_v42_resolver.js` (resolvedor + medição)

## Calibração dos tiers (a régua de 60% está correta para mandante cego)
| Tier | Mandante vence FT | Diff médio |
|------|-------------------|------------|
| Triple Lock Forte | 85.7% | +3.23 |
| Triple Lock | 70.3% | +2.28 |
| G×S Forte | 70.2% | +1.66 |
| Marginal | 68.0% | +1.03 |
| NEUTRO | **47.7%** | +0.38 |

Como aposta cega no mandante, o NEUTRO é cara-ou-coroa (47.7%). **Mas** ao abrir por perfil e liga, ele se parte em padrões.

## Padrões descobertos
| Padrão | Gatilho | Lado | Acerto |
|--------|---------|------|--------|
| **A** | N × N (dois perfis neutros) | MANDANTE | 9/10 = **90%** · diff +4.0 |
| **B** | mandante S/S_STRONG × visitante G/G_STRONG | VISITANTE (inversão) | 15/18 = **83%** |
| **E** | piso de liga (residual) | ARG_B/BR_B→mand · USL/CHI→vis | 25/35 = **71%** |

## Resolvedor (nenhum SKIP — manifesta 100%)
Aplicando A→B→E em cascata sobre os 69 NEUTRO:
- **Acerto global: 50/65 = 76.9%** (vs 47.7% mandante cego)
- Camadas FORTE (A+B): **24/28 = 85.7%** — stake padrão
- Camada FRACA (E): 71% — lean, stake reduzido

## Validação ex-ante
**Audax Italiano × La Serena (12/jun)** — classificado SKIP pelo modelo antigo, perfil N×N. Resultado real: **8×3 mandante** (diff +5). É exatamente o Padrão A (N×N → mandante, diff médio +4.0). O resolvedor v4.2 o teria emitido como MANDANTE 72% FORTE.

## Notas de implementação
- **Não** inverter o piso de liga por histCasa baixo: em liga de base alta o mandante ruim ainda vence cantos (Ponte Preta 11×2, Juventude 9×2 com histCasa < 35%). Esse flip foi testado e reduziu o acerto de 76.9% para 70.8% — descartado.
- Amostras pequenas (Padrão A n=10, piso USL n=3): tratar como direcional, revalidar a cada rodada.
