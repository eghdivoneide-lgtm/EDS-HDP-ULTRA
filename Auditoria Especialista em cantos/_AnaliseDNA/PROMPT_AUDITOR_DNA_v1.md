# 🎯 PROMPT — AUDITOR DE DNA POR TIME

**Projeto:** EDS Especialista em Cantos (futebol — mercado de escanteios)
**Tarefa:** Análise profunda de DNA situacional de cada time em 7 ligas
**Tempo estimado:** 3–5 horas de trabalho contínuo
**Restrição crítica:** NÃO modificar `index.html` nem arquivos em `data/`. Apenas gerar saídas em `Auditoria Especialista em cantos/_AnaliseDNA/`.

---

## 1. CONTEXTO DO PROJETO

O **Especialista em Cantos** é um app analítico (PWA single-file em `index.html`) que projeta cantos/escanteios em partidas de futebol. Hoje, o motor de projeção usa multiplicadores estáticos do "DNA Escoteiro" (perfil tático qualitativo) mas **não captura comportamento situacional condicional**.

**Problema documentado:** No jogo Grêmio × Flamengo (10/05/2026, BR), o motor projetou 6.77 cantos totais (acertou volume) mas previu distribuição equilibrada (~3.4 vs ~3.1). O placar real de cantos foi **0 × 6** — o Flamengo dominou totalmente. O motor não capturou o **gap de qualidade momentum** entre os times.

**Sua missão:** documentar como cada time **REALMENTE se comporta** em diferentes contextos (casa/fora × tipo de adversário) para que essa memória possa ser cravada no contexto do SmartCoach IA.

---

## 2. SUA MISSÃO — RESUMO EXECUTIVO

Para cada uma das 7 ligas ativas, e **para cada time dentro de cada liga**, produzir:

1. **Identidade Base** — PowerScore + categoria + perfil + baselines
2. **Bucket Matrix Comportamental** — 6 buckets (casa/fora × elite/médio/azarão)
3. **Assinaturas Comportamentais** — padrões nomeados detectados objetivamente
4. **Narrativa Operacional** — texto curto profissional para alimentar o SmartCoach

**Entregáveis finais:**
- 7 relatórios HTML visuais (1 por liga)
- 7 JSONs estruturados de memória (1 por liga)
- 1 JSON master consolidado cross-liga
- 1 Sumário Executivo HTML com insights cross-liga

---

## 3. FILOSOFIA DA ANÁLISE (LEIA ANTES DE COMEÇAR)

> **"Variância sempre vai ocorrer, mas se soubermos QUANDO o time muda o seu comportamento, até essa variância podemos identificar."**

Você NÃO está tratando a variância como ruído. Você está **separando MODOS DE OPERAÇÃO** do time. O que parece ser aleatório na média geral é, na verdade, **mistura de modos** (Time X jogando vs elite + Time X jogando vs azarão). Separando os modos, a variância vira **previsibilidade situacional**.

**Você NÃO É um gerador de tabelas.** Você é um **auditor comportamental** que monta o perfil psicológico-tático de cada time baseado em evidência quantitativa.

---

## 4. ESTRUTURA DO PROJETO E DADOS

### 4.1. Localização dos dados
```
especialista-cantos/
├── data/
│   ├── brasileirao2026.js      → window.DADOS_BR    (BR — Série A)
│   ├── brasileiraoB2026.js     → window.DADOS_BR_B  (BR_B — Série B)
│   ├── argentina2026.js        → window.DADOS_ARG   (ARG — Liga Profesional)
│   ├── argentina_b2026.js      → window.DADOS_ARG_B (ARG_B — Primera Nacional)
│   ├── mls2026.js              → window.DADOS_MLS
│   ├── usl2026.js              → window.DADOS_USL
│   ├── bundesliga2026.js       → window.DADOS_BUN
│   └── dna_escoteiro.js        → window.DNA_ESCOTEIRO
└── Auditoria Especialista em cantos/
    └── _AnaliseDNA/            ← SUA pasta de saída
```

### 4.2. Como carregar os dados em Node.js
```js
const fs = require('fs');
const code = fs.readFileSync('data/brasileirao2026.js', 'utf8');
const window = {};
eval(code);
const dados = window.DADOS_BR;
// dados.times → array de strings (nomes dos times)
// dados.jogos → array de jogos
```

### 4.3. Estrutura de um jogo
```js
{
  match_id: "abc123",
  rodada: 7,
  data: "2026-04-05" OU "05.04.2026 19:00" OU "05/04/2026" (formatos variam!),
  mandante: "Flamengo",
  visitante: "Vasco",
  cantos: {
    ht: { m: 3, v: 2 },   // mandante: 3, visitante: 2 no 1º tempo
    ft: { m: 6, v: 4 }    // mandante: 6, visitante: 4 no jogo todo
  },
  placar: {                // PODE não existir em alguns datasets
    ht: { m: 1, v: 0 },
    ft: { m: 2, v: 1 }
  },
  stats_taticas: {         // PODE não existir (~20% dos jogos têm)
    posse: { m: 58, v: 42 },
    finalizacoes: { m: 14, v: 9 }
  }
}
```

**REGRA:** filtre apenas jogos com `j.cantos && j.cantos.ft` válidos. Jogos sem cantos coletados são lixo.

### 4.4. Estrutura do DNA_ESCOTEIRO
```js
window.DNA_ESCOTEIRO = {
  BR: {
    "Flamengo": {
      perfil: "OFENSIVO_SOLIDO",           // string categórica
      tendencia_empate: "BAIXO",
      forma: "VVVDE",                       // últimos 5 jogos (V=vitória, E=empate, D=derrota)
      multPerfil: 1.10,
      multFora: 1.0,
      multSupressao: 0.75,
      casa_v_pct: 67, fora_v_pct: 57,
      casa_d_pct: 0, fora_d_pct: 29,
      gp_jogo: 2.0, gc_jogo: 0.92,
      casa_gp: 2.17, casa_gc: 0.67,
      fora_gp: 1.86, fora_gc: 1.14,
      notas: ["🏠 Forte em casa (67% vitórias)", "..."]
    },
    "Vasco": { ... }
  },
  ARG: { ... },
  ...
}
```

### 4.5. Normalização de nomes de times
**IMPORTANTE:** Alguns datasets têm variações ortográficas (ex: "Atlético-MG" vs "Atletico-MG"). Use match fuzzy:
```js
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]/g,'');
```
Quando buscar time no DNA, tente match exato primeiro, depois match parcial (substring).

### 4.6. Normalização de datas
Datas vêm em 3 formatos. Crie helper:
```js
function normalizarData(d) {
  if (!d) return null;
  const s = String(d).trim();
  let m;
  if (m = s.match(/^(\d{4})-(\d{2})-(\d{2})/)) return s.slice(0,10);
  if (m = s.match(/^(\d{2})\.(\d{2})\.(\d{4})/)) return m[3]+'-'+m[2]+'-'+m[1];
  if (m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/)) return m[3]+'-'+m[2]+'-'+m[1];
  return null;
}
```

---

## 5. METODOLOGIA — 4 NÍVEIS DE ANÁLISE

### NÍVEL 1 — IDENTIDADE BASE

Para cada time, calcular:

#### 1.1. PowerScore (escala 0-100)
```
gp_jogo = DNA_ESCOTEIRO[liga][time].gp_jogo
gc_jogo = DNA_ESCOTEIRO[liga][time].gc_jogo
forma = DNA_ESCOTEIRO[liga][time].forma (ex: "VVDED")
casa_v_pct = DNA_ESCOTEIRO[liga][time].casa_v_pct
fora_v_pct = DNA_ESCOTEIRO[liga][time].fora_v_pct

forma_score = média de [V=1, E=0.5, D=0] dos 5 chars da string forma
v_pct_geral = (casa_v_pct + fora_v_pct) / 2

power_raw = (gp_jogo * 30) + ((2 - gc_jogo) * 20) + (forma_score * 25) + (v_pct_geral * 0.25)
```

Depois de calcular `power_raw` pra TODOS os times da liga, normaliza pra 0-100 (percentil dentro da liga).

#### 1.2. Categoria por percentil
- `power_pct ≥ 70` → **ELITE**
- `30 ≤ power_pct < 70` → **MÉDIO**
- `power_pct < 30` → **AZARÃO**

#### 1.3. Baselines do time
- `media_cantos_pro_geral`, `media_cantos_sofridos_geral`
- `media_cantos_pro_casa`, `media_cantos_sofridos_casa`
- `media_cantos_pro_fora`, `media_cantos_sofridos_fora`
- `desvio_padrao_cantos_pro_geral` (medida de consistência)
- `media_gols_pro_geral`, `media_gols_sofridos_geral` (quando disponível)

#### 1.4. Output Nível 1 (por time)
```json
{
  "time": "Flamengo",
  "liga": "BR",
  "powerScore": 78.5,
  "categoria": "ELITE",
  "perfil_dna": "OFENSIVO_SOLIDO",
  "forma": "VVVDE",
  "baseline": {
    "cantos_pro_geral": 4.45,
    "cantos_sofridos_geral": 4.62,
    "cantos_pro_casa": 6.20,
    "cantos_sofridos_casa": 3.10,
    "cantos_pro_fora": 3.14,
    "cantos_sofridos_fora": 5.71,
    "consistencia_pro": 2.31,       // desvio padrão
    "gols_pro_geral": 2.0,
    "gols_sofridos_geral": 0.92
  },
  "n_jogos": 14
}
```

---

### NÍVEL 2 — BUCKET MATRIX (6 buckets situacionais)

#### 2.1. Definição dos buckets
Para cada jogo do time, classificar pelo adversário (via PowerScore do adversário) e local:

|        | vs ELITE | vs MÉDIO | vs AZARÃO |
|--------|----------|----------|-----------|
| 🏠 Casa | bucket_HC_E | bucket_HC_M | bucket_HC_A |
| ✈️ Fora | bucket_AW_E | bucket_AW_M | bucket_AW_A |

#### 2.2. Métricas por bucket
Para CADA bucket, calcular:
```json
{
  "n": 4,
  "cantos_pro_media": 7.5,
  "cantos_pro_desvio": 1.2,
  "cantos_sofridos_media": 2.5,
  "cantos_sofridos_desvio": 0.8,
  "diferencial": 5.0,                   // pro - sofridos
  "variacao_vs_baseline_pct": 68.5,     // % variação vs cantos_pro_geral
  "gols_pro_media": 2.3,                // quando disponível
  "gols_sofridos_media": 0.8,
  "win_rate_cantos_pct": 75,            // % jogos que time fez mais cantos que adversário
  "qualifier": "consolidado"            // consolidado (N≥5) | sugestivo (N=3-4) | amostra_insuficiente (N<3)
}
```

#### 2.3. Detecção de padrão por bucket
Marca `padrao_detectado: true` quando:
- `n >= 3`
- E (`|variacao_vs_baseline_pct| >= 25` OU `|diferencial| >= 2.0`)

Quando `n < 3`, marca `qualifier: "amostra_insuficiente"` e **NÃO marca padrão**.

---

### NÍVEL 3 — ASSINATURAS COMPORTAMENTAIS

Você deve **caçar 12 assinaturas** padronizadas em cada time. Cada uma tem regra objetiva. Se a regra bate, marca `presente: true` e inclui evidência (números).

#### Lista das 12 assinaturas com regras

| # | Assinatura | Regra de detecção (TODAS condições) |
|---|---|---|
| 1 | `BLITZ_INICIAL` | `cantos_HT_pro / cantos_FT_pro ≥ 0.50` E `n ≥ 5` |
| 2 | `RETRANCA_AVANÇADA` | `cantos_sofridos_HT / cantos_sofridos_FT ≤ 0.35` E `n ≥ 5` |
| 3 | `EFETIVIDADE_CLINICA` | `gols_pro / cantos_pro ≥ 0.30` E `cantos_pro ≤ média_liga * 0.95` E `n ≥ 5` |
| 4 | `ATAQUE_ESTERIL` | `cantos_pro ≥ média_liga` E `gols_pro ≤ média_liga_gols * 0.7` E `(cantos_pro / max(gols_pro, 0.1)) ≥ 4.5` E `n ≥ 5` |
| 5 | `MURO_DEFENSIVO` | `cantos_sofridos ≤ média_liga * 0.7` E `gols_sofridos ≤ média_liga_gols * 0.7` E `n ≥ 5` |
| 6 | `DEFESA_PRECARIA` | `cantos_sofridos ≥ média_liga * 1.3` E `gols_sofridos ≥ média_liga_gols * 1.3` E `n ≥ 5` |
| 7 | `RUPTURA_HOME` | `\|cantos_pro_casa - cantos_pro_fora\| ≥ 2.0` |
| 8 | `ELITE_KILLER` | `cantos_pro_vs_elite > cantos_pro_vs_azarao` E `n_elite ≥ 3` E `n_azarao ≥ 3` |
| 9 | `CARRINHO_FACIL` | `cantos_pro_vs_azarao ≥ baseline_pro * 1.3` E `win_rate_cantos_vs_azarao ≥ 70` E `n_azarao ≥ 3` |
| 10 | `DESEQUILIBRA_FAVORITO` | quando categoria==ELITE: `diferencial_vs_azarao ≥ 2.0` E `n ≥ 3` |
| 11 | `SUCUMBE_AZARÃO` | quando categoria==AZARÃO: em ≥ 60% dos jogos sofreu mais cantos que pró E `n ≥ 5` |
| 12 | `TERMÔMETRO_FORMA` | `desvio_padrao(últimos_5_cantos_pro) > desvio_padrao(geral_cantos_pro) * 1.5` E `n ≥ 5` |

**Você pode propor novas assinaturas** se durante a análise notar padrões recorrentes não capturados pelas 12 acima. Documente a regra de detecção objetivamente.

#### Output Nível 3 (por time)
```json
{
  "assinaturas": [
    {
      "nome": "ATAQUE_ESTERIL",
      "presente": true,
      "evidencia": {
        "cantos_pro_media": 5.8,
        "media_liga": 5.0,
        "gols_pro_media": 1.0,
        "media_liga_gols": 1.5,
        "ratio_cantos_gol": 5.8,
        "n_jogos": 14
      },
      "qualifier": "consolidado"
    },
    {
      "nome": "BLITZ_INICIAL",
      "presente": false
    }
  ]
}
```

---

### NÍVEL 4 — NARRATIVA OPERACIONAL

Para CADA time, escrever um texto profissional (3-6 frases) que sintetize:
- Categoria + perfil DNA
- Padrão dominante em casa e fora
- 1-3 assinaturas comportamentais detectadas
- Gatilho conhecido (se houver) — ex: "quando faz 1º gol, retranca"
- Variância (previsível vs errático)
- Alerta operacional principal

**Tom:** consultor de aposta profissional, direto, sem floreio. Frases curtas. Use emoji estratégico (🏠 ✈️ 🟢 🔴 ⚠️) com parcimônia (máx 1 por linha).

**Exemplo de narrativa boa:**
> **Mirassol** — Time MÉDIO-AZARÃO (PowerScore 38). Perfil PADRAO, com forma instável (EEDEE). 🏠 Em casa: tenta dominar mesmo contra elite mas sofre 6.8 cantos no contra-ataque (`SUCUMBE_AZARÃO` consolidado, 7 jogos). Assinatura forte de `ATAQUE_ESTERIL`: encosta na área (5.8 cantos pró) mas converte pouco (1.0 gol/jogo, ratio 5.8 cantos/gol). ✈️ Fora: vira retranca, 2.1 cantos pró. ⚠️ Variância ALTA contra elite — sinal direcional pouco confiável.

**Exemplo de narrativa RUIM (não fazer):**
> Mirassol é um time interessante que joga bem em casa e mal fora. Tem média de 5.8 cantos. *(sem evidência, vago, não-operacional)*

---

## 6. DEFINIÇÕES TÉCNICAS — FÓRMULAS

### 6.1. Forma score
```js
const formaScore = forma => (forma || 'EEEEE').split('').slice(0, 5)
  .map(c => c === 'V' ? 1 : c === 'E' ? 0.5 : 0)
  .reduce((s, n) => s + n, 0) / 5;
```

### 6.2. Percentil dentro da liga
```js
function percentil(valor, todosValores) {
  const sorted = [...todosValores].sort((a, b) => a - b);
  const idx = sorted.findIndex(v => v >= valor);
  return idx >= 0 ? (idx / sorted.length) * 100 : 100;
}
```

### 6.3. Desvio padrão
```js
function desvio(arr) {
  if (arr.length === 0) return 0;
  const m = arr.reduce((s, n) => s + n, 0) / arr.length;
  return Math.sqrt(arr.reduce((s, n) => s + (n - m) ** 2, 0) / arr.length);
}
```

### 6.4. Win rate em cantos
% de jogos do bucket em que o time fez **mais cantos** que o adversário (empate em cantos não conta como win).

---

## 7. ENTREGÁVEIS EXATOS

### 7.1. Estrutura de pastas (criar dentro de `Auditoria Especialista em cantos/_AnaliseDNA/`)

```
_AnaliseDNA/
├── 01_BR/
│   ├── relatorio_BR.html          (visual rico, todos os times)
│   ├── memoria_BR.json            (estruturado pro SmartCoach)
│   └── log_BR.txt                 (logs do processamento)
├── 02_BR_B/
├── 03_ARG/
├── 04_ARG_B/
├── 05_MLS/
├── 06_USL/
├── 07_BUN/
├── _SUMARIO_EXECUTIVO.html        (insights cross-liga)
├── _MEMORIA_TIMES_MASTER.json     (consolidado cross-liga)
└── _METODOLOGIA_APLICADA.md       (relatório do que foi feito)
```

### 7.2. Schema do `memoria_<LIGA>.json` (POR LIGA)

```json
{
  "liga": "BR",
  "ligaNome": "Brasileirão Série A",
  "data_analise": "2026-05-14",
  "n_jogos_analisados": 137,
  "n_times": 20,
  "ranking_powerscore": [
    { "time": "Flamengo", "powerScore": 82.5, "categoria": "ELITE" },
    { "time": "Palmeiras", "powerScore": 75.0, "categoria": "ELITE" },
    ...
  ],
  "times": {
    "Flamengo": {
      "identidade": {
        "powerScore": 82.5,
        "powerPercentil": 95,
        "categoria": "ELITE",
        "perfil_dna": "OFENSIVO_SOLIDO",
        "forma": "VVVDE",
        "n_jogos": 14
      },
      "baseline": {
        "cantos_pro_geral": 4.45,
        "cantos_sofridos_geral": 4.62,
        "cantos_pro_casa": 6.20,
        "cantos_sofridos_casa": 3.10,
        "cantos_pro_fora": 3.14,
        "cantos_sofridos_fora": 5.71,
        "consistencia_pro": 2.31,
        "gols_pro_geral": 2.0,
        "gols_sofridos_geral": 0.92
      },
      "buckets": {
        "casa_vs_elite": { "n": 2, "cantos_pro_media": ..., ... },
        "casa_vs_medio": { ... },
        "casa_vs_azarao": { ... },
        "fora_vs_elite": { ... },
        "fora_vs_medio": { ... },
        "fora_vs_azarao": { ... }
      },
      "assinaturas": [
        { "nome": "ATAQUE_ESTERIL", "presente": false },
        { "nome": "BLITZ_INICIAL", "presente": true, "evidencia": {...}, "qualifier": "consolidado" }
      ],
      "narrativa": "Flamengo — Time ELITE (PowerScore 82.5)..."
    },
    "Vasco": { ... }
  },
  "matriz_dna_cruzamentos": {
    "OFENSIVO_SOLIDO_vs_DEFENSIVO": {
      "n_jogos": 5,
      "cantos_media_total": 9.4,
      "domina_lado_forte_pct": 80,
      "diferencial_medio_cantos": 3.2
    },
    ...
  },
  "insights_liga": [
    "ARG é a única liga onde times AZARÃO em casa têm 60%+ de win rate em cantos contra ELITE — fenômeno cultural.",
    "BR mostra padrão claro de ATAQUE_ESTERIL nas equipes com PowerScore 30-50."
  ]
}
```

### 7.3. Schema do `_MEMORIA_TIMES_MASTER.json` (CROSS-LIGA)

Tudo num só arquivo pra consumo do SmartCoach:

```json
{
  "geradoEm": "2026-05-14T19:00:00Z",
  "versao": "v1.0",
  "n_ligas": 7,
  "n_times_total": 140,
  "BR": { ... mesma estrutura de memoria_BR.json ... },
  "BR_B": { ... },
  "ARG": { ... },
  "ARG_B": { ... },
  "MLS": { ... },
  "USL": { ... },
  "BUN": { ... }
}
```

### 7.4. Estrutura do `relatorio_<LIGA>.html`

HTML standalone visualmente rico, com:
1. **Header da liga** — nome + flag + data
2. **Ranking PowerScore** — tabela ordenada com categoria
3. **Matriz DNA × DNA** — quais cruzamentos geram mais cantos / dominância
4. **Insights da liga** — bullet points
5. **Por time** (cada time em seção colapsável ou cards expandidos):
   - Identidade base (cards 4 colunas)
   - Bucket Matrix (tabela 6 buckets com cor por padrão detectado)
   - Assinaturas (lista com badges verde se presente, cinza se ausente)
   - Narrativa operacional (caixa destacada)

**Cores e estilo:** use a paleta do app (`--bg: #0a0f0d`, `--green: #34d367`, `--gold: #f59e0b`, `--red: #ef4444`, `--text: #e8f5ee`, `--muted: #6b8f79`). Fonte: Inter ou system-ui.

### 7.5. Estrutura do `_SUMARIO_EXECUTIVO.html`

Documento HTML cross-liga com:
1. **Top 10 cross-liga** — times com maior PowerScore globalmente
2. **Comparativo de DNA cultural por liga** — qual liga tem mais ATAQUE_ESTERIL, qual tem mais MURO_DEFENSIVO, etc.
3. **Surpresas detectadas** — times onde categoria DNA Escoteiro (perfil) conflita com PowerScore (ex: "marcado OFENSIVO mas tem PowerScore baixo")
4. **Recomendações operacionais cross-liga**
5. **Limitações da análise** — explicitar onde sample é insuficiente

---

## 8. REGRAS DE QUALIDADE (NÃO-NEGOCIÁVEIS)

### 8.1. Não inventar dados
- Se um time tem `n_jogos < 5`, marque `confiabilidade: "BAIXA"` na identidade.
- Se um bucket tem `n < 3`, marque `qualifier: "amostra_insuficiente"` e **não derive padrão**.
- Se uma assinatura precisa de `gols_pro` mas o dataset não tem placar, marque `nao_avaliavel: "sem_dados_placar"`.

### 8.2. Sempre mostrar evidência numérica
Toda afirmação numa narrativa deve estar baseada em valor calculado. Nunca escreva "Flamengo é dominante" — escreva "Flamengo tem 75% win rate em cantos vs Azarão (3 de 4 jogos)".

### 8.3. Sample size transparente
SEMPRE incluir `n` (sample size) em qualquer métrica. Se um bucket tem N=2, deixe claro no relatório HTML com tag `⚠️ amostra pequena`.

### 8.4. Logs obrigatórios
Cada `log_<LIGA>.txt` deve conter:
- Total de jogos processados
- Total de times analisados
- Times com sample insuficiente (lista)
- Assinaturas detectadas por contagem (ex: "ATAQUE_ESTERIL: 4 times")
- Tempo de processamento
- Avisos/anomalias detectadas

### 8.5. Determinismo
Sua análise deve ser **reprodutível**. Mesmo input → mesmo output. Não use aleatoriedade.

---

## 9. PROIBIÇÕES E RESTRIÇÕES

❌ **NÃO modifique** `index.html`
❌ **NÃO modifique** arquivos em `data/`
❌ **NÃO modifique** arquivos em `scraper/`
❌ **NÃO faça commits** no git
❌ **NÃO faça push** pro GitHub
❌ **NÃO instale dependências npm** (use apenas Node.js puro + `fs`, `path`)
❌ **NÃO chame APIs externas**
❌ **NÃO altere o motor de projeção** do app

✅ **SOMENTE** crie arquivos em `Auditoria Especialista em cantos/_AnaliseDNA/`
✅ Toda lógica deve estar **autocontida** em scripts Node.js que ficam em `_AnaliseDNA/_scripts/` (opcional — pode usar inline)

---

## 10. COMO COMEÇAR

1. **Validação inicial** (10 min):
   - Carrega cada um dos 7 datasets
   - Verifica integridade (quantos jogos, quantos times, % com cantos válidos)
   - Salva resultado em `_AnaliseDNA/_validacao_datasets.txt`

2. **Processa uma liga de teste** (BR é a melhor escolha):
   - Implementa metodologia completa (níveis 1-4)
   - Gera `01_BR/relatorio_BR.html` + `memoria_BR.json` + `log_BR.txt`
   - **PARA aqui** e revisa visualmente se o output faz sentido

3. **Replica para as outras 6 ligas** após validação visual da BR

4. **Gera consolidados cross-liga**:
   - `_MEMORIA_TIMES_MASTER.json`
   - `_SUMARIO_EXECUTIVO.html`
   - `_METODOLOGIA_APLICADA.md` (documenta o que você fez)

5. **Finaliza com relatório de entrega** em texto:
   - Tempo total
   - N times analisados
   - N assinaturas detectadas (por tipo)
   - Limitações encontradas
   - Sugestões para próxima iteração

---

## 11. CRITÉRIOS DE ACEITE (como o trabalho será auditado)

Um auditor humano (parceiro Claude) revisará seu output verificando:

1. ✅ Todos os 7 JSONs por liga existem e têm schema correto
2. ✅ Todos os 7 HTMLs por liga renderizam visualmente (sem JS quebrado, sem imagens faltantes)
3. ✅ JSON master cross-liga existe e consolida tudo
4. ✅ Sumário executivo existe
5. ✅ Para times escolhidos aleatoriamente, o auditor recalcula os números manualmente e compara — devem bater (tolerância 1% por erro de arredondamento)
6. ✅ Sample sizes baixos estão **marcados** com `amostra_insuficiente` ou `confiabilidade: BAIXA`
7. ✅ Nenhuma narrativa contém afirmação SEM evidência numérica
8. ✅ Nenhum arquivo do projeto (fora de `_AnaliseDNA/`) foi tocado

---

## 12. PERGUNTAS FREQUENTES PRÉ-EMPTIVAS

**P: E se um time tem só 2 jogos no dataset?**
R: Inclui na liga com `confiabilidade: "BAIXA"` e `n_jogos: 2`. Calcula baseline mesmo assim, mas marca buckets como `amostra_insuficiente` e narrativa de "dados insuficientes — recolher mais histórico".

**P: E se o nome do time tem variações ortográficas no dataset?**
R: Use a função `norm()` do item 4.5. Quando relatório for gerado, use o nome **mais frequente** do dataset.

**P: E se a liga não tem DNA_ESCOTEIRO cadastrado?**
R: Todas as 7 ligas ativas têm DNA cadastrado. Se faltar, marca o time como `dna_indisponivel: true` na identidade.

**P: O HTML pode usar bibliotecas (Tailwind, Chart.js)?**
R: Não. HTML standalone com CSS inline (paleta do app). Dados em tabelas HTML semânticas. Sem JS necessário.

**P: Posso gerar um JSON gigantesco em vez de 7 menores?**
R: Não. **Os 7 JSONs por liga são obrigatórios** porque permitem carregamento incremental no SmartCoach. O master cross-liga é adicional.

**P: Quando termino, devo avisar como?**
R: Imprima no final do processamento uma mensagem clara:
```
═══════════════════════════════════════════════
✅ AUDITORIA DNA CONCLUÍDA
═══════════════════════════════════════════════
Tempo total: XhYmin
Ligas processadas: 7/7
Times analisados: 140
Assinaturas detectadas (total): NNN
Arquivos gerados:
  - 7 relatórios HTML
  - 7 JSONs por liga
  - 1 JSON master
  - 1 sumário executivo
  - 1 metodologia
Limitações conhecidas:
  - <lista>
═══════════════════════════════════════════════
```

---

## 13. ENTREGÁVEL FINAL — CHECKLIST

Antes de declarar concluído, confirme que TUDO abaixo está presente:

- [ ] `01_BR/relatorio_BR.html` + `memoria_BR.json` + `log_BR.txt`
- [ ] `02_BR_B/relatorio_BR_B.html` + `memoria_BR_B.json` + `log_BR_B.txt`
- [ ] `03_ARG/relatorio_ARG.html` + `memoria_ARG.json` + `log_ARG.txt`
- [ ] `04_ARG_B/relatorio_ARG_B.html` + `memoria_ARG_B.json` + `log_ARG_B.txt`
- [ ] `05_MLS/relatorio_MLS.html` + `memoria_MLS.json` + `log_MLS.txt`
- [ ] `06_USL/relatorio_USL.html` + `memoria_USL.json` + `log_USL.txt`
- [ ] `07_BUN/relatorio_BUN.html` + `memoria_BUN.json` + `log_BUN.txt`
- [ ] `_MEMORIA_TIMES_MASTER.json`
- [ ] `_SUMARIO_EXECUTIVO.html`
- [ ] `_METODOLOGIA_APLICADA.md`
- [ ] `_validacao_datasets.txt`
- [ ] Nenhum arquivo do projeto (fora de `_AnaliseDNA/`) foi modificado
- [ ] Mensagem de conclusão impressa conforme item 12

---

## 14. CONTEXTO FINAL — POR QUE ISSO IMPORTA

O objetivo deste trabalho não é gerar relatórios para serem arquivados. **É construir memória institucional reaproveitável** que será consumida pelo SmartCoach IA do app em tempo real.

Quando o operador pedir "analise Grêmio × Flamengo" no SmartCoach, ele vai:
1. Ler `_MEMORIA_TIMES_MASTER.json`
2. Pegar entrada do Grêmio (narrativa + bucket `casa_vs_elite`) e do Flamengo (narrativa + bucket `fora_vs_elite`)
3. Combinar com a projeção do motor
4. Entregar veredito muito mais profundo

**Sua qualidade aqui = qualidade dos vereditos do SmartCoach pelos próximos meses.**

Faça com rigor estatístico, narrativa enxuta, evidência sempre, sem inventar.

**Quando terminar, avise. Um auditor humano (parceiro Claude Opus 4.7) vai revisar seu trabalho.**

---

*Documento gerado em 2026-05-14 pelo Claude Opus 4.7 (1M context) para o projeto EDS Especialista em Cantos.*
