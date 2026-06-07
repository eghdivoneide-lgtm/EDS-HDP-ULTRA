# 🔧 PROMPT — IMPLEMENTAÇÃO DE CORREÇÕES DE AUDITORIA EXTERNA

**Projeto:** EDS Especialista em Cantos (futebol — mercado de escanteios)
**Repositório:** `https://github.com/eghdivoneide-lgtm/especialista-em-cantos`
**Tarefa:** Implementar 7 correções/melhorias apontadas em auditoria técnica externa
**Tempo estimado:** 4–6 horas de trabalho contínuo
**Auditor pós-implementação:** Claude Opus 4.7 (1M context) na sessão paralela

---

## 1. CONTEXTO DO PROJETO

O **EDS Especialista em Cantos** é um app analítico (PWA single-file em `index.html`, ~530KB de código) que projeta escanteios em partidas de futebol em 7 ligas:
- 🇧🇷 BR (Brasileirão A) · 🇧🇷 BR_B (Brasileirão B)
- 🇦🇷 ARG (Liga Profesional) · 🇦🇷 ARG_B (Primera Nacional)
- 🇺🇸 MLS · 🇺🇸 USL Championship
- 🇩🇪 BUN (Bundesliga)

**Arquitetura simplificada:**
- `index.html` — app inteiro (UI, motor, SmartCoach IA, abas, lógica)
- `data/<liga>2026.js` — datasets de jogos por liga (cantos coletados)
- `data/dna_escoteiro.js` — perfis qualitativos por time (OFENSIVO_SOLIDO, MURO_DUPLO, etc)
- `data/memoria_dna.js` — análise comportamental cravada (179 times · 12 assinaturas · 19 divergências)
- `Auditoria Especialista em cantos/_AnaliseDNA/` — scripts e relatórios da auditoria DNA
- `Auditoria Especialista em cantos/_AnaliseDNA/_scripts/lib/checkpoint.js` — gera detector de divergências DNA × Performance

**Motor v3.0 ativo:** LIGA_DNA + FAV_DOMINANCE + ARQUETIPO_MULT + Cisne threshold por liga.

**Aba "🏆 Múltiplas Elite"** (recente): SmartCoach IA cura 4 múltiplas piramidais (5/10/15/20) usando memória DNA.

---

## 2. CONTEXTO DA AUDITORIA EXTERNA

Uma auditoria técnica externa (Claude Sonnet 4.6 em sessão independente com acesso ao repositório) foi solicitada. Ela identificou **3 críticas certeiras**, **2 refinamentos legítimos** e **algumas observações de média prioridade**. O analista interno do projeto (Claude Opus 4.7) **reconheceu integralmente** os pontos e aceitou todas as recomendações.

**Sua missão é implementar as 7 correções/melhorias documentadas abaixo**, com rigor técnico e sem desvios criativos. O analista interno fará auditoria de cada entrega.

---

## 3. AS 7 CORREÇÕES/MELHORIAS

### 🔴 CORREÇÃO 1 — Remover bug `Math.max(0.25, ...)` no detector de divergências

**Onde:** `Auditoria Especialista em cantos/_AnaliseDNA/_scripts/lib/checkpoint.js`, linha ~307.

**Código atual (errado):**
```js
magnitudeRel = Math.max(0.25, Math.abs(ratioSof - 1));
```

**Problema:** Força mínimo de 25% de magnitude relativa no caso "Defensivo medíocre", independente do desvio real. Resultado prático: o time **Corinthians** foi classificado severidade `alta` mesmo tendo `cantos_sofridos_vs_media_pct: 1.4%` (dentro do ruído estatístico). Isso fez o detector marcar **falsamente** times como divergentes, o que afeta cascata: Filtro OURO exclui esses times, SmartCoach recusa eles nas Múltiplas Elite.

**Correção:**
```js
magnitudeRel = Math.abs(ratioSof - 1);
```

**Após corrigir:**
1. Re-rode o pipeline completo do auditor: `node "Auditoria Especialista em cantos/_AnaliseDNA/_scripts/auditor.js"` (ou equivalente — verifique o entrypoint exato).
2. Verifique que `_MEMORIA_TIMES_MASTER.json` foi regenerado com severidades corretas.
3. Regenere `data/memoria_dna.js` a partir do JSON master (script existente: o arquivo `data/memoria_dna.js` é `window.MEMORIA_DNA = <JSON>;` com header de comentário).
4. Confirme: Corinthians (BR) deve agora ter severidade `media` ou `baixa` (não `alta`).
5. Reporte: quantos times mudaram de `alta` pra `media`/`baixa` após a correção.

**Critério de aceite:**
- Corinthians no `_MEMORIA_TIMES_MASTER.json` → `severidade: "media"` ou `"baixa"`
- `data/memoria_dna.js` reflete o novo JSON
- Distribuição total de severidades antes/depois reportada

---

### 🔴 CORREÇÃO 2 — Adicionar CLV (Closing Line Value) no Bet Tracker

**Contexto:** CLV é o padrão-ouro pra medir skill em apostas esportivas — você bateu numa odd que depois MOVEU a seu favor (mercado validou) ou contra (você foi ruído favorável)?

**Estrutura atual do Bet Tracker:** Localizado em `index.html` na view `view-tracker`. Cada aposta tem: liga, jogo, mercado, linha, odd, stake, status. Storage em `localStorage.sniper_bets_geral`.

**Implementação:**

#### 2.1. Schema novo de aposta
Adicionar 2 campos opcionais em cada `bet`:
```js
{
  // ... campos existentes
  odd_aposta: 1.95,        // odd que o operador bateu (já é o campo "odd" atual — renomear/duplicar)
  odd_fechamento: 1.85,    // odd no momento do início do jogo (preenchida manualmente ou via varredor)
  clv_pct: 5.4             // calculado: ((odd_aposta / odd_fechamento) - 1) * 100
}
```

Mantenha compatibilidade com bets antigas que não têm esses campos (fallback `null`).

#### 2.2. UI no Bet Tracker
- No formulário de adicionar aposta, mostrar 2 campos: "Odd na entrada" e "Odd de fechamento (preencher após o jogo)".
- No card/linha de cada aposta exibida, mostrar CLV se calculado: `CLV: +5.4%` (verde se ≥0, vermelho se <0).
- Botão "✏️ Atualizar odd fechamento" pra editar após o jogo.

#### 2.3. Cálculo agregado
- No painel topo do Bet Tracker (cards de estatísticas), adicionar:
  - **CLV médio** (média de `clv_pct` de bets com fechamento preenchido)
  - **% de bets com CLV positivo**
- Considera apenas bets `Win` ou `Loss` (ignora `Open` e `Refund`).

**Critério de aceite:**
- Campo `odd_fechamento` adicionável manualmente
- CLV calculado e exibido em cada bet
- Card "CLV médio" + "% CLV positivo" no painel agregado
- Backward compat: bets antigas sem CLV continuam funcionando

---

### 🔴 CORREÇÃO 3 — Validador pós-resposta no SmartCoach das Múltiplas Elite

**Contexto:** Função `gerarMultiplasElite()` em `index.html` (procure por essa função — está perto de `_montarPromptMultiplas`). Hoje o JSON retornado pelo Sonnet 4.6 é apenas `JSON.parse()` e renderizado. Sem validação.

**Implementação:** criar função `_validarRespostaMultiplas(parsed, candidatos)` que retorna `{ valido: bool, erros: [strings] }` com checks:

1. **Schema completo:**
   - Existência: `tese_geral`, `elite5`, `elite10`, `elite15`, `elite20`
   - Cada escalão tem `picks: []` e `tese: string`
   - Cada pick tem: `liga`, `jogo`, `mercado` (HDP ou Under), `linha`, `favorito`, `justificativa`

2. **Piramidalidade:** elite5 ⊂ elite10 ⊂ elite15 ⊂ elite20 (comparar pares de jogo via `jogo` normalizado lowercase sem espaços)

3. **Tamanhos:** elite5 deve ter 5 picks, elite10 deve ter 10, elite15 deve ter 15, elite20 deve ter 20. Tolerância: ±0 (se SmartCoach não atingiu, fail e exibe alerta).

4. **Exclusão de divergência alta:** nenhum pick pode envolver time que esteja em `window.MEMORIA_DNA[liga].divergencias_dna_performance` com `severidade === 'alta'`. Atravesse o JSON de candidatos pra ver quais times entraram em cada pick.

5. **Mercados válidos:**
   - HDP: linha deve ser uma das: `-0.5, -1.0, -1.5, -2.0, -2.5`
   - Under: linha deve ser `7.5, 8.5, 9.5, 10.5, 11.5`

6. **Jogos existem nos candidatos:** cada pick deve corresponder a um candidato presente no input (não invenção do SmartCoach).

**Comportamento se inválido:**
- Mostra erros no UI (em vermelho, no `multiplas-status`)
- Não persiste no cache
- Botão "🔄 Tentar Regerar" disponível pra nova tentativa

**Critério de aceite:**
- Função `_validarRespostaMultiplas` existe e é chamada antes de `renderMultiplasElite`
- Quando JSON tem erro, UI mostra lista de erros específicos
- Cache local não salva resposta inválida

---

### 🟠 CORREÇÃO 4 — Display de probabilidade composta + WR breakeven + Kelly Fraction nas Múltiplas Elite

**Onde:** `_cardMultipla(escalao, dados)` em `index.html` (renderiza cada um dos 4 escalões).

**Hoje:** mostra apenas "Prob composta estimada: ~X%" e "Odd acumulada: ~Yx".

**Adicionar 4 métricas adicionais por escalão:**

1. **Probabilidade composta real** (Π pᵢ):
   - Atualmente usa estimativa fixa (23.7% pra ELITE5, etc). **Trocar por cálculo real** com base na faixa BP de cada pick (probabilidade implícita = 1/odd_justa).
   - Se a faixa for NUCLEAR: usa 0.78 (média histórica WR NUCLEAR observada)
   - Se FORTE: 0.43
   - Se MODERADA: 0.51
   - Se sem BP: usa probabilidade implícita do Cisne ou 0.55 fallback
   - Π pᵢ = produto das probabilidades de cada pick

2. **WR de breakeven** = `1 / odd_composta`. Se odd composta total = 22, breakeven = 4.5%.

3. **Kelly Fraction:**
   - Fórmula: `(p × b - q) / b` onde `p` = prob composta, `q` = 1-p, `b` = odd_composta - 1
   - Se Kelly < 0, mostrar "Aposta com EV negativo — NÃO recomendado"
   - Se Kelly > 0, mostrar "Stake máximo sugerido por Kelly: X% do bankroll"

4. **Margem de segurança:** mostrar gap entre `prob_composta` e `breakeven` em pontos percentuais.
   - Se gap < 2pp → bandeira amarela "⚠️ Margem fina — alta sensibilidade a variância"
   - Se gap < 0 → bandeira vermelha "🚫 EV teórico NEGATIVO"
   - Se gap > 5pp → bandeira verde "🟢 Margem confortável"

**Critério de aceite:**
- Cada card de escalão mostra os 4 valores adicionais
- Bandeiras coloridas funcionam corretamente
- Kelly Fraction calculado corretamente (testar manualmente com 1 escalão)

---

### 🟠 CORREÇÃO 5 — Painel CLV completo no Bet Tracker

**Contexto:** Após correção 2, há campos brutos. Agora montar painel analítico.

**Componentes a adicionar no topo do Bet Tracker (próximo aos cards de estatísticas):**

1. **WR rolling 30/60/90 dias** (3 cards):
   - Filtrar bets com `data` nos últimos N dias e status `Win` ou `Loss`
   - WR = Win / (Win + Loss)
   - Mostrar trend: ↑ ↓ ↔ comparando WR atual vs WR do período anterior idêntico

2. **Intervalo de confiança 95% do ROI** (1 card):
   - ROI = (lucro - stake_total) / stake_total
   - IC 95% via bootstrap (1000 reamostragens com reposição) **OU** aproximação normal (IC = ROI ± 1.96 × σ/√n)
   - Exibir: `ROI: +15.2% [IC 95%: +8.4% a +22.0%]`

3. **Alerta de Drift** (banner condicional):
   - Calcular WR dos últimos 30 dias vs WR dos 60 anteriores
   - Se WR caiu mais de 5pp → banner amarelo "⚠️ Drift detectado — WR caiu Xpp nos últimos 30d"
   - Se WR caiu mais de 10pp → banner vermelho "🚨 Drift forte"

**Critério de aceite:**
- 3 cards (WR 30d, 60d, 90d) com setas de trend
- Card de ROI com IC 95%
- Banner condicional aparece quando drift detectado
- Funciona com 0 bets (mostra "—" sem quebrar)

---

### 🟡 CORREÇÃO 6 — Análise de poder estatístico das 12 assinaturas

**Contexto:** A assinatura `TERMOMETRO_FORMA` deu zero em todas as 7 ligas. A tentação é afrouxar o threshold (1.5× → 1.3×). Mas isso é **p-hacking comportamental**.

**Fazer ao invés:** análise de poder pra responder *"qual N seria necessário pra detectar efeito Y com poder 80%?"*

**Implementação:**
- Criar arquivo `Auditoria Especialista em cantos/_AnaliseDNA/_scripts/analise_poder.js`
- Pra cada assinatura, calcular:
  - Efeito mínimo detectável com N atual (potência 80%, alpha 5%)
  - N necessário pra detectar efeito de 10%, 20%, 30%
- Identificar assinaturas com `N_disponivel < N_necessario_minimo` e marcar como "imatura"
- Gerar relatório `_AnaliseDNA/_ANALISE_PODER_ASSINATURAS.md`

**Para fazer o cálculo:** use teste de proporção (binomial) com normal approximation:
```
N_necessario = ((z_alpha + z_beta) / efeito_minimo)² × p × (1-p)
onde:
  z_alpha = 1.96 (alpha 5%)
  z_beta = 0.84 (poder 80%)
  p = prevalência esperada (varia por assinatura)
  efeito_minimo = diferença que se quer detectar
```

**Critério de aceite:**
- Arquivo `_ANALISE_PODER_ASSINATURAS.md` gerado
- Pra cada uma das 12 assinaturas: N atual, N necessário, status (madura/imatura)
- Documentar conclusão sobre TERMÔMETRO_FORMA especificamente

---

### 🟡 CORREÇÃO 7 — Snapshot da memória DNA antes de cada rodada (hold-out logging)

**Contexto:** Pra validar out-of-sample, precisamos snapshot da memória DNA antes que uma rodada nova seja injetada nos data files.

**Implementação:**

1. **Botão no app** (na aba 🏆 Múltiplas Elite ou em Bet Tracker, à sua escolha):
   - Label: "📸 Snapshot Memória DNA (pré-rodada)"
   - Quando clicado: serializa `window.MEMORIA_DNA` + timestamp atual e oferece download como `snapshot_dna_<timestamp>.json`

2. **Localização recomendada do download:** o operador salva manualmente em `Auditoria Especialista em cantos/_AnaliseDNA/_snapshots/`.

3. **Documentação:** adicione seção no `_METODOLOGIA_APLICADA.md` explicando o protocolo:
   - Antes de cada rodada → snapshot
   - Após rodada → cruzar predições da memória do snapshot com resultados reais
   - Acumular pra construir hold-out test set real

**Critério de aceite:**
- Botão funcional que gera download JSON com timestamp
- Documentação do protocolo em `_METODOLOGIA_APLICADA.md`

---

## 4. RESTRIÇÕES E PROIBIÇÕES

❌ **NÃO altere** o motor de projeção (`projecaoJogo` em `index.html`)
❌ **NÃO altere** o `FAV_DOMINANCE`, `LIGA_DNA`, `ARQUETIPO_MULT` (já calibrados)
❌ **NÃO altere** os `data/<liga>2026.js` exceto `data/memoria_dna.js` (que será regenerado após correção 1)
❌ **NÃO faça commits ou pushes** — apenas modifique arquivos locais. O analista interno fará revisão e commit.
❌ **NÃO crie dependências npm novas** — use Node.js puro + fs/path
❌ **NÃO chame APIs externas** durante implementação
❌ **NÃO altere** a estrutura de `gerarCandidatosMultiplas` ou `gerarMultiplasElite` exceto pra adicionar validação (correção 3) e display (correção 4)
❌ **NÃO afrouxe** threshold de TERMÔMETRO_FORMA — apenas análise de poder, conforme correção 6

✅ **PODE modificar** `index.html` nas funções específicas mencionadas
✅ **PODE modificar** `Auditoria Especialista em cantos/_AnaliseDNA/_scripts/lib/checkpoint.js` (correção 1)
✅ **PODE regenerar** `data/memoria_dna.js` (apenas após correção 1)
✅ **PODE criar** novos arquivos em `Auditoria Especialista em cantos/_AnaliseDNA/_scripts/` (correção 6)
✅ **PODE criar** novos arquivos em `Auditoria Especialista em cantos/_AnaliseDNA/_snapshots/` (correção 7)

---

## 5. FORMATO DE ENTREGA

Ao terminar, gere **3 arquivos de documentação** em `Auditoria Especialista em cantos/_AnaliseDNA/`:

### 5.1. `IMPLEMENTACAO_LOG.md`
Para cada correção, registre:
- Status (✅ implementada / ⚠️ parcial / ❌ não implementada)
- Arquivos modificados (paths exatos)
- Linhas alteradas (de/para resumido)
- Tempo gasto
- Issues encontradas (se houver)
- Critério de aceite atendido (sim/não, com evidência)

### 5.2. `IMPLEMENTACAO_DIFFS.md`
Diffs unificados (formato `diff -u`) das principais mudanças, agrupados por correção. Útil pro auditor revisar mudanças cirúrgicas.

### 5.3. Mensagem de conclusão (no chat final)

Formato obrigatório:
```
═══════════════════════════════════════════════════════════════
✅ IMPLEMENTAÇÃO DE AUDITORIA CONCLUÍDA
═══════════════════════════════════════════════════════════════
Tempo total: XhYmin
Correções implementadas: N/7

🔴 CORREÇÃO 1 (Math.max bug): ✅ ou ⚠️ ou ❌
🔴 CORREÇÃO 2 (CLV Bet Tracker): ✅ ou ⚠️ ou ❌
🔴 CORREÇÃO 3 (Validador SmartCoach): ✅ ou ⚠️ ou ❌
🟠 CORREÇÃO 4 (Display prob/Kelly): ✅ ou ⚠️ ou ❌
🟠 CORREÇÃO 5 (Painel CLV): ✅ ou ⚠️ ou ❌
🟡 CORREÇÃO 6 (Análise poder): ✅ ou ⚠️ ou ❌
🟡 CORREÇÃO 7 (Snapshot DNA): ✅ ou ⚠️ ou ❌

Arquivos modificados:
  - <paths>

Arquivos criados:
  - <paths>

Observações:
  - <qualquer issue ou detalhe importante>

Próximo passo: aguardando auditoria de Claude Opus 4.7 (analista interno).
═══════════════════════════════════════════════════════════════
```

---

## 6. CRITÉRIOS DE ACEITE GLOBAIS

O analista interno (Claude Opus 4.7) vai validar:

1. ✅ Sintaxe JS válida (todo `index.html` parseia em Node `new Function`)
2. ✅ Nenhuma referência quebrada (funções existem e são chamadas corretamente)
3. ✅ Restrições da seção 4 respeitadas (nenhum arquivo proibido modificado)
4. ✅ Cada uma das 7 correções tem evidência objetiva de implementação
5. ✅ `IMPLEMENTACAO_LOG.md` e `IMPLEMENTACAO_DIFFS.md` presentes e precisos
6. ✅ Backward compatibility preservada (bets antigas, memória DNA antiga, etc)
7. ✅ Service Worker NÃO precisou ser tocado (ou se sim, documentado)

Se algum critério falhar, será reportado ao operador com sugestão de correção pontual.

---

## 7. CONTATO COM O OPERADOR

**Operador:** Egnaldo (Comandante do EDS Especialista em Cantos)
**Idioma de preferência:** Português (pt-BR)
**Estilo:** Direto, sem cortesia desnecessária, com evidência numérica em cada afirmação.

Se precisar de esclarecimento em algum ponto, **pergunte antes de chutar**. O operador prefere uma pergunta de clarificação a uma implementação errada.

---

## 8. POR QUE ISSO IMPORTA

Esta auditoria nasceu de **crítica honesta**. O sistema já é tecnicamente sofisticado, mas **falta calibração estatística** e **transparência operacional**. Implementar essas 7 correções move o sistema de "parecendo científico" para **"sendo científico"** — usando palavras da auditoria externa.

A diferença não é cosmética. É a diferença entre **operar achando que o sistema é robusto** e **operar sabendo onde ele é robusto e onde ainda não é**.

Trabalho com rigor. Documente tudo. Quando o auditor interno (Claude Opus 4.7) for revisar, ele vai conferir cada critério. Faça uma vez bem feito.

**Quando terminar, avise. O auditor interno fará revisão completa e proporá próximos passos ao operador.**

---

*Documento gerado em 2026-05-14 pelo Claude Opus 4.7 (1M context) para o projeto EDS Especialista em Cantos, após auditoria externa de Claude Sonnet 4.6.*
