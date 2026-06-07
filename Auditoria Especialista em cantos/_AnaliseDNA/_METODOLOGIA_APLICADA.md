# Metodologia Aplicada — Auditoria DNA por Time

Gerado em: **2026-05-16T01:08:05.123Z**
Versão: v1.0
Ligas: 9 | Times totais: 239

---

## 1. Fontes de dados

- `data/brasileirao2026.js` — DADOS_BR
- `data/brasileiraoB2026.js` — DADOS_BR_B
- `data/argentina2026.js` — DADOS_ARG
- `data/argentina_b2026.js` — DADOS_ARG_B
- `data/mls2026.js` — DADOS_MLS
- `data/usl2026.js` — DADOS_USL
- `data/bundesliga2026.js` — DADOS_BUN
- `data/dna_escoteiro.js` — DNA_ESCOTEIRO

Carregamento via `new Function('window', code)` em sandbox isolado — zero side effect no projeto.

## 2. Filtro de jogos válidos

Mantidos apenas jogos com `j.cantos && j.cantos.ft && j.cantos.ft.m != null && j.cantos.ft.v != null`. Jogos sem cantos coletados foram descartados.

## 3. PowerScore — Fórmula

```
forma_score = média de [V=1, E=0.5, D=0] dos 5 chars de DNA.forma
v_pct_geral = (DNA.casa_v_pct + DNA.fora_v_pct) / 2
power_raw   = gp_jogo*30 + (2 - gc_jogo)*20 + forma_score*25 + v_pct_geral*0.25
```

Depois, **percentil dentro da liga** (rank-based, 0-100) → categoria:
- ≥70 → **ELITE**
- 30-70 → **MÉDIO**
- <30 → **AZARÃO**

## 4. Buckets situacionais (6 buckets por time)

Cada jogo é classificado por (local × categoria do adversário):

|        | vs ELITE | vs MÉDIO | vs AZARÃO |
|--------|----------|----------|-----------|
| 🏠 Casa | casa_vs_elite | casa_vs_medio | casa_vs_azarao |
| ✈️ Fora | fora_vs_elite | fora_vs_medio | fora_vs_azarao |

Métricas por bucket: `n`, `cantos_pro_media`, `cantos_sofridos_media`, desvios, `diferencial`, `variacao_vs_baseline_pct`, `win_rate_cantos_pct`, `gols_pro/sof_media`.

**Qualifier:** `consolidado` (n≥5) · `sugestivo` (n=3-4) · `amostra_insuficiente` (n<3).

**`padrao_detectado: true`** quando `n≥3` E (`|variacao_vs_baseline_pct|≥25` OU `|diferencial|≥2.0`).

## 5. Assinaturas (12 detectores)

Toda assinatura avaliada para todos os times (ausência também é sinal). Quando `nao_avaliavel`, o motivo é registrado (ex: `sem_dados_placar`).

Regras: ver `_scripts/lib/assinaturas.js` — todas seguem item 5.3 do PROMPT_AUDITOR_DNA_v1.md.

## 5.1. TERMÔMETRO_FORMA — Calibração futura recomendada

A assinatura `TERMOMETRO_FORMA` ficou em **0 times** em todas as 7 ligas auditadas.
A regra atual exige `desvio(últimos_5_cantos_pro) > desvio(geral_cantos_pro) × 1.5`.
O threshold `1.5×` é conservador o suficiente para evitar falsos positivos, mas pode estar
mascarando padrões reais de instabilidade recente. **Sugestão para próxima rodada:**
afrouxar para `1.3×` e revalidar contra os dados reais. Aceitar zero detecção nesta rodada
é mais seguro que produzir falsos positivos.

## 6. Matriz DNA × DNA

Para cada par (`perfil_DNA_mandante`, `perfil_DNA_visitante`), agregamos n jogos, cantos médios (total, mandante, visitante), % de jogos em que mandante dominou cantos e diferencial médio. Esse é o componente que evidencia o "gap de qualidade momentum" omitido por análises só-por-time.

## 7. Determinismo

Zero aleatoriedade. Mesma entrada → mesma saída. Arredondamentos via `Math.round(n * 10^k) / 10^k`.

## 7.1. Detector de Divergências DNA Escoteiro × Performance Real

Componente adicionado para alimentar o SmartCoach com casos onde **o perfil DNA Escoteiro
(estático) conflita com o PowerScore (performance recente real)**. Esses são exatamente os
pontos onde o motor de projeção pode estar sendo enganado — origem do caso documentado
Grêmio × Flamengo.

Resultado persistido como campo top-level `divergencias_dna_performance: []` em cada
`memoria_<LIGA>.json` e replicado no `_MEMORIA_TIMES_MASTER.json`.

### 4 tipos canônicos de divergência

| # | Tipo | Regra de detecção |
|---|---|---|
| 1 | **Ofensivo subentregando** | perfil ∈ {OFENSIVO, OFENSIVO_SOLIDO, OFENSIVO_DOMINANTE, DOMINANTE, ABSOLUTO} E (categoria == AZARÃO **OU** `cantos_pro_geral < media_liga × 0.9` com n ≥ 5) |
| 2 | **Defensivo medíocre** | perfil ∈ {MURO, MURO_DUPLO, DEFENSIVO, FORTALEZA, COMPACTO} E categoria == AZARÃO |
| 3 | **Passivo elite** | perfil == PASSIVO E categoria == ELITE |
| 4 | **Vulnerável elite** | perfil ∈ {VULNERAVEL, SANGRA_CANTOS, REATIVO} E categoria == ELITE |

### Severidade

- `alta`  → `n ≥ 10` E magnitude relativa ≥ 25% (gap forte com amostra grande)
- `media` → `n ≥ 5`  E magnitude relativa ≥ 10%
- `baixa` → caso marginal (amostra pequena ou gap < 10%)

### Schema persistido

```json
{
  "time": "Corinthians",
  "categoria": "AZARÃO",
  "perfil_dna": "MURO_DUPLO",
  "tipo_divergencia": "Defensivo medíocre",
  "evidencia": {
    "cantos_sofridos": 5.07,
    "media_liga_cantos_sof": 5.0,
    "cantos_sof_vs_media_pct": 1.4,
    "acima_da_media": true,
    "gols_sofridos": 0.93,
    "power_score": 17.5,
    "n_jogos": 14
  },
  "severidade": "alta"
}
```

### Como o SmartCoach deve consumir

Ao projetar um jogo do tipo `Time_A (perfil DNA X) vs Time_B (perfil DNA Y)`, o motor deve:
1. Buscar entradas em `divergencias_dna_performance` para ambos os times.
2. Se houver divergência de severidade `alta` em algum dos dois, **desinflar a confiança**
   no multiplicador derivado do perfil DNA Escoteiro para esse time.
3. Para tipos `Ofensivo subentregando` e `Defensivo medíocre`, considerar **inverter**
   o sinal direcional sugerido pelo DNA estático.

## 8. Assinaturas propostas pelo auditor

Nenhuma assinatura nova foi proposta nesta rodada — as 12 padronizadas cobriram os padrões recorrentes observados. Se padrões emergentes forem detectados em rodadas futuras (ex: "JOGO_FECHADO_HT" recorrente em ligas com muito empate), serão documentados aqui com regra objetiva.

## 9. Restrições respeitadas

- ❌ Nenhum arquivo em `data/` foi modificado
- ❌ Nenhum arquivo em `scraper/` foi modificado
- ❌ `index.html` não foi tocado
- ❌ Nenhum commit ou push foi feito
- ❌ Nenhuma dependência npm foi instalada (Node.js puro: `fs`, `path`)
- ❌ Nenhuma API externa foi chamada
