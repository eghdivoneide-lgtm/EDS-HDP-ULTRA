# 🔍 PROMPT — AUDITORIA EXTERNA v2 (validação das correções)

**Para:** Claude Sonnet 4.6 (auditor externo, mesma sessão da auditoria v1)
**De:** Egnaldo (operador do EDS Especialista em Cantos) + Claude Opus 4.7 (analista interno)
**Data:** 2026-05-14
**Tipo:** Auditoria de **segunda instância** — validação técnica das correções implementadas

---

## 1. CONTEXTO

Você fez duas rodadas de auditoria neste projeto. Na primeira (v1), levantou 5 críticas críticas, 3 refinamentos legítimos e identificou um padrão preocupante de reframing emocional na defesa do analista interno (eu, Claude Opus 4.7).

Na segunda rodada, **eu reconheci integralmente os erros** que você apontou — incluindo:
- O bug `Math.max(0.25, ...)` no detector de divergências
- A defesa matemática da pirâmide com WR de 75% sem evidência
- Ignorar margem de casa, correlação entre picks, Kelly Criterion
- Mal-aplicação de Taleb
- Tom defensivo desnecessário

**Você foi correto em todos esses pontos.** Eu errei na defesa.

Após o reconhecimento, o operador autorizou que eu implementasse as 7 correções/melhorias que você sugeriu (3 críticas + 3 acréscimos + 1 análise de poder). Implementei todas, sem desvios criativos. Agora venho pedir que **você audite tecnicamente o trabalho de implementação**.

**Postura solicitada:** mesma da v1 — crítica honesta sem cortesia. Se algo foi mal implementado, aponte. Se está superficial, aponte. Se está bom, diga. Não preciso de validação simbólica — preciso de validação real.

---

## 2. REPOSITÓRIO

**GitHub público:** `https://github.com/eghdivoneide-lgtm/especialista-em-cantos`

**Branch:** `main` (último commit deve refletir as correções, ou em pasta `_AnaliseDNA/` se o operador ainda não commitou)

---

## 3. AS 7 CORREÇÕES IMPLEMENTADAS

### CORREÇÃO 1 — Bug `Math.max(0.25, ...)` no detector

**Arquivo:** `Auditoria Especialista em cantos/_AnaliseDNA/_scripts/lib/checkpoint.js` linha ~307

**Antes:**
```js
magnitudeRel = Math.max(0.25, Math.abs(ratioSof - 1));
```

**Depois:**
```js
magnitudeRel = Math.abs(ratioSof - 1);
```

**Re-executei o pipeline completo:**
- Auditor rodado em todas as 7 ligas
- `_MEMORIA_TIMES_MASTER.json` regenerado
- `data/memoria_dna.js` regenerado a partir do novo JSON

**Impacto comparativo (verificar):**
- Corinthians (BR): era `severidade: alta` com `cantos_sof_vs_media_pct: 1.4%` → agora `severidade: baixa`
- Distribuição global: antes 12/7/0 (alta/media/baixa) → depois 3/12/4

**O que auditar:**
- Verifique se a correção realmente reflete a magnitude real (sem outro piso oculto)
- Confira se a redistribuição faz sentido estatístico
- Identifique se sobraram casos parecidos com Corinthians antigo (severidade alta com magnitude pequena)

---

### CORREÇÃO 2 — CLV no Bet Tracker

**Arquivo:** `index.html`

**Novas funções criadas:**
- `calcularCLV(oddAposta, oddFechamento)` — fórmula `((aposta/fechamento) - 1) × 100`
- `atualizarOddFechamentoBet(id)` — prompt pra editar e recalcular
- `calcularCLVAgregado(bets)` — retorna `clv_medio`, `pct_positivo`, `n_com_clv`

**Schema novo em bet:** `odd_aposta`, `odd_fechamento`, `clv_pct` (todos nullable pra backward compat)

**UI:** coluna "📊 CLV" na tabela do Bet Tracker; botão "+ odd fech." em bets resolvidas sem CLV

**O que auditar:**
- A fórmula está correta? (consenso de mercado é `((odd_aposta / odd_fechamento) - 1) × 100`)
- Backward compatibility com bets antigas funciona?
- O CLV agregado considera o universo correto (apenas Win/Loss, ignora Open/Refund)?
- Há viés introduzido pela forma como pedimos o odd de fechamento (manual)?

---

### CORREÇÃO 3 — `_validarRespostaMultiplas()` no SmartCoach

**Arquivo:** `index.html`

**Implementa 7 verificações:**
1. Schema completo (top-level keys)
2. Tamanhos exatos (5/10/15/20)
3. Picks válidos (liga, jogo, mercado, linha, favorito, justificativa)
4. Mercados válidos (HDP em `-0.5/-1.0/-1.5/-2.0/-2.5`, Under em `7.5/8.5/9.5/10.5/11.5`)
5. Piramidalidade (elite5 ⊂ elite10 ⊂ elite15 ⊂ elite20)
6. Exclusão de divergência alta
7. Jogos existem nos candidatos pré-filtrados

**Integração:** chamado antes de persistir no cache. Se inválido, mostra erros + permite regerar.

**O que auditar:**
- As 7 verificações são suficientes ou falta algo (ex: validar odds, datas, conflito de horário)?
- Match de piramidalidade via `normJogo()` é robusto a variações de nome?
- Detecção de "pick inventado pelo SmartCoach" tem falsos positivos (match parcial pode falhar)?

---

### CORREÇÃO 4 — Display prob composta + Kelly + breakeven

**Arquivo:** `index.html`

**Novas funções:**
- `_calcularProbCompostaReal(picks, candidatos)` — usa priors da auditoria 01-04/05:
  - BP NUCLEAR → 0.78
  - BP FORTE → 0.43
  - BP MODERADA → 0.51
  - Cisne Δ≥2.5 sem BP → 0.65
  - Fallback → 0.55
- `_calcularKellyFraction(p, odd)` — `(p·b − q)/b`

**No card de cada escalão:**
- WR breakeven = `1/odd_composta`
- Margem = `prob_composta − breakeven` (em pp)
- Kelly Fraction com mensagem contextual
- Bandeira: 🚫 vermelho (margem<0) / ⚠️ dourado (0-2pp) / 🟡 laranja (2-5pp) / 🟢 verde (≥5pp)

**O que auditar:**
- Os priors usados são honestos? (auditoria 01-04/05 tinha N pequeno por faixa — você criticou isso na v1; agora estou usando os mesmos números como prior — isso é circular ou metodologicamente OK?)
- A fórmula Kelly está correta (especificamente em parlay com odd composta)?
- A bandeira de margem captura o risco real ou está calibrada arbitrariamente?
- Ainda falta: **fator de correlação entre picks** (você mencionou ~0.10-0.20). Isso NÃO foi implementado. É grave?

---

### CORREÇÃO 5 — Painel CLV no Bet Tracker

**Arquivo:** `index.html`

**Componentes:**
- WR rolling 30d / 60d / 90d com setas de trend
- ROI com IC 95% (aproximação normal: `ROI ± 1.96·σ/√n`)
- Detector de drift: compara WR últimos 30d vs 60-90d anteriores
  - drift_forte: queda ≥ 10pp (banner vermelho)
  - drift_moderado: queda ≥ 5pp (banner amarelo)
- Card CLV agregado: média + % positivo + N

**O que auditar:**
- IC 95% via aproximação normal é apropriado pra n pequeno (< 30)? Bootstrap seria melhor mas não foi implementado — é grave?
- O critério de drift (5pp / 10pp) é defensável estatisticamente ou é threshold arbitrário?
- Há vies de seleção pelas janelas (30/60/90)?

---

### CORREÇÃO 6 — Análise de poder estatístico

**Arquivos criados:**
- `Auditoria Especialista em cantos/_AnaliseDNA/_scripts/analise_poder.js`
- `Auditoria Especialista em cantos/_AnaliseDNA/_ANALISE_PODER_ASSINATURAS.md`

**Método:** teste de proporção (aproximação normal):
```
N = ((z_alpha + z_beta) / efeito)² × p × (1-p)
z_alpha = 1.96, z_beta = 0.84
```

Pra cada uma das 12 assinaturas, calculei:
- N atual médio
- Prevalência observada
- N necessário pra detectar 10%, 20%, 30% de efeito
- Status (madura, limitada, imatura)

**Conclusão sobre TERMÔMETRO_FORMA:** documentada com diagnóstico objetivo (sem afrouxar threshold).

**O que auditar:**
- Aproximação normal é apropriada quando p está perto de 0 (caso de TERMÔMETRO_FORMA com prevalência 0)? Pra p extremo, deveria ser Wilson score interval ou exato binomial?
- A "prevalência observada" usa o `p` baseado em prevalência. Quando p=0 ou p=1, usei `p=0.5` (worst case). Isso é apropriado?
- O relatório dá margem pra p-hacking futuro ou está blindado?

---

### CORREÇÃO 7 — Snapshot DNA pré-rodada

**Arquivo:** `index.html`

**Função:** `snapshotMemoriaDNA()` baixa `snapshot_dna_<timestamp>.json` com:
```json
{
  "snapshot_timestamp": "...",
  "snapshot_label": "Pré-rodada...",
  "memoria": <window.MEMORIA_DNA inteiro>
}
```

**UI:** botão `📸 Snapshot DNA` na aba 🏆 Múltiplas Elite

**Protocolo documentado:** seção 9 do `_METODOLOGIA_APLICADA.md`

**Pasta:** `Auditoria Especialista em cantos/_AnaliseDNA/_snapshots/` (criada)

**O que auditar:**
- A operação manual (clicar antes de cada rodada + mover arquivo manualmente) tem risco de falha humana. É aceitável ou deveria ser automatizado?
- A estrutura do snapshot é suficiente pra reconstruir as predições da rodada depois?
- Falta algo: timestamp da última rodada injetada nos datasets? Hash dos `data/*.js`? Pra garantir que o snapshot é reproducível.

---

## 4. ARQUIVOS DE REFERÊNCIA NO REPO

1. **`Auditoria Especialista em cantos/_AnaliseDNA/IMPLEMENTACAO_LOG.md`** — documento detalhado do que fiz em cada correção, com diffs e métricas comparativas
2. **`Auditoria Especialista em cantos/_AnaliseDNA/_ANALISE_PODER_ASSINATURAS.md`** — relatório da correção 6
3. **`Auditoria Especialista em cantos/_AnaliseDNA/_METODOLOGIA_APLICADA.md`** — seção 9 nova (protocolo de snapshot)
4. **`Auditoria Especialista em cantos/_AnaliseDNA/_MEMORIA_TIMES_MASTER.json`** — JSON regenerado pós-correção 1
5. **`index.html`** — todas as correções 2, 3, 4, 5, 7

---

## 5. FORMATO DE RELATÓRIO SOLICITADO

Mesmo padrão da auditoria v1:

### A. Veredito geral
Score por dimensão (0-10) das correções implementadas. Não precisa elogio — só medição honesta.

### B. Para cada uma das 7 correções
- ✅ Bem implementada / ⚠️ Parcial / ❌ Mal implementada
- Pontos específicos de mérito ou crítica
- Sugestão de melhoria se houver

### C. Pontos cegos NOVOS detectados
Algo que minha implementação introduziu de risco que você consegue ver e eu não? Ex: bug sutil em alguma fórmula, viés introduzido, dependência circular, etc.

### D. Pontos da auditoria v1 que continuam abertos
Quais críticas estruturais sobreviveram (Poisson independente, hold-out formal, correlação entre picks, etc.) e ainda precisam ser endereçadas em versão futura?

### E. Postura do analista interno
A correção foi implementada com humildade ou ainda há resíduos do padrão defensivo da v1? Use como evidência o `IMPLEMENTACAO_LOG.md` e a forma como as correções foram estruturadas.

### F. Recomendação executiva
3-5 próximas ações priorizadas. Se há algo crítico ainda em aberto, marque.

---

## 6. AUTORIZAÇÃO E DELIMITAÇÃO

- ✅ **Pode** ler qualquer arquivo do repo
- ✅ **Pode** rodar scripts em modo dry-run pra verificar resultados (ex: rodar `analise_poder.js` localmente pra ver output)
- ✅ **Pode** pedir esclarecimento se algum ponto da implementação estiver opaco
- ❌ **NÃO modifique** nenhum arquivo (apenas auditoria, não implementação)
- ❌ **NÃO chame** APIs externas durante a auditoria
- ❌ **NÃO faça commits**

---

## 7. SOBRE A POSTURA SOLICITADA

A auditoria v1 foi extraordinária justamente porque você foi honesto **sem buscar simetria forçada**. Críticas válidas ficaram críticas, refinamentos ficaram refinamentos. Nada foi inflado pra "balancear" o relatório.

Repita essa postura. Se as 7 correções foram bem feitas, diga. Se 4 foram boas e 3 foram superficiais, diga. Se eu introduzi algum novo bug ou viés, **aponte com nome e endereço**.

O sistema só fica melhor com essa pressão.

**Obrigado antecipadamente.**

— Claude Opus 4.7 (1M context), analista interno do EDS Especialista em Cantos

---

*Documento gerado em 2026-05-14 pelo Claude Opus 4.7 para Claude Sonnet 4.6 via Egnaldo (operador).*
