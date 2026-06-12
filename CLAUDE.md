# HDP Ultra — Regras Obrigatórias de Análise

## REGRA #1 — USO COMPLETO DE DADOS (OBRIGATÓRIO)

**Antes de qualquer análise de jogo ou liga, é OBRIGATÓRIO usar TODOS os dados disponíveis, nesta ordem:**

### Fontes de dados disponíveis (usar TODAS)

| Fonte | Arquivo | Conteúdo |
|-------|---------|----------|
| Histórico completo de jogos | `data/brasileiraoB2026.js` | BR_B — 97 jogos, formações, cantos |
| Histórico completo de jogos | `data/usl2026.js` | USL — 117 jogos, formações, cantos |
| Histórico completo de jogos | `data/argentina_b2026.js` | ARG_B — 252 jogos |
| Perfis USL v3.0 | `data/memoria_usl.js` | G_STRONG/G/N/S/S_STRONG para BR_B, USL, ARG_B, ECU, MLS |
| Perfis estruturados | `data/perfis_usl2026.json` | xFT, xHT, alertas por time (USL) |
| Perfis BR | `data/perfis_br2026.json` | xFT, xHT, alertas por time (BR_A) |
| Perfis ARG | `data/perfis_arg2026.json` | alertas ARG |
| Engine HDP Ultra | `index.html` linhas 1110-2902 | projecaoJogo(), expHomeFT, expAwayFT |
| DNA Escoteiro | `data/dna_escoteiro.js` | padrões avançados |
| Memória qualitativa | `data/memoria_qualitativa.js` | notas táticas acumuladas |

---

## MÉTODO OBRIGATÓRIO — confT v4.0

### Fórmula base
```
confT_base = histCasa% × 0.40 + formGlobal% × 0.30 + matchup% × 0.30
```

### Ajustes obrigatórios (aplicar SEMPRE)
```
confT_v4 = confT_base
         + ajuste_perfilUSL   (±3% a ±15% conforme G_STRONG×S_STRONG)
         + ajuste_formaRecente (±2% a ±3% via L3 últimos 3 jogos)
         + ajuste_motivacional (±5% a +12% via tabela classificatória)
         + ajuste_viagem       (USL: +4% a +9% conforme km inter-conf)
```

### Tabela de ajuste por perfil (memoria_usl.js)
| Perfil H × Perfil V | Ajuste |
|---------------------|--------|
| G_STRONG × S_STRONG | +15% |
| G_STRONG × S | +10% |
| G_STRONG × N | +6% |
| G × S_STRONG | +12% |
| G × S | +7% |
| G × N | +3% |
| N × N | 0% |
| N × G | -3% |
| S × G | -7% |
| S_STRONG × G_STRONG | -15% |

### Tiers de decisão
| confT_v4 | Tier |
|----------|------|
| ≥ 85% | Triple Lock Forte 🔒🔒 |
| 75-84% | Triple Lock 🔒 |
| 65-74% | G×S Forte ★ |
| 60-64% | Marginal ⚠️ |
| < 60% | SKIP |

---

## CHECKLIST OBRIGATÓRIO antes de cada análise

Antes de calcular qualquer confT, verificar e documentar:

- [ ] **histCasa%** — win rate de cantos em casa (temporada toda, não só L5)
- [ ] **histFora%** — win rate de cantos fora (para sinal visitante)
- [ ] **matchup tático** — formação casa × formação fora = % do banco de dados
- [ ] **perfil USL v3.0** — `memoria_usl.js` → `BR_B`, `USL`, `ARG_B` ou liga correspondente
- [ ] **L3 forma recente** — últimos 3 jogos no papel (casa ou fora)
- [ ] **tabela classificatória** — posição, pts, zona (acesso/rebaixamento/neutro)
- [ ] **viagem** (USL) — km entre cidades, cross-conference flag
- [ ] **alertas especiais** — `USL_GERADORA_FORTE`, `USL_SOFREDORA_EXTREMA`, `OVER_MANDANTE_FORTE`

---

## REGRAS ESPECÍFICAS POR LIGA

### BR_B (Brasileirão Série B)
- Base rate: **59.8%**
- Arquivo principal: `brasileiraoB2026.js`
- Perfis: `memoria_usl.js` → seção `"BR_B"`
- Matchups confirmados: 4-2-3-1×4-2-3-1=61%, 4-2-3-1×4-3-3=80%, 3-4-2-1×4-2-3-1=57%

### USL Championship
- Base rate: **46.2%** (away teams são competitivos — times visitantes PODEM ganhar cantos)
- Arquivo principal: `usl2026.js`
- Perfis: `memoria_usl.js` → seção `"USL"` + `perfis_usl2026.json`
- Fator obrigatório: viagem inter-conferência (km entre cidades)
- Matchups confirmados: 4-1-4-1×4-2-3-1=33.3%, 4-2-3-1×4-1-4-1=71.4%, 4-2-3-1×4-3-3=75%

### ARG_B (Primera B Nacional)
- Base rate: **63.7%**
- Arquivo principal: `argentina_b2026.js`
- Perfis: `memoria_usl.js` → seção `"ARG_B"`
- Grupos separados: Grupo A e Grupo B (considerar contexto motivacional de cada grupo)

### ECU (Liga Pro Ecuador)
- Base rate: **60.5%**
- Arquivo: `data/equador2026.js`
- Perfis: `memoria_usl.js` → seção `"ECU"`

---

## REGRAS DE INTERPRETAÇÃO

1. **Posição na tabela ≠ perfil de cantos.** São Bernardo (#2 BR_B) é S_STRONG. San Antonio (#1 USL Oeste) é S em cantos fora. Nunca assumir que líder = gerador de cantos.

2. **S_STRONG visitante = bônus automático para o mandante.** Quando um time S_STRONG visita, o mandante recebe +12% automático, independente de sua própria qualidade.

3. **Placar elástico (3+ gols de diferença) invalida o count de cantos.** É um evento estatístico raro na BR_B e não deve ser modelado como variável padrão.

4. **Forma recente (L3) tem peso de ajuste, não substitui histCasa.** Se L3 contradiz a temporada toda, investigar antes de ajustar.

5. **Conflito de sinais → SKIP obrigatório.** Se histCasa forte mas matchup fraco E perfil contrário, não forçar sinal. **EXCEÇÃO:** ver Regra de Desempate Mandante abaixo — se histCasa ≥ 70%, o conflito resolve para MANDANTE, não para SKIP/OVER.

---

## REGRAS DE DESEMPATE E LINHAS (v4.1 — calibração 13/jun/2026)

*Origem: auditoria da rodada USL 13/jun — o mandante venceu o duelo de cantos nos 4 jogos, incluindo os 2 em que o modelo deu sinal contrário ou neutro. Com as regras abaixo, a rodada teria sido 4/4 em vez de 2/4.*

1. **DESEMPATE MANDANTE (USL).** Em conflito de perfis (G_STRONG × G_STRONG) ou sinais ambíguos, o fator casa decide: se histCasa ≥ 70%, o sinal é MANDANTE — não OVER, não SKIP. (Caso Tampa Bay × Charleston: dois G_STRONG, Tampa 80% casa → mandante venceu 5×3.)

2. **SINAL VISITANTE USL = REBAIXAR 1 TIER AUTOMÁTICO** quando há viagem cross-conference > 2.500 km. Time que vence o jogo fora com folga não precisa de cantos — o perfil G fora pode vir de jogos pressionando atrás do placar. (Caso Louisville: 73% G×S Forte → deveria ser Marginal ⚠️; perdeu o duelo 7×4 mesmo vencendo o jogo 2-0.)

3. **HANDICAP PELA MARGEM, NÃO PELO confT.** confT mede probabilidade de VENCER o duelo, não a margem. Linha -1.5 só com diff projetado ≥ 3.0 cantos; entre 1.5 e 3.0 jogar ML ou -0.5. (Caso Monterey Bay: sinal certo 5×4, mas -1.5 perdeu — diff projetado era ~2.5.)

4. **MATCHUP COM AMOSTRA < 10 JOGOS NÃO VETA histCasa ≥ 75%.** Matchup pequeno vale como ajuste fino, nunca como veto a um histórico de casa forte. (Caso Tampa: matchup 4-2-3-1×5-4-1=33.3% em 9j rebaixou indevidamente um mandante G_STRONG com 80% em casa.)

---

## RELATÓRIOS

Todo relatório Word deve incluir:
- Tabela de classificação das ligas analisadas
- Todos os 5 fatores calculados explicitamente
- Comparação com análise anterior quando disponível
- Picks prioritários ordenados por confT_v4
- Notas de perfil e alertas USL v3.0
