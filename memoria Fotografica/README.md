# 📸 Memória Fotográfica do SmartCoach

> **Kit portátil para clonar o SmartCoach em qualquer agente IA externo (Claude, ChatGPT, Gemini, etc.)**
> Versão 1.0 — snapshot do dia **2026-05-16**, pós-rodada 09-13/05 (109 jogos novos injetados).

---

## 🎯 O que é este kit

Esta pasta é uma **fotografia completa do conhecimento institucional** do SmartCoach — a IA quantitativa embarcada no app EDS Especialista em Cantos. Foi montada para que o Comandante possa pedir uma **segunda opinião** ou um **análise paralela** em outro agente IA (sem precisar do app aberto), entregando ao agente externo TUDO o que o SmartCoach sabe.

**Cobertura:** 9 ligas operáveis · 239 times · **1.717 jogos** da temporada 2026.

| Liga | Nome | Times | Jogos | Status |
|---|---|---|---|---|
| BR | Brasileirão Série A | 20 | 147 | OK |
| BR_B | Brasileirão Série B | 20 | 77 | OK |
| ARG | Argentina Liga Profesional | 30 | 249 | OK |
| ARG_B | Argentina Primera Nacional | 36 | 216 | OK |
| MLS | Major League Soccer | 30 | 177 | ⚠️ observação (ROI -17% n=32) |
| USL | USL Championship | 25 | 106 | OK |
| BUN | Bundesliga | 18 | 297 | OK |
| J1 | J1 League | 20 | 129 | ⚠️ observação (DNA parcial) |
| J2_J3 | J2 + J3 League | 40 | 319 | OK |

---

## 🚀 Como usar (3 modos)

### Modo 1 — Drop-in single-file (mais rápido)

1. Abra o arquivo **`05_BUNDLE_COMPLETO.md`** — ele tem TUDO em um único MD (system prompt + metodologia + calibrações + MEMORIA_DNA resumida + sumários de histórico).
2. Cole no início da conversa com Claude / ChatGPT / Gemini.
3. Faça a pergunta. O agente já está "ligado" como SmartCoach.

**Quando usar:** consultas rápidas, comparações entre times, análise comportamental.
**Limite:** o bundle MD não traz o histórico jogo-a-jogo bruto (peso demais — ~3MB total). Tem sumários e PowerScore.

### Modo 2 — Bundle + JSONs anexados (mais robusto)

1. Cole `05_BUNDLE_COMPLETO.md` no início da conversa.
2. Anexe os arquivos `03_MEMORIA_DNA.json` e o(s) histórico(s) que precisar de `04_HISTORICO_JOGO_A_JOGO/<LIGA>.json`.
3. Diga ao agente: *"Os JSONs anexados são a sua fonte primária. Leia-os e use os dados literais ao responder."*

**Quando usar:** análise profunda de um time específico, "liste os últimos 10 jogos do Bayern", validar números.

### Modo 3 — Pipeline custom

Use os arquivos como blocos:
- **`00_SYSTEM_PROMPT_AGENTE.md`** → cole como **system prompt** da API.
- **`01_METODOLOGIA.md`** + **`02_CALIBRACOES_LIGAS.md`** → cole como contexto inicial.
- **`03_MEMORIA_DNA.json`** → injete como contexto adicional (JSON).
- **`04_HISTORICO_JOGO_A_JOGO/<LIGA>.json`** → injete só a liga relevante.

**Quando usar:** automação, agentes recorrentes, integrações via API.

---

## 📂 Estrutura da pasta

```
memoria Fotografica/
├── README.md                              ← este arquivo
├── 00_SYSTEM_PROMPT_AGENTE.md             ← persona + regras de conduta SmartCoach
├── 01_METODOLOGIA.md                      ← PowerScore, arquétipos, 12 assinaturas, 4 motores
├── 02_CALIBRACOES_LIGAS.md                ← LIGA_DNA, FAV_DOMINANCE, PROTOCOLO_STAKE, LIGAS_STATUS
├── 03_MEMORIA_DNA.json                    ← 239 times com PowerScore, baselines, buckets, assinaturas
├── 04_HISTORICO_JOGO_A_JOGO/
│   ├── BR.json                            ← 147 jogos cronológicos com cantos HT/FT, gols, posse, etc.
│   ├── BR_B.json                          ← 77 jogos
│   ├── ARG.json                           ← 249 jogos
│   ├── ARG_B.json                         ← 216 jogos
│   ├── MLS.json                           ← 177 jogos
│   ├── USL.json                           ← 106 jogos
│   ├── BUN.json                           ← 297 jogos
│   ├── J1.json                            ← 129 jogos
│   └── J2_J3.json                         ← 319 jogos
├── 05_BUNDLE_COMPLETO.md                  ← TUDO em 1 arquivo (drop into LLM)
├── 06_DNA_ESCOTEIRO.md                    ← prompt-template pra IA externa gerar perfis qualitativos das 5 ligas faltantes
└── _REFERENCIA_memoria_qualitativa_atual.js  ← exemplo real do DNA ESCOTEIRO que o app já tem (BR/ARG/MLS/USL)
```

---

## 🧠 O que o SmartCoach sabe (resumo)

1. **PowerScore (0-100)** de cada um dos 239 times — categoria (ELITE / MÉDIO / AZARÃO) e perfil DNA (OFENSIVO_SOLIDO, EQUILIBRADO, DEFENSIVO, MURO_DUPLO, etc.).
2. **Baselines situacionais**: cantos pro/sof em casa vs elite/médio/azarão, fora vs elite/médio/azarão (até 6 buckets por time).
3. **12 assinaturas comportamentais** detectadas em cada time onde há evidência objetiva (BLITZ_INICIAL, RETRANCA_AVANÇADA, ATAQUE_ESTERIL, EFETIVIDADE_CLINICA, MURO_DEFENSIVO, DEFESA_PRECARIA, RUPTURA_HOME, ELITE_KILLER, CARRINHO_FACIL, DESEQUILIBRA_FAVORITO, SUCUMBE_AZARÃO).
4. **Divergências DNA × Performance** — sinais críticos onde o perfil DNA não bate com o desempenho recente.
5. **4 motores de decisão**: Bala de Prata, Reis dos Cantos, Cisne Negro, Tiro Sniper.
6. **Calibrações por liga**: arquétipo (ofensiva / equilibrada / trucada), fator de dominância do favorito, threshold Cisne Negro, multiplicadores por arquétipo.

---

## 📅 Quando regerar este kit

Este snapshot foi tirado em **2026-05-16**. Regere a cada rodada importante:

1. No app principal: importe a nova rodada nos datasets.
2. Rode os scripts:
   ```bash
   cd "Auditoria Especialista em cantos/_AnaliseDNA/_scripts"
   node auditor.js liga BR
   # ... repita para as 9 ligas
   node auditor.js consolidar
   ```
3. Regere `data/memoria_dna.js`.
4. Refaça os passos de criação desta pasta (sobrescrevendo este snapshot).

---

## 🧬 BÔNUS: Gerar DNA ESCOTEIRO das 5 ligas faltantes

O app principal hoje tem **DNA ESCOTEIRO** (memória qualitativa YAAKEN) apenas para **BR/ARG/MLS/USL**. Faltam BR_B, ARG_B, BUN, J1, J2_J3.

Este kit traz o arquivo **`06_DNA_ESCOTEIRO.md`** com um **prompt-template completo** para a IA externa gerar os 5 perfis faltantes a partir dos dados já disponíveis no kit. O output dela vira JSON colável direto no `data/memoria_qualitativa.js` do app, fechando 100% da cobertura.

**Fluxo:**
1. Vc cola o `05_BUNDLE_COMPLETO.md` + o `06_DNA_ESCOTEIRO.md` na IA externa.
2. Anexa o `03_MEMORIA_DNA.json` + os 5 históricos das ligas faltantes (`04_HISTORICO_JOGO_A_JOGO/BR_B.json` etc).
3. IA externa devolve 5 blocos JSON.
4. Vc cola no app principal. SmartCoach passa a ter DNA ESCOTEIRO em 9/9 ligas.

---

## ⚠️ Limitações

- **Modelo base do agente externo**: o SmartCoach do app é Claude Sonnet 4.6 / Opus 4.7. Outros LLMs (GPT-4o, Gemini 2.0) podem produzir variações sutis na interpretação, mas terão acesso aos mesmos dados.
- **Memória de treinamento**: o agente externo pode tentar misturar o conhecimento injetado com seu próprio treinamento (pré-2026, genérico). O `00_SYSTEM_PROMPT_AGENTE.md` traz a regra inviolável de "use SEMPRE a memória institucional injetada, NUNCA o treinamento genérico" — reforce isso se o agente derivar.
- **Liga MLS**: em observação (ROI -17% n=32). Reduzir stake; em qualquer recomendação avisar do status.
- **Liga J1**: em maturação (DNA parcial, ~1 jogo por bucket). Análise comparativa OK; stake real NÃO.

---

## 🛡️ EDS Soluções Inteligentes — Especialista em Cantos

Este kit é propriedade intelectual do Comandante do app EDS. SmartCoach é o ativo central do ecossistema — esta fotografia preserva esse ativo em formato portátil.
