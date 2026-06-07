# 🔍 PROCEDIMENTO DE DESCOBERTAS

> **Regra inviolável**: TODO padrão estatisticamente relevante DEVE ser gravado no arquivo MD da liga correspondente.

---

## 📋 CHECKLIST APÓS CADA AUDITORIA

### 1. Padrões POSITIVOS
- [ ] Algum filtro com acerto >70% e n≥5?
- [ ] Alguma faixa específica que se destaca?
- [ ] Time/contexto que aumenta acerto consistentemente?
- [ ] Convergência de motores com edge significativo?

### 2. Padrões NEGATIVOS
- [ ] Alguma faixa que acerta <50% consistentemente?
- [ ] Armadilha de PUSH ou linha?
- [ ] Mercado com sinal invertido?
- [ ] Contexto/time onde o motor falha sistematicamente?

### 3. Mudança de calibração
- [ ] Taxa está subindo / estável / caindo entre rodadas?
- [ ] Algum time mudou de perfil?

### 4. Gravação obrigatória
- [ ] Abri o arquivo MD da liga
- [ ] Atualizei tabela de números-chave
- [ ] Adicionei filtro novo em "Regras de Entrada" ou em "Armadilhas"
- [ ] Atualizei ROI estimado
- [ ] Atualizei perfil de times se aplicável

---

## ✅ O QUE GRAVAR

### Sim, gravar:
- Filtros que funcionam (taxa, faixa, perfil, convergência)
- Filtros que NÃO funcionam (armadilhas)
- Faixas validadas com n suficiente
- Times com perfil consistente (forte / volátil)
- Taxas consolidadas por mercado
- ROI estimado com odds reais
- Mudanças sistemáticas de calibração

### NÃO gravar:
- Histórico narrativo de rodadas
- Casos específicos de jogos passados
- Justificativas longas
- Análises de "por que" se já temos a regra
- Tabelas de erros individuais
- Comentários sobre apostas pontuais

---

## 🎯 PRINCÍPIO ÚNICO

**"Esse dado ajuda a decidir sobre os PRÓXIMOS jogos?"**

- SIM → grava
- NÃO → fora do protocolo

---

## 🔄 PROCESSO

### Passo 1 — Detectar
- Subgrupos com taxa muito alta (≥70%) ou muito baixa (≤45%)
- Padrão recorrente em 2+ rodadas
- n mínimo 5 observações

### Passo 2 — Validar
- Calcular Wilson IC 95%
- IC inferior > 50% (para "OURO") ou IC superior < 50% (para "ARMADILHA")
- Confirmar em pelo menos 2 rodadas independentes

### Passo 3 — Gravar (sucinto)
- Adicionar à tabela de números-chave
- Adicionar item em "Regras de Entrada" (positivo) ou "Armadilhas" (negativo)
- Atualizar ROI estimado
- Atualizar data de "última atualização"

### Passo 4 — Aplicar
- Próxima ativação do protocolo: filtro novo já em ação

---

## ⚡ PROMESSA OPERACIONAL

Eu (Claude/Fantasma) ME COMPROMETO a:
1. Após cada auditoria: rodar este checklist
2. Antes de finalizar resposta: perguntar "registrei isso?"
3. Em cada ativação: ler o arquivo da liga, não improvisar
4. Gravar sucinto e ACIONÁVEL — não narrativo
