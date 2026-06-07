# 📐 METODOLOGIA — SmartCoach

> **Como interpretar o que está em `03_MEMORIA_DNA.json` e em `04_HISTORICO_JOGO_A_JOGO/`.**

---

## 1. PowerScore (0-100)

Métrica unificada de **força recente** do time, normalizada para a liga. Calculada a partir do desempenho dos últimos jogos, ponderando cantos pró/sof, gols pró/sof, vitórias e qualidade dos adversários.

### Categorias

| Faixa | Categoria | Interpretação |
|---|---|---|
| 80-100 | **ELITE** | Top da liga; favorito natural; bom em casa contra qualquer um. |
| 50-79 | **MÉDIO** | Time normal da liga; oscila; jogo equilibrado contra outro médio. |
| 0-49 | **AZARÃO** | Lanterna ou desempenho ruim; perde a maioria; vulnerável defensivamente. |

### Como usar

- **PowerScore > 85**: confiar em sinais positivos de cantos pró + cuidado com HDP -2.0+ (favorito pode "deitar").
- **PowerScore < 30**: time vai sofrer cantos; bom para Over linhas baixas; cuidado em Under.
- **Diferença entre dois times > 40 pontos**: jogo desequilibrado; favorito domina; Reis dos Cantos / Bala de Prata acionados.

### Onde encontrar

```json
MEMORIA_DNA[LIGA].times[NOME_TIME].identidade.powerScore
MEMORIA_DNA[LIGA].times[NOME_TIME].identidade.categoria
MEMORIA_DNA[LIGA].times[NOME_TIME].identidade.perfil_dna
MEMORIA_DNA[LIGA].times[NOME_TIME].identidade.forma   // ex: "VVVDE" (V=vit, E=empate, D=derrota)
```

---

## 2. Perfil DNA (string nominal)

Resume o estilo do time em uma palavra-chave. Combina cantos + gols + consistência.

| Perfil | O que significa |
|---|---|
| **OFENSIVO_SOLIDO** | Cria muito, sofre pouco. Bayern, Palmeiras, River Plate. |
| **EQUILIBRADO** | Cria e sofre na mesma proporção; jogos sob controle. |
| **DEFENSIVO** | Sofre pouco, cria pouco; jogos travados. |
| **OFENSIVO_VULNERAVEL** | Cria muito, sofre muito; jogos abertos. |
| **MURO_DUPLO** | Bloqueia ataque + defende bem; jogos com poucos cantos totais. |
| **AZARAO_LIMITADO** | Cria pouco, sofre muito; bom para Over linhas baixas se o adversário é elite. |
| **INSTAVEL** | Performance varia muito; pouca previsibilidade. |

---

## 3. Baselines (médias do time)

Médias gerais e por contexto. Sempre normalizadas por jogo.

### Campos disponíveis em `MEMORIA_DNA[LIGA].times[TIME].baseline`

| Campo | O que é |
|---|---|
| `n_jogos` | Total de jogos analisados |
| `n_jogos_casa` / `n_jogos_fora` | Distribuição casa/fora |
| `cantos_pro_geral` / `cantos_sofridos_geral` | Cantos pró/sof por jogo (geral) |
| `cantos_pro_casa` / `cantos_sofridos_casa` | Em casa |
| `cantos_pro_fora` / `cantos_sofridos_fora` | Fora |
| `cantos_pro_ht_geral` / `cantos_sof_ht_geral` | Primeiro tempo apenas |
| `consistencia_pro` | Desvio padrão dos cantos pró (quanto menor, mais previsível) |
| `gols_pro_geral` / `gols_sofridos_geral` | Gols pró/sof por jogo |
| `confiabilidade` | "ALTA" (n≥10) / "MÉDIA" (5≤n<10) / "BAIXA" (n<5) |

---

## 4. Buckets situacionais

**A parte mais importante para previsão.** Diz como o time se comporta em situações específicas: casa/fora × elite/médio/azarão do adversário.

### 6 buckets possíveis por time

```json
buckets: {
  casa_vs_elite:   { n, cantos_pro, cantos_sof, qualifier },
  casa_vs_medio:   { ... },
  casa_vs_azarao:  { ... },
  fora_vs_elite:   { ... },
  fora_vs_medio:   { ... },
  fora_vs_azarao:  { ... }
}
```

### Qualifier (confiabilidade do bucket)

| Qualifier | Significado |
|---|---|
| **`consolidado`** | n ≥ 4 jogos no bucket — padrão confiável. Use como sinal forte. |
| **`tendencia`** | 2 ≤ n < 4 — padrão emergente. Use com ressalva. |
| **`amostra_insuficiente`** | n < 2 — descartar. |

### Exemplo de uso

> *"Bayern joga em casa contra Mainz (categoria AZARÃO). Qual o histórico?"*

→ Consulte `MEMORIA_DNA.BUN.times.Bayern.buckets.casa_vs_azarao`. Se `qualifier === 'consolidado'` e `cantos_pro > 7`, é um sinal forte para Over cantos Bayern.

---

## 5. As 12 Assinaturas Comportamentais

Detectadas em cada time **apenas se houver evidência objetiva** (não são genéricas). Quando presentes, são tratadas com **prioridade máxima**.

| Assinatura | Significado | Implicação operacional |
|---|---|---|
| **BLITZ_INICIAL** | Cantos concentrados no 1T | Over HT cantos do time; HDP HT mais provável |
| **RETRANCA_AVANÇADA** | Sofre cantos majoritariamente no 2T (recua placar) | Over 2T cantos do adversário |
| **ATAQUE_ESTERIL** | Cantos altos, gols baixos | Cuidado em mercados de gols; cantos sim |
| **EFETIVIDADE_CLINICA** | Gols altos com cantos baixos (cirúrgico) | Under cantos pode brilhar mesmo com favorito |
| **MURO_DEFENSIVO** | Cantos sofridos baixos + gols sofridos baixos | Adversário não consegue produzir; reduz volume |
| **DEFESA_PRECARIA** | Cantos e gols sofridos acima da média | Adversário produz muito; Over linhas altas |
| **RUPTURA_HOME** | Diferença grande casa/fora | Trate jogos casa/fora como times diferentes |
| **ELITE_KILLER** | Rende MAIS contra elite do que contra azarão | Surpresa: vira "favorito" comportamental contra grandes |
| **CARRINHO_FACIL** | Domina azarões com folga | Bala de Prata + Reis dos Cantos quando enfrenta azarão |
| **DESEQUILIBRA_FAVORITO** | Quando é favorito, abre placar de cantos | HDP de cantos -2.0 viável |
| **SUCUMBE_AZARÃO** | Quando é azarão, sofre muitos cantos | Over cantos do adversário + Reis dos Cantos pro favorito |

### Onde encontrar

```json
MEMORIA_DNA[LIGA].times[TIME].assinaturas: [
  { nome: "BLITZ_INICIAL", evidencia: "...", severidade: "ALTA" | "MEDIA" | "BAIXA" }
]
```

---

## 6. Divergências DNA × Performance (CRÍTICO)

**Sinal mais valioso da memória.** Quando um time tem perfil DNA forte (ex.: OFENSIVO_SOLIDO) mas a performance recente NÃO bate, há divergência. O motor pode estar sendo enganado.

### Tipos

| Tipo | Sinal operacional |
|---|---|
| **Ofensivo subentregando** | Desinflar confiança em HDP forte; considerar Under |
| **Defensivo medíocre** | NÃO apostar Under achando que o time é fortaleza; pode estourar |
| **Passivo elite** | Time forte mas com cantos baixos; cuidado com Over |
| **Vulnerável elite** | Time forte mas sofre cantos; cuidado com HDP -2.0+ |

### Severidade

- **ALTA**: reduzir stake / abster do mercado direcional.
- **MÉDIA**: usar com ressalva, citar no laudo.
- **BAIXA**: apenas alerta visual; manter aposta.

### Onde encontrar

```json
MEMORIA_DNA[LIGA].divergencias_dna_performance: [
  { time: "Grêmio", tipo: "Ofensivo subentregando", severidade: "ALTA", detalhes: "..." }
]
```

---

## 7. Os 4 Motores de Decisão (terminologia do app)

O SmartCoach gera 4 tipos de sinal a partir dos cálculos Poisson + correções por arquétipo:

### 7.1. **Bala de Prata (BP)**
Sinal sobre **Over/Under de cantos totais FT** do jogo. Tem 3 níveis:
- **NUCLEAR** (`bp_nuclear`): probabilidade > 90%; sempre operável.
- **FORTE** (`bp_forte`): 80-90%; operável em ligas ofensivas.
- **MODERADA** (`bp_moderada`): 70-80%; vale apenas em ligas ofensivas (em "equilibradas" multiplicador 0.7; em "trucadas" zerado — produziu 40% WR em ARG_B).

### 7.2. **Reis dos Cantos (RC)**
Sinal sobre **dominância territorial** de um time (vai puxar a maioria dos cantos). 3 níveis:
- **ABSOLUTO** (`reis_absoluto`): time vai monopolizar; HDP -1.5 ou -2.0 viável.
- **DOMINANTE** (`reis_dominante`): time leva clara vantagem; HDP -1.0.
- **MODERADO** (`reis_moderado`): leve vantagem; usar apenas em ligas ofensivas.

### 7.3. **Cisne Negro (CN)**
Sinal de **outlier de cantos** — diferença Δ entre xCorners FT e a média da liga. Threshold por liga:
- ARG/ARG_B: 1.5 (faixa 1.5-2.0 tem 73% WR — captura mais sinais bons).
- MLS: 2.5 (com Δ≥3 ROI +8%; com Δ 2.0-2.5 ROI -7%).
- Demais: 2.0 (padrão).

### 7.4. **Tiro Sniper (TS)**
Sinal **direcional** sobre Under ou Over baseado em apatia (TMI dupla baixa = Under reforçado) ou tempestade (TMI dupla alta = Over).

### Como o agente IA deve mencionar

Quando o operador pergunta "que sinais o motor daria para Time A × Time B?", você (agente externo) deve raciocinar:
1. PowerScore + buckets situacionais → estimar xCorners pró e sof de cada lado.
2. Aplicar fator de dominância da liga (`02_CALIBRACOES_LIGAS.md`).
3. Comparar com a média da liga (`mediaFT`) → se Δ ≥ threshold, é Cisne Negro.
4. Verificar assinaturas + divergências para reforçar/atenuar.
5. Cite o sinal nomeado quando aplicável: "Esse jogo seria um Bala de Prata FORTE para Over 9.5 cantos".

---

## 8. Ranking PowerScore por liga

Cada liga tem ranking ordenado em `MEMORIA_DNA[LIGA].ranking_powerscore`. Use para responder rápido perguntas tipo:
- "Top 3 da Bundesliga em PowerScore?"
- "Quem é elite na MLS?"
- "Quem está pior posicionado no Brasileirão?"

---

## 9. Matriz de cruzamentos DNA × DNA

Pré-calculada por liga em `MEMORIA_DNA[LIGA].matriz_dna_cruzamentos`. Mostra a média de cantos esperada quando um perfil enfrenta outro:

> *"EQUILIBRADO × OFENSIVO_SOLIDO no Brasileirão gera em média 11.5 cantos/jogo."*

Útil para validar projeções rapidamente sem cálculo Poisson completo.

---

## 10. Insights por liga

Em `MEMORIA_DNA[LIGA].insights_liga` há observações nomeadas (ex.: "Bundesliga tem azarões que roubam cantos — fator de dominância 0.79 reflete isso"). Use como contexto rápido.

---

## 📚 Recap — Hierarquia de uso

Quando o operador faz uma pergunta:

1. **Status da liga** → veja se ela está suspensa/em observação (`02_CALIBRACOES_LIGAS.md`).
2. **Identidade do time** → PowerScore + categoria + perfil DNA + forma.
3. **Bucket situacional** → se o cenário (casa/fora vs categoria adversário) tem `qualifier: 'consolidado'`, use como sinal forte.
4. **Assinaturas** → se presentes e severidade ALTA, são prioritárias.
5. **Divergências DNA × Performance** → se severidade ALTA, atenue ou reverta a recomendação.
6. **Histórico jogo-a-jogo** → para forma recente e padrões cronológicos.
7. **Arquétipo da liga + multiplicadores** → calibra a recomendação final.
