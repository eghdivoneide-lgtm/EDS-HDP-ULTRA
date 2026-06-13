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
| confT_v4 | Tier | Sinal |
|----------|------|-------|
| ≥ 85% | Triple Lock Forte 🔒🔒 | MANDANTE |
| 75-84% | Triple Lock 🔒 | MANDANTE |
| 65-74% | G×S Forte ★ | MANDANTE |
| 60-64% | Marginal ⚠️ | MANDANTE |
| < 60% | **RESOLVEDOR NEUTRO** (ver Regras v4.2) | MANDANTE ou VISITANTE |

**NUNCA EMITIR SKIP.** Abaixo de 60% o modelo passa pelo Resolvedor Neutro (Regras v4.2) e sempre se manifesta — mandante ou visitante, com força FORTE ou FRACA.

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

## REGRAS v4.2 — FIM DO SKIP / MANIFESTAÇÃO OBRIGATÓRIA (backtest 13/jun/2026)

*Origem: backtest rolling retroativo de 222 jogos das 4 ligas (BR_B, USL, ARG_B, CHI), isolando os 69 que o modelo classificava como NEUTRO (confT < 60%). Descoberta: o NEUTRO **não é zona cega** — esconde sinal explorável em ~42% dos casos. Validação ex-ante: Audax Italiano × La Serena (12/jun), classificado SKIP, terminou **8×3 mandante** (N×N, exatamente o Padrão A). O modelo nunca mais emite SKIP — manifesta-se em 100% dos jogos.*

### Princípio
O confT mede a força do **MANDANTE**. Um confT baixo não significa "sem sinal" — significa "**o sinal pode estar do outro lado**" ou "**o fator casa decide sozinho**". Todo jogo recebe um lado (MANDANTE ou VISITANTE) e uma força (FORTE / FRACO).

### RESOLVEDOR NEUTRO (aplicar quando confT < 60%, em cascata)

| Ordem | Gatilho | Sinal | Força | Acerto no backtest |
|-------|---------|-------|-------|--------------------|
| **A** | **N × N** (ambos perfil N) | **MANDANTE** | FORTE (~72%) | 9/10 = **90%** · diff médio +4.0 |
| **B** | mandante **S/S_STRONG** × visitante **G/G_STRONG** | **VISITANTE** (inversão) | FORTE (~70%) | 15/18 = **83%** |
| **E** | residual — **piso de liga** | ARG_B/BR_B → MANDANTE · USL/CHI → VISITANTE | FRACO (~57%) | 25/35 = **71%** |

- **Camadas FORTE (A+B) juntas: 24/28 = 85.7%.** Stake padrão.
- **Camada FRACA (E): 71%.** Stake reduzido — é lean, não lock.
- **Acerto global do resolvedor: 50/65 = 76.9%** (vs 47.7% apostando cego no mandante).

### Regras de leitura do resolvedor
1. **Padrão A — N×N é o resgate mais importante.** Quando nenhum dos dois tem perfil de canto definido, o mando de campo decide com folga. O confT antigo punia o N×N duas vezes (ajuste de perfil zero + formGlobal baixo); agora o N×N **vira sinal MANDANTE**, não SKIP. (Caso Audax 8×3, Atl. Rafaela 11×2, Quilmes 7×0, Oakland 7×0.)
2. **Padrão B — inversão S×G é o sinal mais robusto** (maior amostra). Mandante fraco de cantos recebendo visitante forte = o confT cai *porque o mandante é ruim*; o lado certo é o VISITANTE, não SKIP. (Caso Miami 0×9, San Antonio 0×7, Nublense 0×8 — todos visitante.)
3. **Padrão E — o piso muda por liga.** ARG_B (base 68.7%) e BR_B (66.7%) mantêm o mandante mesmo no neutro; USL (52.4%) e CHI (56.5%) viram zona de visitante. **NÃO** inverter o piso por histCasa baixo: em liga de base alta o mandante ruim ainda vence (Ponte Preta 11×2, Juventude 9×2 com histCasa < 35%).
4. **Threshold de manifestação é móvel por liga.** Na prática o corte mandante↔visitante fica em ~55% na ARG_B e ~62% na USL/CHI — refletido pelo piso de liga acima.

### Ressalva de amostra
Padrão A (n=10) e piso USL (n=3) têm amostra pequena — tratar como direcional e revalidar a cada rodada (forward test). Padrão B (n=18) é o mais sólido. A camada FRACA é lean de gestão, nunca aposta principal.

---

## RELATÓRIOS

Todo relatório Word deve incluir:
- Tabela de classificação das ligas analisadas
- Todos os 5 fatores calculados explicitamente
- Comparação com análise anterior quando disponível
- Picks prioritários ordenados por confT_v4
- Notas de perfil e alertas USL v3.0
